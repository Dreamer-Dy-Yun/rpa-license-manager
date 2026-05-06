# Project Structure

이 문서는 LLM과 사람이 프로젝트 경계를 빠르게 파악하기 위한 기준 문서다. 폴더, 파일, 책임이 바뀌면 반드시 이 파일을 함께 갱신한다.

## Boundary Rule

- 화면 책임은 `src/features/*`에 둔다.
- API 호출 계약은 `src/shared/api`에 둔다.
- Firebase 클라이언트 초기화는 `src/shared/firebase`에만 둔다.
- 업무 값, 타입, 계산 규칙은 `packages/domain`에 둔다.
- Firestore 접근은 `src/shared/api/firestoreAppApi.ts`에 둔다.
- 권한 강제의 최종 경계는 `firestore.rules`에 둔다.
- 배포와 CI/CD 결정은 `.github/workflows`, `firebase.json`, `docs/DEPLOYMENT.md`에 둔다.
- 임의 업무 데이터는 만들지 않는다. 백엔드가 없거나 설정이 없으면 빈 계약 응답 또는 오류 상태를 드러낸다.

## Root

| Path | Role |
|---|---|
| `README.md` | 실행 방법과 프로젝트 요약 |
| `PROJECT_STRUCTURE.md` | 폴더/파일 경계의 기준 문서 |
| `package.json` | 프론트와 공유 도메인을 묶는 npm workspace 루트 |
| `firebase.json` | Hosting과 Firestore rules/indexes 배포 설정 |
| `.firebaserc` | 기본 Firebase project id. 현재 `rpa-licence-manager` |
| `firestore.rules` | Spark 전용 보안 경계. 역할별 Firestore 직접 접근을 제한한다 |
| `.env.example` | 프론트 Firebase Web App 환경 변수 계약 |
| `.firebaserc.example` | 실제 project id가 들어갈 파일의 예시 |
| `.gitattributes` | 저장소 줄바꿈 정규화 기준 |

## `packages/domain`

프론트와 Firestore Rules 문서가 공유하는 업무 언어다. Firebase SDK와 React를 import하지 않는다.

| Path | Role |
|---|---|
| `packages/domain/src/constants.ts` | 역할, 상태, 분류, 컬렉션명, 기본 설정값 |
| `packages/domain/src/types.ts` | API 계약과 Firestore 문서의 TypeScript 타입 |
| `packages/domain/src/date.ts` | 날짜/일시 포맷과 날짜-only 계산 |
| `packages/domain/src/licenseRules.ts` | 라이선스 만료 계산, 필터, 정렬, 변경 상세 계산 |
| `packages/domain/src/index.ts` | 외부 공개 export 경계 |

## `src`

React 프론트엔드다. 화면은 API 계약을 호출하며, API 구현체가 Firebase SDK로 Firestore에 직접 접근한다.

| Path | Role |
|---|---|
| `src/main.tsx` | React 앱 진입점 |
| `src/app/App.tsx` | 앱 상태 조합과 화면 라우팅 |
| `src/app/AppShell.tsx` | 공통 레이아웃, 메뉴, 로그인 영역 |
| `src/shared/api/*` | Firestore 직접 접근 API 계약, Spark 대체 구현체 |
| `src/shared/firebase/*` | Firebase Web SDK 초기화와 Auth/Firestore 연결 |
| `src/shared/lib/firestoreIds.ts` | Firestore 문서 ID 정규화 규칙 |
| `src/features/auth` | 로그인 상태 표시/조작 |
| `src/features/dashboard` | 솔루션별 카드 요약 화면 |
| `src/features/licenses` | 라이선스 등록/수정/조회/불출/회수/삭제 화면 |
| `src/features/history` | 이력 조회 화면 |
| `src/features/contacts` | 연락처 조회/관리 화면 |
| `src/features/admin` | 솔루션, 권한, 시스템 설정 관리자 화면 |
| `src/styles` | 전역 CSS |

## `docs`

| Path | Role |
|---|---|
| `docs/API_CONTRACT.md` | 프론트 화면과 Firestore API 구현체 사이의 계약 |
| `docs/DATA_MODEL.md` | Firestore 컬렉션과 문서 의미 |
| `docs/DEPLOYMENT.md` | GitHub Actions와 Firebase 배포 절차 |
| `docs/DECISIONS.md` | 저장된 사용자 결정과 아키텍처 결정 |
| `docs/SPARK_SETUP.md` | 무료 Spark 플랜 운영과 첫 관리자 수동 생성 절차 |

## `.github/workflows`

| Path | Role |
|---|---|
| `.github/workflows/ci.yml` | PR/push 검증: install, build, test |
| `.github/workflows/firebase-deploy.yml` | main 배포: Hosting, Firestore rules/indexes |
