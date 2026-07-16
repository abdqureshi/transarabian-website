-- Trans Arabian Recruitment Portal — Phase 2 foundation
create extension if not exists pgcrypto;
create type public.user_role as enum ('candidate','recruiter','admin');
create type public.application_status as enum ('Submitted','Shortlisted','Interview','Medical','Visa','Protector','Ticket','Deployed','Rejected','Withdrawn');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,full_name text not null default '',phone text,role public.user_role not null default 'candidate',created_at timestamptz not null default now());
create table public.jobs (id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,country text not null,industry text,category text,salary_min numeric,salary_max numeric,salary_currency text,vacancies integer not null default 1,status text not null default 'Open',featured boolean not null default false,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.applications (id uuid primary key default gen_random_uuid(),reference_number text unique not null,candidate_id uuid not null references public.profiles(id) on delete restrict,job_id uuid references public.jobs(id) on delete set null,job_title text not null,status public.application_status not null default 'Submitted',candidate_data jsonb not null default '{}'::jsonb,interview_date timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.application_documents (id uuid primary key default gen_random_uuid(),application_id uuid not null references public.applications(id) on delete cascade,candidate_id uuid not null references public.profiles(id) on delete restrict,document_type text not null,storage_path text not null,created_at timestamptz not null default now());
create table public.application_status_history (id bigint generated always as identity primary key,application_id uuid not null references public.applications(id) on delete cascade,status public.application_status not null,note text,changed_by uuid references public.profiles(id),created_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));return new;end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('recruiter','admin'));$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin');$$;

alter table public.profiles enable row level security;alter table public.jobs enable row level security;alter table public.applications enable row level security;alter table public.application_documents enable row level security;alter table public.application_status_history enable row level security;
create policy "profiles read own" on public.profiles for select using(id=auth.uid() or public.is_staff());
create policy "profiles update own" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid() and role=(select role from public.profiles where id=auth.uid()));
create policy "jobs public read" on public.jobs for select using(true);
create policy "staff manage jobs" on public.jobs for all using(public.is_staff()) with check(public.is_staff());
create policy "candidates read own applications" on public.applications for select using(candidate_id=auth.uid() or public.is_staff());
create policy "candidates create own applications" on public.applications for insert with check(candidate_id=auth.uid());
create policy "staff update applications" on public.applications for update using(public.is_staff()) with check(public.is_staff());
create policy "documents read own or staff" on public.application_documents for select using(candidate_id=auth.uid() or public.is_staff());
create policy "documents insert own" on public.application_documents for insert with check(candidate_id=auth.uid());
create policy "status history read own or staff" on public.application_status_history for select using(public.is_staff() or exists(select 1 from public.applications a where a.id=application_id and a.candidate_id=auth.uid()));
create policy "staff add status history" on public.application_status_history for insert with check(public.is_staff());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('candidate-documents','candidate-documents',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy "candidate uploads own documents" on storage.objects for insert to authenticated with check(bucket_id='candidate-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "candidate reads own documents" on storage.objects for select to authenticated using(bucket_id='candidate-documents' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_staff()));
