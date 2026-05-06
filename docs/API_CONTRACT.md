# API Contract

프론트는 Firestore를 직접 읽거나 쓰지 않는다. 모든 업무 호출은 Firebase callable Functions를 통한다.

## Common

- 인증: Firebase Auth Google login
- 오류: callable `HttpsError` 또는 프론트 `ApiError`
- 성공 응답: 함수별 데이터 반환
- mutation 성공 응답: 최신 `BootstrapData` 반환

## Callables

| Callable | Auth | Role | Request | Response |
|---|---|---|---|---|
| `bootstrapApp` | optional | any | none | `BootstrapData` |
| `saveSolution` | required | 관리자 | `SaveSolutionPayload` | `BootstrapData` |
| `deleteSolution` | required | 관리자 | `{ solutionName }` | `BootstrapData` |
| `saveUserPermission` | required | 관리자 | `SaveUserPermissionPayload` | `BootstrapData` |
| `updateSystemSetting` | required | 관리자 | `UpdateSystemSettingPayload` | `BootstrapData` |
| `saveLicense` | required | 관리자, 운영자 | `SaveLicensePayload` | `BootstrapData` |
| `issueLicense` | required | 관리자, 운영자 | `IssueLicensePayload` | `BootstrapData` |
| `returnLicense` | required | 관리자, 운영자 | `ReturnLicensePayload` | `BootstrapData` |
| `deleteLicense` | required | 관리자 | `DeleteLicensePayload` | `BootstrapData` |
| `saveContact` | required | 관리자 | `SaveContactPayload` | `BootstrapData` |
| `deleteContact` | required | 관리자 | `{ id }` | `BootstrapData` |

## Contract Mock

Firebase 설정이 없거나 `VITE_USE_CONTRACT_MOCK=true`이면 프론트는 `contractMockApi`를 사용한다. 이 구현체는 임의 업무 데이터를 만들지 않고 빈 `BootstrapData`와 명시적 설정 상태만 반환한다.

