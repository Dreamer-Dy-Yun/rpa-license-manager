import {
  COLLECTIONS,
  ROLES,
  nowDateTimeString,
  type Role,
  type UserPermissionRecord
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import { toDocId } from "../infra/ids.js";
import type { Actor } from "../shared/auth.js";

export async function listPermissions(): Promise<UserPermissionRecord[]> {
  const snapshot = await db.collection(COLLECTIONS.USER_PERMISSIONS).get();
  return snapshot.docs
    .map((doc) => doc.data() as UserPermissionRecord)
    .sort((left, right) => left.email.localeCompare(right.email));
}

export async function saveUserPermission(actor: Actor, payload: { email: string; role: Role; note: string }): Promise<void> {
  const email = payload.email.trim().toLocaleLowerCase("ko");
  const role = payload.role;
  const note = payload.note.trim();

  if (!email) {
    throw new Error("사용자 이메일은 필수입니다.");
  }
  if (!Object.values(ROLES).includes(role)) {
    throw new Error("유효하지 않은 권한 역할입니다.");
  }

  const ref = db.collection(COLLECTIONS.USER_PERMISSIONS).doc(toDocId(email));
  const snapshot = await ref.get();
  const now = nowDateTimeString();

  if (!snapshot.exists) {
    await ref.set({
      email,
      role,
      note,
      createdAt: now,
      createdByEmail: actor.email,
      updatedAt: now,
      updatedByEmail: actor.email
    } satisfies UserPermissionRecord);
    return;
  }

  const current = snapshot.data() as UserPermissionRecord;
  await ref.set({
    email,
    role,
    note,
    createdAt: current.createdAt,
    createdByEmail: current.createdByEmail,
    updatedAt: now,
    updatedByEmail: actor.email
  } satisfies UserPermissionRecord);
}

