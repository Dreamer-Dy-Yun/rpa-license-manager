import type { DashboardCard } from "@rpa-license/domain";
import { Button } from "../../shared/ui/Button";

interface DashboardViewProps {
  cards: DashboardCard[];
  onSelectSolution: (solutionName: string) => void;
}

export function DashboardView({ cards, onSelectSolution }: DashboardViewProps) {
  if (cards.length === 0) {
    return <section className="empty-state">표시할 솔루션 카드가 없습니다.</section>;
  }

  return (
    <section className="dashboard-grid">
      {cards.map((card) => (
        <Button variant="card" key={card.solutionName} onClick={() => onSelectSolution(card.solutionName)}>
          <span className="card-title">{card.solutionName}</span>
          <span className="card-subtitle">{card.manufacturerName}</span>
          <dl className="metric-grid">
            <Metric label="사용가능" value={card.availableCount} />
            <Metric label="사용중" value={card.inUseCount} />
            <Metric label="만료예정" value={card.expiringSoonCount} />
            <Metric label="만료" value={card.expiredCount} />
          </dl>
        </Button>
      ))}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
