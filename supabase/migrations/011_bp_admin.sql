-- Admin BP management: refund on listing rejection and manual balance adjustments

-- New transaction type for manual admin balance changes
alter type public.bp_transaction_type add value if not exists 'admin_adjust';

-- Refund the BP spent to publish a listing (admin action, works for any owner).
-- Idempotent: only refunds when the property still has a net BP deduction.
create or replace function public.admin_refund_listing_bp(p_property_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_net integer;
begin
  if not public.is_admin() then
    return false;
  end if;

  select owner_id into v_owner_id
  from public.properties
  where id = p_property_id;

  if v_owner_id is null then
    return false;
  end if;

  select coalesce(sum(amount), 0) into v_net
  from public.bp_transactions
  where reference_id = p_property_id::text
    and type in ('listing_publish', 'refund');

  -- Nothing was deducted (e.g. admin-owned listing) or already refunded.
  if v_net >= 0 then
    return false;
  end if;

  perform set_config('app.bp_update', 'true', true);

  update public.profiles
  set bp_balance = bp_balance + (-v_net),
      updated_at = now()
  where id = v_owner_id;

  insert into public.bp_transactions (user_id, amount, type, reference_id)
  values (v_owner_id, -v_net, 'refund', p_property_id::text);

  return true;
end;
$$;

grant execute on function public.admin_refund_listing_bp(uuid) to authenticated;

-- Manually add or remove BP from a user's balance (admin action).
create or replace function public.admin_adjust_bp(p_user_id uuid, p_amount integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    return false;
  end if;

  if p_amount = 0 then
    return false;
  end if;

  perform set_config('app.bp_update', 'true', true);

  update public.profiles
  set bp_balance = bp_balance + p_amount,
      updated_at = now()
  where id = p_user_id
    and bp_balance + p_amount >= 0;

  if not found then
    return false;
  end if;

  insert into public.bp_transactions (user_id, amount, type, reference_id)
  values (p_user_id, p_amount, 'admin_adjust', null);

  return true;
end;
$$;

grant execute on function public.admin_adjust_bp(uuid, integer) to authenticated;
