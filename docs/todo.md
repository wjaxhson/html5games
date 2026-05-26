# TODO

## 완료된 작업

### 인프라
- [x] GitHub 연결
- [x] Cloudflare Pages 배포
- [x] Firebase 로그인
- [x] Firestore 저장

### 공용 시스템
- [x] 루트 `index.html` 런처 페이지 구성
- [x] Firebase 설정 공용 분리 (`shared/firebase.js`)
- [x] 게임 목록 분리 (`shared/game-list.js`)
- [x] 게임 목록 자동 렌더링
- [x] `visible: false` 게임 숨김 처리
- [x] 공통 CSS 작성 (`shared/common.css`)
- [x] 게임 공통 레이아웃 작성 (`shared/game-layout.css`)
- [x] 공용 저장 모듈 작성 (`shared/save.js`)

### 게임 (1차)
- [x] Simple Clicker
- [x] Upgrade Clicker
- [x] Crystal Miner
- [x] Trace The Line
- [x] More Dots
- [x] Stroop Test
- [x] Path Memory
- [x] Expanding Map
- [x] 2048 (Firebase 저장 연동, 모바일 D-패드)
- [x] Snake — 스네이크 (Firebase 저장 연동)
- [x] Whack-a-Mole — 두더지 잡기 (난이도별 Firebase 저장 연동)
- [x] Breakout — 벽돌깨기 (Firebase 저장 연동, 속도·스테이지 버그 수정)

### 게임 (2차)
- [x] Tetris — 테트리스 (SRS 회전, 고스트, 모바일 스와이프)
- [x] Memory Card — 메모리 카드 (4x4/6x6 이모지 매칭)
- [x] Typing Test — 타자 연습 (60초 WPM)
- [x] Minesweeper — 지뢰찾기 (첫 클릭 안전, 롱프레스 깃발)
- [x] Space Invaders — 스페이스 인베이더 (웨이브, 파티클)
- [x] Simon Says — 사이먼 게임 (색상 시퀀스)
- [x] Rhythm Tap — 리듬 탭 (수축 원 타이밍)
- [x] Bubble Shooter — 슈팅버블 (헥스 그리드, BFS 매칭)
- [x] Math Rush — 숫자 퀴즈 (60초 사칙연산)
- [x] Rope Swing — 로프 스윙 (진자 물리)
- [x] Wordle — 워들 (5글자 추측, 6번 시도)

---

## 다음 작업

### 우선순위 높음
- [x] 기존 게임 3개 실제 배포 테스트
- [x] 로그인 상태 저장/불러오기 테스트
- [x] 비로그인 localStorage 저장 테스트
- [ ] 모바일 화면 테스트
- [x] 썸네일 누락 시 기본 이미지 확인

### UI 개선
- [x] `shared/default-thumbnail.png` 추가
- [x] 게임별 `thumbnail.png` 추가
- [x] 메인 페이지 카드 디자인 다듬기
- [ ] 게임 내부 버튼 크기 모바일 최적화

### 기능 확장
- [ ] 로그아웃 기능
- [ ] 플레이 시간 기록
- [ ] 게임별 통계 시스템
- [ ] 랭킹
- [ ] 업적

### 게임 추가 후보 (3차)
- [ ] Color Flood (색상 범람)
- [ ] Nonogram (노노그램)
- [ ] Tower Defense (타워 디펜스)
- [ ] Sliding Puzzle (슬라이딩 퍼즐)
- [ ] Crossword (크로스워드)
