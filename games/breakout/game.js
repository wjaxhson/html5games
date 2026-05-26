import { createSaveManager } from "../../shared/save.js";

// ── DOM ──────────────────────────────────────────────────────────
const startScreen   = document.getElementById('start-screen');
const gameScreen    = document.getElementById('game-screen');
const canvasWrap    = document.getElementById('canvas-wrap');
const canvas        = document.getElementById('canvas');
const ctx           = canvas.getContext('2d');
const overlay       = document.getElementById('overlay');
const overlayEmoji  = document.getElementById('overlay-emoji');
const overlayTitle  = document.getElementById('overlay-title');
const overlaySub    = document.getElementById('overlay-sub');
const overlayBtn    = document.getElementById('overlay-btn');
const scoreEl       = document.getElementById('score');
const bestEl        = document.getElementById('best');
const stageEl       = document.getElementById('stage');
const livesEl       = document.getElementById('lives');
const loginStatusEl = document.getElementById('login-status');

document.getElementById('start-btn').addEventListener('click', initGame);

// ── Layout ───────────────────────────────────────────────────────
const W = 360, H = 560;
canvas.width = W; canvas.height = H;

// ── Config ───────────────────────────────────────────────────────
const PADDLE_H   = 10;
const BALL_R     = 7;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_PAD  = 5;
const BRICK_TOP  = 60;
const COLORS     = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];

// ── State ─────────────────────────────────────────────────────────
let score, best, lives, stage;
let paddle, ball, bricks, powerUps;
let rafId, paused, launched, waiting;
let paddleWidthBase;

// ── Save Manager ─────────────────────────────────────────────────
const saveManager = createSaveManager({
  gameId: 'game-breakout',
  loginStatusEl,
  getSaveData() {
    return { best };
  },
  applySaveData(data) {
    best = data.best ?? 0;
    bestEl.textContent = best;
  },
});

// ── Bricks ───────────────────────────────────────────────────────
function buildBricks(stageNum) {
  const bw = (W - BRICK_PAD * (BRICK_COLS + 1)) / BRICK_COLS;
  const bh = 18;
  const result = [];
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++) {
      const hp = stageNum >= 3 && r < 2 ? 2 : 1;
      result.push({
        x: BRICK_PAD + c * (bw + BRICK_PAD),
        y: BRICK_TOP + r * (bh + BRICK_PAD),
        w: bw, h: bh,
        color: COLORS[r % COLORS.length],
        hp, maxHp: hp, alive: true,
      });
    }
  return result;
}

// ── Init ─────────────────────────────────────────────────────────
function initGame() {
  score = 0; lives = 3; stage = 1;
  paddleWidthBase = 80;
  newStage();
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function newStage() {
  const pw = Math.max(50, paddleWidthBase - (stage - 1) * 8);
  paddle   = { x: W / 2 - pw / 2, y: H - 28, w: pw, h: PADDLE_H };
  resetBall();
  bricks   = buildBricks(stage);
  powerUps = [];
  waiting  = true;
  launched = false;
}

function resetBall() {
  ball = {
    x: W / 2, y: H - 28 - PADDLE_H - BALL_R - 2,
    vx: 3.5 + stage * 0.4,
    vy: -(3.5 + stage * 0.4),
    r: BALL_R,
  };
  waiting  = true;
  launched = false;
}

// ── Loop ─────────────────────────────────────────────────────────
function loop() { update(); draw(); rafId = requestAnimationFrame(loop); }

function update() {
  if (paused || waiting) return;

  ball.x += ball.vx; ball.y += ball.vy;

  if (ball.x - ball.r < 0)  { ball.x = ball.r;      ball.vx =  Math.abs(ball.vx); }
  if (ball.x + ball.r > W)  { ball.x = W - ball.r;  ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < 0)  { ball.y = ball.r;       ball.vy =  Math.abs(ball.vy); }

  // Paddle
  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y + ball.r <= paddle.y + paddle.h + ball.r &&
    ball.x >= paddle.x - ball.r &&
    ball.x <= paddle.x + paddle.w + ball.r
  ) {
    const hit   = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const angle = hit * 65 * (Math.PI / 180);
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -speed * Math.cos(angle);
    ball.y  = paddle.y - ball.r;
  }

  // Ball lost
  if (ball.y - ball.r > H) {
    lives--;
    updateHUD();
    if (lives <= 0) { handleGameOver(); return; }
    resetBall(); return;
  }

  // Bricks
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      const fromLeft = Math.abs(ball.x - (b.x + b.w)), fromRight = Math.abs(ball.x - b.x);
      const fromTop  = Math.abs(ball.y - (b.y + b.h)), fromBottom = Math.abs(ball.y - b.y);
      const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
      if (min === fromTop || min === fromBottom) ball.vy *= -1; else ball.vx *= -1;
      b.hp--;
      if (b.hp <= 0) {
        b.alive = false;
        score += 10 * stage;
        if (Math.random() < .15) spawnPowerUp(b);
      }
      break;
    }
  }

  // Power-ups
  for (const p of powerUps) {
    if (!p.alive) continue;
    p.y += 2.5;
    if (p.y + 8 >= paddle.y && p.x >= paddle.x && p.x <= paddle.x + paddle.w) {
      p.alive = false; applyPowerUp(p.type);
    }
    if (p.y > H) p.alive = false;
  }

  // Stage clear
  if (bricks.every(b => !b.alive)) {
    stage++; score += 100; updateHUD();
    showOverlay('🎉', `스테이지 ${stage}!`, '+100 보너스! 준비하세요.', '계속 →', () => {
      newStage(); overlay.classList.add('hidden');
    });
  }

  updateHUD();
}

