import {
  COMPUTED_LICENSE_STATUS,
  DEPLOYMENT_TYPES,
  HISTORY_EVENT_TYPES,
  LICENSE_CLASSIFICATIONS,
  LICENSE_ROLES,
  LICENSE_STATUS
} from "./constants.js";
import { addDaysDateOnly, compareDateOnly, isDateOnly, todayDateOnly } from "./date.js";
import type {
  ComputedLicenseStatus,
  ContactFilters,
  ContactRecord,
  HistoryFilters,
  HistoryRecord,
  LicenseFilters,
  LicenseRecord,
  LicenseView
} from "./types.js";

export function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

export function isBlank(value: unknown): boolean {
  return normalizeText(value) === "";
}

export function includesText(source: unknown, keyword: unknown): boolean {
  const normalizedKeyword = normalizeText(keyword).toLocaleLowerCase("ko");
  if (!normalizedKeyword) {
    return true;
  }
  return normalizeText(source).toLocaleLowerCase("ko").includes(normalizedKeyword);
}

export function assertAllowedValue<T extends readonly string[]>(value: string, allowed: T, label: string): asserts value is T[number] {
  if (!allowed.includes(value)) {
    throw new Error(`${label} 값이 유효하지 않습니다.`);
  }
}

export function validateLicensePayload(payload: Pick<LicenseRecord, "solutionName" | "customerName" | "licenseNumber" | "classification" | "deploymentType" | "licenseRole" | "startDate" | "endDate">): void {
  if (isBlank(payload.solutionName)) {
    throw new Error("솔루션명은 필수입니다.");
  }
  if (isBlank(payload.customerName)) {
    throw new Error("고객사/기관명은 필수입니다.");
  }
  if (isBlank(payload.licenseNumber)) {
    throw new Error("라이선스 번호는 필수입니다.");
  }
  assertAllowedValue(payload.classification, LICENSE_CLASSIFICATIONS, "라이선스 구분");
  assertAllowedValue(payload.deploymentType, DEPLOYMENT_TYPES, "배포 방식");
  assertAllowedValue(payload.licenseRole, LICENSE_ROLES, "역할");
  if (!isDateOnly(payload.startDate) || !isDateOnly(payload.endDate)) {
    throw new Error("라이선스 시작일과 종료일은 yyyy-MM-dd 형식이어야 합니다.");
  }
  if (compareDateOnly(payload.startDate, payload.endDate) > 0) {
    throw new Error("라이선스 시작일은 종료일보다 늦을 수 없습니다.");
  }
}

export function evaluateLicense(row: LicenseRecord, expiringDays: number, baseDate = todayDateOnly()): LicenseView {
  const threshold = addDaysDateOnly(baseDate, expiringDays);
  const isExpired = compareDateOnly(row.endDate, baseDate) < 0;
  const isExpiringSoon = !isExpired && compareDateOnly(row.endDate, threshold) <= 0;

  return {
    ...row,
    computedStatus: isExpired ? COMPUTED_LICENSE_STATUS.EXPIRED : row.storedStatus,
    isExpired,
    isExpiringSoon
  };
}

export function sortLicenses(left: LicenseView, right: LicenseView): number {
  const rank: Record<ComputedLicenseStatus, number> = {
    [LICENSE_STATUS.AVAILABLE]: 0,
    [LICENSE_STATUS.IN_USE]: 1,
    [COMPUTED_LICENSE_STATUS.EXPIRED]: 2
  };
  const statusDiff = rank[left.computedStatus] - rank[right.computedStatus];
  if (statusDiff !== 0) {
    return statusDiff;
  }
  const customerDiff = left.customerName.localeCompare(right.customerName, "ko");
  if (customerDiff !== 0) {
    return customerDiff;
  }
  return left.licenseNumber.localeCompare(right.licenseNumber, "ko");
}

export function filterLicenses(rows: LicenseView[], filters: LicenseFilters): LicenseView[] {
  return rows.filter((row) => {
    if (filters.solutionName && row.solutionName !== filters.solutionName) return false;
    if (filters.licenseNumber && !includesText(row.licenseNumber, filters.licenseNumber)) return false;
    if (filters.customerName && !includesText(row.customerName, filters.customerName)) return false;
    if (filters.recipient && !includesText(row.currentRecipient, filters.recipient)) return false;
    if (filters.status && row.computedStatus !== filters.status) return false;
    if (filters.classification && row.classification !== filters.classification) return false;
    if (filters.deploymentType && row.deploymentType !== filters.deploymentType) return false;
    if (filters.licenseRole && row.licenseRole !== filters.licenseRole) return false;
    if (filters.expirationFlag === "만료" && !row.isExpired) return false;
    if (filters.expirationFlag === "만료예정" && !row.isExpiringSoon) return false;
    return true;
  });
}

export function filterHistory(rows: HistoryRecord[], filters: HistoryFilters): HistoryRecord[] {
  return rows.filter((row) => {
    if (filters.solutionName && row.solutionName !== filters.solutionName) return false;
    if (filters.licenseNumber && !includesText(row.licenseNumber, filters.licenseNumber)) return false;
    if (filters.eventType && row.eventType !== filters.eventType) return false;
    if (filters.operatorEmail && !includesText(row.actorEmail, filters.operatorEmail)) return false;
    if (filters.recipient && !includesText(row.recipient, filters.recipient)) return false;
    return true;
  });
}

export function filterContacts(rows: ContactRecord[], filters: ContactFilters): ContactRecord[] {
  return rows.filter((row) => {
    if (filters.solutionName && row.solutionName !== filters.solutionName) return false;
    if (filters.organizationName && !includesText(row.organizationName, filters.organizationName)) return false;
    if (filters.contactName && !includesText(row.contactName, filters.contactName)) return false;
    if (filters.phoneNumber && !includesText(row.phoneNumber, filters.phoneNumber)) return false;
    if (filters.email && !includesText(row.email, filters.email)) return false;
    return true;
  });
}

export function buildLicenseChangeDetails(before: LicenseRecord, after: LicenseRecord): string {
  const fields: Array<[keyof LicenseRecord, string]> = [
    ["solutionName", "솔루션명"],
    ["customerName", "고객사/기관명"],
    ["classification", "라이선스구분"],
    ["deploymentType", "배포방식"],
    ["licenseRole", "역할"],
    ["startDate", "라이선스시작일"],
    ["endDate", "라이선스종료일"],
    ["note", "비고"]
  ];

  return fields
    .reduce<string[]>((changes, [key, label]) => {
      const beforeValue = normalizeText(before[key]);
      const afterValue = normalizeText(after[key]);
      if (beforeValue !== afterValue) {
        changes.push(`${label}: ${beforeValue} -> ${afterValue}`);
      }
      return changes;
    }, [])
    .join("\n");
}

export function sortHistory(rows: HistoryRecord[]): HistoryRecord[] {
  return [...rows].sort((left, right) => right.eventAt.localeCompare(left.eventAt));
}

export function emptyReferenceData() {
  return {
    solutions: [],
    classifications: LICENSE_CLASSIFICATIONS,
    deploymentTypes: DEPLOYMENT_TYPES,
    licenseRoles: LICENSE_ROLES,
    historyEventTypes: HISTORY_EVENT_TYPES,
    licenseStatuses: [LICENSE_STATUS.AVAILABLE, LICENSE_STATUS.IN_USE, COMPUTED_LICENSE_STATUS.EXPIRED] as const,
    roles: ["관리자", "운영자", "조회자", "권한없음"] as const
  };
}
