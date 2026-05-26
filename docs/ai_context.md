# AI Context

이 문서는 AI가 HTML5Games 프로젝트를 이어서 작업할 때 참고하는 내부 작업 기준이다.

## 작업 시작 전 필수 확인

이 프로젝트에서 작업 시작 전 반드시 수행:

1. 최신 GitHub 저장소 구조 확인
2. docs/project_overview.md 확인
3. docs/ai_context.md 확인
4. docs/todo.md 확인
5. shared/game-list.js 확인
6. 현재 games/ 폴더 목록 확인

위 확인 없이 구조를 추론하지 말 것.
기억 기반으로 "안 되어 있음" 판단 금지.
실제 파일 기준으로만 판단.

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
- Firestore 저장/불러오기 구조 정리
- 루트 런처 페이지
- 게임 목록 자동 렌더링
- `shared/game-list.js`
- `shared/common.css`
- `shared/game-layout.css`
- 게임별 `meta.json` 기반 목록 표시
- 통합 네비게이션 (back-link, 모바일 대응)

### 현재 게임 (총 23개)

#### 클리커 / 방치형
- `games/simple-clicker/`
- `games/upgrade-clicker/`
- `games/crystal-miner/`
- `games/expanding-map/`

#### 반응속도 / 아케이드
- `games/trace-the-line/`
- `games/more-dots/`
- `games/snake/`
- `games/whack-a-mole/`
- `games/breakout/`
- `games/space-invaders/`
- `games/rhythm-tap/`
- `games/rope-swing/`

#### 퍼즐 / 전략
- `games/stroop-test/`
- `games/path-memory/`
- `games/2048/`
- `games/tetris/`
- `games/memory-card/`
- `games/minesweeper/`
- `games/simon-says/`
- `games/bubble-shooter/`
- `games/wordle/`

#### 교육 / 학습
- `games/math-rush/`
- `games/typing-test/`

## 핵심 구조

루트 `index.html`은 게임 화면이 아니라 런처 페이지다.

게임 목록은 `shared/game-list.js`에서 관리한다.

정적 사이트 환경에서는 `games/` 폴더 자동 스캔이 불가능하므로,
게임을 추가할 때는 반드시 `shared/game-list.js`의 `gameFolders` 배열에 등록한다.

각 게임의 제목, 설명, 표시 여부는 각 게임 폴더의 `meta.json`에서 관리한다.

## 게임 목록 규칙

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
  "2048",
  "snake",
  "whack-a-mole",
  "breakout",
  "tetris",
  "memory-card",
  "typing-test",
  "minesweeper",
  "space-invaders",
  "simon-says",
  "rhythm-tap",
  "bubble-shooter",
  "math-rush",
  "rope-swing",
  "wordle"
];
```

각 게임 폴더에는 반드시 `meta.json`을 둔다.

```json
{
  "title": "Simple Clicker",
  "description": "가장 기본적인 클릭 게임",
  "visible": true
}
```

- `visible: false`인 게임은 목록에서 숨긴다.
- `meta.json`이 없거나 잘못되면 해당 게임은 목록에 표시되지 않는다.
- `gameFolders`에는 실제 존재하는 게임 폴더명만 넣는다.

## 게임 폴더 기본 구조

```txt
games/game-id/
├─ index.html
├─ meta.json
├─ style.css
└─ game.js
```

게임에 따라 파일이 더 추가될 수 있다.

## 공용 파일

```txt
shared/
├─ common.css
├─ firebase.js
├─ game-layout.css
├─ game-list.js
├─ save.js
└─ default-thumbnail.png
```

## 저장 구조

모든 게임은 `shared/save.js`의 `createSaveManager()`를 사용한다.
`createSaveUI()` / `save-ui.js` 방식은 더 이상 사용하지 않는다.

```js
import { createSaveManager } from "../../shared/save.js";

const saveManager = createSaveManager({
  gameId: 'game-example',
  loginStatusEl: document.getElementById('login-status'),
  getSaveData() {
    return { score, best };           // 저장할 데이터 반환
  },
  applySaveData(d) {
    score = d.score ?? 0;             // 불러온 데이터 적용
    best  = d.best  ?? 0;
    updateHUD();
  },
});

// 저장: saveManager.save()  (async, 필요 시 await)
```

Firebase 로그인 상태: Firestore `users/{uid}/games/{gameId}` 에 저장
비로그인 상태: localStorage `html5games:{gameId}:save` 에 저장
게임 진입 시 자동 불러오기 후 `applySaveData` 호출

## 특수 패턴

### 데일리 잠금 (워들 등)
```js
function getTodayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// getSaveData에 lastDate 포함:
getSaveData() { return { ..., lastDate: getTodayKey(), lastGuesses: guesses }; }

// applySaveData에서 날짜 비교:
applySaveData(d) {
  savedDate = d.lastDate ?? null;
  // newGame()에서 savedDate === getTodayKey() 이면 복원
}
```

### 동적 보드 구성 (사이먼 게임 등)
```js
// 모드에 따라 CSS 클래스와 그리드 크기 동적 변경
board.className = `simon-board g${mode}`;
// CSS: .simon-board.g2 { grid-template-columns: 1fr 1fr; }
```

### 헥스 그리드 (슈팅버블)
```js
const R=18, COLS=9;
const MARGIN = Math.floor((W - (2*R + (COLS-1)*(2*R+2))) / 2);
function colX(c, row){ return MARGIN+R+(2*R+2)*c+(row%2?(R+1):0); }
function rowY(r){ return R+4+r*(R*1.73); }
function rowCols(r){ return r%2===0 ? COLS : COLS-1; }
```

### 물리 기반 움직임 (로프 스윙)
```js
// 진자 역학: 각도 기반 속도 적분, 탄젠트 방향 투영
const len = rope.len;
const gravity = 1500;
const torque = -gravity * Math.sin(angle);
angularVel += (torque / len) * dtS;
angle += angularVel * dtS;
```

## 개발 방향

- 무료 인프라 우선
- 모바일 대응 고려 (터치, 버튼 크기, Canvas 클릭 분할)
- 서버 비용 최소화
- 유지보수 단순화
- 게임별 독립성 유지
- 공용 기능은 `shared/`로 분리
- 새 게임은 작은 단위로 빠르게 추가
- 문서와 실제 코드 상태가 다르면 실제 코드 기준으로 판단 후 문서 수정

## AI 작업 주의사항

- 이전 대화 기억만으로 현재 상태를 판단하지 말 것.
- 반드시 최신 GitHub 문서와 코드를 먼저 확인할 것.
- `docs/` 문서가 최신인지 실제 코드와 비교할 것.
- 사용자가 "최신 문서 확인"을 요청하면 추론하지 말고 실제 파일을 다시 확인할 것.
- 이미 구현된 기능을 "없다"고 단정하지 말 것.
- 수정 제안 시 어느 파일을 어떻게 바꿀지 명확히 제시할 것.
- 코드나 문서 전문을 요청받으면 복사해서 바로 붙여넣을 수 있게 한 덩어리로 제공할 것.
- `createSaveUI()` / `save-ui.js`는 구 버전 — 현재는 `createSaveManager()` 사용.
