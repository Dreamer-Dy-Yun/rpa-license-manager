const PACIFIC_TIME_ZONE = "America/Los_Angeles";
const KOREA_TIME_ZONE = "Asia/Seoul";

export const FIRESTORE_SPARK_QUOTAS = [
  { key: "stored", label: "저장 데이터", limit: "1 GiB", period: "총량" },
  { key: "reads", label: "문서 읽기", limit: "50,000", period: "일" },
  { key: "writes", label: "문서 쓰기", limit: "20,000", period: "일" },
  { key: "deletes", label: "문서 삭제", limit: "20,000", period: "일" },
  { key: "egress", label: "아웃바운드 전송", limit: "10 GiB", period: "월" }
] as const;

export function getFirestoreUsageConsoleUrl(projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "rpa-licence-manager"): string {
  return `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/usage`;
}

export function getNextFirestoreResetLabel(now = new Date()): string {
  const resetAt = nextPacificMidnight(now);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TIME_ZONE,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short"
  }).format(resetAt);
}

function nextPacificMidnight(now: Date): Date {
  const pacificToday = dateParts(now, PACIFIC_TIME_ZONE);
  const nextDate = new Date(Date.UTC(pacificToday.year, pacificToday.month - 1, pacificToday.day + 1));
  return zonedTimeToDate(
    nextDate.getUTCFullYear(),
    nextDate.getUTCMonth() + 1,
    nextDate.getUTCDate(),
    PACIFIC_TIME_ZONE
  );
}

function zonedTimeToDate(year: number, month: number, day: number, timeZone: string): Date {
  const target = Date.UTC(year, month - 1, day, 0, 0, 0);
  const guess = new Date(target);
  const guessParts = dateParts(guess, timeZone);
  const guessAsUtc = Date.UTC(guessParts.year, guessParts.month - 1, guessParts.day, guessParts.hour, guessParts.minute, guessParts.second);
  return new Date(target - (guessAsUtc - target));
}

function dateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second
  };
}
