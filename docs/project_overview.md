# HTML5Games 프로젝트

HTML5Games는 브라우저에서 바로 실행할 수 있는 HTML5 게임 플랫폼입니다.

## 목표

- 설치 없이 웹 브라우저에서 바로 플레이
- 로그인 기반 이어하기
- 클라우드 저장 지원
- 모바일 환경 대응
- 무료 인프라 기반 운영

## 사용 기술

- Cloudflare Pages
- GitHub
- Firebase Authentication
- Firestore
- Vanilla JavaScript
- HTML5 Canvas

## 기본 구조

루트 페이지는 게임 화면이 아니라 런처 페이지입니다.

사용자는 사이트에 접속한 뒤 로그인 상태를 확인하고, 게임 목록에서 원하는 게임을 선택해 플레이합니다.

접속
→ 로그인
→ 게임 선택
→ 게임 실행
→ 게임 내부 저장/불러오기

## 게임 구조

각 게임은 games/ 폴더 안에서 독립적으로 관리합니다.

games/
  game-id/
    index.html
    game.js
    style.css
    thumbnail.png

## 저장 방식

로그인 상태에서는 Firestore에 저장하고, 비로그인 상태에서는 localStorage에 저장합니다.

게임은 진입 시 자동으로 저장 데이터를 불러오며, 일정 시간마다 자동 저장됩니다.

## 현재 구현된 게임 (총 23개)

### 클리커 / 방치형
- Simple Clicker
- Upgrade Clicker
- Crystal Miner
- Expanding Map

### 반응속도 / 아케이드
- Trace The Line
- More Dots
- Whack-a-Mole (두더지 잡기) — 난이도 3단계, 폭탄 두더지, 콤보 시스템
- Snake (스네이크) — 모바일 D패드 지원, 속도 점진 상승
- Breakout (벽돌깨기) — 멀티 스테이지, 파워업 아이템
- Space Invaders (스페이스 인베이더) — 웨이브, 파티클, 적 폭탄
- Rhythm Tap (리듬 탭) — 수축 원 타이밍 게임
- Rope Swing (로프 스윙) — 진자 물리, 별 수집

### 퍼즐 / 전략
- Stroop Test
- Path Memory
- 2048 — 터치 스와이프 지원, 타일 합치기 퍼즐
- Tetris (테트리스) — SRS 회전, 고스트 피스, 레벨 시스템
- Memory Card (메모리 카드) — 4x4/6x6 이모지 플립 매칭
- Minesweeper (지뢰찾기) — 첫 클릭 안전, 3 난이도, 롱프레스 깃발
- Simon Says (사이먼 게임) — 색상 시퀀스 기억
- Bubble Shooter (슈팅버블) — 헥스 그리드, BFS 연쇄 제거
- Wordle (워들) — 5글자 추측, 6번 시도, 키보드 힌트

### 교육 / 학습
- Math Rush (숫자 퀴즈) — 60초 사칙연산, 콤보 보너스
- Typing Test (타자 연습) — 60초 WPM 측정
