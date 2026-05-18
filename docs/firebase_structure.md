# Firebase 구조

## Authentication
- Google 로그인 사용

## Firestore 구조

saves/
└─ uid
    ├─ horse-racing
    ├─ moon-game
    └─ ...

## 저장 데이터 예시

{
  stage: 5,
  gold: 1200,
  hp: 30,
  updatedAt: 123456789
}

## 저장 정책
- 로그인 유저만 클라우드 저장
- 비로그인 상태는 localStorage 임시 저장 가능
