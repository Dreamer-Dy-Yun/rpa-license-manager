import { useMemo, useState } from "react";
import {
  filterLicenses,
  LICENSE_STATUS,
  type DeleteLicensePayload,
  type IssueLicensePayload,
  type LicenseFilters,
  type LicenseView as LicenseViewRecord,
  type ReferenceData,
  type ReturnLicensePayload,
  type SaveLicensePayload
} from "@rpa-license/domain";

interface LicenseViewProps {
  licenses: LicenseViewRecord[];
  referenceData: ReferenceData;
  canEdit: boolean;
  canDelete: boolean;
  initialSolution?: string;
  onSave: (payload: SaveLicensePayload) => Promise<void>;
  onIssue: (payload: IssueLicensePayload) => Promise<void>;
  onReturn: (payload: ReturnLicensePayload) => Promise<void>;
  onDelete: (payload: DeleteLicensePayload) => Promise<void>;
}

export function LicenseView({
  licenses,
  referenceData,
  canEdit,
  canDelete,
  initialSolution,
  onSave,
  onIssue,
  onReturn,
  onDelete
}: LicenseViewProps) {
  const [tab, setTab] = useState(canEdit ? "edit" : "list");
  const [editing, setEditing] = useState<LicenseViewRecord | null>(null);
  const [filters, setFilters] = useState<LicenseFilters>(initialSolution ? { solutionName: initialSolution } : {});
  const rows = useMemo(() => filterLicenses(licenses, filters), [licenses, filters]);
  const hasSolutions = referenceData.solutions.length > 0;

  return (
    <section className="stack">
      <div className="subtabs">
        {canEdit ? <button className={tab === "edit" ? "is-active" : ""} type="button" onClick={() => setTab("edit")}>등록/수정</button> : null}
        <button className={tab === "list" ? "is-active" : ""} type="button" onClick={() => setTab("list")}>조회</button>
      </div>

      {tab === "edit" && canEdit ? (
        <form
          className="panel form-grid"
          key={editing?.licenseNumber ?? "new-license"}
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await onSave({
              solutionName: String(data.get("solutionName") ?? ""),
              customerName: String(data.get("customerName") ?? ""),
              licenseNumber: String(data.get("licenseNumber") ?? ""),
              classification: String(data.get("classification") ?? "") as SaveLicensePayload["classification"],
              deploymentType: String(data.get("deploymentType") ?? "") as SaveLicensePayload["deploymentType"],
              licenseRole: String(data.get("licenseRole") ?? "") as SaveLicensePayload["licenseRole"],
              startDate: String(data.get("startDate") ?? ""),
              endDate: String(data.get("endDate") ?? ""),
              note: String(data.get("note") ?? "")
            });
            setEditing(null);
            event.currentTarget.reset();
          }}
        >
          {!hasSolutions ? <p className="form-message">먼저 솔루션을 등록해야 라이선스를 저장할 수 있습니다.</p> : null}
          <Select name="solutionName" label="솔루션명" values={referenceData.solutions} defaultValue={editing?.solutionName} required disabled={!hasSolutions} />
          <Field name="customerName" label="고객사/기관명" defaultValue={editing?.customerName} required />
          <Field name="licenseNumber" label="라이선스 번호" defaultValue={editing?.licenseNumber} required readOnly={Boolean(editing)} />
          <Select name="classification" label="라이선스 구분" values={referenceData.classifications} defaultValue={editing?.classification} required />
          <Select name="deploymentType" label="배포 방식" values={referenceData.deploymentTypes} defaultValue={editing?.deploymentType} required />
          <Select name="licenseRole" label="역할" values={referenceData.licenseRoles} defaultValue={editing?.licenseRole} required />
          <Field name="startDate" label="시작일" type="date" defaultValue={editing?.startDate} required />
          <Field name="endDate" label="종료일" type="date" defaultValue={editing?.endDate} required />
          <label className="field field-full">
            <span>비고</span>
            <textarea name="note" defaultValue={editing?.note} rows={3} />
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={!hasSolutions}>저장</button>
            <button className="ghost-button" type="button" onClick={() => setEditing(null)}>초기화</button>
          </div>
        </form>
      ) : null}

      {tab === "list" ? (
        <>
          <form
            className="panel filter-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setFilters({
                solutionName: String(data.get("solutionName") ?? ""),
                status: String(data.get("status") ?? "") as LicenseFilters["status"],
                licenseNumber: String(data.get("licenseNumber") ?? ""),
                customerName: String(data.get("customerName") ?? ""),
                recipient: String(data.get("recipient") ?? ""),
                expirationFlag: String(data.get("expirationFlag") ?? "") as LicenseFilters["expirationFlag"]
              });
            }}
          >
            <Select name="solutionName" label="솔루션명" values={referenceData.solutions} defaultValue={filters.solutionName} includeAll />
            <Select name="status" label="상태" values={referenceData.licenseStatuses} defaultValue={filters.status} includeAll />
            <Field name="licenseNumber" label="라이선스 번호" />
            <Field name="customerName" label="고객사/기관명" />
            <Field name="recipient" label="수령자" />
            <Select name="expirationFlag" label="만료 구분" values={["만료", "만료예정"]} defaultValue={filters.expirationFlag} includeAll />
            <div className="form-actions">
              <button className="secondary-button" type="submit">필터 적용</button>
              <button className="ghost-button" type="button" onClick={() => setFilters({})}>초기화</button>
            </div>
          </form>

          <div className="panel table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>솔루션</th>
                  <th>고객사/기관</th>
                  <th>라이선스 번호</th>
                  <th>분류</th>
                  <th>역할</th>
                  <th>종료일</th>
                  <th>수령자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.licenseNumber}>
                    <td><span className={`status ${statusClass(row.computedStatus)}`}>{row.computedStatus}</span></td>
                    <td>{row.solutionName}</td>
                    <td>{row.customerName}</td>
                    <td>{row.licenseNumber}</td>
                    <td>{row.classification}</td>
                    <td>{row.licenseRole}</td>
                    <td>{row.endDate}</td>
                    <td>{row.currentRecipient}</td>
                    <td>
                      <div className="inline-actions">
                        {canEdit ? <button type="button" onClick={() => { setEditing(row); setTab("edit"); }}>수정</button> : null}
                        {canEdit && row.storedStatus === LICENSE_STATUS.AVAILABLE && !row.isExpired ? (
                          <button type="button" onClick={() => issue(row.licenseNumber, onIssue)}>불출</button>
                        ) : null}
                        {canEdit && row.storedStatus === LICENSE_STATUS.IN_USE ? (
                          <button type="button" onClick={() => returnRow(row.licenseNumber, onReturn)}>회수</button>
                        ) : null}
                        {canDelete ? <button type="button" onClick={() => remove(row.licenseNumber, onDelete)}>삭제</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? <p className="table-empty">조회 결과가 없습니다.</p> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Field({ name, label, type = "text", defaultValue, required, readOnly }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean; readOnly?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} readOnly={readOnly} />
    </label>
  );
}

