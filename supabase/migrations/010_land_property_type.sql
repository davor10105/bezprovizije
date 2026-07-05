-- Add "land" (Zemljište) to property_type enum
alter type public.property_type add value if not exists 'land';
