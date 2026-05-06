import {
  PERMISSION_REQUEST_STATUS,
  ROLES,
  formatDateTimeValue,
  type PermissionRequestRecord,
  type SavePermissionRequestPayload
} from "@rpa-license/domain";
import { Button } from "../../shared/ui/Button";
import { SelectField, TextAreaField } from "../../shared/ui/FormFields";
import { FormActions, FormMessage, FormPanel, Notice, Stack } from "../../shared/ui/Surface";

interface PermissionRequestViewProps {
  email: string;
  request: PermissionRequestRecord | null;
  onSave: (payload: SavePermissionRequestPayload) => Promise<void>;
}

const REQUESTABLE_ROLES = [ROLES.VIEWER, ROLES.OPERATOR, ROLES.ADMIN] as const;

export function PermissionRequestView({ email, request, onSave }: PermissionRequestViewProps) {
  const isPending = request?.status === PERMISSION_REQUEST_STATUS.PENDING;
  const isRejected = request?.status === PERMISSION_REQUEST_STATUS.REJECTED;

  return (
    <Stack>
      <Notice tone={isRejected ? "danger" : "info"}>
        {request ? requestSummary(request) : "권한 요청을 남기면 관리자가 권한 관리 화면에서 확인할 수 있습니다."}
      </Notice>

      <FormPanel
        key={request ? `${request.status}-${request.updatedAt.seconds}` : "new-permission-request"}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await onSave({
            requestedRole: String(data.get("requestedRole") ?? "") as SavePermissionRequestPayload["requestedRole"],
            reason: String(data.get("reason") ?? "")
          });
          event.currentTarget.reset();
        }}
      >
        <label className="field">
          <span>요청 사용자</span>
          <input value={email} readOnly />
        </label>
        <SelectField
          name="requestedRole"
          label="요청 권한"
          values={REQUESTABLE_ROLES}
          defaultValue={request?.requestedRole ?? ROLES.VIEWER}
          required
        />
        <TextAreaField
          name="reason"
          label="요청 사유"
          className="field-full"
          rows={4}
          defaultValue={isPending || isRejected ? request?.reason : ""}
          required
        />
        <FormMessage>
          {isPending ? "대기 중인 요청도 사유를 수정해 다시 보낼 수 있습니다." : "필요한 권한과 사용 목적을 간단히 적어 주세요."}
        </FormMessage>
        <FormActions>
          <Button variant="primary" type="submit">{isPending ? "요청 수정" : "권한 요청"}</Button>
        </FormActions>
      </FormPanel>
    </Stack>
  );
}

function requestSummary(request: PermissionRequestRecord): string {
  const updatedAt = formatDateTimeValue(request.updatedAt) || "-";
  if (request.status === PERMISSION_REQUEST_STATUS.PENDING) {
    return `${request.requestedRole} 권한 요청이 대기 중입니다. 마지막 요청: ${updatedAt}`;
  }
  if (request.status === PERMISSION_REQUEST_STATUS.REJECTED) {
    return `이전 권한 요청이 거절되었습니다. 관리자 메모: ${request.adminNote || "없음"}`;
  }
  return `${request.requestedRole} 권한 요청이 승인되었습니다. 새로고침 후 메뉴가 열리지 않으면 관리자에게 문의하세요.`;
}
