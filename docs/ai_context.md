# TODO

## 현재 우선순위

### 인프라
- [x] GitHub 연결
- [x] Cloudflare Pages 배포
- [x] Firebase 로그인
- [x] Firestore 저장

---

## 현재 플랫폼 구조

현재 프로젝트는 다음 흐름을 기준으로 구성한다.

```txt
접속
→ 로그인
→ 게임 선택
→ 게임 실행
→ 게임 내부 저장/불러오기 처리
```

루트 페이지는 실제 게임 화면이 아니라
로그인과 게임 목록을 제공하는 런처 페이지 역할을 한다.

---

## 공용 사이트 시스템

현재 단계에서의 공용 시스템은
게임 내부 기능보다 사이트 전체 구조를 우선한다.

### 목표

- 루트 페이지는 로그인과 게임 목록을 제공하는 런처 페이지로 사용한다.
- 사용자는 로그인 상태를 확인하고 원하는 게임으로 진입한다.
- 각 게임은 `games/` 내부에서 독립적으로 실행된다.
- Canvas, 게임 루프, 입력 처리 등은 각 게임 내부에서 구현한다.
- 게임 간 의존성을 최소화한다.

### 완료된 작업

- [x] 루트 `index.html` 런처 페이지 구성
- [x] Firebase 로그인 연결
- [x] 로그인 상태 표시
- [x] 게임 목록 UI 구성
- [x] `games/simple-clicker/` 샘플 게임 추가
- [x] 게임 이동 링크 연결
- [x] 게임 내부 저장/불러오기 시스템 구현
- [x] localStorage fallback 구현
- [x] 30초 자동 저장 구현
- [x] 수동 저장 버튼 구현
- [x] Firebase 설정 공용 분리 (`shared/firebase.js`)
- [x] Upgrade Clicker 샘플 게임 추가

### 다음 작업

- [ ] `shared/save.js` 작성
- [ ] `shared/game-list.js` 작성
- [ ] 게임 목록 자동 렌더링
- [ ] `visible: false` 게임 숨김 처리
- [ ] 썸네일 시스템
- [ ] 공통 CSS 시스템
- [ ] 모바일 UI 개선

---

## 게임 목록 시스템

정적 사이트 환경에서는 브라우저에서 `games/` 폴더를 자동 스캔할 수 없다.

Cloudflare Pages는 서버 파일 목록 API를 제공하지 않으므로,
게임 목록은 `shared/game-list.js` 파일에서 관리한다.

게임 목록 예시:

```js
export const games = [
  {
    id: "simple-clicker",
    title: "Simple Clicker",
    description: "가장 기본적인 클릭 게임",
    path: "./games/simple-clicker/",
    visible: true
  },
  {
    id: "test-game",
    title: "Test Game",
    description: "개발 중인 테스트 게임",
    path: "./games/test-game/",
    visible: false
  }
];
```

`visible: false`인 게임은 메인 페이지에 표시하지 않는다.

---

## 저장 시스템 정책

저장 시스템은 메인 페이지가 아니라
각 게임 내부에서 처리한다.

### 저장 방식

로그인 상태:
- Firebase Firestore 사용

비로그인 상태:
- localStorage 사용

### 기본 동작

- 게임 진입 시 자동 불러오기
- 30초마다 자동 저장
- 수동 저장 버튼 지원
- 저장 데이터가 없으면 새 게임 시작

### Firestore 구조

```txt
users/{uid}/games/{gameId}
```

예시:

```txt
users/abcd1234/games/simple-clicker
```

### 저장 데이터 예시

```json
{
  "gameId": "simple-clicker",
  "score": 15,
  "updatedAt": 1710000000000
}
```

---

## 게임 구조 규칙

각 게임은 독립 실행 가능해야 한다.

기본 구조:

```txt
games/
  game-id/
    index.html
    game.js
```

권장 구조:

```txt
games/
  game-id/
    index.html
    game.js
    style.css
    thumbnail.png
```

### 역할 분리

루트 페이지:
- 로그인
- 게임 목록
- 게임 진입

게임 내부:
- 게임 로직
- 저장/불러오기
- 자동 저장
- UI

---

## 게임

### 완료
- [x] Simple Clicker 프로토타입
- [x] Upgrade Clicker 프로토타입

### 진행 예정
- [ ] 리듬 게임 프로토타입
- [ ] 원버튼 게임 프로토타입

---

## 향후 기능

- [ ] 랭킹
- [ ] 업적
- [ ] 프리미엄 기능
- [ ] 광고 제거
- [ ] 클라우드 세이브 동기화 개선
- [ ] 게임별 통계 시스템
- [ ] 플레이 시간 기록
