import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../../shared/firebase.js";

const GAME_ID = "simple-clicker";
const LOCAL_SAVE_KEY = `html5games:${GAME_ID}:save`;

const scoreEl = document.getElementById("score");
const clickButton = document.getElementById("clickButton");
const saveButton = document.getElementById("saveButton");
const statusEl = document.getElementById("status");
const loginStatusEl = document.getElementById("loginStatus");

let currentUser = null;
let score = 0;

function render() {
  scoreEl.innerText = score;
}

function getSaveData() {
  return {
    gameId: GAME_ID,
    score,
    updatedAt: Date.now()
  };
}

async function saveGame() {
  const saveData = getSaveData();

  if (currentUser) {
    await setDoc(
      doc(db, "users", currentUser.uid, "games", GAME_ID),
      saveData
    );

    statusEl.innerText = "서버에 저장 완료";
  } else {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(saveData));
    statusEl.innerText = "로컬스토리지에 저장 완료";
  }
}

async function loadGame() {
  if (currentUser) {
    const docSnap = await getDoc(
      doc(db, "users", currentUser.uid, "games", GAME_ID)
    );

    if (docSnap.exists()) {
      const data = docSnap.data();
      score = data.score ?? 0;
      statusEl.innerText = "서버 저장 데이터 불러오기 완료";
    } else {
      statusEl.innerText = "서버 저장 데이터 없음";
    }
  } else {
    const rawData = localStorage.getItem(LOCAL_SAVE_KEY);

    if (rawData) {
      const data = JSON.parse(rawData);
      score = data.score ?? 0;
      statusEl.innerText = "로컬 저장 데이터 불러오기 완료";
    } else {
      statusEl.innerText = "저장 데이터 없음";
    }
  }

  render();
}

clickButton.addEventListener("click", () => {
  score += 1;
  render();
});

saveButton.addEventListener("click", async () => {
  await saveGame();
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (user) {
    loginStatusEl.innerText = `${user.displayName} 로그인 중`;
  } else {
    loginStatusEl.innerText = "비로그인 상태";
  }

  await loadGame();
});

setInterval(async () => {
  await saveGame();
}, 30000);
