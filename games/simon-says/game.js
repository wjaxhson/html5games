import { createSaveManager } from "../../shared/save.js";

// ── 버튼 색상 팔레트 (최대 16개) ─────────────────────────────────────────
const BTN_COLORS=[
  '#f87171','#4ade80','#60a5fa','#fbbf24', // 2x2 (4)
  '#f472b6','#a78bfa','#34d399','#fb923c','#22d3ee', // 3x3 (9)
  '#e879f9','#86efac','#93c5fd','#fcd34d','#fca5a5','#c4b5fd','#6ee7b7', // 4x4 (16)
];

// ── State ──────────────────────────────────────────────────────────────────
let sequence, playerIdx, round, showing, accepting;
let mode = 2; // 그리드 크기 (2, 3, 4)
let best2=0, best3=0, best4=0; // 모드별 최고
let btns = [];

function getBest(){ return mode===2?best2:mode===3?best3:best4; }
function setBest(v){ if(mode===2)best2=v; else if(mode===3)best3=v; else best4=v; }

const saveManager=createSaveManager({
  gameId:'game-simon-says',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best2,best3,best4}},
  applySaveData(d){
    best2=d.best2??d.best??0; // 이전 저장 포맷 호환
    best3=d.best3??0;
    best4=d.best4??0;
    renderBest();
  },
});

function renderBest(){
  document.getElementById('best').textContent=getBest();
}

// ── Mode selection ─────────────────────────────────────────────────────────
document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.diff-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  mode=+b.dataset.mode;
  renderBest();
}));

document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('retry-btn').addEventListener('click',startGame);

// ── Start ──────────────────────────────────────────────────────────────────
function startGame(){
  ['start-screen','result-screen'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById('game-screen').classList.add('active');
  sequence=[];round=0;playerIdx=0;showing=false;accepting=false;
  buildBoard();
  renderBest();
  setStatus('준비 중...');
  setTimeout(nextRound,800);
}

// ── Build button grid ──────────────────────────────────────────────────────
function buildBoard(){
  const board=document.getElementById('simon-board');
  board.innerHTML='';
  board.className=`simon-board g${mode}`;
  btns=[];
  const total=mode*mode;
  for(let i=0;i<total;i++){
    const b=document.createElement('button');
    b.className='simon-btn';
    b.dataset.i=i;
    b.style.background=BTN_COLORS[i]||'#94a3b8';
    b.addEventListener('click',()=>{ if(accepting)playerPress(i); });
    board.appendChild(b);
    btns.push(b);
  }
}

// ── Game logic ─────────────────────────────────────────────────────────────
function nextRound(){
  round++;
  sequence.push(Math.floor(Math.random()*(mode*mode)));
  document.getElementById('round').textContent=round;
  setStatus('잘 보세요!');
  showSequence();
}

function showSequence(){
  showing=true;accepting=false;
  setBtnsDisabled(true);
  let i=0;
  const speed=Math.max(250,700-round*25);
  function next(){
    if(i>=sequence.length){showing=false;accepting=true;setBtnsDisabled(false);setStatus('따라하세요!');return;}
    flashBtn(sequence[i]);
    i++;
    setTimeout(next,speed+200);
  }
  setTimeout(next,400);
}

function flashBtn(idx){
  const b=btns[idx];
  if(!b)return;
  b.classList.add('lit');
  setTimeout(()=>b.classList.remove('lit'),350);
}

function setBtnsDisabled(v){btns.forEach(b=>b.disabled=v);}

function playerPress(idx){
  flashBtn(idx);
  if(idx!==sequence[playerIdx]){endGame();return;}
  playerIdx++;
  if(playerIdx>=sequence.length){
    playerIdx=0;accepting=false;
    setStatus('정확해요! 🎉');
    setTimeout(nextRound,900);
  }
}

function setStatus(txt){document.getElementById('status').textContent=txt;}

async function endGame(){
  accepting=false;setBtnsDisabled(true);
  setStatus('틀렸어요! ❌');
  if(round>getBest()){setBest(round);await saveManager.save();}
  setTimeout(()=>{
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    const best=getBest();
    document.getElementById('r-emoji').textContent=round>=20?'🏆':round>=10?'🎉':'😅';
    document.getElementById('r-round').textContent=`${round}라운드`;
    document.getElementById('r-sub').textContent=`${mode}×${mode} 모드 최고: ${best}라운드`;
  },800);
}
