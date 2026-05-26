import { createSaveManager } from "../../shared/save.js";

// ── Word list ──────────────────────────────────────────────────────────────
const ANSWERS = [
  "about","above","abuse","actor","acute","admit","adopt","adult","after","again",
  "agent","agree","ahead","alarm","album","alert","alien","align","alike","alive",
  "alley","allow","alone","along","alter","angel","anger","angle","angry","anime",
  "ankle","annex","antic","anvil","apart","apple","apply","april","arena","argue",
  "arise","armor","army","aroma","arose","arrow","arson","asset","atlas","attic",
  "audio","audit","augur","avail","avoid","awake","award","aware","awful","beach",
  "beard","beast","began","begin","being","below","bench","bible","birth","black",
  "blade","blame","bland","blank","blast","blaze","bleed","blend","bless","blind",
  "block","blood","blown","blues","blunt","board","boost","booth","bound","boxer",
  "brace","brain","brand","brave","bread","break","breed","brick","bride","brief",
  "bring","broad","broke","brook","brown","brush","build","built","bulge","bumpy",
  "bunch","burst","buyer","bylaw","cabin","camel","candy","cargo","carry","catch",
  "cause","cease","chain","chair","chaos","charm","chart","chase","cheap","check",
  "cheek","chess","chest","chief","child","china","choir","chunk","claim","clamp",
  "clang","clash","clasp","class","clean","clear","clerk","click","cliff","cling",
  "clock","clone","close","cloud","coach","coast","comet","comic","coral","could",
  "count","court","cover","crack","craft","crash","craze","crazy","creek","crime",
  "crisp","cross","crowd","crown","crust","crypt","cubic","curve","cycle","daily",
  "dance","datum","decay","delay","delta","depot","depth","derby","devil","digit",
  "dirty","disco","dizzy","donor","doubt","dough","drank","dream","dress","drift",
  "drink","drive","drove","drunk","dryer","early","earth","eight","elect","elite",
  "email","empty","enemy","enjoy","enter","entry","equal","error","event","exact",
  "excel","exist","extra","fable","faint","fairy","faith","false","fancy","fatal",
  "feast","fiber","field","fifth","fifty","fight","final","first","fixed","flame",
  "flash","flask","flesh","float","flood","floor","flour","fluid","flush","focus",
  "force","forge","forte","forum","found","frame","frank","fraud","fresh","front",
  "froze","fruit","fully","funny","ghost","giant","given","gland","glare","glass",
  "gleam","gloom","gloss","glove","going","gorge","grace","grade","grain","grand",
  "grant","graph","grasp","grass","grave","great","greed","green","greet","grief",
  "grind","groan","groom","group","grove","grown","gruel","guard","guess","guest",
  "guide","guilt","guise","gusto","happy","harsh","haste","haunt","haven","heart",
  "heavy","hence","herbs","hinge","hippo","horse","hotel","house","human","humor",
  "hurry","ideal","image","imply","inbox","infer","input","inter","intro","issue",
  "ivory","jewel","joker","joust","judge","juice","juicy","keeps","known","label",
  "lance","large","laser","later","laugh","layer","learn","legal","level","light",
  "limit","linen","liver","lodge","logic","lower","lucky","lunar","lusty","magic",
  "major","maker","manor","maple","march","match","mayor","media","mercy","merit",
  "messy","metal","might","minor","minus","misty","model","money","month","moody",
  "moral","motor","mount","mouse","mouth","movie","muddy","music","naive","nerve",
  "never","night","ninja","noble","noise","north","noted","novel","nurse","nymph",
  "occur","offer","often","olive","onset","opera","orbit","order","other","ought",
  "outer","oxide","ozone","paint","panel","paper","party","pasta","patch","pause",
  "peace","penny","phase","phone","photo","piano","piece","pilot","pitch","pixel",
  "pizza","place","plain","plane","plant","plate","plaza","plead","pluck","plumb",
  "point","polar","power","press","price","pride","prime","prize","probe","prone",
  "proof","prose","proud","prove","prowl","pulse","punch","pupil","purse","queen",
  "quest","queue","quick","quiet","quota","quote","rabbi","radar","radio","raise",
  "ranch","range","rapid","ratio","reach","ready","realm","rebel","refer","reign",
  "relax","relay","repay","repel","reply","rerun","reset","reuse","rider","ridge",
  "rifle","right","rigid","risky","rival","river","robot","rocky","roman","rouge",
  "rough","round","route","royal","rugby","ruler","rural","rusty","sadly","saint",
  "salad","sauce","scale","scare","scene","score","scout","screw","seize","sense",
  "serve","seven","shade","shaft","shape","share","shark","sharp","sheep","shelf",
  "shell","shift","shine","shirt","shock","shoot","short","shout","siege","sight",
  "silly","since","sixty","sixth","skill","skull","slant","slave","sleep","slide",
  "slime","slope","sloth","slump","small","smart","smell","smile","smoke","solar",
  "solve","sonic","sorry","sound","south","space","spare","spark","spend","spice",
  "spike","spine","spite","split","spoke","spoon","spore","sport","squad","squat",
  "squib","stack","staff","stage","stain","stale","stall","stand","stare","stark",
  "start","state","steam","steel","steep","steer","stern","stick","stiff","still",
  "stock","stomp","stone","stood","storm","story","stout","straw","stray","strip",
  "strum","stuck","study","stuff","stunt","style","sugar","suite","sunny","super",
  "surge","swamp","swear","sweat","sweep","sweet","swept","swift","swirl","sword",
  "sworn","syrup","table","talon","tango","taste","taunt","teach","teeth","tempo",
  "tense","tenth","their","theme","there","these","thick","thing","think","third",
  "thorn","those","three","threw","throw","thumb","tiger","tight","timer","tired",
  "title","today","token","tooth","topic","total","touch","tough","tower","toxic",
  "track","trade","trail","train","trait","trash","treat","trend","trial","tribe",
  "trick","tried","troop","truck","truly","trunk","trust","truth","twice","twist",
  "ultra","uncle","under","unify","union","until","upper","upset","urban","usage",
  "usual","utter","valid","valor","value","valve","video","vigor","viral","virus",
  "vista","vital","voice","voter","vowed","waist","waste","watch","water","weary",
  "weave","wedge","weird","whole","whose","wider","wield","witty","woman","world",
  "worry","worse","worst","worth","would","wrist","wrote","yacht","young","yours",
  "youth","zebra","zesty","zippy","zonal"
];

