import { createSaveManager } from "../../shared/save.js";

const DIFFS={easy:{r:8,c:8,m:10},mid:{r:12,c:12,m:20},hard:{r:16,c:16,m:40}};
let diff='easy',grid,rows,cols,mines,revealed,flagged,gameOver,started,timerSec,timerInt;
let bestEasy=0,bestMid=0,bestHard=0;

const saveManager=createSaveManager({
  gameId:'game-minesweeper',
  loginStatusEl:document.getElementById('login-status'),
  getSaveData(){return{bestEasy,bestMid,bestHard}},
  applySaveData(d){bestEasy=d.bestEasy??0;bestMid=d.bestMid??0;bestHard=d.bestHard??0;renderBest()},
});

function getBest(){return diff==='easy'?bestEasy:diff==='mid'?bestMid:bestHard;}
function renderBest(){const b=getBest();document.getElementById('best').textContent=b?b+'s':'-';}

document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.diff-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');diff=b.dataset.diff;
}));
document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('reset-btn').addEventListener('click',startGame);

function startGame(){
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  const d=DIFFS[diff];rows=d.r;cols=d.c;mines=d.m;
  revealed=0;flagged=0;gameOver=false;started=false;timerSec=0;
  clearInterval(timerInt);
  document.getElementById('timer').textContent='0';
  document.getElementById('mines-left').textContent=mines;
  document.getElementById('result-banner').className='hidden';
  document.getElementById('result-banner').textContent='';
  renderBest();
  grid=Array.from({length:rows},()=>Array.from({length:cols},()=>({mine:false,open:false,flag:false,adj:0})));
  buildBoard();
}

function placeMines(safeR,safeC){
  let count=0;
  while(count<mines){
    const r=Math.floor(Math.random()*rows),c=Math.floor(Math.random()*cols);
    if((Math.abs(r-safeR)<=1&&Math.abs(c-safeC)<=1)||grid[r][c].mine)continue;
    grid[r][c].mine=true;count++;
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    if(grid[r][c].mine)continue;
    let adj=0;
    neighbors(r,c).forEach(([nr,nc])=>{if(grid[nr][nc].mine)adj++;});
    grid[r][c].adj=adj;
  }
}

function neighbors(r,c){
  const out=[];
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;
    const nr=r+dr,nc=c+dc;
    if(nr>=0&&nr<rows&&nc>=0&&nc<cols)out.push([nr,nc]);
  }
  return out;
}

function buildBoard(){
  const board=document.getElementById('board');
  const wrap=document.getElementById('board-wrap');
  // Fill available width: board-wrap padding=8px each side
  const avail=Math.max(wrap.clientWidth,280)-16;
  const cellSize=Math.max(24,Math.min(40,Math.floor(avail/cols)));
  board.style.gridTemplateColumns=`repeat(${cols},${cellSize}px)`;
  board.innerHTML='';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const cell=document.createElement('div');
    cell.className='cell';
    cell.style.width=cellSize+'px';cell.style.height=cellSize+'px';
    cell.style.fontSize=Math.max(10,cellSize-12)+'px';
    cell.dataset.r=r;cell.dataset.c=c;
    cell.addEventListener('click',()=>open(r,c));
    // 길게 누르기 = 깃발
    let longPress;
    cell.addEventListener('touchstart',()=>{longPress=setTimeout(()=>flag(r,c),500);},{passive:true});
    cell.addEventListener('touchend',()=>clearTimeout(longPress),{passive:true});
    cell.addEventListener('contextmenu',e=>{e.preventDefault();flag(r,c);});
    board.appendChild(cell);
  }
}

function cellEl(r,c){return document.querySelector(`[data-r="${r}"][data-c="${c}"]`);}

function open(r,c){
  if(gameOver||grid[r][c].open||grid[r][c].flag)return;
  if(!started){
    started=true;
    placeMines(r,c);
    timerInt=setInterval(()=>{timerSec++;document.getElementById('timer').textContent=timerSec;},1000);
  }
  flood(r,c);
  checkWin();
}

function flood(r,c){
  if(r<0||r>=rows||c<0||c>=cols)return;
  const cell=grid[r][c];
  if(cell.open||cell.flag)return;
  cell.open=true;revealed++;
  const el=cellEl(r,c);
  if(cell.mine){
    el.classList.add('mine');el.textContent='💣';
    endGame(false);return;
  }
  el.classList.add('open');
  if(cell.adj>0){el.textContent=cell.adj;el.classList.add(`n${cell.adj}`);}
  else neighbors(r,c).forEach(([nr,nc])=>flood(nr,nc));
}

function flag(r,c){
  if(gameOver||grid[r][c].open)return;
  grid[r][c].flag=!grid[r][c].flag;
  const el=cellEl(r,c);
  if(grid[r][c].flag){el.classList.add('flag');el.textContent='🚩';flagged++;}
  else{el.classList.remove('flag');el.textContent='';flagged--;}
  document.getElementById('mines-left').textContent=mines-flagged;
}

function checkWin(){
  if(revealed===rows*cols-mines)endGame(true);
}

async function endGame(win){
  gameOver=true;clearInterval(timerInt);
  const banner=document.getElementById('result-banner');
  if(win){
    banner.className='win';banner.textContent=`🎉 클리어! ${timerSec}초`;
    const prev=getBest();
    if(!prev||timerSec<prev){
      if(diff==='easy')bestEasy=timerSec;
      else if(diff==='mid')bestMid=timerSec;
      else bestHard=timerSec;
      await saveManager.save();
      renderBest();
    }
  }else{
    banner.className='lose';banner.textContent='💥 지뢰 폭발!';
    // 모든 지뢰 공개
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
      if(grid[r][c].mine&&!grid[r][c].open){const el=cellEl(r,c);el.classList.add('mine');el.textContent='💣';}
  }
}
