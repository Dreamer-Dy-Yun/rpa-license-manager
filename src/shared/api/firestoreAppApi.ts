import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  type DocumentData,
  type Firestore
} from "firebase/firestore";
import {
  APP_NAME,
  COLLECTIONS,
  COMPUTED_LICENSE_STATUS,
  DEFAULT_EXPIRING_DAYS,
  DEFAULT_TIME_ZONE,
  DEPLOYMENT_TYPES,
  HISTORY_EVENT_TYPES,
  LICENSE_CLASSIFICATIONS,
  LICENSE_ROLES,
  LICENSE_STATUS,
  MENU_ITEMS,
  PUBLIC_PERMISSION_MESSAGE,
  ROLES,
  SETTING_KEYS,
  buildLicenseChangeDetails,
  compareDateTimeAsc,
  emptyReferenceData,
  evaluateLicense,
  sortHistory,
  sortLicenses,
  validateLicensePayload,
  type BootstrapData,
  type ContactRecord,
  type DashboardCard,
  type DeleteContactPayload,
  type DeleteLicensePayload,
  type DeleteSolutionPayload,
  type HistoryEventType,
  type HistoryRecord,
  type IssueLicensePayload,
  type LicenseRecord,
  type LicenseView,
  type MenuItem,
  type ReferenceData,
  type ReturnLicensePayload,
  type Role,
  type SaveContactPayload,
  type SaveLicensePayload,
  type SaveSolutionPayload,
  type SaveUserPermissionPayload,
  type SolutionRecord,
  type StoredSolutionRecord,
  type SystemSettingRecord,
  type UpdateSystemSettingPayload,
  type UserContext,
  type UserPermissionRecord
} from "@rpa-license/domain";
import { getFirebaseClient } from "../firebase/client";
import { permissionDocId, toDocId } from "../lib/firestoreIds";
import { ApiError, type AppApi } from "./appApi";

export const firestoreAppApi: AppApi = {
  bootstrapApp,
  saveSolution: (payload) => mutate([ROLES.ADMIN], async ({ db, actor }) => saveSolutionRecord(db, actor, payload)),
  deleteSolution: (payload) => mutate([ROLES.ADMIN], async ({ db }) => deleteSolutionRecord(db, payload)),
  saveUserPermission: (payload) => mutate([ROLES.ADMIN], async ({ db, actor }) => saveUserPermissionRecord(db, actor, payload)),
  updateSystemSetting: (payload) => mutate([ROLES.ADMIN], async ({ db, actor }) => updateSystemSettingRecord(db, actor, payload)),
  saveLicense: (payload) => mutate([ROLES.ADMIN, ROLES.OPERATOR], async ({ db, actor }) => saveLicenseRecord(db, actor, payload)),
  issueLicense: (payload) => mutate([ROLES.ADMIN, ROLES.OPERATOR], async ({ db, actor }) => issueLicenseRecord(db, actor, payload)),
  returnLicense: (payload) => mutate([ROLES.ADMIN, ROLES.OPERATOR], async ({ db, actor }) => returnLicenseRecord(db, actor, payload)),
  deleteLicense: (payload) => mutate([ROLES.ADMIN], async ({ db, actor }) => deleteLicenseRecord(db, actor, payload)),
  saveContact: (payload) => mutate([ROLES.ADMIN], async ({ db, actor }) => saveContactRecord(db, actor, payload)),
  deleteContact: (payload) => mutate([ROLES.ADMIN], async ({ db }) => deleteContactRecord(db, payload))
};

