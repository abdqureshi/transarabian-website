-- Enum additions must be committed before later migrations use the new values.
-- Keeping these changes separate avoids PostgreSQL's "unsafe use of new value"
-- error when Supabase applies migrations inside transactions.
alter type public.user_role add value if not exists 'super_admin';
alter type public.user_role add value if not exists 'viewer';

alter type public.application_status add value if not exists 'Under Review';
alter type public.application_status add value if not exists 'Interview Scheduled';
alter type public.application_status add value if not exists 'Interviewed';
alter type public.application_status add value if not exists 'Selected';
alter type public.application_status add value if not exists 'Medical Pending';
alter type public.application_status add value if not exists 'Medical Cleared';
alter type public.application_status add value if not exists 'Medical Failed';
alter type public.application_status add value if not exists 'Documents Pending';
alter type public.application_status add value if not exists 'Visa Processing';
alter type public.application_status add value if not exists 'Visa Approved';
alter type public.application_status add value if not exists 'Protector Complete';
alter type public.application_status add value if not exists 'Ticket Issued';
alter type public.application_status add value if not exists 'On Hold';
