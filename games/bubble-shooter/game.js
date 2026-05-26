import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=520,R=18,COLS=10;
canvas.width=W;canvas.height=H;

const COLORS=['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6'];
let grid,projectile,score,best,running,angle,nextColor,rafId,lastT=0;

const saveManager=createSaveManager({
  gameId:'game-bubble-shooter',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

// ── Hex grid helpers ───────────────────────────────────────────────────────
function colX(c,row){return R+1+(R*2+2)*c+(row%2?(R+1):0);}
function rowY(r){return R+1+r*(R*1.73);}

function hexNeighbors(r,c){
  const even=r%2===0;
  const cands=[
    [r-1,even?c-1:c],[r-1,even?c:c+1],
    [r,c-1],[r,c+1],
    [r+1,even?c-1:c],[r+1,even?c:c+1]
  ];
  return cands.filter(([nr,nc])=>{
    if(nr<0||nr>=grid.length)return false;
    if(nc<0)return false;
    const rowCols=nr%2===0?COLS:COLS-1;
    return nc<rowCols&&grid[nr]!==undefined;
  });
}

// ── Init ───────────────────────────────────────────────────────────────────
function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  score=0;running=true;angle=-Math.PI/2;
  // Build initial grid (6 rows)
  grid=[];
  for(let r=0;r<6;r++){
    const cols=r%2===0?COLS:COLS-1;
    grid[r]=Array.from({length:cols},()=>randColor());
  }
  nextColor=randColor();
  projectile=null;
  updateHUD();
  cancelAnimationFrame(rafId);
  lastT=0;
  rafId=requestAnimationFrame(loop);

  // Re-attach fire listener (in case it was removed by game-over flow)
  canvas.removeEventListener('click',onFire);
  canvas.removeEventListener('touchstart',onTouch);
  canvas.addEventListener('click',onFire);
  canvas.addEventListener('touchstart',onTouch,{passive:false});
}

function randColor(){return COLORS[Math.floor(Math.random()*COLORS.length)];}

// ── Input ──────────────────────────────────────────────────────────────────
function calcAngle(clientX,clientY){
  const rect=canvas.getBoundingClientRect();
  const mx=(clientX-rect.left)*(W/rect.width);
  const my=(clientY-rect.top)*(H/rect.height);
  let a=Math.atan2(my-(H-40),mx-W/2);
  if(a>-0.15)a=-0.15;
  if(a<-Math.PI+0.15)a=-Math.PI+0.15;
  return a;
}

function onFire(e){
  if(!running||projectile)return;
  angle=calcAngle(e.clientX,e.clientY);
  launchProjectile();
}

function onTouch(e){
  e.preventDefault();
  if(!running||projectile)return;
  const t=e.touches[0];
  angle=calcAngle(t.clientX,t.clientY);
  launchProjectile();
}

canvas.addEventListener('mousemove',e=>{
  if(!running||projectile)return;
  angle=calcAngle(e.clientX,e.clientY);
});
canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(!running||projectile)return;
  angle=calcAngle(e.touches[0].clientX,e.touches[0].clientY);
},{passive:false});

function launchProjectile(){
  const spd=9;
  projectile={x:W/2,y:H-40,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,color:nextColor};
  nextColor=randColor();
}

document.getElementById('start-btn').addEventListener('click',startGame);

// ── Game loop ──────────────────────────────────────────────────────────────
function loop(ts){
  const dt=Math.min(ts-lastT,50);lastT=ts;
  if(running){update();draw();}
  rafId=requestAnimationFrame(loop);
}

function update(){
  if(!projectile)return;
  projectile.x+=projectile.vx;
  projectile.y+=projectile.vy;
  // wall bounce
  if(projectile.x-R<0){projectile.x=R;projectile.vx*=-1;}
  if(projectile.x+R>W){projectile.x=W-R;projectile.vx*=-1;}
  // ceiling
  if(projectile.y-R<=0){snap();return;}
  // collision with grid bubbles
  for(let r=0;r<grid.length;r++){
    if(!grid[r])continue;
    const rowCols=r%2===0?COLS:COLS-1;
    for(let c=0;c<rowCols;c++){
      if(!grid[r][c])continue;
      if(dist(projectile.x,projectile.y,colX(c,r),rowY(r))<R*1.85){
        snap();return;
      }
    }
  }
}

// ── Snap projectile to nearest empty grid slot ─────────────────────────────
function snap(){
  if(!projectile)return;

  let bestDist=Infinity,br=0,bc=0;

  // Search only within existing grid rows (do NOT extend grid here)
  for(let r=0;r<grid.length;r++){
    const rowCols=r%2===0?COLS:COLS-1;
    for(let c=0;c<rowCols;c++){
      if(grid[r][c])continue; // already occupied
      const d=dist(projectile.x,projectile.y,colX(c,r),rowY(r));
      if(d<bestDist){bestDist=d;br=r;bc=c;}
    }
  }

  // If no empty slot found in existing rows (unlikely but safe)
  // prepend a new empty row at top and place there
  if(bestDist>R*3){
    const newRow=Array(COLS).fill(null);
    grid.unshift(newRow);
    br=0;bc=0;
    // find nearest in new row
    for(let c=0;c<COLS;c++){
      const d=dist(projectile.x,projectile.y,colX(c,0),rowY(0));
      if(d<bestDist){bestDist=d;bc=c;}
    }
  }

  const color=projectile.color;
  projectile=null;
  grid[br][bc]=color;

  popMatches(br,bc);
  dropIsolated();
  checkGameOver();
  updateHUD();
}

