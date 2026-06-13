-- YiiArt order storage for Stripe and PayPal checkout.
-- Run this in the Supabase SQL editor before enabling live payments.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'unfulfilled',
  payment_provider text,
  provider_checkout_id text,
  provider_payment_id text,
  currency text not null,
  display_currency text,
  subtotal_amount numeric(12, 2) not null default 0,
  shipping_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  shipping_address_line1 text not null,
  shipping_city text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  customer_notes text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  disputed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  artwork_id text not null,
  title text not null,
  artist_name text,
  image_url text,
  quantity integer not null default 1,
  unit_amount numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_provider_checkout_idx on public.orders (payment_provider, provider_checkout_id);
create index if not exists orders_provider_payment_idx on public.orders (payment_provider, provider_payment_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

create or replace function public.set_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_order_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;

-- The website reads and writes orders only with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose service role keys in client-side NEXT_PUBLIC variables.
