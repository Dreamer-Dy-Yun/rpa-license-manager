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
import { Button } from "../../shared/ui/Button";
import { InputField, SelectField, TextAreaField } from "../../shared/ui/FormFields";
import { FormActions, FormPanel, Stack, TableActions, TableEmpty, TablePanel } from "../../shared/ui/Surface";
import { FirebaseUsagePanel } from "./FirebaseUsagePanel";

interface SolutionsViewProps {
  solutions: SolutionRecord[];
  onSave: (payload: SaveSolutionPayload) => Promise<void>;
  onDelete: (payload: DeleteSolutionPayload) => Promise<void>;
}

export function SolutionsView({ solutions, onSave, onDelete }: SolutionsViewProps) {
  const [editing, setEditing] = useState<SolutionRecord | null>(null);

  return (
    <Stack>
      <FormPanel
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
        <InputField name="solutionName" label="솔루션명" defaultValue={editing?.solutionName} required readOnly={Boolean(editing)} />
        <InputField name="manufacturerName" label="제조사명" defaultValue={editing?.manufacturerName} required />
        <TextAreaField name="note" label="비고" className="field-full" rows={3} defaultValue={editing?.note} />
        <FormActions>
          <Button variant="primary" type="submit">저장</Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>초기화</Button>
        </FormActions>
      </FormPanel>

      <TablePanel>
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
                  <TableActions>
                    <Button variant="table" onClick={() => setEditing(row)}>수정</Button>
                    <Button variant="table" onClick={() => removeSolution(row.solutionName, onDelete)}>삭제</Button>
                  </TableActions>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {solutions.length === 0 ? <TableEmpty>등록된 솔루션이 없습니다.</TableEmpty> : null}
      </TablePanel>
    </Stack>
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
    <Stack>
      <FormPanel
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
        <InputField name="email" label="사용자 이메일" type="email" defaultValue={editing?.email} required readOnly={Boolean(editing)} />
        <SelectField name="role" label="권한 역할" values={referenceData.roles} defaultValue={editing?.role} required />
        <TextAreaField name="note" label="비고" className="field-full" rows={3} defaultValue={editing?.note} />
        <FormActions>
          <Button variant="primary" type="submit">저장</Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>초기화</Button>
        </FormActions>
      </FormPanel>

      <TablePanel>
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
                <td>
                  <TableActions>
                    <Button variant="table" onClick={() => setEditing(row)}>수정</Button>
                  </TableActions>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {permissions.length === 0 ? <TableEmpty>등록된 권한 사용자가 없습니다.</TableEmpty> : null}
      </TablePanel>
    </Stack>
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
    <Stack>
      <FirebaseUsagePanel />

      <FormPanel
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
        <SelectField name="key" label="설정키" values={settings.map((setting) => setting.key)} value={selected?.key ?? ""} onChange={(event) => setSelectedKey(event.target.value)} placeholder={null} />
        <InputField name="value" label="설정값" defaultValue={selected?.value} required />
        <TextAreaField name="description" label="설명" className="field-full" rows={3} defaultValue={selected?.description} />
        <FormActions>
          <Button variant="primary" type="submit" disabled={!selected}>저장</Button>
        </FormActions>
      </FormPanel>

      <TablePanel>
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
        {settings.length === 0 ? <TableEmpty>시스템 설정이 없습니다.</TableEmpty> : null}
      </TablePanel>
    </Stack>
  );
}

async function removeSolution(solutionName: string, onDelete: SolutionsViewProps["onDelete"]) {
  if (!window.confirm("이 솔루션을 삭제할까요? 연결된 데이터가 있으면 삭제되지 않습니다.")) return;
  await onDelete({ solutionName });
}
