import { createSaveManager } from "../../shared/save.js";

let sequence,playerIdx,round,best,showing,accepting;

const saveManager=createSaveManager({
  gameId:'game-simon-says',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

const btns=[0,1,2,3].map(i=>document.getElementById('btn-'+i));
document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('retry-btn').addEventListener('click',startGame);
btns.forEach(b=>b.addEventListener('click',()=>{if(accepting)playerPress(+b.dataset.i);}));

function startGame(){
  ['start-screen','result-screen'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById('game-screen').classList.add('active');
  sequence=[];round=0;showing=false;accepting=false;
  setStatus('준비 중...');
  setTimeout(nextRound,800);
}

function nextRound(){
  round++;
  sequence.push(Math.floor(Math.random()*4));
  document.getElementById('round').textContent=round;
  setStatus('잘 보세요!');
  showSequence();
}

function showSequence(){
  showing=true;accepting=false;
  setBtnsDisabled(true);
  let i=0;
  const speed=Math.max(300,700-round*30);
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
    setTimeout(nextRound,1000);
  }
}

function setStatus(txt){document.getElementById('status').textContent=txt;}

async function endGame(){
  accepting=false;setBtnsDisabled(true);
  setStatus('틀렸어요! ❌');
  if(round>(best??0)){best=round;await saveManager.save();}
  setTimeout(()=>{
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('r-emoji').textContent=round>=20?'🏆':round>=10?'🎉':'😅';
    document.getElementById('r-round').textContent=`${round}라운드`;
    document.getElementById('r-sub').textContent=`최고 기록: ${Math.max(round,best??0)}라운드`;
  },800);
}

// init playerIdx
document.getElementById('game-screen').addEventListener('transitionend',()=>{playerIdx=0;});
// reset playerIdx at start
function resetPlayerIdx(){playerIdx=0;}
const origStart=startGame;
