import {
  COLLECTIONS,
  HISTORY_EVENT_TYPES,
  LICENSE_STATUS,
  buildLicenseChangeDetails,
  evaluateLicense,
  nowDateTimeString,
  sortLicenses,
  validateLicensePayload,
  type DashboardCard,
  type DeleteLicensePayload,
  type IssueLicensePayload,
  type LicenseRecord,
  type LicenseView,
  type ReturnLicensePayload,
  type SaveLicensePayload
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import { toDocId } from "../infra/ids.js";
import type { Actor } from "../shared/auth.js";
import { createHistoryEvent } from "./historyService.js";
import { getExpiringDays } from "./systemService.js";
import { assertSolutionExists, listSolutions } from "./solutionService.js";

export async function listLicenses(): Promise<LicenseView[]> {
  const expiringDays = await getExpiringDays();
  const snapshot = await db.collection(COLLECTIONS.LICENSES).get();
  return snapshot.docs
    .map((doc) => evaluateLicense(doc.data() as LicenseRecord, expiringDays))
    .sort(sortLicenses);
}

export async function getDashboardCards(): Promise<DashboardCard[]> {
  const [solutions, licenses] = await Promise.all([listSolutions(), listLicenses()]);

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
      {
        availableCount: 0,
        inUseCount: 0,
        expiringSoonCount: 0,
        expiredCount: 0
      }
    );

    return {
      solutionName: solution.solutionName,
      manufacturerName: solution.manufacturerName,
      ...counts
    };
  });
}

export async function saveLicense(actor: Actor, payload: SaveLicensePayload): Promise<void> {
  const normalized = normalizeLicensePayload(payload);
  validateLicensePayload(normalized);
  await assertSolutionExists(normalized.solutionName);

  const ref = db.collection(COLLECTIONS.LICENSES).doc(toDocId(normalized.licenseNumber));
  const snapshot = await ref.get();
  const now = nowDateTimeString();

  if (!snapshot.exists) {
    const row: LicenseRecord = {
      ...normalized,
      storedStatus: LICENSE_STATUS.AVAILABLE,
      currentIssuerEmail: "",
      currentRecipient: "",
      currentIssuedAt: "",
      createdAt: now,
      createdByEmail: actor.email,
      updatedAt: now,
      updatedByEmail: actor.email
    };

    await ref.set(row);
    await createHistoryEvent(HISTORY_EVENT_TYPES[0], row, {
      actorEmail: actor.email,
      note: row.note
    });
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
    updatedByEmail: actor.email
  };
  const changeDetails = buildLicenseChangeDetails(current, updated);
  await ref.set(updated);

  if (changeDetails) {
    await createHistoryEvent(HISTORY_EVENT_TYPES[1], updated, {
      actorEmail: actor.email,
      note: updated.note,
      changeDetails
    });
  }
}

export async function issueLicense(actor: Actor, payload: IssueLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const recipient = payload.recipient.trim();
  const note = payload.note.trim();

  if (!licenseNumber) {
    throw new Error("라이선스 번호가 필요합니다.");
  }
  if (!recipient) {
    throw new Error("수령자는 필수입니다.");
  }

  const { ref, row } = await getLicenseRefOrThrow(licenseNumber);
  const evaluated = evaluateLicense(row, await getExpiringDays());

  if (evaluated.isExpired) {
    throw new Error("만료된 라이선스는 불출할 수 없습니다.");
  }
  if (row.storedStatus === LICENSE_STATUS.IN_USE) {
    throw new Error("이미 사용중인 라이선스입니다.");
  }

  const now = nowDateTimeString();
  const updated: LicenseRecord = {
    ...row,
    storedStatus: LICENSE_STATUS.IN_USE,
    currentIssuerEmail: actor.email,
    currentRecipient: recipient,
    currentIssuedAt: now,
    updatedAt: now,
    updatedByEmail: actor.email
  };

  await ref.set(updated);
  await createHistoryEvent(HISTORY_EVENT_TYPES[2], updated, {
    actorEmail: actor.email,
    recipient,
    note
  });
}

export async function returnLicense(actor: Actor, payload: ReturnLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const note = payload.note.trim();
  const { ref, row } = await getLicenseRefOrThrow(licenseNumber);

  if (row.storedStatus !== LICENSE_STATUS.IN_USE) {
    throw new Error("사용중인 라이선스만 회수할 수 있습니다.");
  }

  const now = nowDateTimeString();
  const previousRecipient = row.currentRecipient;
  const updated: LicenseRecord = {
    ...row,
    storedStatus: LICENSE_STATUS.AVAILABLE,
    currentIssuerEmail: "",
    currentRecipient: "",
    currentIssuedAt: "",
    updatedAt: now,
    updatedByEmail: actor.email
  };

  await ref.set(updated);
  await createHistoryEvent(HISTORY_EVENT_TYPES[3], row, {
    actorEmail: actor.email,
    recipient: previousRecipient,
    note
  });
}

export async function deleteLicense(actor: Actor, payload: DeleteLicensePayload): Promise<void> {
  const licenseNumber = payload.licenseNumber.trim();
  const note = payload.note.trim();
  const { ref, row } = await getLicenseRefOrThrow(licenseNumber);

  if (row.storedStatus === LICENSE_STATUS.IN_USE) {
    throw new Error("사용중인 라이선스는 삭제할 수 없습니다.");
  }

  await createHistoryEvent(HISTORY_EVENT_TYPES[4], row, {
    actorEmail: actor.email,
    note,
    deleteSnapshot: JSON.stringify(row)
  });
  await ref.delete();
}

async function getLicenseRefOrThrow(licenseNumber: string) {
  if (!licenseNumber) {
    throw new Error("라이선스 번호가 필요합니다.");
  }
  const ref = db.collection(COLLECTIONS.LICENSES).doc(toDocId(licenseNumber));
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("라이선스를 찾을 수 없습니다.");
  }
  return {
    ref,
    row: snapshot.data() as LicenseRecord
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
