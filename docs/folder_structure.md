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

games/{game-id}/index.html
