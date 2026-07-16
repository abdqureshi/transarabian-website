export const ROLES=Object.freeze({
  SUPER_ADMIN:"super_admin",
  ADMIN:"admin",
  RECRUITER:"recruiter",
  VIEWER:"viewer",
  CANDIDATE:"candidate"
});

export const STAFF_ROLES=Object.freeze([
  ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.RECRUITER,ROLES.VIEWER
]);

export const ROLE_PERMISSIONS=Object.freeze({
  [ROLES.SUPER_ADMIN]:["system.manage","users.manage","roles.manage","settings.manage","jobs.manage","candidates.manage","applications.manage","audit.view","reports.view","data.export"],
  [ROLES.ADMIN]:["jobs.manage","candidates.manage","applications.manage","recruiters.assign","reports.view","data.export"],
  [ROLES.RECRUITER]:["assignments.view","notes.add","application_status.update","interviews.schedule","documents.download"],
  [ROLES.VIEWER]:["admin_data.read"],
  [ROLES.CANDIDATE]:["profile.own","applications.own","documents.own"]
});

export const hasPermission=(role,permission)=>Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
