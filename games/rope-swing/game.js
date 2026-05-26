import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=480;
canvas.width=W;canvas.height=H;

let ball,rope,poles,stars,score,best,running,camX,rafId;

const saveManager=createSaveManager({
  gameId:'game-rope-swing',
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
  score=0;camX=0;running=true;
  ball={x:80,y:H/2,vx:3,vy:0,r:12};
  poles=genPoles(0,8);
  stars=genStars(0,10);
  // 첫 번째 기둥에 로프를 미리 연결해서 시작
  const first=poles[0];
  rope={pole:first,len:Math.hypot(first.x-ball.x,first.y-ball.y)};
  cancelAnimationFrame(rafId);lastT=0;
  rafId=requestAnimationFrame(loop);
  updateHUD();
}

function genPoles(startX,count){
  const arr=[];
  for(let i=0;i<count;i++)arr.push({x:startX+200+i*160+Math.random()*80,y:60+Math.random()*100,r:8});
  return arr;
}
function genStars(startX,count){
  const arr=[];
  for(let i=0;i<count;i++)arr.push({x:startX+120+i*130+Math.random()*60,y:100+Math.random()*200,alive:true});
  return arr;
}

function onTap(){
  if(!running)return;
  if(rope){rope=null;return;} // release
  // find nearest pole above
  const bx=ball.x,by=ball.y;
  let near=null,nd=Infinity;
  poles.forEach(p=>{
    const d=Math.hypot(p.x-bx,p.y-by);
    if(d<nd&&d<220){nd=d;near=p;}
  });
  if(near)rope={pole:near,len:Math.hypot(near.x-bx,near.y-by)};
}

let lastT=0;
function loop(ts){
  const dt=Math.min(ts-lastT,40)/16;lastT=ts;
  if(running){update(dt);draw();}
  rafId=requestAnimationFrame(loop);
}

const GRAVITY=0.4;
function update(dt){
  if(rope){
    // pendulum constraint
    const px=rope.pole.x,py=rope.pole.y;
    ball.vy+=GRAVITY*dt;
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    // constrain to rope length
    const dx=ball.x-px,dy=ball.y-py;
    const d=Math.hypot(dx,dy);
    if(d>rope.len){const f=rope.len/d;ball.x=px+dx*f;ball.y=py+dy*f;
      // project velocity onto tangent
      const nx=dx/d,ny=dy/d;
      const dot=ball.vx*nx+ball.vy*ny;
      ball.vx-=dot*nx;ball.vy-=dot*ny;
    }
  }else{
    ball.vy+=GRAVITY*dt;
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
  }
  // walls
  if(ball.x-ball.r<0){ball.x=ball.r;ball.vx*=-0.7;}
  if(ball.x+ball.r>camX+W){ball.x=camX+W-ball.r;ball.vx*=-0.7;}

  // camera follow
  const target=ball.x-W*0.35;
  if(target>camX)camX+=(target-camX)*0.08;

  // score = furthest x
  const dist=Math.floor((ball.x-80)/60);
  if(dist>score){score=dist;updateHUD();if(score>(best??0)){best=score;saveManager.save();}}

  // stars
  stars.forEach(s=>{
    if(!s.alive)return;
    if(Math.hypot(ball.x-s.x,ball.y-s.y)<ball.r+10){s.alive=false;score+=5;updateHUD();}
  });

  // extend world
  const worldEnd=Math.max(...poles.map(p=>p.x));
  if(ball.x>worldEnd-400){poles=[...poles,...genPoles(worldEnd,5)];stars=[...stars,...genStars(worldEnd,8)];}

  // game over
  if(ball.y>H+50){endGame();}
}

function draw(){
  ctx.fillStyle='#060d1a';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(-camX,0);
  // stars bg
  ctx.fillStyle='#ffffff';
  for(let i=0;i<30;i++){ctx.beginPath();ctx.arc((i*197+camX*0.3)%600,i*53%H,0.7,0,Math.PI*2);ctx.fill();}
  // floor
  ctx.fillStyle='#1e293b';ctx.fillRect(camX,H-10,W,10);
  // poles
  poles.forEach(p=>{
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,p.y);ctx.stroke();
    ctx.fillStyle='#cbd5e1';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  });
  // rope
  if(rope){
    ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(rope.pole.x,rope.pole.y);ctx.lineTo(ball.x,ball.y);ctx.stroke();
  }
  // stars
  stars.forEach(s=>{if(s.alive){ctx.font='20px sans-serif';ctx.textAlign='center';ctx.fillText('⭐',s.x,s.y);}});
  // ball
  ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(ball.x-4,ball.y-4,ball.r*0.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // tap hint
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.font='13px system-ui';ctx.textAlign='center';
  if(rope){ctx.fillText('탭 — 로프 놓기',W/2,H-20);}
  else{ctx.fillText('탭 — 로프 걸기',W/2,H-20);}
}

async function endGame(){
  running=false;cancelAnimationFrame(rafId);
  if(score>(best??0)){best=score;await saveManager.save();}
  ctx.fillStyle='rgba(6,13,26,.88)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#f8fafc';ctx.font='bold 24px system-ui';ctx.textAlign='center';
  ctx.fillText('게임 오버',W/2,H/2-30);
  ctx.fillStyle='#22d3ee';ctx.font='22px system-ui';ctx.fillText(`점수: ${score}`,W/2,H/2+4);
  ctx.fillStyle='#94a3b8';ctx.font='14px system-ui';ctx.fillText(`최고: ${Math.max(score,best??0)}`,W/2,H/2+36);
  ctx.fillStyle='#f8fafc';ctx.font='13px system-ui';ctx.fillText('탭하여 다시하기',W/2,H/2+68);
  canvas.onclick=()=>{canvas.onclick=null;canvas.addEventListener('click',onTap);startGame();};
  canvas.removeEventListener('click',onTap);
}

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=Math.max(score,best??0);
}
