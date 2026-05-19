// ── 색깔 데이터베이스 (20가지) ──
const COLORS = [
  { name: '빨강',   hex: '#e74c3c', complementary: '#3ce7d8' },
  { name: '파랑',   hex: '#3498db', complementary: '#db9034' },
  { name: '초록',   hex: '#27ae60', complementary: '#ae2777' },
  { name: '노랑',   hex: '#f1c40f', complementary: '#0f3ef1' },
  { name: '주황',   hex: '#e67e22', complementary: '#2281e6' },
  { name: '보라',   hex: '#9b59b6', complementary: '#59b69b' },
  { name: '분홍',   hex: '#e91e8c', complementary: '#1ee973' },
  { name: '하늘',   hex: '#00bcd4', complementary: '#d44300' },
  { name: '남색',   hex: '#1a237e', complementary: '#7e6d1a' },
  { name: '연두',   hex: '#8bc34a', complementary: '#7e4ab3' },
  { name: '갈색',   hex: '#795548', complementary: '#484f79' },
  { name: '회색',   hex: '#9e9e9e', complementary: '#9e9e9e' },
  { name: '검정',   hex: '#212121', complementary: '#d4d4d4' },
  { name: '흰색',   hex: '#bdbdbd', complementary: '#424242' },
  { name: '금색',   hex: '#ffc107', complementary: '#070ec1' },
  { name: '은색',   hex: '#90a4ae', complementary: '#a45b46' },
  { name: '자주',   hex: '#880e4f', complementary: '#0e884b' },
  { name: '청록',   hex: '#009688', complementary: '#960016' },
  { name: '연보라', hex: '#ce93d8', complementary: '#93d8c9' },
  { name: '살구',   hex: '#ffab76', complementary: '#76c0ff' },
];

// 비슷한 색 매핑 (hue 인접)
const SIMILAR = {
  '빨강':   ['주황','자주','분홍'],
  '파랑':   ['하늘','남색','청록'],
  '초록':   ['연두','청록','하늘'],
  '노랑':   ['금색','연두','살구'],
  '주황':   ['빨강','살구','금색'],
  '보라':   ['자주','연보라','남색'],
  '분홍':   ['빨강','연보라','살구'],
  '하늘':   ['파랑','청록','은색'],
  '남색':   ['파랑','보라','자주'],
  '연두':   ['초록','노랑','금색'],
  '갈색':   ['살구','주황','금색'],
  '회색':   ['은색','검정','흰색'],
  '검정':   ['회색','남색','갈색'],
  '흰색':   ['회색','은색','연보라'],
  '금색':   ['노랑','살구','주황'],
  '은색':   ['회색','흰색','하늘'],
  '자주':   ['빨강','보라','분홍'],
  '청록':   ['초록','하늘','파랑'],
  '연보라': ['보라','분홍','은색'],
  '살구':   ['주황','분홍','금색'],
};

let questions = [];
let current   = 0;
let history   = []; // {word, inkColor, textColor, chosen, correct}
let startTime = 0;
let blocked   = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) { return shuffle(arr).slice(0, n); }

function colorByName(name) { return COLORS.find(c => c.name === name); }

function buildQuestion() {
  // 글자 내용 (textColor): 임의 색
  const allNames = COLORS.map(c => c.name);
  const textColorName = allNames[Math.floor(Math.random() * allNames.length)];
  const textColor = colorByName(textColorName);

  // 잉크 색 (inkColor): 50% 확률로 다른 색
  let inkColor;
  const forceConflict = Math.random() < 0.75;
  if (forceConflict) {
    const others = COLORS.filter(c => c.name !== textColorName);
    inkColor = others[Math.floor(Math.random() * others.length)];
  } else {
    inkColor = textColor;
  }

  // 정답: inkColor
  const correct = inkColor;

  // 보색
  const complementHex = inkColor.complementary;
  // 가장 가까운 색 이름 찾기 (보색)
  let compColor = COLORS.reduce((best, c) => {
    if (c.name === correct.name) return best;
    return hexDist(c.hex, complementHex) < hexDist(best.hex, complementHex) ? c : best;
  }, COLORS.find(c => c.name !== correct.name));

  // 비슷한 색
  const similarNames = (SIMILAR[correct.name] || []).filter(n => n !== correct.name);
  const similarPool  = COLORS.filter(c => similarNames.includes(c.name));
  let similarColor   = similarPool.length > 0
    ? similarPool[Math.floor(Math.random() * similarPool.length)]
    : COLORS.find(c => c.name !== correct.name && c.name !== compColor.name);

  // 글자에 적힌 색 (만약 잉크색과 같으면 다른 것)
  let textAsColor = textColor;
  if (textAsColor.name === correct.name) {
    const others = COLORS.filter(c => c.name !== correct.name && c.name !== compColor.name && c.name !== similarColor.name);
    textAsColor = others[Math.floor(Math.random() * others.length)];
  }

  // 4개 옵션 중복 제거
  const pool = [correct, compColor, similarColor, textAsColor];
  const seen = new Set();
  const opts = [];
  for (const c of pool) {
    if (!seen.has(c.name)) { seen.add(c.name); opts.push(c); }
  }
  // 부족하면 채우기
  for (const c of shuffle(COLORS)) {
    if (opts.length >= 4) break;
    if (!seen.has(c.name)) { seen.add(c.name); opts.push(c); }
  }

  return {
    word:      textColorName,
    inkColor:  inkColor,
    textColor: textColor,
    options:   shuffle(opts.slice(0, 4)),
  };
}

