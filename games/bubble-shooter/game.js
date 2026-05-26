import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=520,R=18,COLS=10;
canvas.width=W;canvas.height=H;

const COLORS=['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6'];
let grid,projectile,score,best,running,angle,nextColor;

const saveManager=createSaveManager({
  gameId:'game-bubble-shooter',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

document.getElementById('start-btn').addEventListener('click',startGame);
canvas.addEventListener('click',fire);
canvas.addEventListener('touchstart',e=>{e.preventDefault();fire(e.touches[0]);},{passive:false});
canvas.addEventListener('mousemove',aim);
canvas.addEventListener('touchmove',e=>{e.preventDefault();aim(e.touches[0]);},{passive:false});

function colX(c,row){return R+(R*2+2)*c+(row%2?R+1:0);}
function rowY(r){return R+r*(R*1.73);}

function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  grid=[];score=0;running=true;angle=-Math.PI/2;
  for(let r=0;r<6;r++){
    grid[r]=[];
    const cols=r%2===0?COLS:COLS-1;
    for(let c=0;c<cols;c++)grid[r][c]=randColor();
  }
  nextColor=randColor();
  projectile=null;
  updateHUD();
  cancelAnimationFrame(rafId);
  rafId=requestAnimationFrame(loop);
}

function randColor(){return COLORS[Math.floor(Math.random()*COLORS.length)];}

function aim(e){
  const rect=canvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(W/rect.width);
  const my=(e.clientY-rect.top)*(H/rect.height);
  angle=Math.atan2(my-(H-40),mx-W/2);
  if(angle>-0.1)angle=-0.1;if(angle<-Math.PI+0.1)angle=-Math.PI+0.1;
}

function fire(e){
  if(!running||projectile)return;
  if(e){aim(e);}
  const spd=8;
  projectile={x:W/2,y:H-40,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,color:nextColor};
  nextColor=randColor();
}

let rafId,lastT=0;
function loop(ts){
  const dt=Math.min(ts-lastT,50);lastT=ts;
  if(running){update();draw();}
  rafId=requestAnimationFrame(loop);
}

function update(){
  if(!projectile)return;
  projectile.x+=projectile.vx;
  projectile.y+=projectile.vy;
  if(projectile.x-R<0){projectile.x=R;projectile.vx*=-1;}
  if(projectile.x+R>W){projectile.x=W-R;projectile.vx*=-1;}
  if(projectile.y-R<0){snap();return;}
  // collision with grid
  for(let r=0;r<grid.length;r++){
    if(!grid[r])continue;
    for(let c=0;c<grid[r].length;c++){
      if(!grid[r][c])continue;
      const bx=colX(c,r),by=rowY(r);
      if(dist(projectile.x,projectile.y,bx,by)<R*1.9){snap();return;}
    }
  }
}

function snap(){
  // find nearest empty slot
  let best2=Infinity,br=0,bc=0;
  for(let r=0;r<=grid.length;r++){
    if(!grid[r])grid[r]=[];
    const cols=r%2===0?COLS:COLS-1;
    for(let c=0;c<cols;c++){
      if(grid[r][c])continue;
      const d=dist(projectile.x,projectile.y,colX(c,r),rowY(r));
      if(d<best2){best2=d;br=r;bc=c;}
    }
  }
  if(!grid[br])grid[br]=[];
  grid[br][bc]=projectile.color;
  projectile=null;
  popMatches(br,bc);
  checkGameOver();
  updateHUD();
}

function popMatches(r,c){
  const color=grid[r]&&grid[r][c];
  if(!color)return;
  const group=[];
  const visited=new Set();
  function bfs(r,c){
    const key=`${r},${c}`;
    if(visited.has(key))return;
    if(!grid[r]||grid[r][c]!==color)return;
    visited.add(key);group.push([r,c]);
    neighbors(r,c).forEach(([nr,nc])=>bfs(nr,nc));
  }
  bfs(r,c);
  if(group.length>=3){
    group.forEach(([r,c])=>{grid[r][c]=null;});
    score+=group.length*10;
    if(score>(best??0)){best=score;saveManager.save();}
    dropIsolated();
  }
}

function dropIsolated(){
  const reachable=new Set();
  for(let c=0;c<(grid[0]?grid[0].length:0);c++)if(grid[0]&&grid[0][c])dfs(0,c,reachable);
  for(let r=0;r<grid.length;r++)for(let c=0;c<(grid[r]?grid[r].length:0);c++)
    if(grid[r][c]&&!reachable.has(`${r},${c}`)){grid[r][c]=null;score+=5;}
}

function dfs(r,c,set){
  const key=`${r},${c}`;
  if(set.has(key))return;
  if(!grid[r]||!grid[r][c])return;
  set.add(key);
  neighbors(r,c).forEach(([nr,nc])=>dfs(nr,nc,set));
}

function neighbors(r,c){
  const even=r%2===0;
  return[[r-1,even?c-1:c],[r-1,even?c:c+1],[r,c-1],[r,c+1],[r+1,even?c-1:c],[r+1,even?c:c+1]]
    .filter(([nr,nc])=>nr>=0&&nc>=0&&grid[nr]&&nc<grid[nr].length);
}

function checkGameOver(){
  const limit=H-120;
  let over=false,win=true;
  for(let r=0;r<grid.length;r++)for(let c=0;c<(grid[r]?grid[r].length:0);c++){
    if(grid[r][c]){win=false;if(rowY(r)+R>limit)over=true;}
  }
  if(win){showEnd('🎉 클리어!','모든 버블 제거!');}
  else if(over){showEnd('💀 게임 오버',`점수: ${score}`);}
}

async function showEnd(title,sub){
  running=false;
  if(score>(best??0)){best=score;await saveManager.save();}
  ctx.fillStyle='rgba(10,22,40,.88)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#f8fafc';ctx.font='bold 26px system-ui';ctx.textAlign='center';
  ctx.fillText(title,W/2,H/2-30);
  ctx.font='18px system-ui';ctx.fillStyle='#94a3b8';ctx.fillText(sub,W/2,H/2+4);
  ctx.fillStyle='#38bdf8';ctx.font='15px system-ui';ctx.fillText('탭하여 다시하기',W/2,H/2+40);
  canvas.onclick=()=>{canvas.onclick=null;canvas.addEventListener('click',fire);startGame();};
  canvas.removeEventListener('click',fire);
}

function draw(){
  ctx.fillStyle='#0a1628';ctx.fillRect(0,0,W,H);
  // grid bubbles
  for(let r=0;r<grid.length;r++)
    for(let c=0;c<(grid[r]?grid[r].length:0);c++)
      if(grid[r][c])drawBubble(colX(c,r),rowY(r),grid[r][c]);
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
  updateHUD();
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
