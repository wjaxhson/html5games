import { createSaveManager } from "../../shared/save.js";

// ── DOM ───────────────────────────────────────────────
const startScreen   = document.getElementById('start-screen');
const gameScreen    = document.getElementById('game-screen');
const canvas        = document.getElementById('canvas');
const ctx           = canvas.getContext('2d');
const overlay       = document.getElementById('overlay');
const overlayTitle  = document.getElementById('overlay-title');
const overlayScore  = document.getElementById('overlay-score');
const scoreEl       = document.getElementById('score');
const bestEl        = document.getElementById('best');
const lengthEl      = document.getElementById('length');
const loginStatusEl = document.getElementById('login-status');

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', startGame);
document.getElementById('btn-pause').addEventListener('click', togglePause);
['up','down','left','right'].forEach(d => {
  document.getElementById(`btn-${d}`).addEventListener('click', () => changeDir(d));
});

// ── Constants ─────────────────────────────────────────
const COLS = 20, ROWS = 20;
const SPEEDS = [150, 130, 110, 90, 75];

// ── State ─────────────────────────────────────────────
let snake, dir, nextDir, food, score, best, paused, dead, loop;

// ── Save Manager ──────────────────────────────────────
const saveManager = createSaveManager({
  gameId: 'game-snake',
  loginStatusEl,
  getSaveData() {
    return { best };
  },
  applySaveData(data) {
    best = data.best ?? 0;
    bestEl.textContent = best;
  },
});

// ── Game ──────────────────────────────────────────────
function startGame() {
  snake   = [{ x: 10, y: 10 }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food    = spawnFood();
  score   = 0;
  paused  = false;
  dead    = false;
  overlay.classList.add('hidden');

  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  resizeCanvas();
  clearInterval(loop);
  loop = setInterval(tick, currentSpeed());
  draw();
}

function currentSpeed() {
  return SPEEDS[Math.min(Math.floor(score / 50), SPEEDS.length - 1)];
}

function spawnFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function tick() {
  if (paused || dead) return;

  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = spawnFood();
    clearInterval(loop);
    loop = setInterval(tick, currentSpeed());
  } else {
    snake.pop();
  }

  updateHUD();
  draw();
}

async function gameOver() {
  dead = true;
  clearInterval(loop);

  if (score > (best ?? 0)) {
    best = score;
    await saveManager.save(); // 최고점 갱신 시 즉시 저장
  }

  overlayTitle.textContent = '💀 게임 오버';
  overlayScore.textContent = `점수: ${score} · 길이: ${snake.length}`;
  overlay.classList.remove('hidden');
  updateHUD();
}

function togglePause() {
  if (dead) return;
  paused = !paused;
  document.getElementById('btn-pause').textContent = paused ? '▶' : '⏸';
}

// ── HUD ───────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent  = score;
  bestEl.textContent   = Math.max(score, best ?? 0);
  lengthEl.textContent = snake.length;
}

// ── Draw ──────────────────────────────────────────────
function resizeCanvas() {
  const size = Math.min(canvas.parentElement.clientWidth, 440);
  canvas.width = canvas.height = size;
}

function draw() {
  const W = canvas.width, H = canvas.height;
  const cw = W / COLS, ch = H / ROWS;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#1e293b';
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      ctx.beginPath();
      ctx.arc(c * cw + cw / 2, r * ch + ch / 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

  // Food
  ctx.fillStyle = '#ef4444';
  roundRect(ctx, food.x * cw + cw * .15, food.y * ch + ch * .15, cw * .7, ch * .7, cw * .18);
  ctx.fill();

  // Snake
  snake.forEach((seg, i) => {
    const g = Math.round(197 - (i / snake.length) * 80);
    ctx.fillStyle = i === 0 ? '#22c55e' : `rgb(20,${g},60)`;
    const pad = i === 0 ? 0.05 : 0.12;
    roundRect(ctx, seg.x * cw + cw * pad, seg.y * ch + ch * pad, cw * (1 - pad * 2), ch * (1 - pad * 2), cw * .22);
    ctx.fill();
  });

  // Eyes
  const hx = snake[0].x * cw, hy = snake[0].y * ch;
  ctx.fillStyle = '#0f172a';
  const eye = cw * .15;
  ctx.beginPath();
  ctx.arc(hx + cw * .35, hy + ch * .3, eye, 0, Math.PI * 2);
  ctx.arc(hx + cw * .65, hy + ch * .3, eye, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Input ─────────────────────────────────────────────
function changeDir(d) {
  const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const nd = map[d];
  if (nd.x === -dir.x && nd.y === -dir.y) return;
  nextDir = nd;
}

document.addEventListener('keydown', e => {
  if (!gameScreen.classList.contains('active')) return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
  if (map[e.key]) { e.preventDefault(); changeDir(map[e.key]); }
  if (e.key === ' ') togglePause();
});

let tx = 0, ty = 0;
canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
  if (Math.abs(dx) > Math.abs(dy)) changeDir(dx > 0 ? 'right' : 'left');
  else changeDir(dy > 0 ? 'down' : 'up');
}, { passive: true });

window.addEventListener('resize', () => { resizeCanvas(); draw(); });
