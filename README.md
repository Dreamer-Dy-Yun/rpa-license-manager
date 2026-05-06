# RPA License Manager

Firebase 기반 RPA 라이선스 관리 웹앱입니다.

이 프로젝트는 기존 Google Apps Script/Spreadsheet 구현을 새 런타임으로 옮기되, 스프레드시트는 사용하지 않습니다.

## Stack

- Frontend: React, TypeScript, Vite
- Backend: Firebase Cloud Functions for Firebase, Node.js 22
- Auth: Firebase Authentication Google provider
- Data: Cloud Firestore, Functions Admin SDK only
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

## Required Project Rule

폴더/파일 책임이 바뀌면 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 반드시 함께 수정합니다.
