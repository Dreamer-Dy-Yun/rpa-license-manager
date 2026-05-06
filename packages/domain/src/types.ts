import type {
  DEPLOYMENT_TYPES,
  HISTORY_EVENT_TYPES,
  LICENSE_CLASSIFICATIONS,
  LICENSE_ROLES,
  LICENSE_STATUS,
  PERMISSION_REQUEST_STATUS,
  ROLES,
  SOURCE_TYPES
} from "./constants.js";

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type PermissionRequestStatus = (typeof PERMISSION_REQUEST_STATUS)[keyof typeof PERMISSION_REQUEST_STATUS];
export type LicenseStatus = (typeof LICENSE_STATUS)[keyof typeof LICENSE_STATUS];
export type ComputedLicenseStatus = LicenseStatus | "만료";
export type LicenseClassification = (typeof LICENSE_CLASSIFICATIONS)[number];
export type DeploymentType = (typeof DEPLOYMENT_TYPES)[number];
export type LicenseRole = (typeof LICENSE_ROLES)[number];
export type HistoryEventType = (typeof HISTORY_EVENT_TYPES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface MenuItem {
  key: string;
  label: string;
}

export interface UserContext {
  email: string;
  role: Role;
  canAccessApp: boolean;
  message: string;
}

export interface DateTimeValue {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export interface AuditFields {
  createdAt: DateTimeValue;
  createdByEmail: string;
  updatedAt: DateTimeValue;
  updatedByEmail: string;
}

export interface SolutionRecord extends AuditFields {
  solutionName: string;
  manufacturerName: string;
  note: string;
  connectedLicenseCount: number;
  connectedContactCount: number;
}

export type StoredSolutionRecord = Omit<SolutionRecord, "connectedLicenseCount" | "connectedContactCount">;

export interface LicenseRecord extends AuditFields {
  solutionName: string;
  customerName: string;
  licenseNumber: string;
  classification: LicenseClassification;
  deploymentType: DeploymentType;
  licenseRole: LicenseRole;
  startDate: string;
  endDate: string;
  storedStatus: LicenseStatus;
  currentIssuerEmail: string;
  currentRecipient: string;
  currentIssuedAt: DateTimeValue | null;
  note: string;
}

export interface LicenseView extends LicenseRecord {
  computedStatus: ComputedLicenseStatus;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export interface HistoryRecord {
  id: string;
  eventAt: DateTimeValue;
  eventType: HistoryEventType;
  licenseNumber: string;
  solutionName: string;
  customerName: string;
  actorEmail: string;
  recipient: string;
  note: string;
  changeDetails: string;
  deleteSnapshot: string;
  sourceType: SourceType;
}

export interface ContactRecord extends AuditFields {
  id: string;
  solutionName: string;
  organizationName: string;
  contactName: string;
  position: string;
  phoneNumber: string;
  email: string;
  note: string;
}

export interface UserPermissionRecord extends AuditFields {
  email: string;
  role: Role;
  note: string;
}

export interface PermissionRequestRecord extends AuditFields {
  email: string;
  requestedRole: Exclude<Role, typeof ROLES.NONE>;
  reason: string;
  status: PermissionRequestStatus;
  reviewedAt: DateTimeValue | null;
  reviewedByEmail: string;
  adminNote: string;
}

export interface SystemSettingRecord {
  key: string;
  value: string;
  description: string;
  updatedAt: DateTimeValue | null;
  updatedByEmail: string;
}

export interface DashboardCard {
  solutionName: string;
  manufacturerName: string;
  availableCount: number;
  inUseCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export interface ReferenceData {
  solutions: string[];
  classifications: readonly LicenseClassification[];
  deploymentTypes: readonly DeploymentType[];
  licenseRoles: readonly LicenseRole[];
  historyEventTypes: readonly HistoryEventType[];
  licenseStatuses: readonly ComputedLicenseStatus[];
  roles: readonly Role[];
}

export interface AppData {
  licenses: LicenseView[];
  history: HistoryRecord[];
  contacts: ContactRecord[];
  referenceData: ReferenceData;
}

export interface AdminData {
  solutions: SolutionRecord[];
  permissions: UserPermissionRecord[];
  permissionRequests: PermissionRequestRecord[];
  settings: SystemSettingRecord[];
}

export interface BootstrapData {
  appName: string;
  user: UserContext;
  permissionRequest: PermissionRequestRecord | null;
  dashboardCards: DashboardCard[];
  menu: MenuItem[];
  appData: AppData;
  adminData: AdminData;
  systemMessage?: string;
}

export interface DashboardSectionData {
  dashboardCards: DashboardCard[];
  referenceData: ReferenceData;
}

export interface LicenseSectionData {
  licenses: LicenseView[];
  referenceData: ReferenceData;
}

export interface HistorySectionData {
  history: HistoryRecord[];
  referenceData: ReferenceData;
}

export interface ContactSectionData {
  contacts: ContactRecord[];
  referenceData: ReferenceData;
}

export interface SolutionsAdminSectionData {
  solutions: SolutionRecord[];
}

export interface PermissionsAdminSectionData {
  permissions: UserPermissionRecord[];
  permissionRequests: PermissionRequestRecord[];
}

export interface SettingsAdminSectionData {
  settings: SystemSettingRecord[];
}

export interface SaveSolutionPayload {
  solutionName: string;
  manufacturerName: string;
  note: string;
}

export interface DeleteSolutionPayload {
  solutionName: string;
}

export interface SaveUserPermissionPayload {
  email: string;
  role: Role;
  note: string;
}

export interface SavePermissionRequestPayload {
  requestedRole: Exclude<Role, typeof ROLES.NONE>;
  reason: string;
}

export interface ResolvePermissionRequestPayload {
  email: string;
  status: typeof PERMISSION_REQUEST_STATUS.APPROVED | typeof PERMISSION_REQUEST_STATUS.REJECTED;
  note: string;
}

export interface UpdateSystemSettingPayload {
  key: string;
  value: string;
  description: string;
}

export interface SaveLicensePayload {
  solutionName: string;
  customerName: string;
  licenseNumber: string;
  classification: LicenseClassification;
  deploymentType: DeploymentType;
  licenseRole: LicenseRole;
  startDate: string;
  endDate: string;
  note: string;
}

export interface IssueLicensePayload {
  licenseNumber: string;
  recipient: string;
  note: string;
}

export interface ReturnLicensePayload {
  licenseNumber: string;
  note: string;
}

export interface DeleteLicensePayload {
  licenseNumber: string;
  note: string;
}

export interface SaveContactPayload {
  id?: string;
  solutionName: string;
  organizationName: string;
  contactName: string;
  position: string;
  phoneNumber: string;
  email: string;
  note: string;
}

export interface DeleteContactPayload {
  id: string;
}

export interface LicenseFilters {
  solutionName?: string;
  licenseNumber?: string;
  customerName?: string;
  recipient?: string;
  status?: ComputedLicenseStatus | "";
  classification?: LicenseClassification | "";
  deploymentType?: DeploymentType | "";
  licenseRole?: LicenseRole | "";
  expirationFlag?: "만료" | "만료예정" | "";
}

export interface HistoryFilters {
  solutionName?: string;
  licenseNumber?: string;
  eventType?: HistoryEventType | "";
  operatorEmail?: string;
  recipient?: string;
}

export interface ContactFilters {
  solutionName?: string;
  organizationName?: string;
  contactName?: string;
  phoneNumber?: string;
  email?: string;
}
