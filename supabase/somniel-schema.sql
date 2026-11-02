-- Somniel-only data model; apply to a dedicated Somniel Supabase project.
-- No client credentials, shared ProSeU tables, or Firebase database rules are changed.
-- Firebase Authentication remains the identity provider. Edge Functions validate its JWT.
-- All data access is mediated by the server; public table access stays denied.

create table if not exists public.somniel_workers (
  id text primary key,
  record jsonb not null default '{}'::jsonb,
  source text not null default 'somniel',
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint somniel_workers_record_object check (jsonb_typeof(record) = 'object')
);

create table if not exists public.somniel_projects (
  id text primary key,
  record jsonb not null default '{}'::jsonb,
  source text not null default 'somniel',
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint somniel_projects_record_object check (jsonb_typeof(record) = 'object')
);

create table if not exists public.somniel_access (
  firebase_uid text primary key,
  role text not null check (role in ('owner', 'admin', 'reviewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.somniel_audit (
  id bigint generated always as identity primary key,
  firebase_uid text not null,
  email text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists somniel_workers_updated_idx on public.somniel_workers (updated_at desc);
create index if not exists somniel_projects_updated_idx on public.somniel_projects (updated_at desc);
create index if not exists somniel_audit_entity_idx on public.somniel_audit (entity, entity_id, created_at desc);
create index if not exists somniel_audit_actor_idx on public.somniel_audit (firebase_uid, created_at desc);

-- Supabase REST/GraphQL does not expose these records to untrusted clients.
-- Server-side Edge Function uses the secret service-role key only inside the runtime.
alter table public.somniel_workers enable row level security;
alter table public.somniel_projects enable row level security;
alter table public.somniel_access enable row level security;
alter table public.somniel_audit enable row level security;
revoke all on public.somniel_workers, public.somniel_projects, public.somniel_access, public.somniel_audit
  from public, anon, authenticated;
grant select, insert, update, delete on public.somniel_workers, public.somniel_projects, public.somniel_access
  to service_role;
grant select, insert on public.somniel_audit to service_role;
grant usage, select on sequence public.somniel_audit_id_seq to service_role;

-- No permissive anon or authenticated policies: Firebase tokens are verified
-- by the separate Edge Function, including signature, issuer, audience, expiry,
-- email verification and the Somniel-specific owner/admin allowlist.
-- Keep source Firestore data until the post-migration verification report
-- confirms matching counts, IDs and hashes for every record.
