import { createSaveManager } from "../../shared/save.js";

const EMOJIS=['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐙','🦋','🌸','⭐','🍕','🎸','🚀','🌈','🎯','💎','🔥','🎪','🦄','🎭'];
let diff='easy',tries,matched,timerSec,timerInterval,first,second,busy;
let bestEasy=0,bestHard=0;

const saveManager=createSaveManager({
  gameId:'game-memory-card',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{bestEasy,bestHard}},
  applySaveData(d){bestEasy=d.bestEasy??0;bestHard=d.bestHard??0;renderBest()},
});

function renderBest(){
  const b=diff==='easy'?bestEasy:bestHard;
  document.getElementById('best').textContent=b?`${b}점`:'-';
}

document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.diff-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); diff=b.dataset.diff; renderBest();
}));
document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('retry-btn').addEventListener('click',startGame);
document.getElementById('home-btn').addEventListener('click',()=>{
  document.getElementById('result-screen').classList.remove('active');
  document.getElementById('start-screen').classList.add('active');
});

function startGame(){
  ['start-screen','result-screen'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById('game-screen').classList.add('active');
  const cols=diff==='easy'?4:6;
  const pairs=cols*cols/2;
  tries=0;matched=0;timerSec=0;first=null;second=null;busy=false;
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{timerSec++;document.getElementById('timer').textContent=timerSec;},1000);
  const pool=[...EMOJIS].sort(()=>Math.random()-.5).slice(0,pairs);
  const cards=[...pool,...pool].sort(()=>Math.random()-.5);
  const grid=document.getElementById('grid');
  grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  grid.innerHTML='';
  cards.forEach((emoji,i)=>{
    const card=document.createElement('div');
    card.className='card';
    card.dataset.emoji=emoji;
    card.innerHTML=`<div class="card-back">❓</div><div class="card-front">${emoji}</div>`;
    card.addEventListener('click',()=>flip(card));
    grid.appendChild(card);
  });
  updateHUD();
}

function flip(card){
  if(busy||card.classList.contains('flipped')||card.classList.contains('matched'))return;
  card.classList.add('flipped');
  if(!first){first=card;return;}
  second=card;busy=true;tries++;
  updateHUD();
  if(first.dataset.emoji===second.dataset.emoji){
    first.classList.add('matched');second.classList.add('matched');
    matched++;updateHUD();first=null;second=null;busy=false;
    if(matched===document.querySelectorAll('.card').length/2)endGame();
  }else{
    setTimeout(()=>{first.classList.remove('flipped');second.classList.remove('flipped');first=null;second=null;busy=false;},900);
  }
}

async function endGame(){
  clearInterval(timerInterval);
  const pairs=document.querySelectorAll('.card').length/2;
  const score=Math.max(0,pairs*200-tries*10-Math.floor(timerSec/2)*5);
  if(diff==='easy'&&score>bestEasy){bestEasy=score;await saveManager.save();}
  if(diff==='hard'&&score>bestHard){bestHard=score;await saveManager.save();}
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('result-screen').classList.add('active');
  document.getElementById('r-emoji').textContent=score>300?'🏆':score>150?'🎉':'😅';
  document.getElementById('r-title').textContent=score>300?'완벽!':score>150?'훌륭해요!':'아쉽네요';
  document.getElementById('r-sub').textContent=`점수: ${score}점 | ${tries}번 시도 | ${timerSec}초`;
}

function updateHUD(){
  document.getElementById('tries').textContent=tries;
  document.getElementById('matched').textContent=matched;
  renderBest();
}
