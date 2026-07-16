# Edge Functions

Deploy with the Supabase CLI, then store secrets with `supabase secrets set`. `send-email` uses Resend. `send-whatsapp` uses only Meta WhatsApp Cloud API approved templates; it does not send free-form messages.

Required WhatsApp templates should include application confirmation, status update, interview schedule, medical instructions, document request, visa update, ticket issue and departure briefing. Submit templates for Meta approval before use.
