# Data Model

## Collection: `solutions`

솔루션 마스터.

- Document id: `solutionName`을 안전하게 인코딩한 값
- Unique key: `solutionName`
- Delete rule: 연결된 라이선스 또는 연락처가 있으면 삭제 불가
- Audit fields: `createdAt`, `updatedAt`은 Firestore `timestamp`

## Collection: `licenses`

라이선스 현재 상태.

- Document id: `licenseNumber`를 안전하게 인코딩한 값
- Stored status: `사용가능`, `사용중`
- Computed status: `만료`는 저장하지 않고 `endDate`로 계산
- `startDate`, `endDate`: 날짜 전용 `yyyy-MM-dd` 문자열
- `currentIssuedAt`: Firestore `timestamp` 또는 `null`
- Audit fields: `createdAt`, `updatedAt`은 Firestore `timestamp`

## Collection: `licenseHistory`

라이선스 불변 이력.

- Document id: auto id
- Existing records are never updated or deleted by app flows
- `sourceType` marks `웹앱` or future sources
- `eventAt`: Firestore `timestamp`
- App query: 최근 100건만 `eventAt desc` 기준으로 조회한다

## Collection: `contacts`

솔루션별 연락처.

- Document id: auto id
- Query fields: solution name, organization, contact name, phone, email
- Audit fields: `createdAt`, `updatedAt`은 Firestore `timestamp`

## Collection: `userPermissions`

사용자 권한.

- Document id: 사용자 이메일 소문자
- 권한 제거는 삭제가 아니라 `권한없음` 저장
- Spark 무료 전용 구조에서는 최초 관리자 문서를 Firestore 콘솔에서 수동 생성한다
- Audit fields: `createdAt`, `updatedAt`은 Firestore `timestamp`

## Collection: `permissionRequests`

권한 없는 로그인 사용자가 남기는 권한 요청.

- Document id: 사용자 이메일 소문자
- 사용자는 자기 요청 문서만 생성, 조회, 재요청할 수 있다
- 관리자는 요청 목록을 조회하고 `대기` 요청을 `승인` 또는 `거절`로 처리한다
- 승인 시 앱 API가 같은 트랜잭션에서 `userPermissions/{email}`을 생성 또는 갱신한다
- Status: `대기`, `승인`, `거절`
- `reviewedAt`: 처리 전 `null`, 처리 후 Firestore `timestamp`
- Audit fields: `createdAt`, `updatedAt`은 Firestore `timestamp`

## Collection: `systemSettings`

공통 설정.

- Document id: setting key를 안전하게 인코딩한 값
- Initial keys: `만료예정기준일수`, `타임존`
- `updatedAt`: 저장된 문서는 Firestore `timestamp`, 앱 기본값은 `null`
