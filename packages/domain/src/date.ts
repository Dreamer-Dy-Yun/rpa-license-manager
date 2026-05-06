import { DEFAULT_TIME_ZONE } from "./constants.js";
import type { DateTimeValue } from "./types.js";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getParts(date: Date, timeZone = DEFAULT_TIME_ZONE): Record<string, string> {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== "literal") {
        result[part.type] = part.value;
      }
      return result;
    }, {});
}

export function nowDateTimeString(date = new Date(), timeZone = DEFAULT_TIME_ZONE): string {
  const parts = getParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function dateTimeMillis(value: DateTimeValue | null | undefined): number {
  if (!value) {
    return 0;
  }
  return value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000);
}

export function compareDateTimeAsc(left: DateTimeValue | null | undefined, right: DateTimeValue | null | undefined): number {
  return dateTimeMillis(left) - dateTimeMillis(right);
}

export function compareDateTimeDesc(left: DateTimeValue | null | undefined, right: DateTimeValue | null | undefined): number {
  return dateTimeMillis(right) - dateTimeMillis(left);
}

export function formatDateTimeValue(value: DateTimeValue | null | undefined, timeZone = DEFAULT_TIME_ZONE): string {
  return value ? nowDateTimeString(value.toDate(), timeZone) : "";
}

export function todayDateOnly(date = new Date(), timeZone = DEFAULT_TIME_ZONE): string {
  const parts = getParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDaysDateOnly(dateOnly: string, days: number): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addMonthsDateOnly(dateOnly: string, months: number): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const targetMonthOffset = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthOffset / 12);
  const targetMonthIndex = ((targetMonthOffset % 12) + 12) % 12;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonthIndex));

  return `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(targetDay)}`;
}

export function endDateFromDuration(startDate: string, years: number, months: number): string {
  if (!isDateOnly(startDate)) {
    return "";
  }

  const totalMonths = years * 12 + months;
  if (!Number.isInteger(totalMonths) || totalMonths <= 0) {
    return "";
  }

  return addDaysDateOnly(addMonthsDateOnly(startDate, totalMonths), -1);
}

export function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function compareDateOnly(left: string, right: string): number {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}
