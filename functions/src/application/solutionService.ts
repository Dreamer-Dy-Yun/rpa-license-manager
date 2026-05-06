import {
  COLLECTIONS,
  nowDateTimeString,
  type SolutionRecord,
  type StoredSolutionRecord
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import { toDocId } from "../infra/ids.js";
import type { Actor } from "../shared/auth.js";

export async function listSolutions(): Promise<SolutionRecord[]> {
  const [solutionsSnapshot, licensesSnapshot, contactsSnapshot] = await Promise.all([
    db.collection(COLLECTIONS.SOLUTIONS).get(),
    db.collection(COLLECTIONS.LICENSES).get(),
    db.collection(COLLECTIONS.CONTACTS).get()
  ]);

  const licenseCounts = countByField(licensesSnapshot.docs.map((doc) => doc.data()), "solutionName");
  const contactCounts = countByField(contactsSnapshot.docs.map((doc) => doc.data()), "solutionName");

  return solutionsSnapshot.docs
    .map((doc) => {
      const row = doc.data() as StoredSolutionRecord;
      return {
        ...row,
        connectedLicenseCount: licenseCounts.get(row.solutionName) ?? 0,
        connectedContactCount: contactCounts.get(row.solutionName) ?? 0
      };
    })
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function saveSolution(actor: Actor, payload: { solutionName: string; manufacturerName: string; note: string }): Promise<void> {
  const solutionName = payload.solutionName.trim();
  const manufacturerName = payload.manufacturerName.trim();
  const note = payload.note.trim();

  if (!solutionName) {
    throw new Error("솔루션명은 필수입니다.");
  }
  if (!manufacturerName) {
    throw new Error("제조사명은 필수입니다.");
  }

  const ref = db.collection(COLLECTIONS.SOLUTIONS).doc(toDocId(solutionName));
  const snapshot = await ref.get();
  const now = nowDateTimeString();

  if (!snapshot.exists) {
    await ref.set({
      solutionName,
      manufacturerName,
      note,
      createdAt: now,
      createdByEmail: actor.email,
      updatedAt: now,
      updatedByEmail: actor.email
    } satisfies StoredSolutionRecord);
    return;
  }

  const current = snapshot.data() as StoredSolutionRecord;
  await ref.set({
    solutionName,
    manufacturerName,
    note,
    createdAt: current.createdAt,
    createdByEmail: current.createdByEmail,
    updatedAt: now,
    updatedByEmail: actor.email
  } satisfies StoredSolutionRecord);
}

export async function deleteSolution(solutionName: string): Promise<void> {
  const normalized = solutionName.trim();
  if (!normalized) {
    throw new Error("삭제할 솔루션명을 입력해 주세요.");
  }

  const [licenses, contacts] = await Promise.all([
    db.collection(COLLECTIONS.LICENSES).where("solutionName", "==", normalized).limit(1).get(),
    db.collection(COLLECTIONS.CONTACTS).where("solutionName", "==", normalized).limit(1).get()
  ]);

  if (!licenses.empty || !contacts.empty) {
    throw new Error("연결된 라이선스 또는 연락처가 있어 삭제할 수 없습니다.");
  }

  const ref = db.collection(COLLECTIONS.SOLUTIONS).doc(toDocId(normalized));
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("삭제할 솔루션을 찾을 수 없습니다.");
  }
  await ref.delete();
}

export async function assertSolutionExists(solutionName: string): Promise<void> {
  const snapshot = await db.collection(COLLECTIONS.SOLUTIONS).doc(toDocId(solutionName)).get();
  if (!snapshot.exists) {
    throw new Error("등록된 솔루션만 선택할 수 있습니다.");
  }
}

function countByField(rows: FirebaseFirestore.DocumentData[], field: string): Map<string, number> {
  return rows.reduce<Map<string, number>>((result, row) => {
    const value = typeof row[field] === "string" ? row[field] : "";
    if (value) {
      result.set(value, (result.get(value) ?? 0) + 1);
    }
    return result;
  }, new Map());
}