function isValidGuess(w){ return /^[a-zA-Z]{5}$/.test(w); }

// ── State ──────────────────────────────────────────────────────────────────
let answer, guesses, currentRow, currentCol, gameOver;
let streak = 0, best = 0;
// Daily tracking
let savedDate = null, savedGuesses = null, savedWon = false;

function getTodayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const saveManager = createSaveManager({
  gameId: 'game-wordle',
  loginStatusEl: document.getElementById('login-status'),
  getSaveData(){
    return {
      streak, best,
      lastDate: getTodayKey(),
      lastGuesses: guesses ?? [],
      lastWon: (guesses??[]).length > 0 && guesses[guesses.length-1].result.every(r=>r==='correct'),
    };
  },
  applySaveData(d){
    streak = d.streak ?? 0;
    best   = d.best   ?? 0;
    savedDate   = d.lastDate   ?? null;
    savedGuesses= d.lastGuesses ?? null;
    savedWon    = d.lastWon    ?? false;
    updateHUD();
  },
});

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  newGame();
});

// ── Game lifecycle ─────────────────────────────────────────────────────────
function newGame(){
  const today = getTodayKey();
  const dayIdx = Math.floor(Date.now() / 86400000) % ANSWERS.length;
  answer = ANSWERS[dayIdx].toUpperCase();

  guesses = [];
  currentRow = 0;
  currentCol = 0;
  gameOver = false;

  buildBoard();
  buildKeyboard();
  showMessage('');
  document.getElementById('keyboard').style.pointerEvents = '';
  document.getElementById('keyboard').style.opacity = '';
  updateHUD();

  // 오늘 이미 플레이한 경우 → 결과 복원
  if(savedDate === today && savedGuesses && savedGuesses.length > 0){
    restoreToday(savedGuesses, savedWon);
  }
}

// ── Restore today's game ───────────────────────────────────────────────────
function restoreToday(saved, won){
  gameOver = true;
  guesses = [...saved];
  currentRow = saved.length;

  // Fill tiles instantly (no animation)
  saved.forEach(({word, result}, row) => {
    for(let c = 0; c < 5; c++){
      const tile = getTile(row, c);
      tile.textContent = word[c];
      tile.classList.remove('filled','pop');
      tile.classList.add(result[c]);
    }
    updateKeyboard(word, result);
  });

  // Lock keyboard
  document.getElementById('keyboard').style.pointerEvents = 'none';
  document.getElementById('keyboard').style.opacity = '0.6';

  if(won){
    const tries = saved.length;
    showMessage(`🔒 오늘은 이미 완료! ${tries}번 만에 정답 (연속 ${streak}회)`);
  } else {
    showMessage(`🔒 오늘 이미 도전 완료. 정답: ${answer}`);
  }
  updateHUD();
}

