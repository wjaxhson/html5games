# 게임 템플릿 가이드

새 게임은 아래 구조를 기준으로 생성한다.

```txt
games/game-id/
├── index.html
├── style.css
├── game.js          ← 반드시 game.js
├── meta.json
└── thumbnail.png    ← 선택 (없으면 default-thumbnail.png 사용)
```

---

# 파일 설명

## index.html

게임 진입 파일. 공통 CSS와 저장 시스템을 사용한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>게임 이름</title>
  <link rel="stylesheet" href="../../shared/common.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a href="../../index.html" class="back-link">← 게임 목록</a>
  <div id="app">

    <!-- 시작 화면 -->
    <div id="start-screen" class="screen active">
      <div class="title-main">🎮 게임 이름</div>
      <div class="title-sub">게임 설명</div>
      <div id="login-status" class="login-status"></div>
      <button id="start-btn" class="btn-start">시작하기 →</button>
    </div>

    <!-- 게임 화면 -->
    <div id="game-screen" class="screen">
      <!-- HUD -->
      <div class="info-row">
        <div class="info-box">
          <div class="info-label">점수</div>
          <div class="info-val" id="score">0</div>
        </div>
        <div class="info-box">
          <div class="info-label">최고</div>
          <div class="info-val" id="best">0</div>
        </div>
      </div>
      <!-- 게임 캔버스 (캔버스 게임인 경우) -->
      <div id="canvas-wrap">
        <canvas id="canvas"></canvas>
      </div>
    </div>

  </div>
  <script type="module" src="./game.js"></script>
</body>
</html>
```

---

## style.css

게임 전용 스타일. 공통 스타일은 `shared/common.css` 사용.

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #0f172a;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}
#app { width: 100%; max-width: 440px; padding: 16px; }
.screen { display: none; }
.screen.active { display: flex; flex-direction: column; align-items: center; gap: 16px; }
```

---

## game.js

게임 로직. `createSaveManager` 사용 표준 패턴:

```js
import { createSaveManager } from "../../shared/save.js";

// ── 상태 ──────────────────────────────────────────────────────────────────
let score = 0, best = 0;

// ── 저장 관리자 ────────────────────────────────────────────────────────────
const saveManager = createSaveManager({
  gameId: 'game-example',            // 반드시 'game-' 접두사 포함
  loginStatusEl: document.getElementById('login-status'),
  getSaveData() {
    return { score, best };          // 저장할 데이터 반환
  },
  applySaveData(d) {
    best = d.best ?? 0;              // 불러온 데이터 적용
    updateHUD();
  },
});

// ── 시작 버튼 ──────────────────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', initGame);

// ── 게임 초기화 ────────────────────────────────────────────────────────────
function initGame() {
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  score = 0;
  updateHUD();
  // ... 게임 로직 시작
}

// ── HUD 갱신 ──────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('score').textContent = score;
  document.getElementById('best').textContent = best;
}
```

---

## Canvas 게임 추가 패턴

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 480;
canvas.width = W; canvas.height = H;

let running = false, rafId;
let lastT = 0;

function loop(ts) {
  const dt = Math.min(ts - lastT, 50);
  lastT = ts;
  update(dt);
  draw();
  if (running) rafId = requestAnimationFrame(loop);
}

function initGame() {
  // ... 화면 전환, 상태 초기화
  running = true;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  cancelAnimationFrame(rafId);
  if (score > best) { best = score; saveManager.save(); }
}
```

---

## meta.json

게임 목록 표시용 메타데이터.

```json
{
  "title": "게임 이름",
  "description": "한 줄 설명",
  "visible": true
}
```

### visible 규칙

- `true` — 메인 페이지 목록에 표시
- `false` — 목록에서 숨김 (직접 URL 접근은 가능)

---

## thumbnail.png

게임 썸네일 이미지.

- 파일명은 반드시 `thumbnail.png` 로 고정
- 권장 크기: 320x180 (16:9 비율)
- 썸네일이 없으면 `shared/default-thumbnail.png` 자동 사용

---

# 게임 등록 방법

`shared/game-list.js`의 `gameFolders`에 폴더명을 추가한다.

```js
export const gameFolders = [
  // 기존 게임들...
  "new-game"
];
```

실제 게임 정보는 각 게임의 `meta.json`에서 자동 로드된다.

---

# 개발 규칙

- 게임은 독립적으로 동작해야 한다.
- 외부 라이브러리 사용 최소화.
- 모바일 화면 대응 고려 (`touch-action: manipulation`, pointerdown 이벤트).
- 저장은 `createSaveManager()` 사용.
- 공통 기능은 `shared/`에 추가.
- 게임별 중복 코드 최소화.
- `back-link`는 모든 게임에 반드시 포함.
