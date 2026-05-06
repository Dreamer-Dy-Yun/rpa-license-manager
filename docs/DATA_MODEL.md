# Data Model

## Collection: `solutions`

솔루션 마스터.

- Document id: `solutionName`을 안전하게 인코딩한 값
- Unique key: `solutionName`
- Delete rule: 연결된 라이선스 또는 연락처가 있으면 삭제 불가

## Collection: `licenses`

라이선스 현재 상태.

- Document id: `licenseNumber`를 안전하게 인코딩한 값
- Stored status: `사용가능`, `사용중`
- Computed status: `만료`는 저장하지 않고 `endDate`로 계산

## Collection: `licenseHistory`

라이선스 불변 이력.

- Document id: auto id
- Existing records are never updated or deleted by app flows
- `sourceType` marks `웹앱` or future sources

## Collection: `contacts`

솔루션별 연락처.

- Document id: auto id
- Query fields: solution name, organization, contact name, phone, email

## Collection: `userPermissions`

사용자 권한.

- Document id: email을 안전하게 인코딩한 값
- 권한 제거는 삭제가 아니라 `권한없음` 저장
- 최초 로그인 사용자가 최초 관리자 seed 조건을 만족하면 `관리자`로 저장된다

## Collection: `systemSettings`

공통 설정.

- Document id: setting key를 안전하게 인코딩한 값
- Initial keys: `만료예정기준일수`, `타임존`

