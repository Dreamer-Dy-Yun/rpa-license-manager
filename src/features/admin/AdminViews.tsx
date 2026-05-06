import { useState } from "react";
import type {
  DeleteSolutionPayload,
  ReferenceData,
  SaveSolutionPayload,
  SaveUserPermissionPayload,
  SolutionRecord,
  SystemSettingRecord,
  UpdateSystemSettingPayload,
  UserPermissionRecord
} from "@rpa-license/domain";
import { formatDateTimeValue } from "@rpa-license/domain";

interface SolutionsViewProps {
  solutions: SolutionRecord[];
  onSave: (payload: SaveSolutionPayload) => Promise<void>;
  onDelete: (payload: DeleteSolutionPayload) => Promise<void>;
}

export function SolutionsView({ solutions, onSave, onDelete }: SolutionsViewProps) {
  const [editing, setEditing] = useState<SolutionRecord | null>(null);

  return (
    <section className="stack">
      <form
        className="panel form-grid"
        key={editing?.solutionName ?? "new-solution"}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await onSave({
            solutionName: String(data.get("solutionName") ?? ""),
            manufacturerName: String(data.get("manufacturerName") ?? ""),
            note: String(data.get("note") ?? "")
          });
          setEditing(null);
          event.currentTarget.reset();
        }}
      >
        <Field name="solutionName" label="솔루션명" defaultValue={editing?.solutionName} required readOnly={Boolean(editing)} />
        <Field name="manufacturerName" label="제조사명" defaultValue={editing?.manufacturerName} required />
        <label className="field field-full">
          <span>비고</span>
          <textarea name="note" rows={3} defaultValue={editing?.note} />
        </label>
        <div className="form-actions">
          <button className="primary-button" type="submit">저장</button>
          <button className="ghost-button" type="button" onClick={() => setEditing(null)}>초기화</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>솔루션명</th>
              <th>제조사명</th>
              <th>라이선스</th>
              <th>연락처</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {solutions.map((row) => (
              <tr key={row.solutionName}>
                <td>{row.solutionName}</td>
                <td>{row.manufacturerName}</td>
                <td>{row.connectedLicenseCount}</td>
                <td>{row.connectedContactCount}</td>
                <td>
                  <div className="inline-actions">
                    <button type="button" onClick={() => setEditing(row)}>수정</button>
                    <button type="button" onClick={() => removeSolution(row.solutionName, onDelete)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {solutions.length === 0 ? <p className="table-empty">등록된 솔루션이 없습니다.</p> : null}
      </div>
    </section>
  );
}

interface PermissionsViewProps {
  permissions: UserPermissionRecord[];
  referenceData: ReferenceData;
  onSave: (payload: SaveUserPermissionPayload) => Promise<void>;
}

export function PermissionsView({ permissions, referenceData, onSave }: PermissionsViewProps) {
  const [editing, setEditing] = useState<UserPermissionRecord | null>(null);

  return (
    <section className="stack">
      <form
        className="panel form-grid"
        key={editing?.email ?? "new-permission"}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await onSave({
            email: String(data.get("email") ?? ""),
            role: String(data.get("role") ?? "") as SaveUserPermissionPayload["role"],
            note: String(data.get("note") ?? "")
          });
          setEditing(null);
          event.currentTarget.reset();
        }}
      >
        <Field name="email" label="사용자 이메일" type="email" defaultValue={editing?.email} required readOnly={Boolean(editing)} />
        <Select name="role" label="권한 역할" values={referenceData.roles} defaultValue={editing?.role} required />
        <label className="field field-full">
          <span>비고</span>
          <textarea name="note" rows={3} defaultValue={editing?.note} />
        </label>
        <div className="form-actions">
          <button className="primary-button" type="submit">저장</button>
          <button className="ghost-button" type="button" onClick={() => setEditing(null)}>초기화</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>이메일</th>
              <th>권한</th>
              <th>비고</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((row) => (
              <tr key={row.email}>
                <td>{row.email}</td>
                <td>{row.role}</td>
                <td>{row.note}</td>
                <td><button type="button" onClick={() => setEditing(row)}>수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {permissions.length === 0 ? <p className="table-empty">등록된 권한 사용자가 없습니다.</p> : null}
      </div>
    </section>
  );
}

interface SettingsViewProps {
  settings: SystemSettingRecord[];
  onSave: (payload: UpdateSystemSettingPayload) => Promise<void>;
}

export function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [selectedKey, setSelectedKey] = useState(settings[0]?.key ?? "");
  const selected = settings.find((setting) => setting.key === selectedKey) ?? settings[0];

  return (
    <section className="stack">
      <form
        className="panel form-grid"
        key={selected?.key ?? "setting"}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await onSave({
            key: String(data.get("key") ?? ""),
            value: String(data.get("value") ?? ""),
            description: String(data.get("description") ?? "")
          });
        }}
      >
        <label className="field">
          <span>설정키</span>
          <select name="key" value={selected?.key ?? ""} onChange={(event) => setSelectedKey(event.target.value)}>
            {settings.map((setting) => (
              <option key={setting.key} value={setting.key}>{setting.key}</option>
            ))}
          </select>
        </label>
        <Field name="value" label="설정값" defaultValue={selected?.value} required />
        <label className="field field-full">
          <span>설명</span>
          <textarea name="description" rows={3} defaultValue={selected?.description} />
        </label>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={!selected}>저장</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>설정키</th>
              <th>설정값</th>
              <th>설명</th>
              <th>수정일시</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((row) => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td>{row.value}</td>
                <td>{row.description}</td>
                <td>{formatDateTimeValue(row.updatedAt) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {settings.length === 0 ? <p className="table-empty">시스템 설정이 없습니다.</p> : null}
      </div>
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

function Select({ name, label, values, defaultValue, required }: { name: string; label: string; values: readonly string[]; defaultValue?: string; required?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} required={required}>
        <option value="">선택</option>
        {values.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}

async function removeSolution(solutionName: string, onDelete: SolutionsViewProps["onDelete"]) {
  if (!window.confirm("이 솔루션을 삭제할까요? 연결된 데이터가 있으면 삭제되지 않습니다.")) return;
  await onDelete({ solutionName });
}
