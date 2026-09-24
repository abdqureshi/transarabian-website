-- Run manually in the Supabase SQL Editor after creating and confirming an Auth user.
-- Replace both placeholders. No password belongs in this file.
-- Allowed role names: super_admin, admin, recruiter, viewer, candidate.

do $$
declare
  target_email text := 'REPLACE_WITH_AUTH_USER_EMAIL';
  target_role text := 'REPLACE_WITH_ROLE';
  target_user_id uuid;
  target_role_id uuid;
begin
  if target_email like 'REPLACE_%' or target_role like 'REPLACE_%' then
    raise exception 'Replace target_email and target_role before running this script';
  end if;
  if target_role not in ('super_admin','admin','recruiter','viewer','candidate') then
    raise exception 'Invalid role';
  end if;
  select id into target_user_id from auth.users where lower(email)=lower(target_email);
  if target_user_id is null then raise exception 'Auth user not found'; end if;
  select id into target_role_id from public.roles where name=target_role;
  insert into public.user_roles(user_id,role_id) values(target_user_id,target_role_id)
  on conflict(user_id,role_id) do nothing;
end $$;
