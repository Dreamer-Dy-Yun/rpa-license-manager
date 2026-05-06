import {
  COLLECTIONS,
  SOURCE_TYPES,
  nowDateTimeString,
  sortHistory,
  type HistoryEventType,
  type HistoryRecord,
  type LicenseRecord
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";

export async function listHistory(): Promise<HistoryRecord[]> {
  const snapshot = await db.collection(COLLECTIONS.LICENSE_HISTORY).get();
  return sortHistory(
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<HistoryRecord, "id">)
    }))
  );
}

export async function createHistoryEvent(
  eventType: HistoryEventType,
  license: Pick<LicenseRecord, "licenseNumber" | "solutionName" | "customerName">,
  options: {
    actorEmail: string;
    recipient?: string;
    note?: string;
    changeDetails?: string;
    deleteSnapshot?: string;
  }
): Promise<void> {
  const event: Omit<HistoryRecord, "id"> = {
    eventAt: nowDateTimeString(),
    eventType,
    licenseNumber: license.licenseNumber,
    solutionName: license.solutionName,
    customerName: license.customerName,
    actorEmail: options.actorEmail,
    recipient: options.recipient ?? "",
    note: options.note ?? "",
    changeDetails: options.changeDetails ?? "",
    deleteSnapshot: options.deleteSnapshot ?? "",
    sourceType: SOURCE_TYPES[0]
  };

  await db.collection(COLLECTIONS.LICENSE_HISTORY).add(event);
}

