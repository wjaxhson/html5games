# 코딩 규칙

## 기본 원칙

- Vanilla JavaScript 우선 (외부 라이브러리 최소화)
- 무료 인프라 기준 설계
- 모바일 화면 고려 (터치 이벤트, 버튼 크기)
- 게임별 독립성 유지

## 파일 구조 규칙

```txt
games/game-id/
├─ index.html
├─ meta.json
├─ style.css
└─ game.js          ← 반드시 game.js (script.js 아님)
```

- `<script type="module" src="./game.js">` 형태로 로드
- ES Module 문법(`import`/`export`) 사용

## 저장 시스템

**현재 표준: `createSaveManager()` 사용**  
`createSaveUI()` / `save-ui.js` 방식은 더 이상 사용하지 않는다.

```js
import { createSaveManager } from "../../shared/save.js";

const saveManager = createSaveManager({
  gameId: 'game-example',                         // games/ 폴더명과 일치
  loginStatusEl: document.getElementById('login-status'),
  getSaveData() {
    return { score, best };                        // 저장할 값 반환
  },
  applySaveData(d) {
    score = d.score ?? 0;                          // 불러온 값 적용
    best  = d.best  ?? 0;
    updateHUD();
  },
});

// 저장
saveManager.save();        // 동기 호출 가능
await saveManager.save();  // 결과 필요 시 await
```

- `gameId`는 반드시 `game-` 접두사 포함 (예: `'game-wordle'`, `'game-simon-says'`)
- `index.html`에 `<div id="login-status" class="login-status"></div>` 필요

## index.html 표준 구조

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
    <div id="start-screen" class="screen active">
      <!-- 시작 화면 -->
      <div id="login-status" class="login-status"></div>
      <button id="start-btn" class="btn-start">시작하기 →</button>
    </div>
    <div id="game-screen" class="screen">
      <!-- 게임 화면 -->
    </div>
  </div>
  <script type="module" src="./game.js"></script>
</body>
</html>
```

- `back-link`는 반드시 포함 (모든 게임 공통)
- `start-screen`에 `active` 클래스로 초기 표시
- 화면 전환: `.classList.remove('active')` / `.classList.add('active')`

## CSS 규칙

- `shared/common.css` 공통 스타일 사용
- 게임 전용 스타일은 `./style.css`에 작성
- 모바일 우선: `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`
- Canvas 게임: `canvas { display: block; }`, `image-rendering: pixelated`

## Canvas 게임 기본 패턴

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 360, H = 480;
canvas.width = W; canvas.height = H;

let rafId;
function loop(ts) {
  update(ts);
  draw();
  if (running) rafId = requestAnimationFrame(loop);
}

// 시작
document.getElementById('start-btn').addEventListener('click', initGame);
function initGame() {
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  // ... 초기화
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}
```

## 모바일 입력 처리

```js
// 터치와 마우스 모두 처리
canvas.addEventListener('pointerdown', onTap);

// 버튼: pointerdown 사용 (click보다 반응 빠름)
btnLeft.addEventListener('pointerdown', () => keys['ArrowLeft'] = true);
btnLeft.addEventListener('pointerup',   () => keys['ArrowLeft'] = false);

// 캔버스 분할 클릭 (예: 스페이스 인베이더)
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / (rect.width / W);
  if (px < W/3)      { /* 좌이동 */ }
  else if (px > W*2/3) { /* 우이동 */ }
  else               { /* 발사 */ }
});
```

## 동적 크기 조정 (지뢰찾기 등)

```js
// 컨테이너 너비 기준으로 셀 크기 계산
const avail = Math.max(wrap.clientWidth, 280) - 16;
const cellSize = Math.max(24, Math.min(40, Math.floor(avail / cols)));
board.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
```

## 헥스 그리드 (슈팅버블)

```js
const R=18, COLS=9;
const MARGIN = Math.floor((W - (2*R + (COLS-1)*(2*R+2))) / 2);
function colX(c, row){ return MARGIN+R+(2*R+2)*c+(row%2?(R+1):0); }
function rowY(r){ return R+4+r*(R*1.73); }
function rowCols(r){ return r%2===0 ? COLS : COLS-1; }
```

BFS로 같은 색 버블 그룹 제거 + 연결되지 않은 버블 낙하 처리.

## 애니메이션 패턴

- `dt` (delta time) 기반으로 속도 계산: `Math.min(ts - lastT, 50)` (프레임 드롭 방어)
- CSS 애니메이션: `tile.classList.add('flip')` → setTimeout → `tile.classList.add(result)` → `classList.remove('flip')`
- shake 효과: `classList.remove('shake')` → `void el.offsetWidth` → `classList.add('shake')`

## 특수 게임 패턴

### 데일리 잠금 (워들)

```js
function getTodayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
// getSaveData에 lastDate, lastGuesses 포함
// newGame()에서 오늘 날짜 비교 후 이미 플레이한 경우 복원
```

### 키보드 색상 우선순위 (워들)

```js
const STATE_PRIO = { correct: 3, present: 2, absent: 1 };
// 더 높은 상태일 때만 업데이트 (correct로 확정된 키를 present가 덮어쓰지 않도록)
if (!curState || STATE_PRIO[newState] > STATE_PRIO[curState]) {
  if (curState) btn.classList.remove(curState);
  btn.classList.add(newState);
}
```

### 동적 그리드 모드 (사이먼 게임)

```js
// CSS: .simon-board.g2/.g3/.g4 각각 grid-template-columns 다르게
board.className = `simon-board g${mode}`;
// 모드별 best 별도 저장: best2, best3, best4
```

## 성능

- 저사양 모바일 고려
- 파티클/이펙트는 최대 개수 제한
- `cancelAnimationFrame(rafId)` 로 불필요한 루프 중단
- 이미지/사운드 없이 Canvas 직접 그리기 우선
