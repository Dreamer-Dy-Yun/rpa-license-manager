import {
  APP_NAME,
  PUBLIC_PERMISSION_MESSAGE,
  ROLES,
  emptyReferenceData,
  type AppData,
  type BootstrapData,
  type UserContext
} from "@rpa-license/domain";
import { ApiError, type AppApi } from "./appApi";

function mockUser(): UserContext {
  return {
    email: "",
    role: ROLES.NONE,
    canAccessApp: false,
    message: PUBLIC_PERMISSION_MESSAGE
  };
}

function emptyAppData(): AppData {
  return {
    licenses: [],
    history: [],
    contacts: [],
    referenceData: emptyReferenceData()
  };
}

function emptyBootstrap(): BootstrapData {
  const user = mockUser();
  return {
    appName: APP_NAME,
    user,
    dashboardCards: [],
    menu: [{ key: "dashboard", label: "대시보드" }],
    appData: emptyAppData(),
    adminData: {
      solutions: [],
      permissions: [],
      settings: []
    },
    systemMessage: "Firebase 설정이 아직 없어 계약 확인용 빈 상태로 실행 중입니다."
  };
}

async function rejectMutation(): Promise<BootstrapData> {
  throw new ApiError("Firebase 백엔드가 설정되지 않아 저장 작업을 실행할 수 없습니다.");
}

export const contractMockApi: AppApi = {
  bootstrapApp: async () => emptyBootstrap(),
  loadDashboardData: async () => ({
    dashboardCards: [],
    referenceData: emptyReferenceData()
  }),
  loadLicenseData: async () => ({
    licenses: [],
    referenceData: emptyReferenceData()
  }),
  loadHistoryData: async () => ({
    history: [],
    referenceData: emptyReferenceData()
  }),
  loadContactData: async () => ({
    contacts: [],
    referenceData: emptyReferenceData()
  }),
  loadSolutionsAdminData: async () => ({ solutions: [] }),
  loadPermissionsAdminData: async () => ({ permissions: [] }),
  loadSettingsAdminData: async () => ({ settings: [] }),
  saveSolution: rejectMutation,
  deleteSolution: rejectMutation,
  saveUserPermission: rejectMutation,
  updateSystemSetting: rejectMutation,
  saveLicense: rejectMutation,
  issueLicense: rejectMutation,
  returnLicense: rejectMutation,
  deleteLicense: rejectMutation,
  saveContact: rejectMutation,
  deleteContact: rejectMutation
};
