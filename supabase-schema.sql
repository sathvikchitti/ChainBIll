-- ============================================================
-- ChainBill Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Users
create table if not exists users (
  id           text primary key default gen_random_uuid()::text,
  clerk_id     text unique not null,
  name         text not null,
  email        text unique not null,
  role         text not null,        -- SUPPLIER | BUYER | INVESTOR | ADMIN
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Role profiles
create table if not exists supplier_profiles (
  id           text primary key default gen_random_uuid()::text,
  user_id      text unique not null references users(id) on delete cascade,
  company_name text not null
);

create table if not exists buyer_profiles (
  id           text primary key default gen_random_uuid()::text,
  user_id      text unique not null references users(id) on delete cascade,
  company_name text not null,
  credit_score int default 750
);

create table if not exists investor_profiles (
  id            text primary key default gen_random_uuid()::text,
  user_id       text unique not null references users(id) on delete cascade,
  company_name  text not null,
  total_funded  float not null default 0
);

-- Invoices
create table if not exists invoices (
  id                 text primary key default gen_random_uuid()::text,
  invoice_no         text unique not null,
  immutable_id       text unique,
  supplier_id        text not null references users(id),
  buyer_id           text not null references users(id),
  supplier_name      text,
  buyer_name         text,
  amount             float not null,
  description        text not null default '',
  due_date           timestamptz not null,
  status             text not null default 'pending',
  is_draft           boolean not null default false,
  gst_no             text,
  payment_terms      text,
  pdf_url            text,
  blockchain_tx_hash text,
  token_id           text,
  discount_rate      float,
  funding_progress   float not null default 0,
  settlement_status  text not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  verified_at        timestamptz,
  settled_at         timestamptz
);

-- Funding transactions
create table if not exists funding_transactions (
  id                 text primary key default gen_random_uuid()::text,
  invoice_id         text not null references invoices(id) on delete cascade,
  investor_id        text not null references users(id),
  amount_funded      float not null,
  funded_at          timestamptz not null default now(),
  settlement_tx_hash text
);

-- AI analyses
create table if not exists ai_analyses (
  id               text primary key default gen_random_uuid()::text,
  type             text not null,   -- OCR | RISK | CASHFLOW | DISPUTE | PORTFOLIO
  result           jsonb not null,
  confidence_score float,
  explanation      text,
  invoice_id       text references invoices(id) on delete set null,
  user_id          text references users(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- Audit trail
create table if not exists audit_trail (
  id         text primary key default gen_random_uuid()::text,
  invoice_id text not null references invoices(id) on delete cascade,
  action     text not null,   -- CREATED | VERIFIED | LISTED | FUNDED | SETTLED | DISPUTED | DRAFT_SAVED
  actor_id   text references users(id) on delete set null,
  tx_hash    text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

-- Settlement records
create table if not exists settlement_records (
  id               text primary key default gen_random_uuid()::text,
  invoice_id       text unique not null references invoices(id) on delete cascade,
  investor_id      text not null references users(id),
  principal_amount float not null,
  return_amount    float not null,
  roi              float not null,
  settled_at       timestamptz not null default now()
);

-- Credit ledger
create table if not exists credit_ledger (
  id                 text primary key default gen_random_uuid()::text,
  supplier_id        text not null references users(id),
  invoice_id         text not null references invoices(id) on delete cascade,
  event_type         text not null,  -- invoice_raised | buyer_confirmed | funded | settled
  recorded_at        timestamptz not null default now(),
  blockchain_tx_hash text
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_invoices_supplier   on invoices(supplier_id);
create index if not exists idx_invoices_buyer      on invoices(buyer_id);
create index if not exists idx_invoices_status     on invoices(status);
create index if not exists idx_audit_invoice       on audit_trail(invoice_id);
create index if not exists idx_funding_invoice     on funding_transactions(invoice_id);
create index if not exists idx_funding_investor    on funding_transactions(investor_id);
create index if not exists idx_settlement_investor on settlement_records(investor_id);

-- ── Disable RLS for dev (enable + add policies for production) ────────────────
alter table users               disable row level security;
alter table supplier_profiles   disable row level security;
alter table buyer_profiles      disable row level security;
alter table investor_profiles   disable row level security;
alter table invoices            disable row level security;
alter table funding_transactions disable row level security;
alter table ai_analyses         disable row level security;
alter table audit_trail         disable row level security;
alter table settlement_records  disable row level security;
alter table credit_ledger       disable row level security;
