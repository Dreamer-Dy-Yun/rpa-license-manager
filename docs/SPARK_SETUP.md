# Spark Setup

이 프로젝트는 Firebase Spark 무료 플랜 전용으로 운영한다.

## 사용 제품

- Firebase Hosting
- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules

## 사용하지 않는 제품

- Cloud Functions
- Cloud Run
- Artifact Registry
- Cloud Build 기반 Functions 배포

## 첫 관리자 생성

서버 백엔드가 없기 때문에 최초 관리자 문서는 Firestore 콘솔에서 수동으로 만든다.

1. Firebase Console에서 `Firestore Database`로 이동한다.
2. `userPermissions` 컬렉션을 만든다.
3. 문서 ID는 로그인할 Google 이메일 소문자로 입력한다.
   - 예: `dreamer.dy.yun@gmail.com`
4. 필드를 아래처럼 추가한다.

| Field | Type | Value |
|---|---|---|
| `email` | string | `dreamer.dy.yun@gmail.com` |
| `role` | string | `관리자` |
| `note` | string | `최초 관리자` |
| `createdAt` | string | `2026-05-06 00:00:00` |
| `createdByEmail` | string | `manual` |
| `updatedAt` | string | `2026-05-06 00:00:00` |
| `updatedByEmail` | string | `manual` |

이 문서가 있어야 앱에서 관리자 메뉴가 열린다.

## 보안 기준

- 프론트 버튼 숨김은 보안이 아니다.
- 실제 권한 제한은 `firestore.rules`가 담당한다.
- 권한 없는 사용자는 자신의 권한 문서 확인 외에는 앱 데이터를 읽을 수 없다.

