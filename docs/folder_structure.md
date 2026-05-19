# 폴더 구조

```txt
root/
├─ index.html
├─ style.css
├─ main.js
│
├─ games/
│   ├─ simple-clicker/
│   │   ├─ index.html
│   │   ├─ game.js
│   │   ├─ style.css
│   │   └─ thumbnail.png
│   │
│   ├─ horse-racing/
│   │   ├─ index.html
│   │   ├─ game.js
│   │   ├─ style.css
│   │   └─ assets/
│   │
│   └─ moon-game/
│       ├─ index.html
│       ├─ game.js
│       ├─ style.css
│       └─ assets/
│
├─ shared/
│   ├─ firebase.js
│   ├─ auth.js
│   ├─ save.js
│   ├─ game-list.js
│   └─ ui.js
│
└─ docs/
```

---

# 플랫폼 구조

현재 프로젝트는 다음 흐름을 기준으로 구성한다.

```txt
접속
→ 로그인
→ 게임 선택
→ 게임 실행
→ 게임 내부 저장/불러오기 처리
```

루트 페이지는 실제 게임 화면이 아니라  
로그인과 게임 목록을 제공하는 런처 페이지 역할을 한다.

---

# 게임 구조 규칙

각 게임은 반드시 독립 실행 가능해야 한다.

기본 구조:

```txt
games/
  game-id/
    index.html
    game.js
```

권장 구조:

```txt
games/
  game-id/
    index.html
    game.js
    style.css
    meta.json
    thumbnail.png
```

+ meta.json 설명
  
`thumbnail.png` 파일명은 고정한다.
`meta.json`에는 썸네일 경로를 적지 않는다.

예시:

{
  "title": "Crystal Miner",
  "description": "수정을 채굴하고 자동 채굴기를 구매하는 방치형 클리커 게임",
  "visible": true
}

`visible: false`인 게임은 메인 목록에 표시하지 않는다.
단, 직접 URL로 접근하는 것은 가능하다.

메인 페이지의 게임 목록은 `shared/game-list.js`에 등록된 게임 폴더 목록을 기준으로 각 게임의 `meta.json`을 불러와 생성한다.


---

# 역할 분리

## 루트 페이지

루트 페이지의 역할:

- 로그인
- 로그인 상태 표시
- 게임 목록 표시
- 게임 진입

루트 페이지는 게임 자체를 실행하지 않는다.

---

## 게임 내부

각 게임 내부의 역할:

- 게임 로직
- UI
- 저장/불러오기
- 자동 저장
- 입력 처리
- Canvas 처리
- 게임 상태 관리

---

# 저장 시스템 구조

저장 시스템은 메인 페이지가 아니라  
각 게임 내부에서 처리한다.

## 저장 정책

로그인 상태:
- Firebase Firestore 사용

비로그인 상태:
- localStorage 사용

## 기본 동작

- 게임 진입 시 자동 불러오기
- 30초마다 자동 저장
- 수동 저장 버튼 제공
- 저장 데이터가 없으면 새 게임 시작

---

# Firestore 구조

Firestore 저장 구조:

```txt
users/{uid}/games/{gameId}
```

예시:

```txt
users/abcd1234/games/simple-clicker
```

---

# 저장 데이터 예시

```json
{
  "gameId": "simple-clicker",
  "score": 15,
  "updatedAt": 1710000000000
}
```

---

# shared/ 폴더 역할

`shared/` 는 여러 게임에서 공통으로 사용하는 기능을 관리한다.

예시:

- Firebase 초기화
- 인증 처리
- 저장 공통 로직
- 공통 UI
- 게임 목록 데이터
- 공통 유틸 함수

게임 자체 로직은 `games/` 내부에서 관리한다.

자세한 게임 목록 관리 방식은
`docs/game_list_system.md` 를 참고한다.

---

# 개발 방향

- 무료 인프라 우선
- 모바일 대응 고려
- Vanilla JavaScript 우선
- 유지보수 단순화
- 게임 간 의존성 최소화
- Cloudflare Pages 기준 배포