function Select({ name, label, values, defaultValue, includeAll, required, disabled }: { name: string; label: string; values: readonly string[]; defaultValue?: string; includeAll?: boolean; required?: boolean; disabled?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} required={required} disabled={disabled}>
        {includeAll ? <option value="">전체</option> : <option value="">선택</option>}
        {values.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}

function statusClass(status: string): string {
  if (status === "만료") return "status-expired";
  if (status === "사용중") return "status-inuse";
  return "status-available";
}

async function issue(licenseNumber: string, onIssue: LicenseViewProps["onIssue"]) {
  const recipient = window.prompt("수령자를 입력해 주세요.");
  if (!recipient) return;
  const note = window.prompt("불출 비고를 입력해 주세요. 필요 없으면 비워두세요.") ?? "";
  await onIssue({ licenseNumber, recipient, note });
}

async function returnRow(licenseNumber: string, onReturn: LicenseViewProps["onReturn"]) {
  const note = window.prompt("회수 비고를 입력해 주세요. 필요 없으면 비워두세요.") ?? "";
  await onReturn({ licenseNumber, note });
}

async function remove(licenseNumber: string, onDelete: LicenseViewProps["onDelete"]) {
  if (!window.confirm("이 라이선스를 삭제할까요?")) return;
  const note = window.prompt("삭제 비고를 입력해 주세요. 필요 없으면 비워두세요.") ?? "";
  await onDelete({ licenseNumber, note });
}

