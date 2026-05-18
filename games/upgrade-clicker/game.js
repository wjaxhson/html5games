import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "../../shared/firebase.js";

const GAME_ID = "upgrade-clicker";
const LOCAL_SAVE_KEY = `html5games:${GAME_ID}:save`;

const loginStatusEl = document.getElementById("loginStatus");
const scoreTextEl = document.getElementById("scoreText");
const powerTextEl = document.getElementById("powerText");
const upgradeTextEl = document.getElementById("upgradeText");
const clickButton = document.getElementById("clickButton");
const upgradeButton = document.getElementById("upgradeButton");
const saveButton = document.getElementById("saveButton");
const statusEl = document.getElementById("status");

let currentUser = null;

let score = 0;
let clickPower = 1;
let upgradeLevel = 0;
let autoSaveRemaining = 30;

function getUpgradeCost() {
  return 10 + upgradeLevel * 15;
}

function render() {
  scoreTextEl.innerText = `점수: ${score}`;
  powerTextEl.innerText = `클릭 파워: ${clickPower}`;
  upgradeTextEl.innerText = `업그레이드 비용: ${getUpgradeCost()}`;
}

function updateAutoSaveText() {
  const saveType = currentUser ? "서버" : "로컬";
  statusEl.innerText = `${saveType} 자동 저장까지 ${autoSaveRemaining}초`;
}

function getSaveData() {
  return {
    gameId: GAME_ID,
    score,
    clickPower,
    upgradeLevel,
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
  } else {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(saveData));
  }

  autoSaveRemaining = 30;
  updateAutoSaveText();
}

async function loadGame() {
  if (currentUser) {
    const docSnap = await getDoc(
      doc(db, "users", currentUser.uid, "games", GAME_ID)
    );

    if (docSnap.exists()) {
      const data = docSnap.data();
      score = data.score ?? 0;
      clickPower = data.clickPower ?? 1;
      upgradeLevel = data.upgradeLevel ?? 0;
    }
  } else {
    const rawData = localStorage.getItem(LOCAL_SAVE_KEY);

    if (rawData) {
      const data = JSON.parse(rawData);
      score = data.score ?? 0;
      clickPower = data.clickPower ?? 1;
      upgradeLevel = data.upgradeLevel ?? 0;
    }
  }

  render();
  updateAutoSaveText();
}

clickButton.addEventListener("click", () => {
  score += clickPower;
  render();
});

upgradeButton.addEventListener("click", () => {
  const cost = getUpgradeCost();

  if (score < cost) {
    alert("점수가 부족합니다.");
    return;
  }

  score -= cost;
  upgradeLevel += 1;
  clickPower += 1;

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
  autoSaveRemaining--;

  if (autoSaveRemaining <= 0) {
    await saveGame();
  }

  updateAutoSaveText();
}, 1000);
