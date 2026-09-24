# Trans Arabian Recruitment Portal & ATS

React + Vite public website with Supabase authentication, private candidate documents, recruitment administration, application tracking, reporting, audit logs and official-provider notification functions.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `.env.local`, add the project URL and public anon key from **Supabase Dashboard → Project Settings → API**, then restart Vite. `.env.local` is ignored by Git and must never be committed.

## Supabase project setup

1. Create a project at `https://supabase.com/dashboard` and save the database password in a password manager.
2. Open **Project Settings → API** (or **Connect → App Frameworks** in newer dashboard versions).
3. Copy the Project URL to `VITE_SUPABASE_URL` and the public anon/publishable key to `VITE_SUPABASE_ANON_KEY` in `.env.local`.
4. Never copy the service-role/secret key into the React application or any `VITE_` variable.
5. Link the local CLI and apply migrations in filename order with `supabase link --project-ref PROJECT_REF` and `supabase db push`. If using the SQL Editor, apply each migration separately and preserve its order.
6. Run the reference seed with `supabase db reset` for a local project, or execute `supabase/seed.sql` once in the SQL Editor for a development project.
7. Confirm the storage migration created the private candidate buckets and controlled public asset buckets described below. Do not manually make candidate buckets public.

In **Supabase Dashboard → Authentication → URL Configuration**, set the production Site URL and allow these recovery redirects:

```text
http://localhost:5173/auth/reset-password
https://YOUR-PRODUCTION-DOMAIN/auth/reset-password
```

Candidate routes are `/account`, `/account/login`, `/account/register`, `/account/forgot-password`, `/account/reset-password`, and `/candidate/dashboard`. Compatibility routes under `/auth/*` remain available. Administration uses `/admin/login`; it rejects candidate accounts and preserves the protected destination requested before sign-in. Supabase owns session persistence and token refresh; the application does not manually store passwords or access tokens.

Frontend variables:

```env
VITE_SUPABASE_URL=https://PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=PUBLIC_ANON_KEY
VITE_APPLICATION_ENDPOINT=
```

Only the URL and anon key belong in Vite. Never expose the service-role, Resend, SMTP or Meta WhatsApp secret in frontend variables.

## Database and storage

Apply migrations in order using the Supabase CLI or SQL editor:

```bash
supabase db push
```

1. `001_recruitment_portal.sql` creates authentication profiles, initial jobs/applications, private documents and core RLS.
2. `002_enum_extensions.sql` commits the additional account roles and workflow statuses before they are used.
3. `003_full_ats.sql` adds the normalized ATS, campaigns, candidates, notes, interviews, notification queues, audit logs, tags, settings, indexes, duplicate detection, tracking RPC, status history and role policies.
4. `004_security_hardening.sql` tightens profile roles, public job visibility, application ownership, private storage access and function grants.
5. `005_role_based_access_control.sql` enforces the five-role permission matrix, recruiter assignments, candidate ownership, protected profile fields and private document authorization.
6. `006_production_schema.sql` canonicalizes normalized roles, campaign/job metadata, candidate ownership, lowercase workflow statuses, document metadata, history and audit fields while preserving legacy records.
7. `007_constraints_and_indexes.sql` adds production lookup indexes, business checks, safe foreign-key deletion behavior, soft archives and complete updated timestamp coverage.
8. `008_database_functions_and_triggers.sql` centralizes timestamps, database-controlled application references, candidate profile creation, immutable status history and sensitive-action audit logging.
9. `009_supabase_storage.sql` creates private candidate and public asset buckets with MIME/size controls, canonical generated paths, signed-read authorization and assignment-aware storage RLS.

Buckets:

- `candidate-cvs`: private CVs, 5 MB maximum.
- `candidate-documents`: private supporting documents, 5 MB maximum.
- `candidate-passports`: private passport PDF/images, 5 MB maximum.
- `candidate-photos`: private JPG/PNG/WEBP photos, 3 MB maximum.
- `job-posters`: public approved recruitment advertisements, 10 MB maximum.
- `company-assets`: public approved corporate images and documents, 10 MB maximum.

Private objects use `candidate-id/application-id/document-type/generated-uuid.ext`. Original filenames are metadata only. Signed URLs expire after at most ten minutes, and storage RLS restricts candidates to their own applications and recruiters to assigned applications.

