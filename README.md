# RPA License Manager

Firebase Spark 무료 플랜 기반 RPA 라이선스 관리 웹앱입니다.

이 프로젝트는 기존 Google Apps Script/Spreadsheet 구현을 새 런타임으로 옮기되, 스프레드시트는 사용하지 않습니다.

## Stack

- Frontend: React, TypeScript, Vite
- Auth: Firebase Authentication Google provider
- Data: Cloud Firestore
- Backend server: 없음. Firestore Security Rules가 실제 보안 경계
- Hosting: Firebase Hosting
- CI/CD: GitHub Actions

## Local Start

1. `.env.example`을 참고해 `.env.local`에 Firebase Web App 값을 넣습니다.
2. Firebase project id는 나중에 `.firebaserc` 또는 GitHub secret으로 연결합니다.
3. 의존성을 설치합니다.

```powershell
npm install
npm run validate
npm run dev
```

Firebase 설정값이 없을 때는 앱이 임의 업무 데이터를 만들지 않고, 계약 확인용 빈 상태만 표시합니다.

Firebase project id: `rpa-licence-manager`

## Spark Plan Rule

이 프로젝트는 무료 Spark 플랜을 유지한다.

- Cloud Functions를 사용하지 않는다.
- Cloud Run, Artifact Registry, Cloud Build 기반 Functions 배포를 사용하지 않는다.
- 앱은 Firebase Hosting에서 정적 프론트를 서빙한다.
- 로그인은 Firebase Auth를 사용한다.
- 데이터는 브라우저의 Firebase SDK가 Firestore에 직접 접근한다.
- 권한과 데이터 쓰기 제한은 `firestore.rules`에서 강제한다.

첫 관리자 계정은 Firestore 콘솔에서 수동으로 `userPermissions/{email}` 문서를 생성한다. 자세한 절차는 [docs/SPARK_SETUP.md](./docs/SPARK_SETUP.md)를 본다.

## Required Project Rule

폴더/파일 책임이 바뀌면 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 반드시 함께 수정합니다.
