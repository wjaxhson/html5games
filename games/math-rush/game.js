import { createSaveManager } from "../../shared/save.js";

let score,best,combo,timeLeft,correct,total,running,timerInt,curAnswer;

const saveManager=createSaveManager({
  gameId:'game-math-rush',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('retry-btn').addEventListener('click',startGame);

function startGame(){
  ['start-screen','result-screen'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById('game-screen').classList.add('active');
  score=0;combo=0;timeLeft=60;correct=0;total=0;running=true;
  clearInterval(timerInt);
  timerInt=setInterval(tick,1000);
  nextQuestion();updateHUD();
}

function tick(){
  timeLeft--;
  document.getElementById('timer').textContent=timeLeft;
  if(timeLeft<=0)endGame();
}

// 난이도 단계: 맞춘 개수 기준
// 0~4: 덧셈·뺄셈(소수)
// 5~11: 덧셈·뺄셈(큰수) + 곱셈
// 12~19: 위 + 나눗셈
// 20+: 모든 연산 + 큰 수 범위
function getDiffLevel(){
  if(correct>=20)return 3;
  if(correct>=12)return 2;
  if(correct>=5)return 1;
  return 0;
}

function genQuestion(){
  const lv=getDiffLevel();
  const ops=['+','-','×','÷'];
  const opCount=lv>=3?4:lv>=2?4:lv>=1?3:2;
  const op=ops[Math.floor(Math.random()*opCount)];
  let a,b,ans;
  if(op==='+'){
    const max=lv>=2?99:lv>=1?70:30;
    a=rnd(1,max);b=rnd(1,max);ans=a+b;
  }else if(op==='-'){
    const max=lv>=2?99:lv>=1?70:30;
    a=rnd(5,max);b=rnd(1,a);ans=a-b;
  }else if(op==='×'){
    const maxA=lv>=3?15:12,maxB=lv>=3?15:12;
    a=rnd(2,maxA);b=rnd(2,maxB);ans=a*b;
  }else{
    const maxQ=lv>=3?15:12;
    ans=rnd(2,maxQ);b=rnd(2,maxQ);a=ans*b;
  }
  return{expr:`${a} ${op} ${b}`,ans,lv};
}

function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}

function nextQuestion(){
  if(!running)return;
  const q=genQuestion();
  curAnswer=q.ans;
  document.getElementById('question').textContent=q.expr+' = ?';
  const choices=shuffleChoices(q.ans);
  const choicesEl=document.getElementById('choices');
  choicesEl.innerHTML='';
  choices.forEach(v=>{
    const btn=document.createElement('button');
    btn.className='choice';btn.textContent=v;
    btn.addEventListener('click',()=>answer(btn,v));
    choicesEl.appendChild(btn);
  });
}

function shuffleChoices(ans){
  const s=new Set([ans]);
  while(s.size<4){
    const d=rnd(-15,15);if(d===0)continue;
    const v=ans+d;if(v<0)continue;
    s.add(v);
  }
  return [...s].sort(()=>Math.random()-.5);
}

function answer(btn,val){
  if(!running)return;
  total++;
  const correct2=val===curAnswer;
  btn.classList.add(correct2?'correct':'wrong');
  document.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  if(correct2){combo++;const pts=10+Math.floor(combo/3)*5;score+=pts;correct++;showFb(`+${pts} ✅`,correct2);}
  else{combo=0;score=Math.max(0,score-3);showFb('-3 ❌',false);}
  updateHUD();
  if(score>(best??0)){best=score;saveManager.save();}
  setTimeout(nextQuestion,600);
}

function showFb(txt,ok){
  const el=document.getElementById('feedback-bar');
  el.textContent=txt;el.style.color=ok?'#34d399':'#f87171';
}

async function endGame(){
  running=false;clearInterval(timerInt);
  if(score>(best??0)){best=score;await saveManager.save();}
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('result-screen').classList.add('active');
  const acc=total?Math.round(correct/total*100):0;
  document.getElementById('r-emoji').textContent=score>=300?'🏆':score>=150?'🎉':'😅';
  document.getElementById('r-score').textContent=score+'점';
  document.getElementById('r-sub').textContent=`정답 ${correct}/${total} (${acc}%) | 최고: ${Math.max(score,best??0)}점`;
}

const LV_LABELS=['Lv.1 · ＋ −','Lv.2 · ＋ − ×','Lv.3 · ＋ − × ÷','Lv.4 · ALL ↑↑'];
const LV_NEXT=[5,12,20,Infinity];

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('combo').textContent=combo;
  document.getElementById('best').textContent=Math.max(score,best??0);
  const lv=getDiffLevel();
  const remaining=LV_NEXT[lv]-correct;
  const bar=document.getElementById('level-bar');
  if(bar)bar.textContent=LV_LABELS[lv]+(lv<3?`  (다음 단계까지 ${remaining}문제)`:'  🔥 최고 난이도!');
}
