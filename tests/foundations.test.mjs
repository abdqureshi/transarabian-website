import test from "node:test";
import assert from "node:assert/strict";
import { ROLES } from "../src/constants/roles.js";
import { hasPermission,isAdmin,isStaff,resolveRouteAccess } from "../src/utils/permissions.js";
import { hasSupabaseConfig } from "../src/lib/supabaseConfig.js";
import { publicError } from "../src/services/serviceErrors.js";
import { isCnic,isEmail,isPhone } from "../src/utils/validators.js";

test("permission helpers enforce role boundaries",()=>{assert.equal(isAdmin(ROLES.SUPER_ADMIN),true);assert.equal(isAdmin(ROLES.RECRUITER),false);assert.equal(isStaff(ROLES.VIEWER),true);assert.equal(isStaff(ROLES.CANDIDATE),false);assert.equal(hasPermission(ROLES.ADMIN,"jobs.manage"),true);assert.equal(hasPermission(ROLES.CANDIDATE,"jobs.manage"),false)});
test("protected route decisions preserve admin isolation",()=>{assert.equal(resolveRouteAccess({configured:false}),"configuration_missing");assert.equal(resolveRouteAccess({configured:true,loading:true}),"loading");assert.equal(resolveRouteAccess({configured:true,user:null,path:"/admin/jobs"}),"admin_login");assert.equal(resolveRouteAccess({configured:true,user:{id:"1"},role:ROLES.CANDIDATE,allowedRoles:[ROLES.ADMIN]}),"unauthorized");assert.equal(resolveRouteAccess({configured:true,user:{id:"1"},role:ROLES.ADMIN,allowedRoles:[ROLES.ADMIN]}),"allowed")});
test("missing Supabase variables are detected safely",()=>{assert.equal(hasSupabaseConfig("",""),false);assert.equal(hasSupabaseConfig("not-a-url","key"),false);assert.equal(hasSupabaseConfig("https://project.supabase.co","public-anon-key"),false);assert.equal(hasSupabaseConfig("https://abc.supabase.co","valid-public-key"),true)});
test("service errors do not expose unknown technical details",()=>{assert.equal(publicError({message:"Invalid login credentials"}),"The email or password is incorrect.");assert.equal(publicError({message:"relation candidates does not exist"}),"We could not complete that request. Please try again.")});
test("shared candidate validators accept canonical values",()=>{assert.equal(isEmail("candidate@example.com"),true);assert.equal(isCnic("12345-1234567-1"),true);assert.equal(isPhone("+923001234567"),true)});
