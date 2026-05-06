import type {
  BootstrapData,
  DeleteContactPayload,
  DeleteLicensePayload,
  DeleteSolutionPayload,
  IssueLicensePayload,
  ReturnLicensePayload,
  SaveContactPayload,
  SaveLicensePayload,
  SaveSolutionPayload,
  SaveUserPermissionPayload,
  UpdateSystemSettingPayload
} from "@rpa-license/domain";

export interface AppApi {
  bootstrapApp: () => Promise<BootstrapData>;
  saveSolution: (payload: SaveSolutionPayload) => Promise<BootstrapData>;
  deleteSolution: (payload: DeleteSolutionPayload) => Promise<BootstrapData>;
  saveUserPermission: (payload: SaveUserPermissionPayload) => Promise<BootstrapData>;
  updateSystemSetting: (payload: UpdateSystemSettingPayload) => Promise<BootstrapData>;
  saveLicense: (payload: SaveLicensePayload) => Promise<BootstrapData>;
  issueLicense: (payload: IssueLicensePayload) => Promise<BootstrapData>;
  returnLicense: (payload: ReturnLicensePayload) => Promise<BootstrapData>;
  deleteLicense: (payload: DeleteLicensePayload) => Promise<BootstrapData>;
  saveContact: (payload: SaveContactPayload) => Promise<BootstrapData>;
  deleteContact: (payload: DeleteContactPayload) => Promise<BootstrapData>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

