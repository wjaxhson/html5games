# 폴더 구조

```txt
root/
├─ index.html          ← 런처 페이지 (게임 목록 + 로그인)
├─ style.css
├─ main.js
│
├─ games/
│   ├─ simple-clicker/
│   ├─ upgrade-clicker/
│   ├─ crystal-miner/
│   ├─ trace-the-line/
│   ├─ more-dots/
│   ├─ stroop-test/
│   ├─ path-memory/
│   ├─ expanding-map/
│   ├─ 2048/
│   ├─ snake/
│   ├─ whack-a-mole/
│   ├─ breakout/
│   ├─ tetris/
│   ├─ memory-card/
│   ├─ typing-test/
│   ├─ minesweeper/
│   ├─ space-invaders/
│   ├─ simon-says/
│   ├─ rhythm-tap/
│   ├─ bubble-shooter/
│   ├─ math-rush/
│   ├─ rope-swing/
│   └─ wordle/
│
├─ shared/
│   ├─ firebase.js          ← Firebase 초기화
│   ├─ save.js              ← createSaveManager() 저장 공통 모듈
│   ├─ game-list.js         ← gameFolders 배열 (게임 목록)
│   ├─ common.css           ← 전체 공통 스타일
│   ├─ game-layout.css      ← 게임 레이아웃 공통
│   └─ default-thumbnail.png
│
└─ docs/
    ├─ ai_context.md
    ├─ coding-rules.md
    ├─ coding_rules.md
    ├─ deployment.md
    ├─ firebase_structure.md
    ├─ folder_structure.md
    ├─ game_list_system.md
    ├─ game_template.md
    ├─ project_overview.md
    └─ todo.md
```

---

# 각 게임 폴더 구조

```txt
games/game-id/
├─ index.html      ← 게임 진입 (ES Module)
├─ game.js         ← 게임 로직 (반드시 game.js)
├─ style.css       ← 게임 전용 스타일
├─ meta.json       ← 제목/설명/visible
└─ thumbnail.png   ← 선택 (없으면 default-thumbnail.png)
```

---

# 플랫폼 구조

```txt
접속
→ 로그인 (Google OAuth)
→ 게임 선택 (런처 페이지)
→ 게임 실행 (games/game-id/index.html)
→ 게임 내부 저장/불러오기 (createSaveManager)
```

루트 페이지는 실제 게임 화면이 아니라  
로그인과 게임 목록을 제공하는 런처 페이지 역할을 한다.

---

# 게임 구조 규칙

각 게임은 반드시 독립 실행 가능해야 한다.

```txt
games/
  game-id/
    index.html    ← back-link 포함
    game.js       ← createSaveManager import
    meta.json     ← visible: true/false
```

`meta.json` 예시:

```json
{
  "title": "Crystal Miner",
  "description": "수정을 채굴하고 자동 채굴기를 구매하는 방치형 클리커 게임",
  "visible": true
}
```

- `visible: false`인 게임은 메인 목록에 표시하지 않는다.
- 직접 URL로 접근하는 것은 가능하다.
- 메인 페이지 게임 목록은 `shared/game-list.js`의 `gameFolders` 배열을 기준으로 각 게임의 `meta.json`을 불러와 생성한다.

---

# 역할 분리

## 루트 페이지

- 로그인
- 로그인 상태 표시
- 게임 목록 표시
- 게임 진입

루트 페이지는 게임 자체를 실행하지 않는다.

---

## 게임 내부

- 게임 로직
- UI 및 Canvas 처리
- 저장/불러오기 (`createSaveManager`)
- 입력 처리 (키보드, 터치, Canvas 분할 클릭)
- 게임 상태 관리

---

# 저장 시스템 구조

저장 시스템은 각 게임 내부에서 처리한다.

```js
import { createSaveManager } from "../../shared/save.js";

const saveManager = createSaveManager({
  gameId: 'game-example',
  loginStatusEl: document.getElementById('login-status'),
  getSaveData() { return { score, best }; },
  applySaveData(d) { best = d.best ?? 0; updateHUD(); },
});

saveManager.save();  // 저장
```

## 저장 정책

- 로그인 상태: Firebase Firestore `users/{uid}/games/{gameId}` 저장
- 비로그인 상태: localStorage `html5games:{gameId}:save` 저장

---

# shared/ 폴더 역할

`shared/` 는 여러 게임에서 공통으로 사용하는 기능을 관리한다.

- `firebase.js`: Firebase 초기화, Google 로그인
- `save.js`: `createSaveManager()` — 저장/불러오기 공통 로직
- `game-list.js`: `gameFolders` 배열 — 게임 목록 관리
- `common.css`: 전체 공통 스타일 (back-link, screen, btn-start 등)
- `game-layout.css`: 게임 레이아웃 공통
- `default-thumbnail.png`: 썸네일 없는 게임의 기본 이미지

게임 자체 로직은 `games/` 내부에서 관리한다.

자세한 게임 목록 관리 방식은 `docs/game_list_system.md` 참고.

---

# 개발 방향

- 무료 인프라 우선
- 모바일 대응 고려
- Vanilla JavaScript 우선
- 유지보수 단순화
- 게임 간 의존성 최소화
- Cloudflare Pages 기준 배포
