import {
  APP_NAME,
  DEFAULT_EXPIRING_DAYS,
  DEFAULT_TIME_ZONE,
  MENU_ITEMS,
  PUBLIC_PERMISSION_MESSAGE,
  ROLES,
  SETTING_KEYS,
  emptyReferenceData,
  nowDateTimeString,
  type BootstrapData,
  type MenuItem,
  type ReferenceData,
  type Role,
  type SystemSettingRecord,
  type UserContext,
  LICENSE_CLASSIFICATIONS,
  DEPLOYMENT_TYPES,
  LICENSE_ROLES,
  HISTORY_EVENT_TYPES,
  LICENSE_STATUS,
  COMPUTED_LICENSE_STATUS
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import { toDocId } from "../infra/ids.js";
import type { Actor } from "../shared/auth.js";
import { buildUserContext } from "../shared/auth.js";
import { COLLECTIONS } from "@rpa-license/domain";
import { listContacts } from "./contactService.js";
import { getDashboardCards, listLicenses } from "./licenseService.js";
import { listHistory } from "./historyService.js";
import { listPermissions } from "./permissionService.js";
import { listSolutions } from "./solutionService.js";

export async function seedSystemSettings(actorEmail: string): Promise<void> {
  const now = nowDateTimeString();
  const defaults: SystemSettingRecord[] = [
    {
      key: SETTING_KEYS.EXPIRING_DAYS,
      value: String(DEFAULT_EXPIRING_DAYS),
      description: "종료일 기준 몇 일 이내를 만료예정으로 볼지",
      updatedAt: now,
      updatedByEmail: actorEmail
    },
    {
      key: SETTING_KEYS.TIME_ZONE,
      value: DEFAULT_TIME_ZONE,
      description: "일시 표시 및 계산 기준 타임존",
      updatedAt: now,
      updatedByEmail: actorEmail
    }
  ];

  await Promise.all(
    defaults.map(async (setting) => {
      const ref = db.collection(COLLECTIONS.SYSTEM_SETTINGS).doc(toDocId(setting.key));
      const snapshot = await ref.get();
      if (!snapshot.exists) {
        await ref.set(setting);
      }
    })
  );
}

export async function seedInitialAdmin(actor: Actor | null): Promise<void> {
  if (!actor) {
    return;
  }

  const permissions = await db.collection(COLLECTIONS.USER_PERMISSIONS).limit(1).get();
  if (!permissions.empty) {
    return;
  }

  const now = nowDateTimeString();
  await db.collection(COLLECTIONS.USER_PERMISSIONS).doc(toDocId(actor.email)).set({
    email: actor.email,
    role: ROLES.ADMIN,
    note: "최초 로그인 사용자",
    createdAt: now,
    createdByEmail: actor.email,
    updatedAt: now,
    updatedByEmail: actor.email
  });
}

export async function getExpiringDays(): Promise<number> {
  const snapshot = await db.collection(COLLECTIONS.SYSTEM_SETTINGS).doc(toDocId(SETTING_KEYS.EXPIRING_DAYS)).get();
  const value = Number(snapshot.get("value"));
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_EXPIRING_DAYS;
}

export async function listSettings(): Promise<SystemSettingRecord[]> {
  const snapshot = await db.collection(COLLECTIONS.SYSTEM_SETTINGS).get();
  return snapshot.docs
    .map((doc) => doc.data() as SystemSettingRecord)
    .sort((left, right) => left.key.localeCompare(right.key, "ko"));
}

export async function updateSystemSetting(actor: Actor, payload: { key: string; value: string; description: string }): Promise<void> {
  const key = payload.key.trim();
  const value = payload.value.trim();
  const description = payload.description.trim();

  if (!key) {
    throw new Error("설정키는 필수입니다.");
  }
  if (!value) {
    throw new Error("설정값은 필수입니다.");
  }
  if (key === SETTING_KEYS.EXPIRING_DAYS) {
    const days = Number(value);
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error("만료예정기준일수는 1 이상의 정수여야 합니다.");
    }
  }

  const ref = db.collection(COLLECTIONS.SYSTEM_SETTINGS).doc(toDocId(key));
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("설정키를 찾을 수 없습니다.");
  }

  await ref.set(
    {
      key,
      value,
      description,
      updatedAt: nowDateTimeString(),
      updatedByEmail: actor.email
    },
    { merge: true }
  );
}

export function buildMenuByRole(role: Role): MenuItem[] {
  const menu: MenuItem[] = [{ key: MENU_ITEMS.DASHBOARD, label: "대시보드" }];
  if (role === ROLES.NONE) {
    return menu;
  }

  menu.push(
    { key: MENU_ITEMS.LICENSES, label: "라이선스 관리" },
    { key: MENU_ITEMS.HISTORY, label: "이력 조회" },
    { key: MENU_ITEMS.CONTACTS, label: "연락처 관리" }
  );

  if (role === ROLES.ADMIN) {
    menu.push(
      { key: MENU_ITEMS.SOLUTIONS, label: "솔루션 관리" },
      { key: MENU_ITEMS.PERMISSIONS, label: "권한 관리" },
      { key: MENU_ITEMS.SETTINGS, label: "시스템 설정" }
    );
  }

  return menu;
}

export async function buildReferenceData(): Promise<ReferenceData> {
  const solutions = await listSolutions();
  return {
    solutions: solutions.map((solution) => solution.solutionName),
    classifications: LICENSE_CLASSIFICATIONS,
    deploymentTypes: DEPLOYMENT_TYPES,
    licenseRoles: LICENSE_ROLES,
    historyEventTypes: HISTORY_EVENT_TYPES,
    licenseStatuses: [LICENSE_STATUS.AVAILABLE, LICENSE_STATUS.IN_USE, COMPUTED_LICENSE_STATUS.EXPIRED],
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.VIEWER, ROLES.NONE]
  };
}

export function emptyBootstrap(user: UserContext, message?: string): BootstrapData {
  return {
    appName: APP_NAME,
    user,
    dashboardCards: [],
    menu: buildMenuByRole(user.role),
    appData: {
      licenses: [],
      history: [],
      contacts: [],
      referenceData: emptyReferenceData()
    },
    adminData: {
      solutions: [],
      permissions: [],
      settings: []
    },
    systemMessage: message
  };
}

export async function buildBootstrap(actor: Actor | null, systemMessage?: string): Promise<BootstrapData> {
  await seedSystemSettings(actor?.email ?? "system");
  await seedInitialAdmin(actor);

  const user = await buildUserContext(actor);
  if (!user.canAccessApp) {
    return emptyBootstrap(user, systemMessage ?? (actor ? PUBLIC_PERMISSION_MESSAGE : "로그인이 필요합니다."));
  }

  const [referenceData, dashboardCards, licenses, history, contacts] = await Promise.all([
    buildReferenceData(),
    getDashboardCards(),
    listLicenses(),
    listHistory(),
    listContacts()
  ]);

  const adminData =
    user.role === ROLES.ADMIN
      ? {
          solutions: await listSolutions(),
          permissions: await listPermissions(),
          settings: await listSettings()
        }
      : {
          solutions: [],
          permissions: [],
          settings: []
        };

  return {
    appName: APP_NAME,
    user,
    dashboardCards,
    menu: buildMenuByRole(user.role),
    appData: {
      licenses,
      history,
      contacts,
      referenceData
    },
    adminData,
    systemMessage
  };
}

