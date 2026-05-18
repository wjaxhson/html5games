# HTML5Games 프로젝트

## 프로젝트 목표
누구나 브라우저에서 바로 플레이 가능한 HTML5 게임 사이트 구축.

## 핵심 기능
- 웹 브라우저 즉시 실행
- 로그인 기반 이어하기
- 클라우드 저장
- 모바일 대응
- 무료 인프라 기반 운영

## 사용 기술
- Cloudflare Pages
- GitHub
- Firebase Authentication
- Firestore
- HTML5 Canvas
- JavaScript (Vanilla JS 우선)

## 현재 완료 상태
- Cloudflare Pages 배포 완료
- GitHub 자동 배포 연결 완료
- Firebase Google 로그인 완료
- Firestore 저장/불러오기 완료

## 향후 예정 기능
- 게임 목록 메인 페이지
- 게임별 독립 폴더 구조
- 유저 프로필
- 랭킹 시스템
- 프리미엄 기능
- 광고 제거 옵션

## 사이트 진입 구조
이 프로젝트의 루트 `index.html`은 특정 게임 화면이 아니라,
전체 게임 목록을 보여주는 런처 페이지 역할을 한다.

첫 페이지의 주요 역할은 다음과 같다.

- Firebase Auth 기반 로그인 제공
- 로그인 상태 표시
- 플레이 가능한 게임 목록 표시
- 각 게임 페이지로 이동하는 링크 제공

실제 게임 화면은 `games/` 하위 폴더에서 독립적으로 관리한다.
예를 들어 `games/sample-game/index.html` 형태로 구성한다.
