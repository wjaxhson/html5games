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

// ── Save Manager ─────────────────────────────────────────────────
const saveManager = createSaveManager({
  gameId: 'game-2048',
  loginStatusEl,
  getSaveData() { return { best }; },
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

// D-Pad 버튼
['up', 'down', 'left', 'right'].forEach(d => {
  document.getElementById(`btn-${d}`).addEventListener('click', () => move(d));
});

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

// 한 줄을 왼쪽으로 밀기 (score 부수효과 있음)
function slideLeft(row) {
  const arr = row.filter(v => v);          // 0 제거
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < SIZE) arr.push(0);   // 오른쪽 패딩
  return arr;
}

// 방향별로 한 "줄"을 꺼내고 → 저장하는 헬퍼
// 방향이 right/down 이면 뒤집어서 왼쪽 슬라이드를 적용하고 다시 뒤집음
function getLine(idx, dir) {
  switch (dir) {
    case 'left':  return grid[idx].slice();
    case 'right': return grid[idx].slice().reverse();
    case 'up':    return grid.map(r => r[idx]);
    case 'down':  return grid.map(r => r[idx]).reverse();
  }
}

function setLine(idx, dir, line) {
  switch (dir) {
    case 'left':
      grid[idx] = line;
      break;
    case 'right':
      grid[idx] = line.slice().reverse();
      break;
    case 'up':
      line.forEach((v, r) => { grid[r][idx] = v; });
      break;
    case 'down':
      line.slice().reverse().forEach((v, r) => { grid[r][idx] = v; });
      break;
  }
}

// ── Move ─────────────────────────────────────────────────────────
function move(dir) {
  let moved = false;

  for (let i = 0; i < SIZE; i++) {
    const line    = getLine(i, dir);
    const before  = line.join(',');
    const slid    = slideLeft(line);
    if (slid.join(',') !== before) moved = true;
    setLine(i, dir, slid);
  }

  if (!moved) return;

  updateScore();
  addTile();
  render();
  checkEnd();
}

// ── End check ────────────────────────────────────────────────────
function checkEnd() {
  let hasEmpty = false, hasWin = false;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c])      hasEmpty = true;
      if (grid[r][c] === 2048) hasWin = true;
    }

  if (hasWin && !won) { won = true; showMsg('🎉 2048 달성!'); return; }
  if (hasEmpty) return;

  // 인접 합치기 가능 여부 체크
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
    await saveManager.save();
  }
}

// ── Render ───────────────────────────────────────────────────────
function render() {
  // 배경 셀 1회 생성
  if (!boardEl.querySelector('.cell')) {
    for (let i = 0; i < SIZE * SIZE; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      boardEl.appendChild(cell);
    }
  }

  // 기존 타일 제거 후 재생성
  boardEl.querySelectorAll('.tile').forEach(t => t.remove());

  const cells   = boardEl.querySelectorAll('.cell');
  const firstRect = cells[0].getBoundingClientRect();
  const boardRect = boardEl.getBoundingClientRect();
  const gap = 10;
  const cellW = firstRect.width;
  const cellH = firstRect.height;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (!val) continue;

      const tile = document.createElement('div');
      tile.className = `tile ${val >= 2048 ? 't-super' : `t-${val}`}`;
      tile.style.width    = `${cellW}px`;
      tile.style.height   = `${cellH}px`;
      tile.style.top      = `${10 + r * (cellH + gap)}px`;
      tile.style.left     = `${10 + c * (cellW + gap)}px`;
      tile.style.fontSize = `${Math.max(14, Math.min(28, cellW * 0.38))}px`;
      tile.textContent    = val;
      boardEl.appendChild(tile);
    }
  }
}

// ── Input: 키보드 ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!gameScreen.classList.contains('active')) return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
  if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
});

// ── Input: 터치 스와이프 ──────────────────────────────────────────
let tx = 0, ty = 0;
boardWrap.addEventListener('touchstart', e => {
  tx = e.touches[0].clientX;
  ty = e.touches[0].clientY;
}, { passive: true });

boardWrap.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;   // 너무 짧은 스와이프 무시
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
  else                              move(dy > 0 ? 'down'  : 'up');
}, { passive: true });

window.addEventListener('resize', render);