## Admin account setup

Create the first user through Supabase Authentication or the candidate account page. Confirm the email, copy the user UUID from **Authentication → Users**, then run the following once in the authenticated Supabase SQL Editor as the project owner:

```sql
insert into public.user_roles(user_id,role_id)
select 'USER_UUID',id from public.roles where name='super_admin'
on conflict(user_id,role_id) do nothing;
```

Verify the assignment without exposing any key:

```sql
select p.id,p.email,r.name
from public.profiles p
join public.user_roles ur on ur.user_id=p.id
join public.roles r on r.id=ur.role_id
where p.id='USER_UUID';
```

Sign in at `/admin/login`. Never add a hardcoded administrator password, never run role assignment from browser code, and never put the Supabase service-role key in a `VITE_` variable. After the first super-admin exists, future account administration should be performed through a protected server-side workflow audited by the database.

Exact dashboard workflow:

1. Open **Authentication → Users → Add user → Create new user**.
2. Enter the administrator's real email and a unique temporary password; enable email confirmation only when your project email flow is configured.
3. Ask the administrator to reset the temporary password immediately using `/account/forgot-password`.
4. Copy the Auth user email and open `scripts/assign-development-role.sql`.
5. Replace `REPLACE_WITH_AUTH_USER_EMAIL` and set `REPLACE_WITH_ROLE` to `super_admin`; execute it in the SQL Editor.
6. Verify the assignment with the query above, then test `/admin/login` in a private browser window.

To create an optional development recruiter, repeat these steps with another Auth user and assign `recruiter`. No password is stored in SQL. Public registration always receives the `candidate` role and cannot create an administrator.

Roles are `super_admin`, `admin`, `recruiter`, `viewer`, and `candidate`. Never allow role assignment from untrusted profile form input.

Only a `super_admin` may change roles or system settings. Admins manage recruitment records and assignments. Recruiters can read and update only assigned applications/candidates. Viewers have read-only permitted admin access. Candidates are restricted to their own profile, applications and document paths. These rules are enforced by Supabase RLS in addition to frontend route guards.

Admin routes include `/admin`, `/admin/jobs`, `/admin/applications`, `/admin/candidates`, `/admin/interviews`, `/admin/reports`, `/admin/users`, and `/admin/settings`. User and settings access is restricted to super-admins.

## Verify authentication, protected routes, and RLS

Run local code checks:

```bash
npm test
npm run lint
npm run build
```

Manual account checks:

- Open public pages in a signed-out browser and confirm they work without Supabase authentication.
- Remove one local Supabase variable, restart Vite, and confirm `/account` shows a friendly unavailable state while public pages remain usable. Detailed setup text must appear only during development.
- Register at `/account/register`; confirm the resulting user has only the `candidate` role.
- Confirm a candidate opening `/admin` is redirected or denied, while the assigned super-admin reaches the requested admin page after login.
- Confirm sign-out clears the Supabase session and returns to the correct login route.

RLS verification should use separate Supabase test users—not the service-role key. In the SQL Editor, inspect enabled policies with:

```sql
select schemaname,tablename,policyname,roles,cmd
from pg_policies
where schemaname in ('public','storage')
order by schemaname,tablename,policyname;
```

Using candidate and recruiter JWTs through the application or a local integration test, verify that a candidate cannot select another candidate/application/document, a recruiter sees only assigned records, and anonymous requests see only `open`, `closing_soon`, or `interview_scheduled` jobs. Attempting a private bucket's object URL without a signed URL must fail.

## Security notes

- Never expose a Supabase service-role/secret key in browser code or a `VITE_` variable.
- Never commit `.env.local`; it is intentionally ignored by Git.
- Candidate CVs, passports, photos, and supporting documents must remain in private buckets and be accessed only through short-lived signed URLs.
- Never disable RLS in production. Frontend route guards improve usability, but RLS is the authorization boundary.
- Do not store passwords in migrations, seed files, source code, or documentation.
- Use the service role only in trusted server-side functions, rotate leaked credentials immediately, and avoid logging tokens or personal documents.

## Add or manage a job

