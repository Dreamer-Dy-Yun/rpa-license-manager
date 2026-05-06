import { describe, expect, it } from "vitest";
import { LICENSE_STATUS } from "./constants.js";
import { evaluateLicense, sortLicenses } from "./licenseRules.js";
import type { LicenseRecord } from "./types.js";

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
  currentIssuedAt: "",
  note: "",
  createdAt: "2026-01-01 00:00:00",
  createdByEmail: "admin@example.com",
  updatedAt: "2026-01-01 00:00:00",
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
