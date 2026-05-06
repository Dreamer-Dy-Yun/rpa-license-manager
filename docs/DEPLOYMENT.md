# Deployment

## GitHub Secrets

나중에 실제 Firebase project를 연결할 때 아래 secrets가 필요하다.

| Secret | Meaning |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Hosting 및 Firestore rules/indexes 배포 권한이 있는 service account JSON |
| `FIREBASE_PROJECT_ID` | 배포 대상 Firebase project id |
| `VITE_FIREBASE_API_KEY` | Firebase Web App config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Web App config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Web App config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Web App config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Web App config |
| `VITE_FIREBASE_APP_ID` | Firebase Web App config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement id. Optional but recommended when Analytics is enabled |

## Pipelines

- `ci.yml`: pull request와 push에서 타입 검사, 테스트, 빌드를 수행한다.
- `firebase-deploy.yml`: `main` branch push 또는 수동 실행에서 Firebase Hosting, Firestore rules/indexes를 배포한다.

현재 Firebase project id는 `rpa-licence-manager`다. GitHub secret `FIREBASE_PROJECT_ID`도 같은 값으로 설정한다.

Firestore에는 별도 DB 비밀번호가 없다. 배포 자동화에는 `FIREBASE_SERVICE_ACCOUNT` secret이 필요하고, 런타임의 데이터 접근은 Firebase Auth와 Firestore Rules로 통제한다.

## Spark 무료 플랜

이 프로젝트는 무료 Spark 플랜을 유지한다. Cloud Functions, Cloud Run, Artifact Registry 기반 배포는 사용하지 않는다.

최초 1회 Firebase Hosting API와 Firestore API가 필요할 수 있다. 콘솔에서 Hosting과 Firestore를 이미 만들었다면 보통 준비가 끝난 상태다.

## Service Account JSON 생성

GitHub Actions가 Firebase CLI로 배포할 수 있도록 Google Cloud service account key를 GitHub secret에 넣는다.

### 1. Service account 생성

Google Cloud Console에서 `IAM 및 관리자 > 서비스 계정`으로 이동한다.

- Project: `rpa-licence-manager`
- Service account name: `rpa-licence-manager GitHub Actions Deployer`
- Service account ID: `rpa-licence-gha-deployer`
- Description: `Deploys Firebase Hosting and Firestore config for rpa-licence-manager from GitHub Actions.`

초기 배포 검증 단계에서는 아래 역할을 부여한다.

- `Firebase Admin`
- `Firebase Hosting Admin`
- `Cloud Datastore Owner`

배포가 안정화되면 과한 권한을 줄이고 최소 권한으로 조정한다. Functions 관련 권한은 Spark 전용 구조에서는 필요 없다.

### 2. JSON key 생성

생성한 service account를 열고 `키 > 키 추가 > 새 키 만들기 > JSON`을 선택한다. 다운로드된 JSON은 다시 받을 수 없으므로 안전하게 보관한다.

### 3. GitHub secret 등록

GitHub repository에서 `Settings > Secrets and variables > Actions > New repository secret`으로 이동한다.

- Name: `FIREBASE_SERVICE_ACCOUNT`
- Secret: 다운로드한 JSON 파일 내용 전체

추가로 아래 값도 등록한다.

- `FIREBASE_PROJECT_ID`: `rpa-licence-manager`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Service account JSON은 저장소 파일로 커밋하지 않는다.

## Local Deploy

```powershell
npm install
npm run validate
npm exec firebase login
npm exec firebase use <project-id>
npm exec firebase deploy
```
