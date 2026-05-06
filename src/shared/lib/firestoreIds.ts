export function normalizeKey(value: string): string {
  return value.trim().toLocaleLowerCase("ko");
}

export function toDocId(value: string): string {
  const normalized = normalizeKey(value);
  if (!normalized) {
    throw new Error("문서 ID를 만들 수 없는 빈 값입니다.");
  }
  return encodeURIComponent(normalized).replace(/\./g, "%2E");
}

export function permissionDocId(email: string): string {
  const normalized = normalizeKey(email);
  if (!normalized || normalized.includes("/")) {
    throw new Error("유효하지 않은 이메일입니다.");
  }
  return normalized;
}

