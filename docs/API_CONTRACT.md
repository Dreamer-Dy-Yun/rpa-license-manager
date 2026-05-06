# API Contract

프론트 화면은 `AppApi` 계약만 호출한다. Spark 무료 전용 구조에서는 `AppApi` 구현체가 Firebase Web SDK로 Firestore에 직접 접근한다.

## Common

- 인증: Firebase Auth Google login
- 오류: Firestore SDK 오류 또는 프론트 `ApiError`
- 성공 응답: 함수별 데이터 반환
- `bootstrapApp`은 사용자, 메뉴, 빈 화면 데이터만 반환한다. 대량 컬렉션은 읽지 않는다.
- 화면 데이터는 현재 화면 진입 시 섹션 로드 메서드로 가져온다.
- mutation 성공 응답: 최신 최소 `BootstrapData` 반환. 현재 화면 데이터는 이후 섹션 로드로 갱신한다.
- 일시 필드: `createdAt`, `updatedAt`, `eventAt`, `currentIssuedAt`은 Firestore `timestamp` 또는 명시적 `null`을 사용한다.
- 날짜 필드: 라이선스 `startDate`, `endDate`는 날짜 전용 `yyyy-MM-dd` 문자열을 사용한다.
- 이력 조회는 최근 `100`건만 `eventAt desc` 기준으로 읽는다.

## AppApi Methods

| Method | Auth | Role | Request | Response |
|---|---|---|---|---|
| `bootstrapApp` | optional | any | none | `BootstrapData` |
| `loadDashboardData` | required | 관리자, 운영자, 조회자 | none | `DashboardSectionData` |
| `loadLicenseData` | required | 관리자, 운영자, 조회자 | none | `LicenseSectionData` |
| `loadHistoryData` | required | 관리자, 운영자, 조회자 | none | `HistorySectionData` |
| `loadContactData` | required | 관리자, 운영자, 조회자 | none | `ContactSectionData` |
| `loadSolutionsAdminData` | required | 관리자 | none | `SolutionsAdminSectionData` |
| `loadPermissionsAdminData` | required | 관리자 | none | `PermissionsAdminSectionData` |
| `loadSettingsAdminData` | required | 관리자 | none | `SettingsAdminSectionData` |
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