async function bootstrapApp(): Promise<BootstrapData> {
  try {
    const { db } = getFirebaseClient();
    const user = await buildUserContext(db);

    if (!user.canAccessApp) {
      return emptyBootstrap(user, user.email ? PUBLIC_PERMISSION_MESSAGE : "로그인이 필요합니다.");
    }

    const [solutions, settings, permissions, contacts, history] = await Promise.all([
      listSolutions(db),
      listSettings(db),
      user.role === ROLES.ADMIN ? listPermissions(db) : Promise.resolve([]),
      listContacts(db),
      listHistory(db)
    ]);
    const licenses = await listLicenses(db, getExpiringDays(settings));

    return {
      appName: APP_NAME,
      user,
      dashboardCards: buildDashboardCards(solutions, licenses),
      menu: buildMenuByRole(user.role),
      appData: {
        licenses,
        history,
        contacts,
        referenceData: buildReferenceData(solutions)
      },
      adminData: {
        solutions,
        permissions,
        settings
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function mutate(
  allowedRoles: Role[],
  action: (context: { db: Firestore; actor: string; role: Role }) => Promise<void>
): Promise<BootstrapData> {
  try {
    const { db } = getFirebaseClient();
    const actor = getActorEmail();
    const role = await getRole(db, actor);

    if (!allowedRoles.includes(role)) {
      throw new ApiError("권한이 없습니다.");
    }

    await action({ db, actor, role });
    return await bootstrapApp();
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function buildUserContext(db: Firestore): Promise<UserContext> {
  const actor = getOptionalActorEmail();
  if (!actor) {
    return {
      email: "",
      role: ROLES.NONE,
      canAccessApp: false,
      message: "로그인이 필요합니다."
    };
  }

  const role = await getRole(db, actor);
  return {
    email: actor,
    role,
    canAccessApp: role !== ROLES.NONE,
    message: role === ROLES.NONE ? PUBLIC_PERMISSION_MESSAGE : ""
  };
}

async function getRole(db: Firestore, email: string): Promise<Role> {
  const snapshot = await getDoc(doc(db, COLLECTIONS.USER_PERMISSIONS, permissionDocId(email)));
  if (!snapshot.exists()) {
    return ROLES.NONE;
  }

  const role = snapshot.data().role;
  return isRole(role) ? role : ROLES.NONE;
}

function getOptionalActorEmail(): string {
  const email = getFirebaseClient().auth.currentUser?.email;
  return typeof email === "string" ? email.trim().toLocaleLowerCase("ko") : "";
}

function getActorEmail(): string {
  const email = getOptionalActorEmail();
  if (!email) {
    throw new ApiError("로그인이 필요합니다.");
  }
  return email;
}

async function listCollection<T>(db: Firestore, name: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((row) => row.data() as T);
}

async function listSolutions(db: Firestore): Promise<SolutionRecord[]> {
  const [solutions, licenses, contacts] = await Promise.all([
    listCollection<StoredSolutionRecord>(db, COLLECTIONS.SOLUTIONS),
    listCollection<LicenseRecord>(db, COLLECTIONS.LICENSES),
    listCollection<ContactRecord>(db, COLLECTIONS.CONTACTS)
  ]);

  return solutions
    .map((solution) => ({
      ...solution,
      connectedLicenseCount: licenses.filter((license) => license.solutionName === solution.solutionName).length,
      connectedContactCount: contacts.filter((contact) => contact.solutionName === solution.solutionName).length
    }))
    .sort((left, right) => compareDateTimeAsc(left.createdAt, right.createdAt));
}

async function listLicenses(db: Firestore, expiringDays: number): Promise<LicenseView[]> {
  const rows = await listCollection<LicenseRecord>(db, COLLECTIONS.LICENSES);
  return rows.map((row) => evaluateLicense(row, expiringDays)).sort(sortLicenses);
}

async function listContacts(db: Firestore): Promise<ContactRecord[]> {
  const rows = await listCollection<ContactRecord>(db, COLLECTIONS.CONTACTS);
  return rows.sort((left, right) => {
    const solutionDiff = left.solutionName.localeCompare(right.solutionName, "ko");
    if (solutionDiff !== 0) return solutionDiff;
    const orgDiff = left.organizationName.localeCompare(right.organizationName, "ko");
    if (orgDiff !== 0) return orgDiff;
    return left.contactName.localeCompare(right.contactName, "ko");
  });
}

async function listHistory(db: Firestore): Promise<HistoryRecord[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.LICENSE_HISTORY));
  return sortHistory(
    snapshot.docs.map((row) => ({
      id: row.id,
      ...(row.data() as Omit<HistoryRecord, "id">)
    }))
  );
}

async function listPermissions(db: Firestore): Promise<UserPermissionRecord[]> {
  const rows = await listCollection<UserPermissionRecord>(db, COLLECTIONS.USER_PERMISSIONS);
  return rows.sort((left, right) => left.email.localeCompare(right.email));
}

async function listSettings(db: Firestore): Promise<SystemSettingRecord[]> {
  const rows = await listCollection<SystemSettingRecord>(db, COLLECTIONS.SYSTEM_SETTINGS);
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return defaultSettings().map((setting) => byKey.get(setting.key) ?? setting);
}

function defaultSettings(): SystemSettingRecord[] {
  return [
    {
      key: SETTING_KEYS.EXPIRING_DAYS,
      value: String(DEFAULT_EXPIRING_DAYS),
      description: "종료일 기준 몇 일 이내를 만료예정으로 볼지",
      updatedAt: null,
      updatedByEmail: ""
    },
    {
      key: SETTING_KEYS.TIME_ZONE,
      value: DEFAULT_TIME_ZONE,
      description: "일시 표시 및 계산 기준 타임존",
      updatedAt: null,
      updatedByEmail: ""
    }
  ];
}

function getExpiringDays(settings: SystemSettingRecord[]): number {
  const value = Number(settings.find((setting) => setting.key === SETTING_KEYS.EXPIRING_DAYS)?.value);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_EXPIRING_DAYS;
}

function buildDashboardCards(solutions: SolutionRecord[], licenses: LicenseView[]): DashboardCard[] {
  return solutions.map((solution) => {
    const related = licenses.filter((license) => license.solutionName === solution.solutionName);
    const counts = related.reduce(
      (result, license) => {
        if (license.isExpired) {
          result.expiredCount += 1;
        } else if (license.storedStatus === LICENSE_STATUS.IN_USE) {
          result.inUseCount += 1;
        } else {
          result.availableCount += 1;
        }

        if (license.isExpiringSoon) {
          result.expiringSoonCount += 1;
        }

        return result;
      },
      { availableCount: 0, inUseCount: 0, expiringSoonCount: 0, expiredCount: 0 }
    );

    return {
      solutionName: solution.solutionName,
      manufacturerName: solution.manufacturerName,
      ...counts
    };
  });
}

function buildReferenceData(solutions: SolutionRecord[]): ReferenceData {
  return {
    ...emptyReferenceData(),
    solutions: solutions.map((solution) => solution.solutionName),
    classifications: LICENSE_CLASSIFICATIONS,
    deploymentTypes: DEPLOYMENT_TYPES,
    licenseRoles: LICENSE_ROLES,
    historyEventTypes: HISTORY_EVENT_TYPES,
    licenseStatuses: [LICENSE_STATUS.AVAILABLE, LICENSE_STATUS.IN_USE, COMPUTED_LICENSE_STATUS.EXPIRED],
    roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.VIEWER, ROLES.NONE]
  };
}

function buildMenuByRole(role: Role): MenuItem[] {
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

function emptyBootstrap(user: UserContext, message?: string): BootstrapData {
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

async function saveSolutionRecord(db: Firestore, actor: string, payload: SaveSolutionPayload): Promise<void> {
  const solutionName = payload.solutionName.trim();
  const manufacturerName = payload.manufacturerName.trim();
  const note = payload.note.trim();

  if (!solutionName) throw new Error("솔루션명은 필수입니다.");
  if (!manufacturerName) throw new Error("제조사명은 필수입니다.");

  const ref = doc(db, COLLECTIONS.SOLUTIONS, toDocId(solutionName));
  const snapshot = await getDoc(ref);
  const now = Timestamp.now();
  const current = snapshot.data() as StoredSolutionRecord | undefined;

  await setDoc(ref, {
    solutionName,
    manufacturerName,
    note,
    createdAt: current?.createdAt ?? now,
    createdByEmail: current?.createdByEmail ?? actor,
    updatedAt: now,
    updatedByEmail: actor
  } satisfies StoredSolutionRecord);
}

async function deleteSolutionRecord(db: Firestore, payload: DeleteSolutionPayload): Promise<void> {
  const solutionName = payload.solutionName.trim();
  if (!solutionName) throw new Error("삭제할 솔루션명을 입력해 주세요.");

  const [licenses, contacts] = await Promise.all([
    listCollection<LicenseRecord>(db, COLLECTIONS.LICENSES),
    listCollection<ContactRecord>(db, COLLECTIONS.CONTACTS)
  ]);
  const hasLicense = licenses.some((license) => license.solutionName === solutionName);
  const hasContact = contacts.some((contact) => contact.solutionName === solutionName);
  if (hasLicense || hasContact) {
    throw new Error("연결된 라이선스 또는 연락처가 있어 삭제할 수 없습니다.");
  }

  await deleteDoc(doc(db, COLLECTIONS.SOLUTIONS, toDocId(solutionName)));
}

async function saveUserPermissionRecord(db: Firestore, actor: string, payload: SaveUserPermissionPayload): Promise<void> {
  const email = payload.email.trim().toLocaleLowerCase("ko");
  const role = payload.role;
  const note = payload.note.trim();

  if (!email) throw new Error("사용자 이메일은 필수입니다.");
  if (!isRole(role)) throw new Error("유효하지 않은 권한 역할입니다.");

  const ref = doc(db, COLLECTIONS.USER_PERMISSIONS, permissionDocId(email));
  const snapshot = await getDoc(ref);
  const current = snapshot.data() as UserPermissionRecord | undefined;
  const now = Timestamp.now();

  await setDoc(ref, {
    email,
    role,
    note,
    createdAt: current?.createdAt ?? now,
    createdByEmail: current?.createdByEmail ?? actor,
    updatedAt: now,
    updatedByEmail: actor
  } satisfies UserPermissionRecord);
}

async function updateSystemSettingRecord(db: Firestore, actor: string, payload: UpdateSystemSettingPayload): Promise<void> {
  const key = payload.key.trim();
  const value = payload.value.trim();
  const description = payload.description.trim();

  if (!key) throw new Error("설정키는 필수입니다.");
  if (!value) throw new Error("설정값은 필수입니다.");
  if (![SETTING_KEYS.EXPIRING_DAYS, SETTING_KEYS.TIME_ZONE].includes(key as typeof SETTING_KEYS.EXPIRING_DAYS | typeof SETTING_KEYS.TIME_ZONE)) {
    throw new Error("지원하지 않는 설정키입니다.");
  }
  if (key === SETTING_KEYS.EXPIRING_DAYS) {
    const days = Number(value);
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error("만료예정기준일수는 1 이상의 정수여야 합니다.");
    }
  }

  await setDoc(doc(db, COLLECTIONS.SYSTEM_SETTINGS, toDocId(key)), {
    key,
    value,
    description,
    updatedAt: Timestamp.now(),
    updatedByEmail: actor
  } satisfies SystemSettingRecord);
}

async function saveLicenseRecord(db: Firestore, actor: string, payload: SaveLicensePayload): Promise<void> {
  const normalized = normalizeLicensePayload(payload);
  validateLicensePayload(normalized);
  await assertSolutionExists(db, normalized.solutionName);

  const licenseRef = doc(db, COLLECTIONS.LICENSES, toDocId(normalized.licenseNumber));

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(licenseRef);
    const now = Timestamp.now();

    if (!snapshot.exists()) {
      const row: LicenseRecord = {
        ...normalized,
        storedStatus: LICENSE_STATUS.AVAILABLE,
        currentIssuerEmail: "",
        currentRecipient: "",
        currentIssuedAt: null,
        createdAt: now,
        createdByEmail: actor,
        updatedAt: now,
        updatedByEmail: actor
      };
      transaction.set(licenseRef, row);
      transaction.set(doc(collection(db, COLLECTIONS.LICENSE_HISTORY)), buildHistoryEvent(HISTORY_EVENT_TYPES[0], row, { actorEmail: actor, note: row.note }));
      return;
    }

    const current = snapshot.data() as LicenseRecord;
    const updated: LicenseRecord = {
      ...current,
      ...normalized,
      storedStatus: current.storedStatus,
      currentIssuerEmail: current.currentIssuerEmail,
      currentRecipient: current.currentRecipient,
      currentIssuedAt: current.currentIssuedAt,
      createdAt: current.createdAt,
      createdByEmail: current.createdByEmail,
      updatedAt: now,
      updatedByEmail: actor
    };
    const changeDetails = buildLicenseChangeDetails(current, updated);
    transaction.set(licenseRef, updated);
    if (changeDetails) {
      transaction.set(doc(collection(db, COLLECTIONS.LICENSE_HISTORY)), buildHistoryEvent(HISTORY_EVENT_TYPES[1], updated, { actorEmail: actor, note: updated.note, changeDetails }));
    }
  });
}

async function issueLicenseRecord(db: Firestore, actor: string, payload: IssueLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const recipient = payload.recipient.trim();
  const note = payload.note.trim();

  if (!licenseNumber) throw new Error("라이선스 번호가 필요합니다.");
  if (!recipient) throw new Error("수령자는 필수입니다.");

  const settings = await listSettings(db);
  const licenseRef = doc(db, COLLECTIONS.LICENSES, toDocId(licenseNumber));

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(licenseRef);
    if (!snapshot.exists()) throw new Error("라이선스를 찾을 수 없습니다.");

    const row = snapshot.data() as LicenseRecord;
    const evaluated = evaluateLicense(row, getExpiringDays(settings));
    if (evaluated.isExpired) throw new Error("만료된 라이선스는 불출할 수 없습니다.");
    if (row.storedStatus === LICENSE_STATUS.IN_USE) throw new Error("이미 사용중인 라이선스입니다.");

    const now = Timestamp.now();
    const updated: LicenseRecord = {
      ...row,
      storedStatus: LICENSE_STATUS.IN_USE,
      currentIssuerEmail: actor,
      currentRecipient: recipient,
      currentIssuedAt: now,
      updatedAt: now,
      updatedByEmail: actor
    };
    transaction.set(licenseRef, updated);
    transaction.set(doc(collection(db, COLLECTIONS.LICENSE_HISTORY)), buildHistoryEvent(HISTORY_EVENT_TYPES[2], updated, { actorEmail: actor, recipient, note }));
  });
}

