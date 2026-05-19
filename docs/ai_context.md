# AI Context

이 문서는 AI가 HTML5Games 프로젝트를 이어서 작업할 때 참고하는 내부 작업 기준이다.

## 저장소

GitHub Repository:
https://github.com/wjaxhson/html5games

배포 주소:
https://html5games-a4y.pages.dev/

## 현재 프로젝트 상태

### 완료

- GitHub 연결
- Cloudflare Pages 배포
- Firebase Google 로그인
- Firestore 저장/불러오기
- 루트 런처 페이지
- 게임 목록 자동 렌더링
- shared/game-list.js
- shared/common.css
- shared/game-layout.css
- shared/save.js
- shared/save-ui.js
- shared/save-ui.css

### 현재 게임

- games/simple-clicker/
- games/upgrade-clicker/
- games/crystal-miner/

## 핵심 구조

루트 index.html은 게임 화면이 아니라 런처 페이지다.

게임 목록은 shared/game-list.js에서 관리한다.

정적 사이트 환경에서는 games/ 폴더 자동 스캔이 불가능하므로,
게임을 추가할 때는 반드시 shared/game-list.js에 등록한다.

## 게임 목록 규칙

```js
export const games = [
  {
    id: "simple-clicker",
    title: "Simple Clicker",
    description: "가장 기본적인 클릭 게임",
    visible: true
  }
];
```

path, thumbnail은 직접 적지 않는다.

```js
const gamePath = `./games/${game.id}/`;
const thumbnailPath = `./games/${game.id}/thumbnail.png`;
```

## 저장 시스템 규칙

공용 저장 모듈은 shared/save.js를 사용한다.

각 게임은 createSaveManager()를 사용해서 저장/불러오기를 처리한다.

Firestore 경로:

users/{uid}/games/{gameId}

localStorage key:

html5games:{gameId}:save

기본 저장 정책:

- 게임 진입 시 자동 불러오기
- 30초마다 자동 저장
- 수동 저장 버튼 지원
- 로그인 상태: Firestore
- 비로그인 상태: localStorage

저장 UI는 shared/save-ui.js의 createSaveUI()를 사용한다.

save-ui 기능:
- 저장 버튼
- 저장 상태 표시
- 자동 저장 남은 시간 표시

각 게임은 saveManager.save()만 연결한다.

기존 saveButton 방식은 사용하지 않는다.

## 게임 페이지 규칙

각 게임은 독립 실행 가능해야 한다.

공통 CSS 연결:

```html
<link rel="stylesheet" href="../../shared/common.css">
<link rel="stylesheet" href="../../shared/game-layout.css">
<link rel="stylesheet" href="./style.css">
<link rel="stylesheet" href="../../shared/save-ui.css">
```
save-ui.css는 가장 마지막에 로드한다.
(게임별 CSS 충돌 방지)

기본 HTML 구조:

```html
<body class="game-page">
  <main class="game-container">
    <header class="game-header">
      <h1 class="game-title">게임 제목</h1>
      <a class="game-back-link" href="../../index.html">← 게임 목록</a>
    </header>

    <section class="game-panel">
      <!-- 게임 UI -->
    </section>

    <section class="game-panel game-status">
      <!-- 저장 상태 -->
    </section>
  </main>

  <script type="module" src="./game.js"></script>
</body>
```

메인 페이지 게임 카드는 아래 구조를 유지한다:

```html
<a class="game-card">
  <img class="game-thumbnail">
  <div class="game-info">
```

thumbnail.png가 없으면:

```html
onerror="this.onerror=null; this.src='./assets/default-thumbnail.png';"
```

## 다음 작업 우선순위

1. 새 게임 추가
