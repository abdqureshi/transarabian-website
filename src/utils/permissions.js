import { ROLE_PERMISSIONS,ROLES,STAFF_ROLES } from "../constants/roles.js";
export const isStaff=role=>STAFF_ROLES.includes(role);
export const isAdmin=role=>role===ROLES.ADMIN||role===ROLES.SUPER_ADMIN;
export const hasRole=(role,allowed=[])=>allowed.includes(role);
export const hasPermission=(role,permission)=>Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
export const landingRouteForRole=role=>isStaff(role)?"/admin":"/candidate/dashboard";
export const resolveRouteAccess=({configured,loading,user,role,allowedRoles=[],path="/"})=>{if(!configured)return"configuration_missing";if(loading)return"loading";if(!user)return path.startsWith("/admin")?"admin_login":"candidate_login";if(allowedRoles.length&&!allowedRoles.includes(role))return"unauthorized";return"allowed"};
