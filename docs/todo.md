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

### 게임
- [x] Simple Clicker
- [x] Upgrade Clicker
- [x] Crystal Miner
- [x] Trace The Line
- [x] More Dots
- [x] Stroop Test
- [x] Path Memory
- [x] Expanding Map
- [x] 2048 (Firebase 저장 연동)
- [x] Snake — 스네이크 (Firebase 저장 연동)
- [x] Whack-a-Mole — 두더지 잡기 (난이도별 Firebase 저장 연동)
- [x] Breakout — 벽돌깨기 (Firebase 저장 연동)

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

### 게임 추가 후보
- [ ] Simon Says (색상 패턴 기억)
- [ ] Typing Speed Test (타이핑 속도)
- [ ] Minesweeper (지뢰찾기)
- [ ] Rhythm Tap (리듬 게임)

