import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=400;canvas.width=W;canvas.height=H;

const TARGET_R=45;
const NOTE_COLORS=['#f472b6','#a78bfa','#60a5fa','#34d399','#fbbf24'];
let notes,score,best,combo,lives,running,rafId,spawnTimer,level;
let feedbackEl=document.getElementById('feedback');

const saveManager=createSaveManager({
  gameId:'game-rhythm-tap',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

document.getElementById('start-btn').addEventListener('click',startGame);
canvas.addEventListener('click',onTap);
canvas.addEventListener('touchstart',e=>{e.preventDefault();onTap();},{passive:false});

function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  notes=[];score=0;combo=0;lives=3;running=true;spawnTimer=0;level=1;
  cancelAnimationFrame(rafId);
  lastT=0;rafId=requestAnimationFrame(loop);
  updateHUD();
}

const POSITIONS=[[90,100],[180,200],[270,100],[90,300],[270,300],[180,350]];
function spawnNote(){
  const pos=POSITIONS[Math.floor(Math.random()*POSITIONS.length)];
  const color=NOTE_COLORS[Math.floor(Math.random()*NOTE_COLORS.length)];
  const dur=Math.max(900,1400-level*50);
  notes.push({x:pos[0],y:pos[1],startR:120,endR:TARGET_R,r:120,dur,elapsed:0,color,alive:true,hit:false});
}

let lastT=0;
function loop(ts){
  const dt=Math.min(ts-lastT,50);lastT=ts;
  if(!running)return;
  spawnTimer+=dt;
  const interval=Math.max(600,1200-level*40);
  if(spawnTimer>=interval){spawnTimer=0;spawnNote();}
  update(dt);draw();
  rafId=requestAnimationFrame(loop);
}

function update(dt){
  notes.forEach(n=>{
    if(!n.alive)return;
    n.elapsed+=dt;
    const t=Math.min(n.elapsed/n.dur,1);
    n.r=n.startR-(n.startR-n.endR)*t;
    if(t>=1&&!n.hit){miss(n);}
  });
  notes=notes.filter(n=>n.alive||n.elapsed<n.dur+300);
}

function onTap(){
  if(!running)return;
  let tapped=false;
  for(const n of notes){
    if(!n.alive||n.hit)continue;
    const diff=Math.abs(n.r-TARGET_R);
    if(diff<=30){  // 넓은 판정 창
      n.hit=true;n.alive=false;
      const pts=diff<=6?300:diff<=15?200:100;
      const label=diff<=6?'🎯 PERFECT!':diff<=15?'✅ GREAT!':'👍 GOOD';
      score+=pts*(1+Math.floor(combo/5));combo++;
      level=1+Math.floor(score/1000);
      showFeedback(label,diff<=6?'#fbbf24':'#34d399');
      updateHUD();tapped=true;
      if(score>(best??0)){best=score;saveManager.save();}
      break;
    }
  }
  // 빈 탭 미스: 노트가 이미 판정 창을 지나쳐 사라진 경우에만 감점
  if(!tapped){
    const nearMissed=notes.some(n=>n.alive&&!n.hit&&n.r<TARGET_R-32);
    if(nearMissed){showFeedback('❌ MISS','#f87171');loseLife();}
  }
}

function miss(n){n.alive=false;showFeedback('❌ MISS','#f87171');loseLife();}

function loseLife(){
  combo=0;lives--;updateHUD();
  if(lives<=0)endGame();
}

function showFeedback(txt,color){
  feedbackEl.textContent=txt;feedbackEl.style.color=color;feedbackEl.style.opacity=1;
  clearTimeout(feedbackEl._t);feedbackEl._t=setTimeout(()=>feedbackEl.style.opacity=0,600);
}

function draw(){
  ctx.fillStyle='#0a0512';ctx.fillRect(0,0,W,H);
  // bg rings decoration
  ctx.strokeStyle='#1e1030';ctx.lineWidth=1;
  [60,120,180].forEach(r=>{ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);ctx.stroke();});

  notes.forEach(n=>{
    if(!n.alive)return;
    // target ring
    ctx.strokeStyle=n.color+'88';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(n.x,n.y,TARGET_R,0,Math.PI*2);ctx.stroke();
    // approach circle
    const alpha=Math.min(1,(n.startR-n.r)/(n.startR-TARGET_R)*2);
    ctx.strokeStyle=n.color;ctx.lineWidth=4;ctx.globalAlpha=alpha;
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    // center dot
    ctx.fillStyle=n.color;ctx.beginPath();ctx.arc(n.x,n.y,8,0,Math.PI*2);ctx.fill();
  });
}

async function endGame(){
  running=false;cancelAnimationFrame(rafId);
  if(score>(best??0)){best=score;await saveManager.save();}
  // reuse start screen overlay pattern — show result inline
  ctx.fillStyle='rgba(10,5,18,.85)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#f8fafc';ctx.font='bold 26px system-ui';ctx.textAlign='center';
  ctx.fillText('게임 오버',W/2,H/2-40);
  ctx.font='20px system-ui';ctx.fillStyle='#f472b6';
  ctx.fillText(`점수: ${score}`,W/2,H/2);
  ctx.fillStyle='#94a3b8';ctx.font='15px system-ui';
  ctx.fillText(`최고: ${Math.max(score,best??0)}`,W/2,H/2+32);
  ctx.fillStyle='#f8fafc';ctx.font='14px system-ui';
  ctx.fillText('탭하여 다시하기',W/2,H/2+70);
  canvas.onclick=()=>{canvas.onclick=null;startGame();};
}

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('combo').textContent=combo;
  document.getElementById('lives').textContent='❤️'.repeat(lives);
  document.getElementById('best').textContent=Math.max(score,best??0);
}
