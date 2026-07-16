import { requireBackend } from "./apiClient";
export const notificationsService={email:async payload=>{const r=await requireBackend().functions.invoke("send-email",{body:payload});if(r.error)throw r.error;return r.data},whatsapp:async payload=>{const r=await requireBackend().functions.invoke("send-whatsapp",{body:payload});if(r.error)throw r.error;return r.data}};
