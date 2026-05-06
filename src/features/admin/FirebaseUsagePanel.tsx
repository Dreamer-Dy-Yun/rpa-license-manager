import { FIRESTORE_SPARK_QUOTAS, getFirestoreUsageConsoleUrl, getNextFirestoreResetLabel } from "../../shared/lib/firebaseUsage";

export function FirebaseUsagePanel() {
  const resetLabel = getNextFirestoreResetLabel();
  const consoleUrl = getFirestoreUsageConsoleUrl();

  return (
    <section className="panel usage-panel" aria-label="Firebase 사용량">
      <div className="usage-panel-header">
        <div>
          <h2>Firebase 사용량</h2>
          <p>정확한 현재 사용량은 Firebase Console 기준입니다.</p>
        </div>
        <a className="usage-link" href={consoleUrl} target="_blank" rel="noreferrer">콘솔 열기</a>
      </div>

      <dl className="usage-grid">
        <div className="usage-item usage-item-attention">
          <dt>현재 사용량</dt>
          <dd>콘솔 확인</dd>
          <span>프론트 단독 구조에서는 전체 사용량 직접 조회 불가</span>
        </div>
        <div className="usage-item">
          <dt>다음 일일 리셋</dt>
          <dd>{resetLabel}</dd>
          <span>태평양 시간 자정 전후</span>
        </div>
        {FIRESTORE_SPARK_QUOTAS.map((quota) => (
          <div className="usage-item" key={quota.key}>
            <dt>{quota.label}</dt>
            <dd>{quota.limit}</dd>
            <span>{quota.period}</span>
          </div>
        ))}
      </dl>
    </section>
  );
}
