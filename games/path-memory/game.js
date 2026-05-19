
const COLS = 6, ROWS = 8;
const ROUNDS = [5, 8, 12, 20];
const SHOW_TOTAL_MS = 2000; // fixed 2s total show time
const TIMER_PER_CELL = 4;
const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

let round = 0, path = [], userPath = [], phase = 'idle';
let timerInterval = null, nextCdInterval = null, timeLeft = 0;

/* ── HELPERS ── */
const $ = id => document.getElementById(id);
const cell = (r,c) => $(`c${r}_${c}`);

function show(id) {
  ['screen-intro','screen-clear','screen-fail','game-area'].forEach(s => {
    const el = $(s);
    if (s === 'game-area') { el.style.display=''; el.classList.remove('visible'); }
    else el.classList.remove('visible');
  });
  const el = $(id);
  if (id === 'game-area') { el.style.display='block'; el.classList.add('visible'); }
  else el.classList.add('visible');
}

function setStatus(msg, cls) {
  const el = $('status-msg');
  el.textContent = msg;
  el.className = 'status-msg' + (cls ? ' '+cls : '');
}



/* ── GRID ── */
function buildGrid() {
  const g = $('grid'); g.innerHTML = '';
  for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
    const d = document.createElement('div');
    d.className = 'cell'; d.id = `c${r}_${c}`;
    d.innerHTML = '<div class="dot"></div>';
    g.appendChild(d);
  }
}

function clearAll() {
  for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
    const el = cell(r,c);
    el.className = 'cell'; el.onclick = null;
    el.innerHTML = '<div class="dot"></div>';
  }
}

/* ── PATH ── */
function genPath(len) {
  for (let t=0; t<800; t++) {
    let r=Math.floor(Math.random()*ROWS), c=Math.floor(Math.random()*COLS);
    let p=[[r,c]], vis=new Set([`${r},${c}`]), ok=true;
    for (let i=1; i<len; i++) {
      const sh=dirs.slice().sort(()=>Math.random()-.5);
      let moved=false;
      for (let [dr,dc] of sh) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!vis.has(`${nr},${nc}`)) {
          r=nr; c=nc; p.push([r,c]); vis.add(`${r},${c}`); moved=true; break;
        }
      }
      if (!moved){ok=false; break;}
    }
    if (ok && p.length===len) return p;
  }
  return null;
}

/* ── PIPS ── */
function resetPips(activeIdx) {
  for (let i=0; i<4; i++) {
    const pip=$(`pip-${i}`);
    pip.className='round-pip';
    pip.style.removeProperty('--dur');
    if (i < activeIdx) pip.classList.add('done');
  }
}
function activatePipTimer(idx) {
  const pip=$(`pip-${idx}`);
  const secs=TIMER_PER_CELL*ROUNDS[idx];
  pip.style.setProperty('--dur', secs+'s');
  void pip.offsetWidth;
  pip.classList.add('active');
}

/* ── TIMER ── */
function stopTimer(){clearInterval(timerInterval);timerInterval=null;}
function startTimer(secs, onEnd){
  stopTimer(); timeLeft=secs;
  const el=$('timer-num'); el.textContent=timeLeft; el.className='';
  timerInterval=setInterval(()=>{
    timeLeft--;
    el.textContent=timeLeft;
    if(timeLeft<=5) el.className='urgent';
    if(timeLeft<=0){stopTimer(); onEnd();}
  },1000);
}

/* ── INIT ── */
function initGame(){
  round=0;
  show('game-area');
  hideNextOverlay();
  buildGrid();
  startRound();
}

/* ── ROUND ── */
function startRound(){
  clearAll(); stopTimer(); hideNextOverlay();
  $('timer-num').textContent='—'; $('timer-num').className='';
  const len=ROUNDS[round];
  $('round-disp').textContent=round+1;
  $('len-disp').textContent=len;
  resetPips(round);
  path=genPath(len);
  if(!path){setStatus('경로 생성 오류');return;}

  phase='show';
  setStatus('경로를 기억하세요!','hi');

  // interval per cell so total ≈ 2000ms
  const interval=Math.floor(SHOW_TOTAL_MS/len);
  let i=0;
  function tick(){
    // deactivate previous (make it path-show = dimmer)
    if(i>0){
      const [pr,pc]=path[i-1];
      const prev=cell(pr,pc);
      prev.classList.remove('path-active');
      prev.classList.add('path-show');
    }
    if(i<path.length){
      const [r,c]=path[i];
      const el=cell(r,c);
      el.classList.add('path-active');
      // start/end markers
      if(i===0) el.classList.add('start');
      if(i===path.length-1) el.classList.add('end');
      i++;
      setTimeout(tick, interval);
    } else {
      // finalise last cell
      const [lr,lc]=path[path.length-1];
      cell(lr,lc).classList.remove('path-active');
      cell(lr,lc).classList.add('path-show','end');
      // wait 1s then hide and start input
      setTimeout(hideAndInput, 1000);
    }
  }
  tick();
}

