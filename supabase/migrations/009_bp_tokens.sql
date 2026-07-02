-- BP token balance on profiles
alter table public.profiles
  add column if not exists bp_balance integer not null default 0 check (bp_balance >= 0);

-- Admin-configurable token pricing (single settings row)
create table public.token_settings (
  id integer primary key check (id = 1),
  sale_listing_bp_cost integer not null default 10 check (sale_listing_bp_cost >= 0),
  rent_listing_bp_cost integer not null default 5 check (rent_listing_bp_cost >= 0),
  bp_price_cents integer not null default 100 check (bp_price_cents > 0),
  updated_at timestamptz not null default now()
);

insert into public.token_settings (id) values (1)
on conflict (id) do nothing;

alter table public.token_settings enable row level security;

create policy "Anyone can read token settings"
  on public.token_settings
  for select
  to authenticated, anon
  using (true);

create policy "Admins can update token settings"
  on public.token_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create type public.bp_purchase_status as enum ('pending', 'completed', 'failed', 'expired');
create type public.bp_payment_method as enum ('card', 'bank_transfer');

create table public.bp_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  bp_amount integer not null check (bp_amount > 0),
  amount_cents integer not null check (amount_cents > 0),
  payment_method public.bp_payment_method not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  status public.bp_purchase_status not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index bp_purchases_user_id_idx on public.bp_purchases (user_id);
create index bp_purchases_status_idx on public.bp_purchases (status);

alter table public.bp_purchases enable row level security;

create policy "Users can view own BP purchases"
  on public.bp_purchases
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all BP purchases"
  on public.bp_purchases
  for select
  to authenticated
  using (public.is_admin());

create type public.bp_transaction_type as enum ('purchase', 'listing_publish', 'refund');

create table public.bp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  type public.bp_transaction_type not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create index bp_transactions_user_id_idx on public.bp_transactions (user_id);

alter table public.bp_transactions enable row level security;

create policy "Users can view own BP transactions"
  on public.bp_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all BP transactions"
  on public.bp_transactions
  for select
  to authenticated
  using (public.is_admin());

-- Prevent direct BP balance changes from the client
create or replace function public.protect_bp_balance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.bp_update', true) = 'true' then
    return new;
  end if;

  if old.bp_balance is distinct from new.bp_balance then
    new.bp_balance := old.bp_balance;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_bp_balance on public.profiles;
create trigger protect_profile_bp_balance
  before update on public.profiles
  for each row
  execute function public.protect_bp_balance();

create or replace function public.get_listing_bp_cost(p_listing_type public.listing_type)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_listing_type = 'sale'::public.listing_type then sale_listing_bp_cost
    else rent_listing_bp_cost
  end
  from public.token_settings
  where id = 1;
$$;

grant execute on function public.get_listing_bp_cost(public.listing_type) to authenticated, anon;

create or replace function public.complete_bp_purchase(
  p_checkout_session_id text,
  p_payment_intent_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_purchase public.bp_purchases%rowtype;
begin
  select * into v_purchase
  from public.bp_purchases
  where stripe_checkout_session_id = p_checkout_session_id
  for update;

  if not found then
    return false;
  end if;

  if v_purchase.status = 'completed' then
    return true;
  end if;

  perform set_config('app.bp_update', 'true', true);

  update public.profiles
  set bp_balance = bp_balance + v_purchase.bp_amount,
      updated_at = now()
  where id = v_purchase.user_id;

  update public.bp_purchases
  set status = 'completed',
      stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id),
      completed_at = now()
  where id = v_purchase.id;

  insert into public.bp_transactions (user_id, amount, type, reference_id)
  values (v_purchase.user_id, v_purchase.bp_amount, 'purchase', v_purchase.id::text);

  return true;
end;
$$;

create or replace function public.deduct_listing_bp(
  p_listing_type public.listing_type,
  p_property_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cost integer;
begin
  if v_user_id is null then
    return false;
  end if;

  if public.is_admin() then
    return true;
  end if;

  v_cost := public.get_listing_bp_cost(p_listing_type);

  if v_cost <= 0 then
    return true;
  end if;

  perform set_config('app.bp_update', 'true', true);

  update public.profiles
  set bp_balance = bp_balance - v_cost,
      updated_at = now()
  where id = v_user_id
    and bp_balance >= v_cost;

  if not found then
    return false;
  end if;

  insert into public.bp_transactions (user_id, amount, type, reference_id)
  values (v_user_id, -v_cost, 'listing_publish', p_property_id::text);

  return true;
end;
$$;

grant execute on function public.deduct_listing_bp(public.listing_type, uuid) to authenticated;

create or replace function public.refund_listing_bp(p_property_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_amount integer;
begin
  if v_user_id is null then
    return false;
  end if;

  select abs(amount) into v_amount
  from public.bp_transactions
  where user_id = v_user_id
    and type = 'listing_publish'
    and reference_id = p_property_id::text
  order by created_at desc
  limit 1;

  if v_amount is null or v_amount <= 0 then
    return false;
  end if;

  perform set_config('app.bp_update', 'true', true);

  update public.profiles
  set bp_balance = bp_balance + v_amount,
      updated_at = now()
  where id = v_user_id;

  insert into public.bp_transactions (user_id, amount, type, reference_id)
  values (v_user_id, v_amount, 'refund', p_property_id::text);

  return true;
end;
$$;

grant execute on function public.refund_listing_bp(uuid) to authenticated;

create policy "Users can insert own pending BP purchases"
  on public.bp_purchases
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

revoke all on function public.complete_bp_purchase(text, text) from public;
grant execute on function public.complete_bp_purchase(text, text) to service_role;
