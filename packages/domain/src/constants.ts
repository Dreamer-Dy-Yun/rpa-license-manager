export const APP_NAME = "RPA 라이선스 관리";
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_EXPIRING_DAYS = 30;
export const DEFAULT_TIME_ZONE = "Asia/Seoul";

export const COLLECTIONS = {
  LICENSES: "licenses",
  LICENSE_HISTORY: "licenseHistory",
  SOLUTIONS: "solutions",
  CONTACTS: "contacts",
  USER_PERMISSIONS: "userPermissions",
  SYSTEM_SETTINGS: "systemSettings"
} as const;

export const ROLES = {
  ADMIN: "관리자",
  OPERATOR: "운영자",
  VIEWER: "조회자",
  NONE: "권한없음"
} as const;

export const LICENSE_STATUS = {
  AVAILABLE: "사용가능",
  IN_USE: "사용중"
} as const;

export const COMPUTED_LICENSE_STATUS = {
  EXPIRED: "만료"
} as const;

export const LICENSE_CLASSIFICATIONS = ["구매", "테스트", "기타"] as const;
export const DEPLOYMENT_TYPES = ["Attended", "Unattended", "해당없음", "기타"] as const;
export const LICENSE_ROLES = ["Bot", "Designer", "Orchestrator"] as const;
export const HISTORY_EVENT_TYPES = ["등록", "수정", "불출", "회수", "삭제"] as const;
export const SOURCE_TYPES = ["웹앱", "시트직접수정", "변경트리거", "트리거보정", "시스템초기화"] as const;

export const SETTING_KEYS = {
  EXPIRING_DAYS: "만료예정기준일수",
  TIME_ZONE: "타임존"
} as const;

export const PUBLIC_PERMISSION_MESSAGE = "권한이 없습니다. 관리자에게 권한을 요청해 주세요.";

export const MENU_ITEMS = {
  DASHBOARD: "dashboard",
  LICENSES: "licenses",
  HISTORY: "history",
  CONTACTS: "contacts",
  SOLUTIONS: "solutions",
  PERMISSIONS: "permissions",
  SETTINGS: "settings"
} as const;

