# Firebase 구조

## Authentication

- Firebase Google 로그인 사용

## Firestore 구조

```txt
users/{uid}/games/{gameId}

예시:

users/abcd1234/games/simple-clicker
```

## localStorage 구조

html5games:{gameId}:save

## 저장 정책

로그인 상태: Firestore 저장
비로그인 상태: localStorage 저장
게임 진입 시 자동 불러오기
기본 30초마다 자동 저장
수동 저장 지원
