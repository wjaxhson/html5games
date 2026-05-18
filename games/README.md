# Games Folder

이 폴더는 HTML5 게임들을 저장하는 공간이다.

각 게임은 서로 독립적으로 동작해야 하며,
반드시 자신의 폴더 내부에 `index.html`을 가진다.

---

# 기본 구조

```txt
games/
  game-id/
    index.html
    
# 규칙

1. 게임은 독립적으로 실행 가능해야 한다

각 게임은 자신의 폴더 URL로 직접 접속했을 때 정상 실행되어야 한다.

예시:

/games/simple-clicker/

2. 공용 기능은 shared/ 를 사용한다

로그인, Firebase, 공통 유틸 등은 shared/ 에서 관리한다.

게임 내부 로직은 각 게임 폴더 안에서 관리한다.

3. 루트 페이지는 게임 화면이 아니다

루트 index.html 은 게임 목록과 로그인 기능을 제공하는 런처 페이지 역할을 한다.

실제 게임은 games/ 내부에서 실행된다.

권장 구조
games/
  sample-game/
    index.html
    style.css
    script.js
    thumbnail.png
개발 방향
모바일 대응 고려
Vanilla JavaScript 우선
무료 인프라 우선
유지보수 단순화
게임 간 의존성 최소화
Cloudflare Pages 배포 기준
