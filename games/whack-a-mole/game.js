import { createSaveManager } from "../../shared/save.js";

// ── DOM ──────────────────────────────────────────────
const startScreen   = document.getElementById('start-screen');
const gameScreen    = document.getElementById('game-screen');
const resultScreen  = document.getElementById('result-screen');
const gridEl        = document.getElementById('grid');
const scoreEl       = document.getElementById('score');
const bestEl        = document.getElementById('best');
const timerEl       = document.getElementById('timer');
const comboEl       = document.getElementById('combo-display');
const loginStatusEl = document.getElementById('login-status');

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', replayGame);
document.getElementById('home-btn').addEventListener('click', goHome);

// ── Difficulty ────────────────────────────────────────
const DIFFS = {
  easy:   { holes: 6, appear: 1100, stay: 1400, bombRate: .1 },
  normal: { holes: 9, appear: 850,  stay: 1100, bombRate: .18 },
  hard:   { holes: 9, appear: 600,  stay: 800,  bombRate: .25 },
};
let difficulty = 'easy';

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.dataset.diff;
  });
});

// ── State ─────────────────────────────────────────────
let score, combo, timeLeft, holes;
let moleTimer, countdownTimer;
// bestScores: 난이도별 최고점 (서버/로컬 통합 관리)
let bestScores = { easy: 0, normal: 0, hard: 0 };
const GAME_DURATION = 30;

// ── Save Manager (난이도 3개 모두 하나의 문서에 저장) ──────────────
const saveManager = createSaveManager({
  gameId: 'game-whack-a-mole',
  loginStatusEl,
  getSaveData() {
    return { ...bestScores };
  },
  applySaveData(data) {
    bestScores.easy   = data.easy   ?? 0;
    bestScores.normal = data.normal ?? 0;
    bestScores.hard   = data.hard   ?? 0;
  },
});

// ── Grid ──────────────────────────────────────────────
function buildGrid(count) {
  gridEl.innerHTML = '';
  holes = [];
  for (let i = 0; i < count; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.innerHTML = `<span class="mole"></span><div class="hole-dirt"></div>`;
    hole.addEventListener('pointerdown', e => { e.preventDefault(); whack(hole); });
    gridEl.appendChild(hole);
    holes.push({ el: hole, active: false, isBomb: false, timer: null });
  }
}

// ── Game Flow ─────────────────────────────────────────
function startGame() {
  const cfg = DIFFS[difficulty];
  score = 0; combo = 0;
  timeLeft = GAME_DURATION;
  timerEl.style.color = '';

  buildGrid(cfg.holes);
  updateHUD();

  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  scheduleMole();
  countdownTimer = setInterval(countdown, 1000);
}

function replayGame() {
  resultScreen.classList.remove('active');
  startGame();
}

function goHome() {
  resultScreen.classList.remove('active');
  startScreen.classList.add('active');
}

// ── Mole Logic ────────────────────────────────────────
function scheduleMole() {
  const cfg = DIFFS[difficulty];
  const idle = holes.filter(h => !h.active);
  if (!idle.length) { moleTimer = setTimeout(scheduleMole, cfg.appear * .5); return; }

  const h = idle[Math.floor(Math.random() * idle.length)];
  popUp(h, Math.random() < cfg.bombRate);
  moleTimer = setTimeout(scheduleMole, cfg.appear + Math.random() * 300 - 150);
}

function popUp(h, isBomb) {
  const cfg = DIFFS[difficulty];
  h.active = true; h.isBomb = isBomb;
  h.el.querySelector('.mole').textContent = isBomb ? '💣' : '🐹';
  h.el.classList.add('up');
  h.timer = setTimeout(() => popDown(h), cfg.stay);
}

function popDown(h) {
  h.active = false;
  h.el.classList.remove('up', 'whacked');
  clearTimeout(h.timer);
}

function whack(holeEl) {
  const h = holes.find(x => x.el === holeEl);
  if (!h || !h.active) return;

  clearTimeout(h.timer);
  h.el.classList.add('whacked');

  const flash = document.createElement('div');
  flash.className = 'hit-flash';
  holeEl.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());

  if (h.isBomb) {
    score = Math.max(0, score - 5);
    combo = 0;
    showCombo('💥 -5점!');
  } else {
    combo++;
    const pts = combo >= 3 ? 20 : 10;
    score += pts;
    showCombo(combo >= 3 ? `🔥 콤보 x${combo}! +${pts}` : `+${pts}`);
  }

  updateHUD();
  setTimeout(() => popDown(h), 200);
}

function showCombo(txt) {
  comboEl.textContent = txt;
  comboEl.classList.remove('combo-pop');
  void comboEl.offsetWidth;
  comboEl.classList.add('combo-pop');
}

// ── Timer ─────────────────────────────────────────────
function countdown() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 5) timerEl.style.color = '#ef4444';
  if (timeLeft <= 0) endGame();
}

async function endGame() {
  clearTimeout(moleTimer);
  clearInterval(countdownTimer);
  holes.forEach(h => { clearTimeout(h.timer); h.el.classList.remove('up'); h.active = false; });

  // 난이도별 최고점 갱신
  if (score > bestScores[difficulty]) {
    bestScores[difficulty] = score;
    await saveManager.save(); // 최고점 갱신 시 즉시 저장
  }

  const best = bestScores[difficulty];
  const emoji = score >= 150 ? '🏆' : score >= 80 ? '🎉' : '😅';
  const title = score >= 150 ? '전설의 두더지 사냥꾼!' : score >= 80 ? '훌륭해요!' : '아쉽네요...';
  const diffLabel = { easy: '쉬움', normal: '보통', hard: '어려움' }[difficulty];

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-score').textContent = `${score}점`;
  document.getElementById('result-sub').textContent = `[${diffLabel}] 최고 기록: ${best}점`;

  gameScreen.classList.remove('active');
  resultScreen.classList.add('active');
}

// ── HUD ───────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = score;
  bestEl.textContent  = Math.max(score, bestScores[difficulty]);
}