Use `/admin/jobs/new` after database setup. Draft jobs remain out of the public production query. Admins can edit, feature, mark urgent, publish, close, fill or archive records. Database changes are logged in `audit_logs`.

For initial JSON migration:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import:jobs
```

The server-side importer upserts by unique slug and does not create duplicates. Do not put the service key in `.env.local` or commit it.

## Import existing posters

Place approved posters in `src/assets/jobs/`, then run:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import:posters
```

The script uploads each file and creates or updates one Draft `job_campaigns` record keyed by filename. For posters containing several positions, keep one campaign and link separate job records with `campaign_id`.

## Review applications and candidates

- `/admin/applications`: filter, select, bulk update, export and open an application.
- Application review: inspect candidate summary, private documents, internal notes and status history.
- `/admin/candidates`: search identity/contact/trade records and review duplicate flags.
- Candidate profiles: personal, passport, professional, documents and application history.
- Updating application status automatically records history and queues candidate notifications.

## Candidate application and tracking

Authenticated submissions upsert a candidate, detect possible duplicates, create a sequential `TA-YYYY-000000` reference, save the application and upload documents privately. Duplicates are flagged, never deleted automatically.

Public tracking is available at `/track-application` and requires both reference number and CNIC/registered phone. It returns only job, date, status, next action, interview and missing-document information.

For production, rate-limit tracking and submission at the edge/WAF and add malware scanning before documents are released to staff.

## Email configuration

Functions use Resend. Deploy and configure server-side secrets:

```bash
supabase functions deploy send-email
supabase functions deploy process-notifications --no-verify-jwt
supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Trans Arabian <jobs@verified-domain.com>" RECRUITMENT_EMAIL=jobs@transarabian.org CRON_SECRET=...
```

Verify the sender domain in Resend. Schedule `process-notifications` using Supabase Cron or an external scheduler and send the long random `x-cron-secret` header. Branded templates live under `supabase/functions/_shared`.

## WhatsApp configuration

Use only Meta WhatsApp Cloud API and approved templates:

```bash
supabase functions deploy send-whatsapp
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=... WHATSAPP_ACCESS_TOKEN=... WHATSAPP_BUSINESS_ACCOUNT_ID=...
```

Approve templates such as `application_received`, `application_status_update`, `interview_scheduled`, `medical_instructions`, `document_request`, `visa_update`, `ticket_issued`, and `departure_briefing` in WhatsApp Manager. Do not use unofficial automation or free-form messages outside Meta rules.

## Frontend deployment

```bash
npm run lint
npm run build
```

Deploy `dist/` to Vercel, Netlify, Cloudflare Pages or another static host. Configure SPA fallback so unknown routes return `index.html`. Set only public Vite variables in the hosting dashboard.

## Test checklist

- Public pages and existing navigation remain available.
- Search, all vacancy filters, sorting, pagination, saved jobs and sharing work.
- Closed/filled/archived jobs do not accept applications.
- Application required fields, email, phone, CNIC and future passport expiry reject invalid input.
- Files over 5 MB or outside approved MIME types are rejected.
- Authenticated submission creates one candidate, application, reference and private documents.
- Repeated identifiers create duplicate warnings without deleting records.
- Candidate can see only their own applications/documents.
- Viewer cannot mutate records; recruiter/admin can update recruitment data.
- Admin routes redirect unauthenticated or unauthorized users.
- Status changes create history, audit records and queued notifications.
- Signed document links expire.
- CSV exports escape quoted values.
- Tracking fails when either reference or identifier is wrong.
- Email sender domain and WhatsApp templates work in provider test environments.
- Mobile public pages, forms, tracking and admin navigation remain usable.

## Known limitations / next improvements

- Apply migrations and provider credentials before backend features become live.
- Add server-side malware scanning and transactional submission Edge Function before high-volume production.
- Add dedicated recruiter assignment, interview editing, user management and settings forms.
- Add Excel/PDF report exporters; current operational export is CSV.
- Add charts, saved report definitions and time-to-fill SQL views.
- Add rate limits/CAPTCHA to login, application and tracking endpoints.
- Add automated integration/E2E tests and database policy tests.
- Add legally approved policy language, retention durations and data-subject request workflow.
