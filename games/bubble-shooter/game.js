import { createSaveManager } from "../../shared/save.js";

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const W=360,H=520;
canvas.width=W;canvas.height=H;

// ── Grid constants ────────────────────────────────────────────────────────
// COLS=9 (even rows) fits cleanly in 360px with R=18 (margin ~10px each side)
const R=18, COLS=9;
const MARGIN=Math.floor((W-(2*R+(COLS-1)*(2*R+2)))/2); // ≈10px

function colX(c,row){ return MARGIN+R+(2*R+2)*c+(row%2?(R+1):0); }
function rowY(r)     { return R+4+r*(R*1.73); }

const COLORS=['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6'];
function randColor(){ return COLORS[Math.floor(Math.random()*COLORS.length)]; }

function rowCols(r){ return r%2===0?COLS:COLS-1; }

// ── State ─────────────────────────────────────────────────────────────────
let grid, projectile, score, best, running, angle, nextColor, rafId, lastT=0;

const saveManager=createSaveManager({
  gameId:'game-bubble-shooter',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

// ── Init ──────────────────────────────────────────────────────────────────
function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  score=0;running=true;angle=-Math.PI/2;
  grid=[];
  for(let r=0;r<5;r++){
    grid[r]=[];
    for(let c=0;c<rowCols(r);c++) grid[r][c]=randColor();
  }
  nextColor=randColor();
  projectile=null;
  updateHUD();
  cancelAnimationFrame(rafId);lastT=0;
  rafId=requestAnimationFrame(loop);

  canvas.removeEventListener('click',onFire);
  canvas.removeEventListener('touchstart',onTouch);
  canvas.addEventListener('click',onFire);
  canvas.addEventListener('touchstart',onTouch,{passive:false});
}

document.getElementById('start-btn').addEventListener('click',startGame);

// ── Input ─────────────────────────────────────────────────────────────────
function calcAngle(cx,cy){
  const rect=canvas.getBoundingClientRect();
  const mx=(cx-rect.left)*(W/rect.width);
  const my=(cy-rect.top)*(H/rect.height);
  let a=Math.atan2(my-(H-40),mx-W/2);
  if(a>-0.1) a=-0.1;
  if(a<-Math.PI+0.1) a=-Math.PI+0.1;
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
  angle=calcAngle(e.touches[0].clientX,e.touches[0].clientY);
  launchProjectile();
}
function launchProjectile(){
  projectile={x:W/2,y:H-40,vx:Math.cos(angle)*9,vy:Math.sin(angle)*9,color:nextColor};
  nextColor=randColor();
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

// ── Loop ──────────────────────────────────────────────────────────────────
function loop(ts){
  lastT=ts;
  if(running){update();draw();}
  rafId=requestAnimationFrame(loop);
}

// ── Physics ───────────────────────────────────────────────────────────────
function update(){
  if(!projectile)return;
  projectile.x+=projectile.vx;
  projectile.y+=projectile.vy;

  // Wall bounce
  if(projectile.x-R<0){projectile.x=R;projectile.vx*=-1;}
  if(projectile.x+R>W){projectile.x=W-R;projectile.vx*=-1;}

  // Ceiling → snap with no hit-bubble reference
  if(projectile.y-R<=0){ snap(-1,-1); return; }

  // Collision with existing grid bubbles
  for(let r=0;r<grid.length;r++){
    const rc=rowCols(r);
    for(let c=0;c<rc;c++){
      if(!grid[r]||!grid[r][c]) continue;
      if(dist(projectile.x,projectile.y,colX(c,r),rowY(r)) < R*2.0){
        snap(r,c); return;
      }
    }
  }
}

// ── Snap ─────────────────────────────────────────────────────────────────
// hitR/hitC: the bubble the projectile collided with (-1,-1 = ceiling)
function snap(hitR,hitC){
  if(!projectile) return;
  const color=projectile.color;
  // 실제 위치를 null 처리 전에 저장 (angle 기반 추정 대신 실제 좌표 사용)
  const projX=projectile.x, projY=projectile.y;
  projectile=null;

  let br=-1,bc=-1,bestDist=Infinity;

  if(hitR===-1){
    // 천장 충돌: row 0에서 실제 X에 가장 가까운 빈 슬롯
    if(!grid[0]) grid[0]=[];
    for(let c=0;c<rowCols(0);c++){
      if(grid[0]&&grid[0][c]) continue;
      const d=Math.abs(projX-colX(c,0));
      if(d<bestDist){bestDist=d;br=0;bc=c;}
    }
    if(br===-1){
      // row 0이 꽉 찬 경우 새 행 추가
      grid.unshift([]);
      bestDist=Infinity;
      for(let c=0;c<rowCols(0);c++){
        const d=Math.abs(projX-colX(c,0));
        if(d<bestDist){bestDist=d;br=0;bc=c;}
      }
    }
  } else {
    // 버블 충돌: 실제 발사체 위치 기준으로 충돌점 계산
    // (angle 대신 projectile 실제 좌표 사용 → 벽 반사 후에도 정확함)
    const dx=projX-colX(hitC,hitR);
    const dy=projY-rowY(hitR);
    const dlen=Math.hypot(dx,dy)||1;
    // 충돌점 = 맞은 버블 표면에서 발사체 방향
    const impactX=colX(hitC,hitR)+(dx/dlen)*R;
    const impactY=rowY(hitR)+(dy/dlen)*R;

    const even=hitR%2===0;
    const cands=[
      [hitR-1, even?hitC-1:hitC],
      [hitR-1, even?hitC:hitC+1],
      [hitR,   hitC-1],
      [hitR,   hitC+1],
      [hitR+1, even?hitC-1:hitC],
      [hitR+1, even?hitC:hitC+1],
    ];

    for(const [nr,nc] of cands){
      if(nr<0||nc<0) continue;
      const rc=rowCols(nr);
      if(nc>=rc) continue;
      const isEmpty=!grid[nr]||!grid[nr][nc];
      if(!isEmpty) continue;
      const d=dist(impactX,impactY,colX(nc,nr),rowY(nr));
      if(d<bestDist){bestDist=d;br=nr;bc=nc;}
    }

    // 빈 이웃 없음 (빽빽한 경우) — fallback
    if(br===-1){br=hitR;bc=hitC;}
  }

  // 행 배열 확보
  while(grid.length<=br) grid.push([]);
  if(!grid[br]) grid[br]=[];
  grid[br][bc]=color;

  popMatches(br,bc);
  dropIsolated();
  checkGameOver();
  updateHUD();
}

// ── BFS match detection (iterative) ──────────────────────────────────────
function popMatches(startR,startC){
  const color=grid[startR]&&grid[startR][startC];
  if(!color) return;

  const group=[];
  const visited=new Set();
  const queue=[[startR,startC]];
  visited.add(`${startR},${startC}`);

  while(queue.length){
    const [r,c]=queue.shift();
    if(!grid[r]||grid[r][c]!==color) continue;
    group.push([r,c]);
    for(const [nr,nc] of hexNeighbors(r,c)){
      const key=`${nr},${nc}`;
      if(!visited.has(key)&&grid[nr]&&grid[nr][nc]===color){
        visited.add(key);queue.push([nr,nc]);
      }
    }
  }

  if(group.length>=3){
    group.forEach(([r,c])=>{grid[r][c]=null;});
    score+=group.length*10;
    if(score>(best??0)){best=score;saveManager.save();}
  }
}

// ── BFS reachability from row 0 (iterative) ───────────────────────────────
function dropIsolated(){
  const reachable=new Set();
  const queue=[];
  if(grid[0]){
    for(let c=0;c<rowCols(0);c++){
      if(grid[0][c]){const k=`0,${c}`;if(!reachable.has(k)){reachable.add(k);queue.push([0,c]);}}
    }
  }
  while(queue.length){
    const [r,c]=queue.shift();
    for(const [nr,nc] of hexNeighbors(r,c)){
      const key=`${nr},${nc}`;
      if(!reachable.has(key)&&grid[nr]&&grid[nr][nc]){
        reachable.add(key);queue.push([nr,nc]);
      }
    }
  }
  for(let r=0;r<grid.length;r++){
    if(!grid[r]) continue;
    const rc=rowCols(r);
    for(let c=0;c<rc;c++){
      if(grid[r][c]&&!reachable.has(`${r},${c}`)){grid[r][c]=null;score+=5;}
    }
  }
}

// ── Hex neighbors (validated against grid bounds) ─────────────────────────
function hexNeighbors(r,c){
  const even=r%2===0;
  const cands=[
    [r-1,even?c-1:c],[r-1,even?c:c+1],
    [r,c-1],[r,c+1],
    [r+1,even?c-1:c],[r+1,even?c:c+1],
  ];
  return cands.filter(([nr,nc])=>{
    if(nr<0||nr>=grid.length||nc<0) return false;
    return nc<rowCols(nr)&&grid[nr]!==undefined;
  });
}

// ── Game over check ───────────────────────────────────────────────────────
function checkGameOver(){
  const dangerY=H-120;
  let hasAny=false,over=false;
  for(let r=0;r<grid.length;r++){
    if(!grid[r]) continue;
    const rc=rowCols(r);
    for(let c=0;c<rc;c++){
      if(grid[r][c]){
        hasAny=true;
        if(rowY(r)+R>dangerY) over=true;
      }
    }
  }
  if(!hasAny) showEnd('🎉 클리어!','모든 버블 제거!');
  else if(over) showEnd('💀 게임 오버',`점수: ${score}`);
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

// ── Draw ──────────────────────────────────────────────────────────────────
function draw(){
  ctx.fillStyle='#0a1628';ctx.fillRect(0,0,W,H);

  // Grid bubbles
  for(let r=0;r<grid.length;r++){
    if(!grid[r]) continue;
    const rc=rowCols(r);
    for(let c=0;c<rc;c++)
      if(grid[r][c]) drawBubble(colX(c,r),rowY(r),grid[r][c]);
  }

  // Danger line
  ctx.strokeStyle='#f87171';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(0,H-120);ctx.lineTo(W,H-120);ctx.stroke();
  ctx.setLineDash([]);

  // Aim line
  ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.moveTo(W/2,H-40);
  ctx.lineTo(W/2+Math.cos(angle)*130,H-40+Math.sin(angle)*130);ctx.stroke();
  ctx.setLineDash([]);

  // Cannon body
  ctx.save();ctx.translate(W/2,H-40);ctx.rotate(angle+Math.PI/2);
  ctx.fillStyle='#334155';ctx.fillRect(-6,-30,12,30);
  ctx.restore();

  // Next bubble (preview at cannon base)
  drawBubble(W/2,H-40,nextColor,true);

  // Flying projectile
  if(projectile) drawBubble(projectile.x,projectile.y,projectile.color);
}

function drawBubble(x,y,color,small=false){
  const r=small?R*0.65:R;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.28)';
  ctx.beginPath();ctx.arc(x-r*0.3,y-r*0.3,r*0.35,0,Math.PI*2);ctx.fill();
}

function dist(ax,ay,bx,by){ return Math.hypot(ax-bx,ay-by); }

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=Math.max(score,best??0);
}
