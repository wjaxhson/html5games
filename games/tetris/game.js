import { createSaveManager } from "../../shared/save.js";

const COLS=10,ROWS=20,CELL=28;
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const nextCanvas=document.getElementById('next-canvas');
const nctx=nextCanvas.getContext('2d');
canvas.width=COLS*CELL; canvas.height=ROWS*CELL;
nextCanvas.width=4*CELL; nextCanvas.height=4*CELL;

const PIECES=[
  {shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],color:'#22d3ee'}, // I
  {shape:[[1,1],[1,1]],color:'#fbbf24'},                               // O
  {shape:[[0,1,0],[1,1,1],[0,0,0]],color:'#a78bfa'},                  // T
  {shape:[[0,1,1],[1,1,0],[0,0,0]],color:'#34d399'},                  // S
  {shape:[[1,1,0],[0,1,1],[0,0,0]],color:'#f87171'},                  // Z
  {shape:[[1,0,0],[1,1,1],[0,0,0]],color:'#60a5fa'},                  // J
  {shape:[[0,0,1],[1,1,1],[0,0,0]],color:'#fb923c'},                  // L
];

let board,score,best,level,lines,cur,next,dropTimer,rafId,running;

const saveManager=createSaveManager({
  gameId:'game-tetris',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{best}},
  applySaveData(d){best=d.best??0;document.getElementById('best').textContent=best},
});

document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('ov-btn').addEventListener('click',startGame);
['left','rotate','right','down','drop'].forEach(a=>{
  document.getElementById('mb-'+a).addEventListener('click',()=>handleAction(a));
});

function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  document.getElementById('overlay').classList.add('hidden');
  board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  score=0;level=1;lines=0;running=true;
  next=randomPiece();
  spawn();
  cancelAnimationFrame(rafId);
  dropTimer=0;
  lastTime=0;
  rafId=requestAnimationFrame(loop);
  updateHUD();
}

function randomPiece(){
  const p=PIECES[Math.floor(Math.random()*PIECES.length)];
  return{shape:p.shape.map(r=>[...r]),color:p.color};
}

function spawn(){
  cur={...next,x:Math.floor(COLS/2)-Math.ceil(next.shape[0].length/2),y:0};
  next=randomPiece();
  if(collides(cur)){gameOver();}
}

function rotate(piece){
  const s=piece.shape;
  const r=s[0].map((_,i)=>s.map(row=>row[i]).reverse());
  return{...piece,shape:r};
}

function collides(p){
  for(let r=0;r<p.shape.length;r++)
    for(let c=0;c<p.shape[r].length;c++)
      if(p.shape[r][c]){
        const nx=p.x+c,ny=p.y+r;
        if(nx<0||nx>=COLS||ny>=ROWS)return true;
        if(ny>=0&&board[ny][nx])return true;
      }
  return false;
}

function lock(){
  for(let r=0;r<cur.shape.length;r++)
    for(let c=0;c<cur.shape[r].length;c++)
      if(cur.shape[r][c]&&cur.y+r>=0)
        board[cur.y+r][cur.x+c]=cur.color;
  clearLines();
  spawn();
}

function clearLines(){
  let cleared=0;
  for(let r=ROWS-1;r>=0;r--){
    if(board[r].every(c=>c)){
      board.splice(r,1);
      board.unshift(Array(COLS).fill(0));
      cleared++;r++;
    }
  }
  if(cleared){
    const pts=[0,100,300,500,800][cleared]*level;
    score+=pts;
    lines+=cleared;
    level=Math.floor(lines/10)+1;
    updateHUD();
    if(score>(best??0)){best=score;saveManager.save();}
  }
}

function dropSpeed(){return Math.max(50,800-level*70);}

let lastTime=0;
function loop(ts){
  if(!running)return;
  const dt=ts-lastTime;lastTime=ts;
  dropTimer+=dt;
  if(dropTimer>=dropSpeed()){dropTimer=0;drop();}
  draw();
  rafId=requestAnimationFrame(loop);
}

function drop(){
  cur.y++;
  if(collides(cur)){cur.y--;lock();}
}

function handleAction(a){
  if(!running)return;
  if(a==='left'){cur.x--;if(collides(cur))cur.x++;}
  else if(a==='right'){cur.x++;if(collides(cur))cur.x--;}
  else if(a==='rotate'){const r=rotate(cur);if(!collides(r))cur=r;}
  else if(a==='down'){drop();score+=1;updateHUD();}
  else if(a==='drop'){while(!collides({...cur,y:cur.y+1}))cur.y++;drop();score+=2;updateHUD();}
}

async function gameOver(){
  running=false;
  cancelAnimationFrame(rafId);
  if(score>(best??0)){best=score;await saveManager.save();}
  document.getElementById('ov-title').textContent='💀 게임 오버';
  document.getElementById('ov-sub').textContent=`점수: ${score} | 레벨: ${level} | 줄: ${lines}`;
  document.getElementById('overlay').classList.remove('hidden');
}

function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=Math.max(score,best??0);
  document.getElementById('level').textContent=level;
  document.getElementById('lines').textContent=lines;
}

// Ghost piece
function ghostY(){
  let gy=cur.y;
  while(!collides({...cur,y:gy+1}))gy++;
  return gy;
}

function draw(){
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,canvas.width,canvas.height);
  // grid dots
  ctx.fillStyle='#1e293b';
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){ctx.beginPath();ctx.arc(c*CELL+CELL/2,r*CELL+CELL/2,1,0,Math.PI*2);ctx.fill();}
  // board
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(board[r][c])drawCell(ctx,c,r,board[r][c]);
  // ghost
  const gy=ghostY();
  for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++)
    if(cur.shape[r][c]){ctx.globalAlpha=.25;drawCell(ctx,cur.x+c,cur.y+gy-cur.y+r,cur.color);ctx.globalAlpha=1;}
  // current
  for(let r=0;r<cur.shape.length;r++)for(let c=0;c<cur.shape[r].length;c++)
    if(cur.shape[r][c])drawCell(ctx,cur.x+c,cur.y+r,cur.color);
  // next preview
  nctx.fillStyle='#1e293b';nctx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
  const ox=Math.floor((4-next.shape[0].length)/2);
  const oy=Math.floor((4-next.shape.length)/2);
  for(let r=0;r<next.shape.length;r++)for(let c=0;c<next.shape[r].length;c++)
    if(next.shape[r][c])drawCell(nctx,ox+c,oy+r,next.color);
}

function drawCell(c,x,y,color){
  const pad=1;
  c.fillStyle=color;
  c.fillRect(x*CELL+pad,y*CELL+pad,CELL-pad*2,CELL-pad*2);
  c.fillStyle='rgba(255,255,255,.18)';
  c.fillRect(x*CELL+pad,y*CELL+pad,CELL-pad*2,4);
}

document.addEventListener('keydown',e=>{
  const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'};
  if(map[e.key]){e.preventDefault();handleAction(map[e.key]);}
});
// touch swipe
let tx=0,ty=0;
canvas.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
canvas.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)<15&&Math.abs(dy)<15){handleAction('rotate');return;}
  if(Math.abs(dx)>Math.abs(dy))handleAction(dx>0?'right':'left');
  else handleAction(dy>0?'down':'drop');
},{passive:true});
