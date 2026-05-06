import { describe, expect, it } from "vitest";
import { LICENSE_STATUS } from "./constants.js";
import { evaluateLicense, sortLicenses } from "./licenseRules.js";
import type { DateTimeValue, LicenseRecord } from "./types.js";

function timestamp(value: string): DateTimeValue {
  const date = new Date(value);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date
  };
}

const base: LicenseRecord = {
  solutionName: "브리티",
  customerName: "테스트기관",
  licenseNumber: "LIC-001",
  classification: "구매",
  deploymentType: "Attended",
  licenseRole: "Bot",
  startDate: "2026-01-01",
  endDate: "2026-05-01",
  storedStatus: LICENSE_STATUS.AVAILABLE,
  currentIssuerEmail: "",
  currentRecipient: "",
  currentIssuedAt: null,
  note: "",
  createdAt: timestamp("2026-01-01T00:00:00Z"),
  createdByEmail: "admin@example.com",
  updatedAt: timestamp("2026-01-01T00:00:00Z"),
  updatedByEmail: "admin@example.com"
};

describe("license rules", () => {
  it("marks expired licenses by end date without changing stored status", () => {
    const result = evaluateLicense(base, 30, "2026-05-06");

    expect(result.storedStatus).toBe("사용가능");
    expect(result.computedStatus).toBe("만료");
    expect(result.isExpired).toBe(true);
  });

  it("sorts available licenses before in-use and expired licenses", () => {
    const available = evaluateLicense({ ...base, licenseNumber: "A", storedStatus: "사용가능", endDate: "2026-12-31" }, 30, "2026-05-06");
    const inUse = evaluateLicense({ ...base, licenseNumber: "B", storedStatus: "사용중", endDate: "2026-12-31" }, 30, "2026-05-06");
    const expired = evaluateLicense({ ...base, licenseNumber: "C", storedStatus: "사용가능", endDate: "2026-01-01" }, 30, "2026-05-06");

    expect([expired, inUse, available].sort(sortLicenses).map((row) => row.licenseNumber)).toEqual(["A", "B", "C"]);
  });
});
