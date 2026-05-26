import { createSaveManager } from "../../shared/save.js";

// ── DOM ──────────────────────────────────────────────────────────
const startScreen   = document.getElementById('start-screen');
const gameScreen    = document.getElementById('game-screen');
const boardEl       = document.getElementById('board');
const boardWrap     = document.getElementById('board-wrap');
const scoreEl       = document.getElementById('score');
const bestEl        = document.getElementById('best-score');
const gameMsg       = document.getElementById('game-message');
const msgText       = document.getElementById('message-text');
const startBtn      = document.getElementById('start-btn');
const newGameBtn    = document.getElementById('new-game-btn');
const retryBtn      = document.getElementById('retry-btn');
const loginStatusEl = document.getElementById('login-status');

// ── State ────────────────────────────────────────────────────────
const SIZE = 4;
let grid, score, best, won;

// ── Save Manager (Firebase 로그인 시 서버 저장, 비로그인 시 localStorage) ──
const saveManager = createSaveManager({
  gameId: 'game-2048',
  loginStatusEl,
  getSaveData() {
    return { best };
  },
  applySaveData(data) {
    best = data.best ?? 0;
    bestEl.textContent = best;
  },
});

// ── Init ─────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  newGame();
});
newGameBtn.addEventListener('click', newGame);
retryBtn.addEventListener('click', newGame);

function newGame() {
  score = 0;
  won   = false;
  grid  = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  gameMsg.classList.add('hidden');
  updateScore();
  addTile(); addTile();
  render();
}

// ── Grid helpers ─────────────────────────────────────────────────
function addTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) empties.push([r, c]);
  if (!empties.length) return;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < .9 ? 2 : 4;
}

function slideRow(row) {
  let arr = row.filter(v => v);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < SIZE) arr.push(0);
  return arr;
}

function move(dir) {
  let moved = false;

  const rotate    = (g) => g[0].map((_, c) => g.map(r => r[c]).reverse());
  const rotateBack = (g) => g[0].map((_, c) => g.map(r => r[r.length - 1 - c]));

  let g = grid.map(r => [...r]);
  if (dir === 'up')    g = rotate(rotate(rotate(g)));
  if (dir === 'right') g = rotate(rotate(g));
  if (dir === 'down')  g = rotate(g);

  for (let r = 0; r < SIZE; r++) {
    const old = [...g[r]];
    g[r] = slideRow(g[r]);
    if (g[r].join() !== old.join()) moved = true;
  }

  if (dir === 'up')    g = rotate(g);
  if (dir === 'right') g = rotateBack(g);
  if (dir === 'down')  g = rotate(rotate(rotate(g)));

  if (!moved) return;
  grid = g;

  updateScore();
  addTile();
  render();
  checkEnd();
}

function checkEnd() {
  let hasEmpty = false, hasWin = false;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) hasEmpty = true;
      if (grid[r][c] === 2048) hasWin = true;
    }

  if (hasWin && !won) { won = true; showMsg('🎉 2048 달성!'); return; }
  if (hasEmpty) return;

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return;
    }

  showMsg('😔 게임 오버');
}

function showMsg(txt) {
  msgText.textContent = txt;
  gameMsg.classList.remove('hidden');
}

async function updateScore() {
  scoreEl.textContent = score;
  if (score > (best ?? 0)) {
    best = score;
    bestEl.textContent = best;
    await saveManager.save(); // 최고점 갱신 시 즉시 저장
  }
}

// ── Render ───────────────────────────────────────────────────────
function render() {
  if (!boardEl.querySelector('.cell')) {
    for (let i = 0; i < SIZE * SIZE; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      boardEl.appendChild(cell);
    }
  }

  boardEl.querySelectorAll('.tile').forEach(t => t.remove());

  const cells = boardEl.querySelectorAll('.cell');
  const firstCell = cells[0].getBoundingClientRect();
  const gap = 10;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (!val) continue;

      const tile = document.createElement('div');
      const cls  = val >= 2048 ? 't-super' : `t-${val}`;
      tile.className = `tile ${cls}`;

      const cellW = firstCell.width;
      const cellH = firstCell.height;
      tile.style.width    = `${cellW}px`;
      tile.style.height   = `${cellH}px`;
      tile.style.top      = `${10 + r * (cellH + gap)}px`;
      tile.style.left     = `${10 + c * (cellW + gap)}px`;
      tile.style.fontSize = cellW > 70 ? '28px' : '20px';
      tile.textContent    = val;
      boardEl.appendChild(tile);
    }
  }
}

// ── Input ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (!gameScreen.classList.contains('active')) return;
  const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
});

let tx = 0, ty = 0;
boardWrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
boardWrap.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
  else move(dy > 0 ? 'down' : 'up');
}, { passive: true });

window.addEventListener('resize', render);
