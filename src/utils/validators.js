import { DOCUMENT_RULES } from "../constants/documentTypes.js";
export const isEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||"").trim());
export const isCnic=value=>/^\d{5}-?\d{7}-?\d$/.test(String(value||"").trim());
export const isPhone=value=>/^\+?[0-9]{10,15}$/.test(String(value||"").replace(/[\s()-]/g,""));
export const validateFile=file=>!file?"A file is required.":!DOCUMENT_RULES.allowedMimeTypes.includes(file.type)?"This file type is not supported.":file.size>DOCUMENT_RULES.maxBytes?"The file must be 5 MB or smaller.":null;
export const clampPage=(page,pages)=>Math.min(Math.max(1,Number(page)||1),Math.max(1,Number(pages)||1));