async function returnLicenseRecord(db: Firestore, actor: string, payload: ReturnLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const note = payload.note.trim();
  const licenseRef = doc(db, COLLECTIONS.LICENSES, toDocId(licenseNumber));

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(licenseRef);
    if (!snapshot.exists()) throw new Error("라이선스를 찾을 수 없습니다.");

    const row = snapshot.data() as LicenseRecord;
    if (row.storedStatus !== LICENSE_STATUS.IN_USE) throw new Error("사용중인 라이선스만 회수할 수 있습니다.");

    const now = Timestamp.now();
    const updated: LicenseRecord = {
      ...row,
      storedStatus: LICENSE_STATUS.AVAILABLE,
      currentIssuerEmail: "",
      currentRecipient: "",
      currentIssuedAt: null,
      updatedAt: now,
      updatedByEmail: actor
    };
    transaction.set(licenseRef, updated);
    transaction.set(doc(collection(db, COLLECTIONS.LICENSE_HISTORY)), buildHistoryEvent(HISTORY_EVENT_TYPES[3], row, { actorEmail: actor, recipient: row.currentRecipient, note }));
  });
}

async function deleteLicenseRecord(db: Firestore, actor: string, payload: DeleteLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const note = payload.note.trim();
  const licenseRef = doc(db, COLLECTIONS.LICENSES, toDocId(licenseNumber));

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(licenseRef);
    if (!snapshot.exists()) throw new Error("라이선스를 찾을 수 없습니다.");

    const row = snapshot.data() as LicenseRecord;
    if (row.storedStatus === LICENSE_STATUS.IN_USE) throw new Error("사용중인 라이선스는 삭제할 수 없습니다.");

    transaction.set(doc(collection(db, COLLECTIONS.LICENSE_HISTORY)), buildHistoryEvent(HISTORY_EVENT_TYPES[4], row, { actorEmail: actor, note, deleteSnapshot: JSON.stringify(row) }));
    transaction.delete(licenseRef);
  });
}

