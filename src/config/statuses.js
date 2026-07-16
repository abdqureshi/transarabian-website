export const JOB_STATUSES=Object.freeze([
  "draft","open","closing_soon","interview_scheduled","closed","filled","archived"
]);

export const APPLICATION_STATUSES=Object.freeze([
  "submitted","under_review","shortlisted","interview_scheduled","interviewed","selected","rejected",
  "medical_pending","medical_cleared","medical_failed","documents_pending","visa_processing",
  "visa_approved","protector_complete","ticket_issued","deployed","on_hold","withdrawn"
]);

export const formatStatus=value=>String(value||"")
  .split("_")
  .filter(Boolean)
  .map(word=>word[0]?.toUpperCase()+word.slice(1))
  .join(" ");