// ── Board ──────────────────────────────────────────────────────────────────
function buildBoard(){
  const board = document.getElementById('board');
  board.innerHTML = '';
  for(let r = 0; r < 6; r++){
    const row = document.createElement('div');
    row.className = 'board-row';
    for(let c = 0; c < 5; c++){
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `t-${r}-${c}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function getTile(r,c){ return document.getElementById(`t-${r}-${c}`); }

function setLetter(letter){
  if(currentCol >= 5 || gameOver) return;
  const tile = getTile(currentRow, currentCol);
  tile.textContent = letter;
  tile.classList.add('filled','pop');
  currentCol++;
}

function deleteLetter(){
  if(currentCol <= 0 || gameOver) return;
  currentCol--;
  const tile = getTile(currentRow, currentCol);
  tile.textContent = '';
  tile.classList.remove('filled','pop');
}

function submitGuess(){
  if(gameOver) return;
  if(currentCol < 5){ shakeRow(currentRow); showMessage('5글자를 모두 입력하세요'); return; }
  const word = Array.from({length:5},(_,i)=>getTile(currentRow,i).textContent).join('');
  if(!isValidGuess(word)){ shakeRow(currentRow); showMessage('유효한 단어가 아닙니다'); return; }

  const result = evaluate(word, answer);
  guesses.push({word, result});
  revealRow(currentRow, word, result, ()=>{
    updateKeyboard(word, result);
    const won = result.every(r=>r==='correct');
    if(won){
      streak = (streak||0)+1;
      if(streak > (best||0)) best = streak;
      saveManager.save();
      showMessage(msgs[Math.min(currentRow,5)]);
      gameOver = true;
      updateHUD();
      setTimeout(()=>showPlayAgain(true), 800);
    } else {
      currentRow++;
      currentCol = 0;
      if(currentRow >= 6){
        streak = 0;
        saveManager.save();
        showMessage(`정답: ${answer}`);
        gameOver = true;
        updateHUD();
        setTimeout(()=>showPlayAgain(false), 800);
      }
    }
    updateHUD();
  });
}

const msgs = ['천재!','훌륭해!','인상적!','잘했어!','좋아!','휴~'];

function evaluate(guess, ans){
  const res = Array(5).fill('absent');
  const ansCopy = ans.split('');
  const guessCopy = guess.split('');
  for(let i=0;i<5;i++){
    if(guessCopy[i]===ansCopy[i]){ res[i]='correct'; ansCopy[i]=null; guessCopy[i]=null; }
  }
  for(let i=0;i<5;i++){
    if(guessCopy[i]===null) continue;
    const idx=ansCopy.indexOf(guessCopy[i]);
    if(idx!==-1){ res[i]='present'; ansCopy[idx]=null; }
  }
  return res;
}

function revealRow(row, word, result, cb){
  let i=0;
  function next(){
    if(i>=5){ cb(); return; }
    const tile=getTile(row,i);
    tile.classList.add('flip');
    setTimeout(()=>{
      tile.classList.add(result[i]);
      tile.classList.remove('flip','filled');
      i++;
      setTimeout(next,60);
    },200);
  }
  next();
}

function shakeRow(row){
  for(let c=0;c<5;c++){
    const tile=getTile(row,c);
    tile.classList.remove('shake');
    void tile.offsetWidth;
    tile.classList.add('shake');
  }
}

// ── Keyboard ───────────────────────────────────────────────────────────────
const ROWS=[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];

function buildKeyboard(){
  const kb=document.getElementById('keyboard');
  kb.innerHTML='';
  ROWS.forEach(row=>{
    const rowEl=document.createElement('div');
    rowEl.className='kb-row';
    row.forEach(k=>{
      const btn=document.createElement('button');
      btn.className='key'+(k==='ENTER'||k==='⌫'?' wide':'');
      btn.textContent=k;
      btn.dataset.key=k;
      btn.addEventListener('click',()=>handleKey(k));
      rowEl.appendChild(btn);
    });
    kb.appendChild(rowEl);
  });
}

const STATE_PRIO = {correct:3, present:2, absent:1};

function updateKeyboard(word, result){
  for(let i=0;i<5;i++){
    const letter=word[i];
    const btn=document.querySelector(`.key[data-key="${letter}"]`);
    if(!btn) continue;
    const newState=result[i];
    // 현재 키 상태 파악
    const curState=btn.classList.contains('correct')?'correct':
                   btn.classList.contains('present')?'present':
                   btn.classList.contains('absent')?'absent':null;
    // 더 높은 우선순위일 때만 업데이트 (correct > present > absent)
    if(!curState || STATE_PRIO[newState] > STATE_PRIO[curState]){
      if(curState) btn.classList.remove(curState);
      btn.classList.add(newState);
    }
  }
}

function handleKey(k){
  if(gameOver) return;
  if(k==='ENTER') submitGuess();
  else if(k==='⌫') deleteLetter();
  else setLetter(k);
}

// ── Physical keyboard ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(document.getElementById('game-screen').classList.contains('active')){
    if(e.key==='Enter') handleKey('ENTER');
    else if(e.key==='Backspace') handleKey('⌫');
    else if(/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
  }
});

// ── UI ─────────────────────────────────────────────────────────────────────
function showMessage(txt){
  document.getElementById('message').textContent=txt;
}

function updateHUD(){
  document.getElementById('streak').textContent=streak??0;
  document.getElementById('best').textContent=best??0;
  document.getElementById('attempts').textContent=`${currentRow??0}/6`;
}

function showPlayAgain(won){
  const kb=document.getElementById('keyboard');
  const btn=document.createElement('button');
  btn.className='btn-start';btn.textContent='다시 하기 (새 게임)';
  btn.style.marginTop='8px';
  btn.addEventListener('click',()=>{
    btn.remove();
    // 오늘 게임은 끝났으므로 다음날 단어로 미리 보여줄 필요 없음 → 그냥 재시작
    // 단, 오늘 날짜 저장은 이미 됐으므로 재시작하면 바로 복원 화면이 표시됨
    newGame();
  });
  kb.after(btn);
}
