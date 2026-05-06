import { HttpsError } from "firebase-functions/v2/https";

export function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }
  const message = error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.";
  return new HttpsError("failed-precondition", message);
}

export function invalidArgument(message: string): HttpsError {
  return new HttpsError("invalid-argument", message);
}

export function permissionDenied(): HttpsError {
  return new HttpsError("permission-denied", "권한이 없습니다.");
}

export function unauthenticated(): HttpsError {
  return new HttpsError("unauthenticated", "로그인이 필요합니다.");
}

