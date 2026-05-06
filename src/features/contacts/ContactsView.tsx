import { useMemo, useState } from "react";
import {
  filterContacts,
  type ContactFilters,
  type ContactRecord,
  type DeleteContactPayload,
  type ReferenceData,
  type SaveContactPayload
} from "@rpa-license/domain";
import { InputField, SelectField, TextAreaField } from "../../shared/ui/FormFields";

interface ContactsViewProps {
  contacts: ContactRecord[];
  referenceData: ReferenceData;
  canManage: boolean;
  onSave: (payload: SaveContactPayload) => Promise<void>;
  onDelete: (payload: DeleteContactPayload) => Promise<void>;
}

export function ContactsView({ contacts, referenceData, canManage, onSave, onDelete }: ContactsViewProps) {
  const [editing, setEditing] = useState<ContactRecord | null>(null);
  const [filters, setFilters] = useState<ContactFilters>({});
  const rows = useMemo(() => filterContacts(contacts, filters), [contacts, filters]);
  const hasSolutions = referenceData.solutions.length > 0;

  return (
    <section className="stack">
      {canManage ? (
        <form
          className="panel form-grid"
          key={editing?.id ?? "new-contact"}
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await onSave({
              id: editing?.id,
              solutionName: String(data.get("solutionName") ?? ""),
              organizationName: String(data.get("organizationName") ?? ""),
              contactName: String(data.get("contactName") ?? ""),
              position: String(data.get("position") ?? ""),
              phoneNumber: String(data.get("phoneNumber") ?? ""),
              email: String(data.get("email") ?? ""),
              note: String(data.get("note") ?? "")
            });
            setEditing(null);
            event.currentTarget.reset();
          }}
        >
          {!hasSolutions ? <p className="form-message">먼저 솔루션을 등록해야 연락처를 저장할 수 있습니다.</p> : null}
          <SelectField name="solutionName" label="솔루션명" values={referenceData.solutions} defaultValue={editing?.solutionName} required disabled={!hasSolutions} />
          <InputField name="organizationName" label="소속명" defaultValue={editing?.organizationName} required />
          <InputField name="contactName" label="담당자명" defaultValue={editing?.contactName} required />
          <InputField name="position" label="직급" defaultValue={editing?.position} />
          <InputField name="phoneNumber" label="전화번호" defaultValue={editing?.phoneNumber} />
          <InputField name="email" label="이메일" type="email" defaultValue={editing?.email} />
          <TextAreaField name="note" label="비고" className="field-full" rows={3} defaultValue={editing?.note} />
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={!hasSolutions}>저장</button>
            <button className="ghost-button" type="button" onClick={() => setEditing(null)}>초기화</button>
          </div>
        </form>
      ) : null}

      <form
        className="panel filter-grid"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setFilters({
            solutionName: String(data.get("solutionName") ?? ""),
            organizationName: String(data.get("organizationName") ?? ""),
            contactName: String(data.get("contactName") ?? ""),
            phoneNumber: String(data.get("phoneNumber") ?? ""),
            email: String(data.get("email") ?? "")
          });
        }}
      >
        <SelectField name="solutionName" label="솔루션명" values={referenceData.solutions} includeAll />
        <InputField name="organizationName" label="소속명" />
        <InputField name="contactName" label="담당자명" />
        <InputField name="phoneNumber" label="전화번호" />
        <InputField name="email" label="이메일" />
        <div className="form-actions">
          <button className="secondary-button" type="submit">필터 적용</button>
          <button className="ghost-button" type="button" onClick={() => setFilters({})}>초기화</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>솔루션</th>
              <th>소속</th>
              <th>담당자</th>
              <th>직급</th>
              <th>전화번호</th>
              <th>이메일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.solutionName}</td>
                <td>{row.organizationName}</td>
                <td>{row.contactName}</td>
                <td>{row.position}</td>
                <td>{row.phoneNumber}</td>
                <td>{row.email}</td>
                <td>
                  {canManage ? (
                    <div className="inline-actions">
                      <button type="button" onClick={() => setEditing(row)}>수정</button>
                      <button type="button" onClick={() => remove(row.id, onDelete)}>삭제</button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="table-empty">조회 결과가 없습니다.</p> : null}
      </div>
    </section>
  );
}

async function remove(id: string, onDelete: ContactsViewProps["onDelete"]) {
  if (!window.confirm("이 연락처를 삭제할까요?")) return;
  await onDelete({ id });
}
