import { createSaveManager } from "../../shared/save.js";

const WORDS=['apple','brave','cloud','dance','eagle','flame','grace','heart','ivory','joker','kneel','lemon','mango','night','ocean','piano','queen','river','stone','tiger','ultra','vivid','water','xenon','yield','zebra','blend','crisp','drift','echo','frost','gleam','hover','index','jewel','karma','laser','magic','noble','orbit','prism','quest','remix','solar','torch','urban','vault','whirl','pixel','youth','blaze','cedar','delta','ember','focus','guide','haste','image','judge','logic','metal','nerve','order','pearl','quote','radar','salsa','tempo','unity','value','witty','exact','yummy','zippy','alpha','bonus','chief','depth','elite','flair','genre','habit','input','jazzy','knack','lucky','mixer','niche','opera','phase','quirk','rapid','scale','tidal','uncle','vigor','whale'];

let cur,next5,correct,wrong,totalWords,timeLeft,running,timerInt,startTime,best;

const saveManager=createSaveManager({
  gameId:'game-typing-test',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

const wordDisplay=document.getElementById('word-display');
const upcomingEl=document.getElementById('upcoming');
const inputEl=document.getElementById('input');

document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('retry-btn').addEventListener('click',startGame);

inputEl.addEventListener('input',onInput);
inputEl.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();submit();}});

function startGame(){
  ['start-screen','result-screen'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById('game-screen').classList.add('active');
  const shuffled=[...WORDS].sort(()=>Math.random()-.5);
  const queue=shuffled;
  let qi=0;
  cur=queue[qi++];
  next5=queue.slice(qi,qi+5);
  correct=0;wrong=0;totalWords=0;timeLeft=60;running=true;startTime=Date.now();
  clearInterval(timerInt);
  timerInt=setInterval(tick,1000);
  inputEl.value='';inputEl.focus();
  renderWord();renderUpcoming();updateHUD();
}

function tick(){
  timeLeft--;
  document.getElementById('timer').textContent=timeLeft;
  updateHUD();
  if(timeLeft<=0)endGame();
}

function onInput(){
  if(!running)return;
  const val=inputEl.value;
  // 실시간 색상 피드백
  const match=cur.startsWith(val);
  inputEl.classList.toggle('error',val.length>0&&!match);
  highlightWord(val);
}

function highlightWord(typed){
  let html='';
  for(let i=0;i<cur.length;i++){
    if(i<typed.length)html+=`<span class="${typed[i]===cur[i]?'correct':'wrong'}">${cur[i]}</span>`;
    else html+=cur[i];
  }
  wordDisplay.innerHTML=html;
}

function submit(){
  if(!running||!inputEl.value.trim())return;
  totalWords++;
  if(inputEl.value.trim()===cur)correct++;
  else wrong++;
  const pool=[...WORDS].sort(()=>Math.random()-.5);
  cur=pool[0];
  next5=pool.slice(1,6);
  inputEl.value='';inputEl.classList.remove('error');
  renderWord();renderUpcoming();updateHUD();
}

function renderWord(){wordDisplay.textContent=cur;}
function renderUpcoming(){upcomingEl.innerHTML=next5.map(w=>`<span class="upcoming-word">${w}</span>`).join('');}

function updateHUD(){
  const elapsed=Math.max(1,(60-timeLeft));
  const wpm=Math.round(correct/(elapsed/60));
  document.getElementById('wpm').textContent=wpm;
  const acc=totalWords?Math.round(correct/totalWords*100):100;
  document.getElementById('acc').textContent=acc+'%';
  document.getElementById('best').textContent=Math.max(wpm,best??0);
}

async function endGame(){
  running=false;clearInterval(timerInt);
  const elapsed=60;
  const wpm=Math.round(correct/(elapsed/60));
  const acc=totalWords?Math.round(correct/totalWords*100):100;
  if(wpm>(best??0)){best=wpm;await saveManager.save();}
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('result-screen').classList.add('active');
  document.getElementById('r-emoji').textContent=wpm>=60?'🏆':wpm>=40?'🎉':'😅';
  document.getElementById('r-wpm').textContent=wpm+' WPM';
  document.getElementById('r-sub').textContent=`정확도 ${acc}% | ${correct}단어 맞춤 | 최고: ${Math.max(wpm,best??0)} WPM`;
}
