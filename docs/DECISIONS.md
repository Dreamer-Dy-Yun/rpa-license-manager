# Decisions

## 2026-05-06

- 새 프로젝트 폴더는 `C:\TEST\rpa-license-manager`로 정한다.
- 기존 Spreadsheet 데이터는 마이그레이션하지 않는다.
- 저장소는 Cloud Firestore를 사용한다.
- 프론트는 React + TypeScript + Vite를 사용한다.
- 백엔드는 Firebase Auth + Firestore + Cloud Functions + Hosting을 사용한다.
- 로그인은 Firebase Authentication의 Google provider를 기준으로 한다.
- Firestore 직접 접근은 보안 규칙에서 차단하고, 모든 업무 데이터 접근은 callable Functions를 통한다.
- 최초 관리자 등록은 `userPermissions` 컬렉션이 비어 있을 때 최초 로그인 사용자를 `관리자`로 저장하는 방식으로 처리한다.
- Firebase project id와 배포 secret은 나중에 주입한다.
- Firebase project id는 `rpa-licence-manager`로 확정했다.
- Firestore는 DB 비밀번호를 쓰지 않는다. 클라이언트 직접 접근은 `firestore.rules`에서 차단하고, 서버 접근은 Firebase Admin SDK와 service account/IAM으로 통제한다.
- Firebase Web App 설정은 `.env.local`에 저장한다. 실제 값은 GitHub 저장소 파일에 커밋하지 않고 Actions secrets로 주입한다.
- GitHub Actions 배포 service account는 여러 Firebase 프로젝트를 구분할 수 있게 표시 이름에 프로젝트명을 포함한다. ID는 길이 제한을 고려해 `rpa-licence-gha-deployer`를 사용한다.
