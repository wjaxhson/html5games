# 게임 목록 시스템

정적 사이트 환경에서는 브라우저에서 `games/` 폴더를 자동 스캔할 수 없다.

Cloudflare Pages는 서버 파일 목록 API를 제공하지 않으므로,
게임 목록은 반드시 `shared/game-list.js` 파일에서 관리한다.

---

# game-list.js 역할

`shared/game-list.js` 는 메인 페이지에 표시할 게임 정보를 관리한다.

새 게임을 추가하더라도 자동으로 메인 페이지에 표시되지 않는다.

반드시 `shared/game-list.js` 에 직접 등록해야 한다.

---

# 기본 구조

```js
export const games = [
  {
    id: "simple-clicker",
    title: "Simple Clicker",
    description: "가장 기본적인 클릭 게임",
    path: "./games/simple-clicker/",
    visible: true
  }
];
```

---

# 필드 설명

## id

게임 고유 ID.

폴더명과 동일하게 사용하는 것을 권장한다.

예시:

```txt
games/simple-clicker/
→ id: "simple-clicker"
```

---

## title

메인 페이지에 표시할 게임 이름.

---

## description

게임 설명.

메인 페이지 카드 또는 리스트에 사용한다.

---

## path

게임 페이지 경로.

예시:

```txt
./games/simple-clicker/
```

---

## visible

메인 페이지 표시 여부.

```js
visible: true
```

메인 페이지에 표시된다.

```js
visible: false
```

게임 폴더가 존재하더라도 메인 페이지에는 표시하지 않는다.

개발 중인 게임이나 숨김 게임에 사용한다.

---

# 메인 페이지 동작 방식

메인 페이지는 `shared/game-list.js` 를 import 하여
`visible === true` 인 게임만 렌더링한다.

즉:

- 게임 폴더 존재 여부
- 파일 존재 여부

가 아니라,

`shared/game-list.js` 가 메인 페이지 표시 기준이다.

---

# 예시

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

위 예시에서:

- `simple-clicker` 는 메인 페이지에 표시됨
- `test-game` 은 숨겨짐