// ── BFS match detection (iterative) ───────────────────────────────────────
function popMatches(startR,startC){
  const color=grid[startR]&&grid[startR][startC];
  if(!color)return;

  const group=[];
  const visited=new Set();
  const queue=[[startR,startC]];
  visited.add(`${startR},${startC}`);

  while(queue.length){
    const [r,c]=queue.shift();
    if(!grid[r]||grid[r][c]!==color)continue;
    group.push([r,c]);
    for(const [nr,nc] of hexNeighbors(r,c)){
      const key=`${nr},${nc}`;
      if(!visited.has(key)&&grid[nr]&&grid[nr][nc]===color){
        visited.add(key);
        queue.push([nr,nc]);
      }
    }
  }

  if(group.length>=3){
    group.forEach(([r,c])=>{grid[r][c]=null;});
    score+=group.length*10;
    if(score>(best??0)){best=score;saveManager.save();}
  }
}

// ── BFS reachability from top row (iterative) ─────────────────────────────
function dropIsolated(){
  const reachable=new Set();
  const queue=[];

  // Seed from top row
  if(grid[0]){
    const rowCols=COLS;
    for(let c=0;c<rowCols;c++){
      if(grid[0][c]){
        const key=`0,${c}`;
        if(!reachable.has(key)){reachable.add(key);queue.push([0,c]);}
      }
    }
  }

  while(queue.length){
    const [r,c]=queue.shift();
    for(const [nr,nc] of hexNeighbors(r,c)){
      const key=`${nr},${nc}`;
      if(!reachable.has(key)&&grid[nr]&&grid[nr][nc]){
        reachable.add(key);
        queue.push([nr,nc]);
      }
    }
  }

  // Null out unreachable bubbles
  for(let r=0;r<grid.length;r++){
    if(!grid[r])continue;
    const rowCols=r%2===0?COLS:COLS-1;
    for(let c=0;c<rowCols;c++){
      if(grid[r][c]&&!reachable.has(`${r},${c}`)){
        grid[r][c]=null;
        score+=5;
      }
    }
  }
}

// ── Game over check ────────────────────────────────────────────────────────
function checkGameOver(){
  const dangerY=H-120;
  let hasAny=false,over=false;
  for(let r=0;r<grid.length;r++){
    if(!grid[r])continue;
    const rowCols=r%2===0?COLS:COLS-1;
    for(let c=0;c<rowCols;c++){
      if(grid[r][c]){
        hasAny=true;
        if(rowY(r)+R>dangerY)over=true;
      }
    }
  }
  if(!hasAny){showEnd('🎉 클리어!','모든 버블 제거!');}
  else if(over){showEnd('💀 게임 오버',`점수: ${score}`);}
}

async function showEnd(title,sub){
  running=false;
  if(score>(best??0)){best=score;await saveManager.save();}
  canvas.removeEventListener('click',onFire);
  canvas.removeEventListener('touchstart',onTouch);
  ctx.fillStyle='rgba(10,22,40,.88)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#f8fafc';ctx.font='bold 26px system-ui';ctx.textAlign='center';
  ctx.fillText(title,W/2,H/2-30);
  ctx.font='18px system-ui';ctx.fillStyle='#94a3b8';ctx.fillText(sub,W/2,H/2+4);
  ctx.fillStyle='#38bdf8';ctx.font='15px system-ui';ctx.fillText('탭하여 다시하기',W/2,H/2+40);
  canvas.addEventListener('click',()=>startGame(),{once:true});
}

// ── Draw ───────────────────────────────────────────────────────────────────
function draw(){
  ctx.fillStyle='#0a1628';ctx.fillRect(0,0,W,H);
  // grid bubbles
  for(let r=0;r<grid.length;r++){
    if(!grid[r])continue;
    const rowCols=r%2===0?COLS:COLS-1;
    for(let c=0;c<rowCols;c++)
      if(grid[r][c])drawBubble(colX(c,r),rowY(r),grid[r][c]);
  }
  // danger line
  ctx.strokeStyle='#f87171';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(0,H-120);ctx.lineTo(W,H-120);ctx.stroke();
  ctx.setLineDash([]);
  // projectile
  if(projectile)drawBubble(projectile.x,projectile.y,projectile.color);
  // cannon
  ctx.save();ctx.translate(W/2,H-40);ctx.rotate(angle+Math.PI/2);
  ctx.fillStyle='#334155';ctx.fillRect(-6,-30,12,30);
  ctx.restore();
  // next bubble preview
  drawBubble(W/2,H-40,nextColor,true);
  // aim line
  ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.moveTo(W/2,H-40);
  ctx.lineTo(W/2+Math.cos(angle)*120,H-40+Math.sin(angle)*120);ctx.stroke();
  ctx.setLineDash([]);
}

function drawBubble(x,y,color,small=false){
  const r=small?R*0.7:R;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)';
  ctx.beginPath();ctx.arc(x-r*0.3,y-r*0.3,r*0.35,0,Math.PI*2);ctx.fill();
}

function dist(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=Math.max(score,best??0);
}
