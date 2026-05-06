import {
  COLLECTIONS,
  nowDateTimeString,
  type ContactRecord,
  type SaveContactPayload
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import type { Actor } from "../shared/auth.js";
import { assertSolutionExists } from "./solutionService.js";

export async function listContacts(): Promise<ContactRecord[]> {
  const snapshot = await db.collection(COLLECTIONS.CONTACTS).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ContactRecord, "id">) }))
    .sort((left, right) => {
      const solutionDiff = left.solutionName.localeCompare(right.solutionName, "ko");
      if (solutionDiff !== 0) return solutionDiff;
      const orgDiff = left.organizationName.localeCompare(right.organizationName, "ko");
      if (orgDiff !== 0) return orgDiff;
      return left.contactName.localeCompare(right.contactName, "ko");
    });
}

export async function saveContact(actor: Actor, payload: SaveContactPayload): Promise<void> {
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

  if (!normalized.solutionName) {
    throw new Error("솔루션명은 필수입니다.");
  }
  if (!normalized.organizationName) {
    throw new Error("소속명은 필수입니다.");
  }
  if (!normalized.contactName) {
    throw new Error("담당자명은 필수입니다.");
  }

  await assertSolutionExists(normalized.solutionName);

  const now = nowDateTimeString();
  if (!normalized.id) {
    const ref = db.collection(COLLECTIONS.CONTACTS).doc();
    await ref.set({
      id: ref.id,
      solutionName: normalized.solutionName,
      organizationName: normalized.organizationName,
      contactName: normalized.contactName,
      position: normalized.position,
      phoneNumber: normalized.phoneNumber,
      email: normalized.email,
      note: normalized.note,
      createdAt: now,
      createdByEmail: actor.email,
      updatedAt: now,
      updatedByEmail: actor.email
    } satisfies ContactRecord);
    return;
  }

  const ref = db.collection(COLLECTIONS.CONTACTS).doc(normalized.id);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("수정할 연락처를 찾을 수 없습니다.");
  }
  const current = snapshot.data() as ContactRecord;
  await ref.set({
    id: normalized.id,
    solutionName: normalized.solutionName,
    organizationName: normalized.organizationName,
    contactName: normalized.contactName,
    position: normalized.position,
    phoneNumber: normalized.phoneNumber,
    email: normalized.email,
    note: normalized.note,
    createdAt: current.createdAt,
    createdByEmail: current.createdByEmail,
    updatedAt: now,
    updatedByEmail: actor.email
  } satisfies ContactRecord);
}

export async function deleteContact(id: string): Promise<void> {
  const normalized = id.trim();
  if (!normalized) {
    throw new Error("삭제할 연락처 ID가 필요합니다.");
  }
  const ref = db.collection(COLLECTIONS.CONTACTS).doc(normalized);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new Error("삭제할 연락처를 찾을 수 없습니다.");
  }
  await ref.delete();
}

