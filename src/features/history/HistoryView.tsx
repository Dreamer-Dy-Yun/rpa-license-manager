import { useMemo, useState } from "react";
import { filterHistory, formatDateTimeValue, type HistoryFilters, type HistoryRecord, type ReferenceData } from "@rpa-license/domain";
import { Button } from "../../shared/ui/Button";
import { InputField, SelectField } from "../../shared/ui/FormFields";
import { FilterActions, FilterPanel, Stack, TableEmpty, TablePanel } from "../../shared/ui/Surface";

interface HistoryViewProps {
  history: HistoryRecord[];
  referenceData: ReferenceData;
}

export function HistoryView({ history, referenceData }: HistoryViewProps) {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const rows = useMemo(() => filterHistory(history, filters), [history, filters]);

  return (
    <Stack>
      <FilterPanel
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
        <FilterActions>
          <Button variant="secondary" type="submit">필터 적용</Button>
          <Button variant="ghost" onClick={() => setFilters({})}>초기화</Button>
        </FilterActions>
      </FilterPanel>

      <TablePanel>
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
                <td className="history-time-cell"><HistoryTime value={row.eventAt} /></td>
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
        {rows.length === 0 ? <TableEmpty>조회 결과가 없습니다.</TableEmpty> : null}
      </TablePanel>
    </Stack>
  );
}

function HistoryTime({ value }: { value: HistoryRecord["eventAt"] }) {
  const full = formatDateTimeValue(value);
  if (!full) {
    return <span>-</span>;
  }

  return (
    <span className="history-time" title={full}>
      <span className="history-time-date">{full.slice(2, 10).replaceAll("-", ".")}</span>
      <span className="history-time-clock">{full.slice(11, 16)}</span>
    </span>
  );
}
