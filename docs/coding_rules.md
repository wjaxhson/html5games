# 코딩 규칙

## 기본 원칙
- Vanilla JavaScript 우선
- 불필요한 프레임워크 최소화
- 무료 인프라 기준 설계

## 게임 구조
- 게임별 독립 폴더
- 각 게임 독립 index.html 사용
- ES Module 방식: `<script type="module" src="./game.js">`

## 렌더링
- HTML5 Canvas 기반
- 모바일 화면 고려

## 파일 구조
- 게임 진입: `index.html`
- 게임 로직: `game.js` (script.js 아님)
- 게임 스타일: `style.css`
- 메타데이터: `meta.json`

## 저장

**현재 표준: `createSaveManager()` 사용**

```js
import { createSaveManager } from "../../shared/save.js";

const saveManager = createSaveManager({
  gameId: 'game-example',
  loginStatusEl: document.getElementById('login-status'),
  getSaveData() { return { score, best }; },
  applySaveData(d) { score = d.score ?? 0; best = d.best ?? 0; },
});

saveManager.save();
```

- Firebase 로그인: Firestore `users/{uid}/games/{gameId}` 저장
- 비로그인: localStorage `html5games:{gameId}:save` 저장
- ~~`createSaveUI()` / `save-ui.js`~~ — 구 버전, 사용 금지

## 성능
- 저사양 모바일 고려
- 초기 로딩 최소화
- dt 기반 프레임 속도 독립 업데이트

## 자세한 내용

`docs/coding-rules.md` 참고 (더 상세한 패턴 모음)
