import { httpsCallable } from "firebase/functions";
import type { BootstrapData } from "@rpa-license/domain";
import { getFirebaseClient } from "../firebase/client";
import { ApiError, type AppApi } from "./appApi";

async function call<TPayload, TResult>(name: string, payload?: TPayload): Promise<TResult> {
  try {
    const { functions } = getFirebaseClient();
    const fn = httpsCallable<TPayload | undefined, TResult>(functions, name);
    const result = await fn(payload);
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.";
    throw new ApiError(message);
  }
}

export const firebaseFunctionsApi: AppApi = {
  bootstrapApp: () => call<void, BootstrapData>("bootstrapApp"),
  saveSolution: (payload) => call("saveSolution", payload),
  deleteSolution: (payload) => call("deleteSolution", payload),
  saveUserPermission: (payload) => call("saveUserPermission", payload),
  updateSystemSetting: (payload) => call("updateSystemSetting", payload),
  saveLicense: (payload) => call("saveLicense", payload),
  issueLicense: (payload) => call("issueLicense", payload),
  returnLicense: (payload) => call("returnLicense", payload),
  deleteLicense: (payload) => call("deleteLicense", payload),
  saveContact: (payload) => call("saveContact", payload),
  deleteContact: (payload) => call("deleteContact", payload)
};

