import { requireBackend,throwIfError } from "./apiClient";
export const authService={signIn:async(email,password)=>throwIfError(await requireBackend().auth.signInWithPassword({email,password})),signOut:async()=>throwIfError(await requireBackend().auth.signOut()),session:async()=>throwIfError(await requireBackend().auth.getSession())};
