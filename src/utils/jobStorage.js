const SAVED_KEY="trans-arabian-saved-jobs";const APPLICATION_KEY="trans-arabian-applications";
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}};
export const getSavedJobs=()=>read(SAVED_KEY);
export const isJobSaved=id=>getSavedJobs().includes(id);
export const toggleSavedJob=id=>{const saved=getSavedJobs();const next=saved.includes(id)?saved.filter(item=>item!==id):[...saved,id];localStorage.setItem(SAVED_KEY,JSON.stringify(next));return next.includes(id)};
export const storeApplicationMetadata=data=>{const applications=read(APPLICATION_KEY);localStorage.setItem(APPLICATION_KEY,JSON.stringify([...applications,data]));};
