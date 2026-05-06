import type { CollectionReference, DocumentData } from "firebase-admin/firestore";
import { COLLECTIONS } from "@rpa-license/domain";
import { db } from "./firebaseAdmin.js";

export function collection<T extends DocumentData>(name: string): CollectionReference<T> {
  return db.collection(name) as CollectionReference<T>;
}

export const refs = {
  licenses: () => collection(COLLECTIONS.LICENSES),
  history: () => collection(COLLECTIONS.LICENSE_HISTORY),
  solutions: () => collection(COLLECTIONS.SOLUTIONS),
  contacts: () => collection(COLLECTIONS.CONTACTS),
  permissions: () => collection(COLLECTIONS.USER_PERMISSIONS),
  settings: () => collection(COLLECTIONS.SYSTEM_SETTINGS)
};

