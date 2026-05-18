# 폴더 구조

root/
├─ index.html
├─ style.css
├─ main.js
├─ games/
│   ├─ horse-racing/
│   │   ├─ index.html
│   │   ├─ game.js
│   │   ├─ style.css
│   │   └─ assets/
│   │
│   └─ moon-game/
│       ├─ index.html
│       ├─ game.js
│       └─ assets/
│
├─ shared/
│   ├─ firebase.js
│   ├─ auth.js
│   ├─ save.js
│   └─ ui.js
│
└─ docs/

# 각 게임은 반드시 다음 구조를 따른다.
각 게임은 반드시 독립 실행 가능해야 한다.

기본 구조:

```txt
games/
  game-id/
    index.html
    game.js

권장 구조:

games/
  game-id/
    index.html
    game.js
    style.css
    thumbnail.png

역할 분리

루트 페이지:

로그인
게임 목록
게임 진입

게임 내부:

게임 로직
저장/불러오기
UI
자동 저장

---

# 3. docs/firebase_structure.md

이건 지금 매우 중요합니다.

```md
# 저장 구조

Firestore 저장 구조:

users/{uid}/games/{gameId}

예시:

users/abcd1234/games/simple-clicker

---

# 저장 데이터 예시

```json
{
  "gameId": "simple-clicker",
  "score": 15,
  "updatedAt": 1710000000000
}
저장 정책

로그인 상태:

Firestore 저장

비로그인 상태:

localStorage 저장

게임 진입 시:

로그인 상태면 Firestore 불러오기
아니면 localStorage 확인

---

# 4. docs/ai_context.md

이건 AI 오해 방지용으로 중요합니다.

```md
## 현재 구현 기준

현재 메인 페이지는 로그인과 게임 목록만 담당한다.

저장/불러오기 로직은 게임 내부에서 처리한다.

공용 저장 시스템을 먼저 만드는 것이 아니라,
각 게임이 독립적으로 저장 시스템을 가지는 방향으로 진행 중이다.

현재 기준 저장 방식:

- 로그인 상태:
  Firestore

- 비로그인 상태:
  localStorage

기본 정책:
- 게임 진입 시 자동 불러오기
- 30초 자동 저장
- 수동 저장 버튼 제공