function hexDist(h1, h2) {
  const r1 = parseInt(h1.slice(1,3),16), g1 = parseInt(h1.slice(3,5),16), b1 = parseInt(h1.slice(5,7),16);
  const r2 = parseInt(h2.slice(1,3),16), g2 = parseInt(h2.slice(3,5),16), b2 = parseInt(h2.slice(5,7),16);
  return Math.abs(r1-r2) + Math.abs(g1-g2) + Math.abs(b1-b2);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startGame() {
  questions = Array.from({length: 5}, buildQuestion);
  current   = 0;
  history   = [];
  startTime = Date.now();
  blocked   = false;
  showScreen('game-screen');
  renderQuestion();
}

function renderDots() {
  const container = document.getElementById('prog-dots');
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const d = document.createElement('div');
    d.className = 'pdot';
    if (i < current)        d.classList.add('done');
    else if (i === current) d.classList.add('active');
    container.appendChild(d);
  }
  document.getElementById('prog-label').textContent = (current + 1) + ' / 5';
}

function renderQuestion() {
  blocked = false;
  const q = questions[current];

  // progress
  renderDots();

  // word
  const wordEl = document.getElementById('q-word');
  wordEl.textContent = q.word;
  wordEl.style.color = q.inkColor.hex;

  // card entrance
  const card = document.getElementById('question-card');
  card.classList.remove('fadein');
  void card.offsetWidth;
  card.classList.add('fadein');

  // buttons
  const grid = document.getElementById('buttons-grid');
  grid.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.background = opt.hex;

    const swatch = document.createElement('div');
    swatch.className = 'btn-color-swatch';
    swatch.style.background = 'rgba(255,255,255,0.22)';

    const label = document.createElement('div');
    label.className = 'btn-color-name';
    label.textContent = opt.name;

    btn.appendChild(swatch);
    btn.appendChild(label);
    btn.addEventListener('click', () => handleAnswer(opt, btn));
    grid.appendChild(btn);
  });
}

function showFeedback(ok) {
  const fb = document.getElementById('feedback');
  document.getElementById('feedback-inner').textContent = ok ? '✓' : '✗';
  fb.style.color = ok ? '#27ae60' : '#e74c3c';
  fb.classList.add('show');
  setTimeout(() => fb.classList.remove('show'), 500);
}

function handleAnswer(chosen, btn) {
  if (blocked) return;
  blocked = true;

  const q = questions[current];
  const ok = chosen.name === q.inkColor.name;

  history.push({ q, chosen, ok });

  btn.classList.add(ok ? 'correct' : 'wrong');
  showFeedback(ok);

  if (!ok) {
    // 실패
    setTimeout(() => markDotFail(), 250);
    setTimeout(() => showResult(false), 800);
    return;
  }

  current++;
  if (current >= 5) {
    setTimeout(() => showResult(true), 600);
  } else {
    setTimeout(() => renderQuestion(), 480);
  }
}

function markDotFail() {
  const dots = document.querySelectorAll('.pdot');
  if (dots[current]) {
    dots[current].classList.remove('active');
    dots[current].classList.add('fail');
  }
}

function showResult(success) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const correct = history.filter(h => h.ok).length;

  document.getElementById('result-emoji').textContent = success ? '🎉' : '😵';
  document.getElementById('result-title').textContent = success ? '성공!' : '탈락!';
  document.getElementById('result-sub').textContent   = success
    ? '5문제 모두 맞혔어요! 대단한 집중력이에요.'
    : `${correct}문제 만에 탈락했어요.`;

  document.getElementById('result-stats').innerHTML = `
    <div class="stat-box">
      <div class="stat-num">${correct}<span style="font-size:16px;color:var(--muted)">/5</span></div>
      <div class="stat-lbl">정답</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${elapsed}<span style="font-size:16px;color:var(--muted)">s</span></div>
      <div class="stat-lbl">소요시간</div>
    </div>
  `;

  const reviewEl = document.getElementById('review-list');
  reviewEl.innerHTML = '';
  history.forEach((h, i) => {
    const item = document.createElement('div');
    item.className = 'review-item';
    const conflict = h.q.word !== h.q.inkColor.name;
    item.innerHTML = `
      <span class="review-icon">${h.ok ? '✅' : '❌'}</span>
      <span class="review-word" style="color:${h.q.inkColor.hex}">${h.q.word}</span>
      <span class="review-desc">${h.ok ? '정답' : '오답 → ' + h.chosen.name}</span>
    `;
    reviewEl.appendChild(item);
  });

  showScreen('result-screen');
  document.getElementById('result-card').classList.remove('fadein');
  void document.getElementById('result-card').offsetWidth;
  document.getElementById('result-card').classList.add('fadein');
}

// 데모 단어 반짝이기
const demoColors = COLORS.map(c => c.hex);
let di = 0;
setInterval(() => {
  di = (di + 1) % demoColors.length;
  const d = document.getElementById('demo-word');
  if (d) d.style.color = demoColors[di];
}, 1200);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn")?.addEventListener("click", startGame);
  document.getElementById("retry-btn")?.addEventListener("click", startGame);
});
