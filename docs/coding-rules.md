## 저장 UI 규칙

- 저장 UI는 각 게임에서 직접 만들지 않는다.
- `shared/save-ui.js`의 `createSaveUI()`를 사용한다.
- 게임별 `game.js`는 `saveManager.save()`를 `createSaveUI()`의 `onSave`에 연결한다.
- 저장 UI DOM id는 기본적으로 `save-ui`를 사용한다.
- 기존 `saveButton` 방식은 사용하지 않는다.
