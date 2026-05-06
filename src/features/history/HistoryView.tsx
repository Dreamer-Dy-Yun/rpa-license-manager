import { useMemo, useState } from "react";
import { filterHistory, formatDateTimeValue, type HistoryFilters, type HistoryRecord, type ReferenceData } from "@rpa-license/domain";
import { InputField, SelectField } from "../../shared/ui/FormFields";

interface HistoryViewProps {
  history: HistoryRecord[];
  referenceData: ReferenceData;
}

export function HistoryView({ history, referenceData }: HistoryViewProps) {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const rows = useMemo(() => filterHistory(history, filters), [history, filters]);

  return (
    <section className="stack">
      <form
        className="panel filter-grid"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setFilters({
            solutionName: String(data.get("solutionName") ?? ""),
            eventType: String(data.get("eventType") ?? "") as HistoryFilters["eventType"],
            licenseNumber: String(data.get("licenseNumber") ?? ""),
            operatorEmail: String(data.get("operatorEmail") ?? ""),
            recipient: String(data.get("recipient") ?? "")
          });
        }}
      >
        <SelectField name="solutionName" label="솔루션명" values={referenceData.solutions} includeAll />
        <SelectField name="eventType" label="이벤트 종류" values={[...referenceData.historyEventTypes]} includeAll />
        <InputField name="licenseNumber" label="라이선스 번호" />
        <InputField name="operatorEmail" label="작업자" />
        <InputField name="recipient" label="수령자" />
        <div className="form-actions">
          <button className="secondary-button" type="submit">필터 적용</button>
          <button className="ghost-button" type="button" onClick={() => setFilters({})}>초기화</button>
        </div>
      </form>

      <div className="panel table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>일시</th>
              <th>종류</th>
              <th>라이선스</th>
              <th>솔루션</th>
              <th>작업자</th>
              <th>수령자</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateTimeValue(row.eventAt)}</td>
                <td>{row.eventType}</td>
                <td>{row.licenseNumber}</td>
                <td>{row.solutionName}</td>
                <td>{row.actorEmail}</td>
                <td>{row.recipient}</td>
                <td>
                  <details>
                    <summary>보기</summary>
                    <pre>{row.changeDetails || row.deleteSnapshot || row.note || "-"}</pre>
                  </details>
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
