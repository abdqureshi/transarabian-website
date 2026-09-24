import { serviceCall } from "./apiClient";
const invoke=(name,payload)=>serviceCall(db=>db.functions.invoke(name,{body:payload}),{context:`notifications.${name}`,fallback:"Unable to send the notification."});
export const notificationsService={email:payload=>invoke("send-email",payload),whatsapp:payload=>invoke("send-whatsapp",payload)};
