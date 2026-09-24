export const DOCUMENT_TYPE=Object.freeze({CV:"cv",CNIC_FRONT:"cnicFront",CNIC_BACK:"cnicBack",PASSPORT:"passport",PHOTO:"photo",EDUCATION:"educationCertificates",EXPERIENCE:"experienceCertificates",TECHNICAL:"technicalCertificates",DRIVING_LICENSE:"drivingLicense",OTHER:"otherDocuments"});
export const DOCUMENT_TYPES=Object.freeze(Object.values(DOCUMENT_TYPE));
export const DOCUMENT_RULES=Object.freeze({allowedMimeTypes:["application/pdf","image/jpeg","image/png","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],maxBytes:5*1024*1024});
