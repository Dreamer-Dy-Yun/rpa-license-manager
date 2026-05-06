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
