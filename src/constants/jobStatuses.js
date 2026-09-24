export const JOB_STATUS=Object.freeze({DRAFT:"draft",OPEN:"open",CLOSING_SOON:"closing_soon",INTERVIEW_SCHEDULED:"interview_scheduled",CLOSED:"closed",FILLED:"filled",ARCHIVED:"archived"});
export const JOB_STATUSES=Object.freeze(Object.values(JOB_STATUS));
export const PUBLIC_JOB_STATUSES=Object.freeze([JOB_STATUS.OPEN,JOB_STATUS.CLOSING_SOON,JOB_STATUS.INTERVIEW_SCHEDULED]);