/* ── INPUT ── */
function hideAndInput(){
  clearAll();
  const [sr,sc]=path[0],[er,ec]=path[path.length-1];
  cell(sr,sc).classList.add('start');
  cell(er,ec).classList.add('end');

  phase='input'; userPath=[[sr,sc]];
  cell(sr,sc).classList.add('selected-ok');

  setStatus('경로를 순서대로 클릭하세요!');
  resetPips(round); activatePipTimer(round);

  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    if(r===sr&&c===sc) continue;
    const el=cell(r,c);
    el.classList.add('clickable');
    el.onclick=()=>clickCell(r,c);
  }
  startTimer(TIMER_PER_CELL*ROUNDS[round],()=>{if(phase==='input')submitAnswer(true);});
}

function clickCell(r,c){
  if(phase!=='input') return;
  const [lr,lc]=userPath[userPath.length-1];
  if(Math.abs(r-lr)+Math.abs(c-lc)!==1) return;
  if(userPath.some(([pr,pc])=>pr===r&&pc===c)) return;
  userPath.push([r,c]);
  const el=cell(r,c);
  el.classList.add('selected-ok','flash-ok');
  setTimeout(()=>el.classList.remove('flash-ok'),220);
  if(userPath.length>=path.length) setTimeout(()=>submitAnswer(false),150);
}

/* ── SUBMIT ── */

function submitAnswer(timedOut){
  if(phase!=='input') return;
  phase='result'; stopTimer();
  $('timer-num').textContent='—'; $('timer-num').className='';
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){cell(r,c).classList.remove('clickable');cell(r,c).onclick=null;}

  let correct=0;
  path.forEach(([r,c],i)=>{
    const el=cell(r,c);
    const matched=userPath[i]&&userPath[i][0]===r&&userPath[i][1]===c;
    el.className='cell'; el.innerHTML='<div class="dot"></div>';
    el.classList.add(matched?'correct-reveal':'wrong-reveal');
    if(matched) correct++;
  });
  userPath.forEach(([r,c])=>{
    if(!path.some(([pr,pc])=>pr===r&&pc===c)){
      const el=cell(r,c);
      el.className='cell wrong-reveal';
      el.innerHTML='<div class="dot"></div>';
    }
  });

  const passed=correct===path.length;
  const pct=Math.round(correct/path.length*100);
  if(timedOut)    setStatus('⏱ 시간 초과!','bad');
  else if(passed) setStatus(`✓ 완벽! ${correct}/${path.length}`,'hi');
  else            setStatus(`✗ ${correct}/${path.length} 정답 (${pct}%)`,'bad');

  // 1초 후 결과 처리
  setTimeout(()=>{
    if(passed){
      $(`pip-${round}`).className='round-pip done';
      round++;
      phase='next';
      if(round>=4){ showClear(); }
      else { showNextOverlay(); }
    } else {
      $(`pip-${round}`).className='round-pip fail';
      phase='fail';
      showFail();
    }
  },1000);
}

/* ── NEXT OVERLAY ── */
function showNextOverlay(){
  $('next-label-txt').textContent=`라운드 ${round} 클리어!`;
  const cd=$('next-cd');
  let t=5; cd.textContent=t; cd.className='next-countdown';
  $('next-overlay').classList.add('visible');
  clearInterval(nextCdInterval);
  nextCdInterval=setInterval(()=>{
    t--;
    cd.textContent=t;
    if(t<=2) cd.className='next-countdown urgent';
    if(t<=0){clearInterval(nextCdInterval); proceedNext();}
  },1000);
}

function hideNextOverlay(){
  clearInterval(nextCdInterval);
  $('next-overlay').classList.remove('visible');
}

function proceedNext(){hideNextOverlay(); startRound();}

/* ── END ── */
function showClear(){
  show('screen-clear');
  $('clear-sub').textContent='4라운드 모두 클리어!\n경로 5 → 8 → 12 → 20칸\n전부 성공했습니다.';
}
function showFail(){
  show('screen-fail');
  $('fail-sub').textContent=`라운드 ${round+1} (${ROUNDS[round]}칸) 에서 탈락했습니다.\n다시 도전해보세요!`;
}
