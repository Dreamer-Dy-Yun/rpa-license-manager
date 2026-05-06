import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, type CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {
  ROLES,
  type BootstrapData,
  type DeleteContactPayload,
  type DeleteLicensePayload,
  type DeleteSolutionPayload,
  type IssueLicensePayload,
  type ReturnLicensePayload,
  type Role,
  type SaveContactPayload,
  type SaveLicensePayload,
  type SaveSolutionPayload,
  type SaveUserPermissionPayload,
  type UpdateSystemSettingPayload
} from "@rpa-license/domain";
import { deleteContact as deleteContactRecord, saveContact as saveContactRecord } from "../application/contactService.js";
import { deleteLicense as deleteLicenseRecord, issueLicense as issueLicenseRecord, returnLicense as returnLicenseRecord, saveLicense as saveLicenseRecord } from "../application/licenseService.js";
import { saveUserPermission as saveUserPermissionRecord } from "../application/permissionService.js";
import { deleteSolution as deleteSolutionRecord, saveSolution as saveSolutionRecord } from "../application/solutionService.js";
import { buildBootstrap, updateSystemSetting as updateSystemSettingRecord } from "../application/systemService.js";
import { getOptionalActor, requireActor, requireRole, type Actor } from "../shared/auth.js";
import { toHttpsError } from "../shared/errors.js";

setGlobalOptions({
  region: "asia-northeast3",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
});

export const bootstrapApp = onCall(async (request) => {
  try {
    return await buildBootstrap(getOptionalActor(request));
  } catch (error) {
    logger.error("bootstrapApp failed", error);
    throw toHttpsError(error);
  }
});

export const saveSolution = mutation<SaveSolutionPayload>([ROLES.ADMIN], "saveSolution", async (actor, payload) => {
  await saveSolutionRecord(actor, payload);
});

export const deleteSolution = mutation<DeleteSolutionPayload>([ROLES.ADMIN], "deleteSolution", async (_actor, payload) => {
  await deleteSolutionRecord(payload.solutionName);
});

export const saveUserPermission = mutation<SaveUserPermissionPayload>([ROLES.ADMIN], "saveUserPermission", async (actor, payload) => {
  await saveUserPermissionRecord(actor, payload);
});

export const updateSystemSetting = mutation<UpdateSystemSettingPayload>([ROLES.ADMIN], "updateSystemSetting", async (actor, payload) => {
  await updateSystemSettingRecord(actor, payload);
});

export const saveLicense = mutation<SaveLicensePayload>([ROLES.ADMIN, ROLES.OPERATOR], "saveLicense", async (actor, payload) => {
  await saveLicenseRecord(actor, payload);
});

export const issueLicense = mutation<IssueLicensePayload>([ROLES.ADMIN, ROLES.OPERATOR], "issueLicense", async (actor, payload) => {
  await issueLicenseRecord(actor, payload);
});

export const returnLicense = mutation<ReturnLicensePayload>([ROLES.ADMIN, ROLES.OPERATOR], "returnLicense", async (actor, payload) => {
  await returnLicenseRecord(actor, payload);
});

export const deleteLicense = mutation<DeleteLicensePayload>([ROLES.ADMIN], "deleteLicense", async (actor, payload) => {
  await deleteLicenseRecord(actor, payload);
});

export const saveContact = mutation<SaveContactPayload>([ROLES.ADMIN], "saveContact", async (actor, payload) => {
  await saveContactRecord(actor, payload);
});

export const deleteContact = mutation<DeleteContactPayload>([ROLES.ADMIN], "deleteContact", async (_actor, payload) => {
  await deleteContactRecord(payload.id);
});

function mutation<TPayload>(
  allowedRoles: Role[],
  scope: string,
  action: (actor: Actor, payload: TPayload) => Promise<void>
) {
  return onCall(async (request: CallableRequest<TPayload>): Promise<BootstrapData> => {
    try {
      const actor = requireActor(request);
      await requireRole(actor, allowedRoles);
      await action(actor, request.data);
      return await buildBootstrap(actor);
    } catch (error) {
      logger.error(`${scope} failed`, error);
      throw toHttpsError(error);
    }
  });
}