async function handleGameOver() {
  cancelAnimationFrame(rafId);
  if (score > (best ?? 0)) {
    best = score;
    await saveManager.save(); // 최고점 갱신 시 즉시 저장
  }
  showOverlay('😔', '게임 오버', `최종 점수: ${score}점 | 최고: ${best}점`, '처음부터 →', initGame);
}

// ── Power-ups ─────────────────────────────────────────────────────
function spawnPowerUp(b) {
  const types = ['wide', 'wide', 'score'];
  powerUps.push({ x: b.x + b.w / 2, y: b.y, type: types[Math.floor(Math.random() * types.length)], alive: true });
}
function applyPowerUp(type) {
  if (type === 'wide') {
    paddle.w = Math.min(140, paddle.w + 30);
    setTimeout(() => { paddle.w = Math.max(50, paddle.w - 30); }, 8000);
  } else {
    score += 50 * stage;
  }
}

// ── Draw ─────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = '#090e1a'; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#ffffff06'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.globalAlpha = b.hp === 1 ? 1 : 0.5 + .5 * (b.hp / b.maxHp);
    ctx.fillStyle = b.color;
    roundRect(ctx, b.x, b.y, b.w, b.h, 4); ctx.fill();
    ctx.globalAlpha = 1;
    if (b.maxHp > 1 && b.hp < b.maxHp) {
      ctx.strokeStyle = '#00000066'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w * .3, b.y);
      ctx.lineTo(b.x + b.w * .5, b.y + b.h * .6);
      ctx.lineTo(b.x + b.w * .7, b.y + b.h);
      ctx.stroke();
    }
  }

  for (const p of powerUps) {
    if (!p.alive) continue;
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.type === 'wide' ? '💛' : '⭐', p.x, p.y);
  }

  const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
  grad.addColorStop(0, '#38bdf8'); grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 6); ctx.fill();

  const bg = ctx.createRadialGradient(ball.x - ball.r * .3, ball.y - ball.r * .3, 0, ball.x, ball.y, ball.r);
  bg.addColorStop(0, '#fff'); bg.addColorStop(1, '#38bdf8');
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = bg; ctx.fill();

  if (waiting) {
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '14px system-ui';
    ctx.textAlign = 'center'; ctx.fillText('탭하여 발사!', W / 2, H / 2);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// ── HUD ──────────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = score;
  bestEl.textContent  = Math.max(score, best ?? 0);
  stageEl.textContent = stage;
  livesEl.textContent = '❤️'.repeat(lives);
}

// ── Overlay ──────────────────────────────────────────────────────
function showOverlay(emoji, title, sub, btnText, cb) {
  overlayEmoji.textContent = emoji;
  overlayTitle.textContent = title;
  overlaySub.textContent   = sub;
  overlayBtn.textContent   = btnText;
  overlay.classList.remove('hidden');
  overlayBtn.onclick = () => { overlay.classList.add('hidden'); cb(); };
}

// ── Input ────────────────────────────────────────────────────────
canvasWrap.addEventListener('mousemove', e => {
  const rect  = canvas.getBoundingClientRect();
  const scale = W / rect.width;
  const mx    = (e.clientX - rect.left) * scale;
  paddle.x    = Math.max(0, Math.min(W - paddle.w, mx - paddle.w / 2));
  if (waiting) ball.x = paddle.x + paddle.w / 2;
});
canvasWrap.addEventListener('click', () => { if (waiting) { waiting = false; launched = true; } });

let lastTX = null;
canvas.addEventListener('touchstart', e => {
  e.preventDefault(); lastTX = e.touches[0].clientX;
  if (waiting) { waiting = false; launched = true; }
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (lastTX === null) return;
  const dx = e.touches[0].clientX - lastTX;
  const rect = canvas.getBoundingClientRect();
  const scale = W / rect.width;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x + dx * scale));
  if (waiting) ball.x = paddle.x + paddle.w / 2;
  lastTX = e.touches[0].clientX;
}, { passive: false });
canvas.addEventListener('touchend', () => { lastTX = null; });

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && waiting)  { waiting = false; launched = true; }
  if (e.key === ' ' && !waiting) paused = !paused;
});
document.addEventListener('keyup', e => { keys[e.key] = false; });
setInterval(() => {
  if (!launched) return;
  if (keys['ArrowLeft'])  paddle.x = Math.max(0, paddle.x - 8);
  if (keys['ArrowRight']) paddle.x = Math.min(W - paddle.w, paddle.x + 8);
}, 16);
