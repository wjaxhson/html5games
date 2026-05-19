# 게임 템플릿 가이드

새 게임은 아래 구조를 기준으로 생성한다.

games/game-id/
├── index.html
├── style.css
├── script.js
├── meta.json
└── thumbnail.png

---

# 파일 설명

## index.html

게임 진입 파일.

공통 CSS와 공통 저장 시스템을 사용할 수 있다.

기본 예시:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>게임 이름</title>

  <link rel="stylesheet" href="../../shared/common.css" />
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <main class="game-container">
    <h1>게임 이름</h1>

    <div id="game"></div>

    <button id="save-btn">
      저장
    </button>
  </main>

  <script type="module" src="./script.js"></script>
</body>
</html>
```

---

## style.css

게임 전용 스타일.

공통 스타일은 `shared/common.css` 사용.

예시:

```css
#game {
  margin-top: 20px;
}
```

---

## script.js

게임 로직 작성.

공통 저장 시스템 사용 가능.

예시:

```js
import {
  loadGameData,
  saveGameData,
  startAutoSave
} from "../../shared/save.js";

const GAME_ID = "sample-game";

const defaultData = {
  score: 0
};

let data = await loadGameData(GAME_ID, defaultData);

function render() {
  console.log(data.score);
}

function save() {
  saveGameData(GAME_ID, data);
}

document
  .getElementById("save-btn")
  .addEventListener("click", save);

startAutoSave(GAME_ID, () => data);

render();
```

---

## meta.json

게임 목록 표시용 메타데이터.

예시:

```json
{
  "title": "Sample Game",
  "description": "샘플 게임 설명",
  "visible": true
}
```

### visible 규칙

- `true`
  - 메인 페이지 목록에 표시

- `false`
  - 메인 페이지 목록에서 숨김
  - 직접 URL 접근은 가능

---

## thumbnail.png

게임 썸네일 이미지.

파일명은 반드시 `thumbnail.png` 로 고정한다.

권장 크기:

- 320x180
- 16:9 비율

썸네일이 없으면:

`shared/default-thumbnail.png`

를 자동 사용한다.

---

# 게임 등록 방법

`shared/game-list.js`

에 게임 폴더명을 추가한다.

예시:

```js
export const gameFolders = [
  "simple-clicker",
  "crystal-miner",
  "sample-game"
];
```

실제 게임 정보는 각 게임의 `meta.json`에서 자동 로드된다.

---

# 개발 규칙

- 게임은 독립적으로 동작해야 한다.
- 외부 라이브러리 사용 최소화.
- 모바일 화면 대응 고려.
- 저장은 공통 save 시스템 사용.
- 공통 기능은 shared/에 추가.
- 게임별 중복 코드 최소화.
