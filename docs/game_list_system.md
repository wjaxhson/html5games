# 게임 목록 시스템

이 프로젝트의 메인 페이지 게임 목록은 `shared/game-list.js`에서 관리한다.

## 핵심 방식

정적 사이트 환경에서는 `games/` 폴더를 자동으로 스캔할 수 없다.

따라서 새 게임을 추가할 때는 반드시 `shared/game-list.js`의 `gameFolders` 배열에 게임 폴더명을 등록한다.

```js
export const gameFolders = [
  "simple-clicker",
  "upgrade-clicker",
  "crystal-miner",
  "trace-the-line",
  "more-dots",
  "stroop-test",
  "path-memory",
  "expanding-map"
];
```

## 게임 정보 로딩 방식

`loadGames()`는 `gameFolders`에 등록된 폴더를 순회하면서 각 게임의 `meta.json`을 불러온다.

```txt
games/{gameId}/meta.json
```

예시:

```txt
games/simple-clicker/meta.json
```

## meta.json 형식

각 게임 폴더에는 `meta.json`을 둔다.

```json
{
  "title": "Simple Clicker",
  "description": "가장 기본적인 클릭 게임",
  "visible": true
}
```

## 필드 설명

- `title`: 메인 페이지에 표시할 게임 제목
- `description`: 메인 페이지에 표시할 게임 설명
- `visible`: `false`면 목록에서 숨김

## 숨김 처리

개발 중이거나 아직 공개하고 싶지 않은 게임은 `meta.json`에서 `visible`을 `false`로 설정한다.

```json
{
  "title": "테스트 게임",
  "description": "개발 중인 게임",
  "visible": false
}
```

## 새 게임 추가 절차

1. `games/` 아래에 새 게임 폴더 생성
2. 새 게임 폴더 안에 `index.html` 생성
3. 새 게임 폴더 안에 `meta.json` 생성
4. 필요하면 `style.css`, `game.js` 추가
5. `shared/game-list.js`의 `gameFolders` 배열에 폴더명 추가

예시:

```txt
games/new-game/
├─ index.html
├─ meta.json
├─ style.css
└─ game.js
```

그리고 `shared/game-list.js`에 추가:

```js
export const gameFolders = [
  "simple-clicker",
  "upgrade-clicker",
  "crystal-miner",
  "trace-the-line",
  "more-dots",
  "stroop-test",
  "path-memory",
  "expanding-map",
  "new-game"
];
```

## 주의사항

- `gameFolders`에는 실제 존재하는 폴더명만 넣는다.
- 폴더명과 URL 경로는 같아야 한다.
- `meta.json`이 없거나 잘못되면 해당 게임은 목록에 표시되지 않는다.
- 메인 페이지는 `games/` 폴더를 자동 스캔하지 않는다.
- 게임을 숨기고 싶을 때는 `gameFolders`에서 제거하지 말고 `meta.json`의 `visible`을 `false`로 두는 것을 우선한다.

## 현재 등록 대상 게임

```txt
games/simple-clicker/
games/upgrade-clicker/
games/crystal-miner/
games/trace-the-line/
games/more-dots/
games/stroop-test/
games/path-memory/
games/expanding-map/
```
