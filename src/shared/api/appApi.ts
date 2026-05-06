import type {
  BootstrapData,
  ContactSectionData,
  DeleteContactPayload,
  DeleteLicensePayload,
  DeleteSolutionPayload,
  DashboardSectionData,
  HistorySectionData,
  IssueLicensePayload,
  LicenseSectionData,
  PermissionsAdminSectionData,
  ReturnLicensePayload,
  SaveContactPayload,
  SaveLicensePayload,
  SaveSolutionPayload,
  SaveUserPermissionPayload,
  SettingsAdminSectionData,
  SolutionsAdminSectionData,
  UpdateSystemSettingPayload
} from "@rpa-license/domain";

export interface AppApi {
  bootstrapApp: () => Promise<BootstrapData>;
  loadDashboardData: () => Promise<DashboardSectionData>;
  loadLicenseData: () => Promise<LicenseSectionData>;
  loadHistoryData: () => Promise<HistorySectionData>;
  loadContactData: () => Promise<ContactSectionData>;
  loadSolutionsAdminData: () => Promise<SolutionsAdminSectionData>;
  loadPermissionsAdminData: () => Promise<PermissionsAdminSectionData>;
  loadSettingsAdminData: () => Promise<SettingsAdminSectionData>;
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
