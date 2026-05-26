# Firebase 구조

## Authentication

- Firebase Google 로그인 사용

## Firestore 구조

```txt
users/{uid}/games/{gameId}

예시:

users/abcd1234/games/game-simple-clicker
```

## localStorage 구조

```txt
html5games:{gameId}:save
```

## 저장 정책

- 로그인 상태: Firestore 저장
- 비로그인 상태: localStorage 저장
- 게임 진입 시 자동 불러오기 (applySaveData 호출)
- 베스트 갱신 시 즉시 저장
- 30초마다 자동 저장 (createSaveManager 내부 처리)

---

## 게임별 저장 데이터 형식

### 클리커 / 방치형

**simple-clicker** (`game-simple-clicker`)
```json
{ "score": 1500 }
```

**upgrade-clicker** (`game-upgrade-clicker`)
```json
{ "coins": 250, "upgrades": { "speed": 2, "value": 1 } }
```

**crystal-miner** (`game-crystal-miner`)
```json
{ "crystals": 500, "miners": 3, "upgrades": {} }
```

**expanding-map** (`game-expanding-map`)
```json
{ "score": 100 }
```

### 반응속도 / 아케이드

**snake** (`game-snake`)
```json
{ "best": 45 }
```

**whack-a-mole** (`game-whack-a-mole`)
```json
{ "bestEasy": 200, "bestNormal": 150, "bestHard": 80 }
```

**breakout** (`game-breakout`)
```json
{ "best": 1200 }
```

**space-invaders** (`game-space-invaders`)
```json
{ "best": 3500 }
```

**rhythm-tap** (`game-rhythm-tap`)
```json
{ "best": 480 }
```

**rope-swing** (`game-rope-swing`)
```json
{ "best": 12 }
```

### 퍼즐 / 전략

**2048** (`game-2048`)
```json
{ "score": 4096, "best": 8192, "board": [[...]] }
```

**tetris** (`game-tetris`)
```json
{ "best": 5000 }
```

**memory-card** (`game-memory-card`)
```json
{ "bestMoves4": 18, "bestMoves6": 42 }
```

**minesweeper** (`game-minesweeper`)
```json
{ "bestEasy": 45, "bestMedium": 120, "bestHard": 0 }
```

**simon-says** (`game-simon-says`)
```json
{ "best2": 15, "best3": 8, "best4": 4 }
```
※ 이전 형식(`"best"`)도 호환: `best2 = d.best2 ?? d.best ?? 0`

**bubble-shooter** (`game-bubble-shooter`)
```json
{ "best": 2400 }
```

**wordle** (`game-wordle`)
```json
{
  "streak": 5,
  "best": 7,
  "lastDate": "2026-05-26",
  "lastGuesses": [
    { "word": "CRANE", "result": ["absent","correct","absent","present","absent"] },
    { "word": "BRAVE", "result": ["correct","correct","correct","correct","correct"] }
  ],
  "lastWon": true
}
```
- `lastDate`: `YYYY-MM-DD` 형식 오늘 날짜
- `lastGuesses`: 각 추측의 단어와 평가 결과 배열
- `lastWon`: 오늘 게임 승리 여부
- 같은 날 재진입 시 UI를 잠금 상태로 복원

### 교육 / 학습

**math-rush** (`game-math-rush`)
```json
{ "best": 28 }
```

**typing-test** (`game-typing-test`)
```json
{ "best": 62 }
```
