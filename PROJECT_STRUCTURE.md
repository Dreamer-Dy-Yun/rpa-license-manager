# Project Structure

이 문서는 LLM과 사람이 프로젝트 경계를 빠르게 파악하기 위한 기준 문서다. 폴더, 파일, 책임이 바뀌면 반드시 이 파일을 함께 갱신한다.

## Boundary Rule

- 화면 책임은 `src/features/*`에 둔다.
- API 호출 계약은 `src/shared/api`에 둔다.
- Firebase 클라이언트 초기화는 `src/shared/firebase`에만 둔다.
- 업무 값, 타입, 계산 규칙은 `packages/domain`에 둔다.
- Firestore 접근과 권한 강제는 `functions/src`에 둔다.
- 배포와 CI/CD 결정은 `.github/workflows`, `firebase.json`, `docs/DEPLOYMENT.md`에 둔다.
- 임의 업무 데이터는 만들지 않는다. 백엔드가 없거나 설정이 없으면 빈 계약 응답 또는 오류 상태를 드러낸다.

## Root

| Path | Role |
|---|---|
| `README.md` | 실행 방법과 프로젝트 요약 |
| `PROJECT_STRUCTURE.md` | 폴더/파일 경계의 기준 문서 |
| `package.json` | 프론트, 공유 도메인, Functions를 묶는 npm workspace 루트 |
| `firebase.json` | Hosting, Functions, Firestore 배포 설정 |
| `.firebaserc` | 기본 Firebase project id. 현재 `rpa-licence-manager` |
| `firestore.rules` | 클라이언트 직접 Firestore 접근 차단. 앱 데이터 접근은 Functions를 통한다 |
| `.env.example` | 프론트 Firebase Web App 환경 변수 계약 |
| `.firebaserc.example` | 실제 project id가 들어갈 파일의 예시 |
| `.gitattributes` | 저장소 줄바꿈 정규화 기준 |

## `packages/domain`

프론트와 백엔드가 공유하는 업무 언어다. Firebase SDK, React, Admin SDK를 import하지 않는다.

| Path | Role |
|---|---|
| `packages/domain/src/constants.ts` | 역할, 상태, 분류, 컬렉션명, 기본 설정값 |
| `packages/domain/src/types.ts` | API 계약과 Firestore 문서의 TypeScript 타입 |
| `packages/domain/src/date.ts` | 날짜/일시 포맷과 날짜-only 계산 |
| `packages/domain/src/licenseRules.ts` | 라이선스 만료 계산, 필터, 정렬, 변경 상세 계산 |
| `packages/domain/src/index.ts` | 외부 공개 export 경계 |

## `functions`

Firebase Cloud Functions 백엔드다. Firestore Admin SDK로 데이터 저장과 권한을 강제한다.

| Path | Role |
|---|---|
| `functions/src/index.ts` | callable function export |
| `functions/src/transport/callables.ts` | Firebase callable 요청/응답 경계 |
| `functions/src/application/*` | 유스케이스 조합. 권한 확인, 저장, 이력 생성 흐름 |
| `functions/src/domain/*` | 백엔드 전용 도메인 보조 규칙 |
| `functions/src/infra/*` | Firebase Admin, Firestore 컬렉션, 문서 ID 변환 |
| `functions/src/shared/*` | 백엔드 공통 에러/인증 보조 |

## `src`

React 프론트엔드다. 화면은 API 계약을 호출하며, Firestore를 직접 읽거나 쓰지 않는다.

| Path | Role |
|---|---|
| `src/main.tsx` | React 앱 진입점 |
| `src/app/App.tsx` | 앱 상태 조합과 화면 라우팅 |
| `src/app/AppShell.tsx` | 공통 레이아웃, 메뉴, 로그인 영역 |
| `src/shared/api/*` | 백엔드 callable 계약과 대체 구현체 |
| `src/shared/firebase/*` | Firebase Web SDK 초기화와 Auth 연결 |
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
| `docs/API_CONTRACT.md` | 프론트와 백엔드 callable 계약 |
| `docs/DATA_MODEL.md` | Firestore 컬렉션과 문서 의미 |
| `docs/DEPLOYMENT.md` | GitHub Actions와 Firebase 배포 절차 |
| `docs/DECISIONS.md` | 저장된 사용자 결정과 아키텍처 결정 |

## `.github/workflows`

| Path | Role |
|---|---|
| `.github/workflows/ci.yml` | PR/push 검증: install, build, test |
| `.github/workflows/firebase-deploy.yml` | main 배포: Hosting, Functions, Firestore rules/indexes |
