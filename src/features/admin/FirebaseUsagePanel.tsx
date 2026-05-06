import { ExternalLink } from "lucide-react";
import { getFirestoreUsageConsoleUrl } from "../../shared/lib/firebaseUsage";

export function FirebaseUsagePanel() {
  const consoleUrl = getFirestoreUsageConsoleUrl();

  return (
    <div className="settings-console-action" aria-label="Firebase 콘솔">
      <span>Firebase 사용량은 콘솔에서 확인합니다.</span>
      <a className="ui-button ui-button-secondary settings-console-link" href={consoleUrl} target="_blank" rel="noreferrer">
        <ExternalLink size={16} aria-hidden="true" />
        콘솔 열기
      </a>
    </div>
  );
}
