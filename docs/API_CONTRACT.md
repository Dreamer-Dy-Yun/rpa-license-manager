# API Contract

프론트 화면은 `AppApi` 계약만 호출한다. Spark 무료 전용 구조에서는 `AppApi` 구현체가 Firebase Web SDK로 Firestore에 직접 접근한다.

## Common

- 인증: Firebase Auth Google login
- 오류: Firestore SDK 오류 또는 프론트 `ApiError`
- 성공 응답: 함수별 데이터 반환
- mutation 성공 응답: 최신 `BootstrapData` 반환
- 일시 필드: `createdAt`, `updatedAt`, `eventAt`, `currentIssuedAt`은 Firestore `timestamp` 또는 명시적 `null`을 사용한다.
- 날짜 필드: 라이선스 `startDate`, `endDate`는 날짜 전용 `yyyy-MM-dd` 문자열을 사용한다.

## AppApi Methods

| Method | Auth | Role | Request | Response |
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

## Security Boundary

프론트 검증은 사용자 경험용이다. 실제 보안 경계는 `firestore.rules`다.
