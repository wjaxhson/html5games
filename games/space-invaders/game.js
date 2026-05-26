import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=480;
canvas.width=W;canvas.height=H;

let score,best,lives,wave,player,bullets,aliens,abombs,particles,running,rafId;
let alienDir,alienSpeed,alienDropY,alienShootTimer;
const keys={};

const saveManager=createSaveManager({
  gameId:'game-space-invaders',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

document.getElementById('start-btn').addEventListener('click',initGame);
document.getElementById('ov-btn').addEventListener('click',initGame);
document.getElementById('cb-left').addEventListener('pointerdown',()=>keys['ArrowLeft']=true);
document.getElementById('cb-left').addEventListener('pointerup',()=>keys['ArrowLeft']=false);
document.getElementById('cb-right').addEventListener('pointerdown',()=>keys['ArrowRight']=true);
document.getElementById('cb-right').addEventListener('pointerup',()=>keys['ArrowRight']=false);
document.getElementById('cb-fire').addEventListener('click',shoot);
document.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' '){e.preventDefault();shoot();}});
document.addEventListener('keyup',e=>{keys[e.key]=false;});
document.getElementById('canvas-wrap').addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect();
  const px=(e.clientX-rect.left)/(rect.width/W);
  if(px<W/3)keys['ArrowLeft']=true; else if(px>W*2/3)keys['ArrowRight']=true; else shoot();
  setTimeout(()=>{keys['ArrowLeft']=false;keys['ArrowRight']=false;},120);
});

function initGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  document.getElementById('overlay').classList.add('hidden');
  score=0;lives=3;wave=1;running=true;
  player={x:W/2,y:H-36,w:36,h:16,speed:4};
  bullets=[];abombs=[];particles=[];
  spawnAliens();
  cancelAnimationFrame(rafId);
  rafId=requestAnimationFrame(loop);
  updateHUD();
}

function spawnAliens(){
  aliens=[];
  alienDir=1;alienSpeed=0.5+wave*0.2;alienDropY=0;alienShootTimer=0;
  const rows=4,cols=9;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
    aliens.push({x:30+c*32,y:40+r*28,w:22,h:16,row:r,alive:true});
}

function shoot(){
  if(!running)return;
  if(bullets.filter(b=>b.player).length>=3)return;
  bullets.push({x:player.x,y:player.y-8,vy:-9,player:true,w:3,h:10});
}

let lastT=0;
function loop(ts){
  const dt=Math.min(ts-lastT,50);lastT=ts;
  update(dt);draw();
  if(running)rafId=requestAnimationFrame(loop);
}

function update(dt){
  // Player move
  if(keys['ArrowLeft'])player.x=Math.max(player.w/2,player.x-player.speed);
  if(keys['ArrowRight'])player.x=Math.min(W-player.w/2,player.x+player.speed);

  // Bullets
  bullets=bullets.filter(b=>{
    b.y+=b.vy;
    if(b.y<-10||b.y>H+10)return false;
    if(b.player){
      for(const a of aliens){
        if(!a.alive)continue;
        if(Math.abs(b.x-a.x)<a.w/2&&Math.abs(b.y-a.y)<a.h/2){
          a.alive=false;
          score+=(4-a.row)*10+wave*5;
          updateHUD();
          boom(a.x,a.y,'#4ade80');
          if(score>(best??0)){best=score;saveManager.save();}
          return false;
        }
      }
    }else{
      if(Math.abs(b.x-player.x)<player.w/2&&Math.abs(b.y-player.y)<player.h/2){
        lives--;updateHUD();boom(player.x,player.y,'#f87171');
        if(lives<=0){endGame();return false;}
        return false;
      }
    }
    return true;
  });

  // Alien movement
  const alive=aliens.filter(a=>a.alive);
  if(!alive.length){wave++;spawnAliens();return;}

  const minX=Math.min(...alive.map(a=>a.x-a.w/2));
  const maxX=Math.max(...alive.map(a=>a.x+a.w/2));
  alive.forEach(a=>a.x+=alienDir*alienSpeed);
  if(maxX>=W-4||minX<=4){alienDir*=-1;alive.forEach(a=>a.y+=16);}

  if(alive.some(a=>a.y+a.h/2>=H-50)){endGame();return;}

  // Alien bombs
  alienShootTimer+=1;
  if(alienShootTimer>Math.max(40,90-wave*8)){
    alienShootTimer=0;
    const shooter=alive[Math.floor(Math.random()*alive.length)];
    abombs.push({x:shooter.x,y:shooter.y,vy:3+wave*0.3,player:false,w:4,h:10});
    bullets.push(abombs[abombs.length-1]);
  }

  // Particles
  particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;return p.life>0;});
}

function boom(x,y,color){
  for(let i=0;i<8;i++)
    particles.push({x,y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,color,life:20,r:2+Math.random()*3});
}

function draw(){
  ctx.fillStyle='#02060e';ctx.fillRect(0,0,W,H);
  // stars
  ctx.fillStyle='#ffffff';
  for(let i=0;i<40;i++){ctx.beginPath();ctx.arc((i*137)%W,(i*97+Date.now()/200*0.5)%H,0.7,0,Math.PI*2);ctx.fill();}
  // player
  ctx.fillStyle='#4ade80';
  roundRect(ctx,player.x-player.w/2,player.y-player.h/2,player.w,player.h,4);ctx.fill();
  ctx.fillStyle='#86efac';ctx.fillRect(player.x-3,player.y-player.h/2-6,6,8);
  // aliens
  aliens.forEach(a=>{
    if(!a.alive)return;
    ctx.font=`${a.w}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(a.row===0?'👾':a.row===1?'🛸':a.row===2?'🤖':'👽',a.x,a.y);
  });
  // bullets
  bullets.forEach(b=>{
    ctx.fillStyle=b.player?'#fbbf24':'#f87171';
    ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
  });
  // particles
  particles.forEach(p=>{ctx.fillStyle=p.color;ctx.globalAlpha=p.life/20;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
}

function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}

async function endGame(){
  running=false;cancelAnimationFrame(rafId);
  if(score>(best??0)){best=score;await saveManager.save();}
  document.getElementById('ov-title').textContent='💀 게임 오버';
  document.getElementById('ov-sub').textContent=`점수: ${score} | 웨이브: ${wave} | 최고: ${best}`;
  document.getElementById('overlay').classList.remove('hidden');
}
function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=Math.max(score,best??0);
  document.getElementById('wave').textContent=wave;
  document.getElementById('lives').textContent='❤️'.repeat(lives);
}
