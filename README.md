# Trans Arabian Recruitment Portal & ATS

React + Vite public website with Supabase authentication, private candidate documents, recruitment administration, application tracking, reporting, audit logs and official-provider notification functions.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `.env.local`, add the project URL and public anon key from **Supabase Dashboard → Project Settings → API**, then restart Vite. `.env.local` is ignored by Git and must never be committed.

In **Supabase Dashboard → Authentication → URL Configuration**, set the production Site URL and allow these recovery redirects:

```text
http://localhost:5173/auth/reset-password
https://YOUR-PRODUCTION-DOMAIN/auth/reset-password
```

Authentication routes are `/auth/login`, `/auth/forgot-password`, and `/auth/reset-password`. Supabase owns session persistence and token refresh; the application does not manually store passwords or access tokens.

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

Buckets:

- `candidate-documents`: private, 5 MB per file, PDF/JPG/PNG/DOC/DOCX. Access uses RLS and short-lived signed URLs.
- `job-posters`: public approved recruitment advertisements, 10 MB maximum.

## Admin account setup

Register through `/account`, locate the user UUID in Supabase Authentication, then assign the role in the SQL editor:

```sql
update public.profiles set role = 'super_admin' where id = 'USER_UUID';
```

Roles are `super_admin`, `admin`, `recruiter`, `viewer`, and `candidate`. Never allow role assignment from untrusted profile form input.

Only a `super_admin` may change roles or system settings. Admins manage recruitment records and assignments. Recruiters can read and update only assigned applications/candidates. Viewers have read-only permitted admin access. Candidates are restricted to their own profile, applications and document paths. These rules are enforced by Supabase RLS in addition to frontend route guards.

Admin routes include `/admin`, `/admin/jobs`, `/admin/applications`, `/admin/candidates`, `/admin/interviews`, `/admin/reports`, and `/admin/settings`.

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
