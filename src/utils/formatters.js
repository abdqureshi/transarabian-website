export const formatStatus=value=>String(value||"").split("_").filter(Boolean).map(word=>word[0]?.toUpperCase()+word.slice(1)).join(" ");
export const formatDate=(value,options={})=>value?new Intl.DateTimeFormat(undefined,{dateStyle:"medium",...options}).format(new Date(value)):"—";
export const formatCurrency=(value,currency="PKR")=>new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:0}).format(Number(value)||0);
export const formatPhone=value=>String(value||"").replace(/[^+\d]/g,"");
