# Decisions

## 2026-05-06

- 새 프로젝트 폴더는 `C:\TEST\rpa-license-manager`로 정한다.
- 기존 Spreadsheet 데이터는 마이그레이션하지 않는다.
- 저장소는 Cloud Firestore를 사용한다.
- 프론트는 React + TypeScript + Vite를 사용한다.
- 무료 Spark 플랜을 유지하기 위해 Cloud Functions 백엔드를 사용하지 않는다.
- 프론트는 Firebase Hosting에서 정적 배포하고, Firebase Web SDK로 Firestore에 직접 접근한다.
- 로그인은 Firebase Authentication의 Google provider를 기준으로 한다.
- Firestore Security Rules를 실제 보안 경계로 삼는다.
- 최초 관리자 등록은 Firestore 콘솔에서 수동 생성한다.
- Firebase project id와 배포 secret은 나중에 주입한다.
- Firebase project id는 `rpa-licence-manager`로 확정했다.
- Firestore는 DB 비밀번호를 쓰지 않는다. Spark 전용 구조에서는 클라이언트가 직접 접근하되, `firestore.rules`가 역할 기반 접근을 통제한다.
- Firebase Web App 설정은 `.env.local`에 저장한다. 실제 값은 GitHub 저장소 파일에 커밋하지 않고 Actions secrets로 주입한다.
- GitHub Actions 배포 service account는 여러 Firebase 프로젝트를 구분할 수 있게 표시 이름에 프로젝트명을 포함한다. ID는 길이 제한을 고려해 `rpa-licence-gha-deployer`를 사용한다.

## 2026-05-06 Spark 전용 전환

- 사용자가 무료 Spark 플랜 유지를 명시했다.
- Cloud Functions와 관련된 Cloud Run, Cloud Build, Artifact Registry 배포 흐름을 제거한다.
- `React -> Firestore 직접 접근 -> Firestore Security Rules` 구조로 전환한다.
- 첫 관리자 자동 생성은 서버 없이 안전하게 처리하기 어렵기 때문에 수동 seed로 결정한다.

## 2026-05-06 Spark 읽기량 최적화

- Spark 무료 읽기 한도 보호를 위해 `bootstrapApp`은 대량 컬렉션을 읽지 않는다.
- 화면별 데이터는 화면 진입 시 별도 섹션 API로 지연 로딩한다.
- 라이선스 이력은 누적 데이터이므로 기본 조회를 최근 100건으로 제한한다.

## 2026-05-06 라이선스 기간 입력

- 라이선스 등록 화면은 시작일과 기간(년/개월) 콤보박스 선택으로 종료일을 즉시 계산한다.
- 저장 계약은 `startDate`, `endDate` 날짜 문자열을 유지한다.
- 종료일을 직접 수정하면 기간 선택 상태는 해제한다.

## 2026-05-06 UI 버튼 경계 정리

- 화면에서 직접 `<button>` 스타일을 흩뿌리지 않고 `src/shared/ui/Button.tsx`를 통해 공통 버튼 계층을 사용한다.
- 버튼 형태는 primary, secondary, ghost, icon, menu, tab, table, stepper, card variant로 구분한다.
- 테이블 액션, 탭, 날짜 스테퍼처럼 작은 버튼도 같은 기본 focus/disabled/hover 규칙을 공유한다.
- 생짜 `<button>` fallback은 잘못된 참조를 숨기므로 제거하고, `scripts/audit-styles.mjs`가 공통 Button 밖의 `<button>` 사용을 실패로 처리한다.
- 패널, 폼 액션, 테이블 액션, 빈 상태, 알림, 탭 컨테이너는 `src/shared/ui/Surface.tsx` 래퍼를 사용해 CSS class 문자열이 화면별 파일에 흩어지지 않게 한다.

## 2026-05-06 라이선스 조회 필터 확장

- 라이선스 조회 필터는 5열 그리드 기준으로 배치한다.
- 라이선스 분류와 역할을 조회 조건에 포함한다.

## 2026-05-06 이력 일시 표시 축약

- 이력 조회 테이블의 일시는 `yy.MM.dd`와 `HH:mm` 두 줄로 표시한다.
- 초 단위까지 포함한 전체 일시는 tooltip으로 보존한다.

## 2026-05-06 날짜 입력 스테퍼 위치

- 날짜 입력의 하루 증감 버튼은 입력란 왼쪽에 배치한다.
- 날짜 입력 컨트롤은 일일조정, 입력란, 달력 버튼 순서로 하나의 엘리먼트처럼 보이게 구성한다.
- 브라우저 기본 date picker는 유지하되, 기본 아이콘은 숨기고 명시적인 달력 버튼으로 연다.

## 2026-05-06 라이선스 등록 기간 영역 분리

- 라이선스 등록 폼의 시작일, 기간(년/개월), 종료일은 상위 폼 그리드에 흩뿌리지 않고 전체 폭 영역으로 묶는다.
- 묶인 기간 영역 안에서 별도 6열 그리드를 사용한다. 시작일/종료일은 2칸, 년/개월은 1칸씩 차지한다.
- 기간 영역은 넓은 화면에서도 입력란이 과하게 늘어나지 않도록 컬럼 최대 폭을 제한한다.

## 2026-05-06 Firebase 사용량 확인

- Spark 전용 프론트 단독 구조에서는 Firebase Console의 정확한 현재 전체 사용량을 앱에서 직접 조회하지 않는다.
- 시스템 설정 화면에는 사용량 카드 대신 Firebase Console 사용량 링크만 표시한다.
- Firestore 무료 quota와 리셋 기준은 Firebase Console과 공식 문서 기준으로 확인한다.

## 2026-05-06 권한 요청 흐름

- 서버 백엔드가 없으므로 권한 요청도 Firestore 직접 접근과 Security Rules로 처리한다.
- `permissionRequests/{email}`은 사용자 본인 요청 상태와 관리자 처리 상태를 담는 컬렉션이다.
- 권한 없는 로그인 사용자는 자기 요청만 생성, 조회, 재요청할 수 있다.
- 관리자는 권한 관리 화면에서 요청을 승인 또는 거절한다.
- 승인 시 `userPermissions/{email}`을 같은 트랜잭션에서 생성 또는 갱신한다.

## 2026-05-07 날짜 스테퍼와 이력 필터 배치

- 날짜 입력의 하루 증감 버튼은 길게 누르면 반복 입력으로 동작한다.
- 반복 입력은 짧은 지연 후 시작하고, 누르고 있는 시간이 길수록 적당한 속도까지 가속한다.
- 이력 조회 필터는 기존 5열에서 6열로 확장하고, 마지막 셀 안에 2행 1열 버튼 그리드를 둔다.
