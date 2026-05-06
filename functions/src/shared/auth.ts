import type { CallableRequest } from "firebase-functions/v2/https";
import {
  PUBLIC_PERMISSION_MESSAGE,
  ROLES,
  type Role,
  type UserContext
} from "@rpa-license/domain";
import { db } from "../infra/firebaseAdmin.js";
import { toDocId } from "../infra/ids.js";
import { permissionDenied, unauthenticated } from "./errors.js";
import { COLLECTIONS } from "@rpa-license/domain";

export interface Actor {
  email: string;
  uid: string;
}

export function getOptionalActor(request: CallableRequest<unknown>): Actor | null {
  const auth = request.auth;
  const email = auth?.token.email;
  if (!auth || typeof email !== "string" || email.trim() === "") {
    return null;
  }
  return {
    email: email.trim().toLocaleLowerCase("ko"),
    uid: auth.uid
  };
}

export function requireActor(request: CallableRequest<unknown>): Actor {
  const actor = getOptionalActor(request);
  if (!actor) {
    throw unauthenticated();
  }
  return actor;
}

export async function getRole(email: string): Promise<Role> {
  const snapshot = await db.collection(COLLECTIONS.USER_PERMISSIONS).doc(toDocId(email)).get();
  if (!snapshot.exists) {
    return ROLES.NONE;
  }
  const role = snapshot.get("role");
  return Object.values(ROLES).includes(role) ? role : ROLES.NONE;
}

export async function requireRole(actor: Actor, allowedRoles: Role[]): Promise<Role> {
  const role = await getRole(actor.email);
  if (!allowedRoles.includes(role)) {
    throw permissionDenied();
  }
  return role;
}

export async function buildUserContext(actor: Actor | null): Promise<UserContext> {
  if (!actor) {
    return {
      email: "",
      role: ROLES.NONE,
      canAccessApp: false,
      message: "로그인이 필요합니다."
    };
  }

  const role = await getRole(actor.email);
  return {
    email: actor.email,
    role,
    canAccessApp: role !== ROLES.NONE,
    message: role === ROLES.NONE ? PUBLIC_PERMISSION_MESSAGE : ""
  };
}