async function saveContactRecord(db: Firestore, actor: string, payload: SaveContactPayload): Promise<void> {
  const normalized = {
    id: payload.id?.trim(),
    solutionName: payload.solutionName.trim(),
    organizationName: payload.organizationName.trim(),
    contactName: payload.contactName.trim(),
    position: payload.position.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    email: payload.email.trim(),
    note: payload.note.trim()
  };

  if (!normalized.solutionName) throw new Error("솔루션명은 필수입니다.");
  if (!normalized.organizationName) throw new Error("소속명은 필수입니다.");
  if (!normalized.contactName) throw new Error("담당자명은 필수입니다.");

  await assertSolutionExists(db, normalized.solutionName);
  const now = Timestamp.now();

  if (!normalized.id) {
    const ref = doc(collection(db, COLLECTIONS.CONTACTS));
    await setDoc(ref, {
      ...normalized,
      id: ref.id,
      createdAt: now,
      createdByEmail: actor,
      updatedAt: now,
      updatedByEmail: actor
    } satisfies ContactRecord);
    return;
  }

  const ref = doc(db, COLLECTIONS.CONTACTS, normalized.id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("수정할 연락처를 찾을 수 없습니다.");
  const current = snapshot.data() as ContactRecord;
  await setDoc(ref, {
    ...normalized,
    id: normalized.id,
    createdAt: current.createdAt,
    createdByEmail: current.createdByEmail,
    updatedAt: now,
    updatedByEmail: actor
  } satisfies ContactRecord);
}

async function deleteContactRecord(db: Firestore, payload: DeleteContactPayload): Promise<void> {
  if (!payload.id.trim()) throw new Error("삭제할 연락처 ID가 필요합니다.");
  await deleteDoc(doc(db, COLLECTIONS.CONTACTS, payload.id.trim()));
}

async function assertSolutionExists(db: Firestore, solutionName: string): Promise<void> {
  const snapshot = await getDoc(doc(db, COLLECTIONS.SOLUTIONS, toDocId(solutionName)));
  if (!snapshot.exists()) {
    throw new Error("등록된 솔루션만 선택할 수 있습니다.");
  }
}

function buildHistoryEvent(
  eventType: HistoryEventType,
  license: Pick<LicenseRecord, "licenseNumber" | "solutionName" | "customerName">,
  options: {
    actorEmail: string;
    recipient?: string;
    note?: string;
    changeDetails?: string;
    deleteSnapshot?: string;
  }
): Omit<HistoryRecord, "id"> {
  return {
    eventAt: Timestamp.now(),
    eventType,
    licenseNumber: license.licenseNumber,
    solutionName: license.solutionName,
    customerName: license.customerName,
    actorEmail: options.actorEmail,
    recipient: options.recipient ?? "",
    note: options.note ?? "",
    changeDetails: options.changeDetails ?? "",
    deleteSnapshot: options.deleteSnapshot ?? "",
    sourceType: "웹앱"
  };
}

function normalizeLicensePayload(payload: SaveLicensePayload): Pick<
  LicenseRecord,
  "solutionName" | "customerName" | "licenseNumber" | "classification" | "deploymentType" | "licenseRole" | "startDate" | "endDate" | "note"
> {
  return {
    solutionName: payload.solutionName.trim(),
    customerName: payload.customerName.trim(),
    licenseNumber: payload.licenseNumber.trim(),
    classification: payload.classification,
    deploymentType: payload.deploymentType,
    licenseRole: payload.licenseRole,
    startDate: payload.startDate.trim(),
    endDate: payload.endDate.trim(),
    note: payload.note.trim()
  };
}

function isRole(value: unknown): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  return new ApiError(error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.");
}
