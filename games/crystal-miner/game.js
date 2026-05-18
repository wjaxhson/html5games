import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  auth,
  db
} from "../../shared/firebase.js";

const GAME_ID = "crystal-miner";
const LOCAL_SAVE_KEY =
  `html5games:${GAME_ID}:save`;

const crystalText =
  document.getElementById("crystalText");

const perSecondText =
  document.getElementById("perSecondText");

const minerCountText =
  document.getElementById("minerCountText");

const minerCostText =
  document.getElementById("minerCostText");

const mineButton =
  document.getElementById("mineButton");

const buyMinerButton =
  document.getElementById("buyMinerButton");

const saveButton =
  document.getElementById("saveButton");

const statusEl =
  document.getElementById("status");

const loginStatusEl =
  document.getElementById("loginStatus");

let currentUser = null;

let crystals = 0;
let minerCount = 0;

let autoSaveRemaining = 30;

function getMinerCost() {
  return Math.floor(
    10 * Math.pow(1.35, minerCount)
  );
}

function getPerSecond() {
  return minerCount;
}

function render() {
  crystalText.innerText =
    Math.floor(crystals);

  perSecondText.innerText =
    getPerSecond();

  minerCountText.innerText =
    minerCount;

  minerCostText.innerText =
    getMinerCost();
}

function updateAutoSaveText() {
  const saveType =
    currentUser ? "서버" : "로컬";

  statusEl.innerText =
    `${saveType} 자동 저장까지 ${autoSaveRemaining}초`;
}

function getSaveData() {
  return {
    crystals,
    minerCount,
    updatedAt: Date.now()
  };
}

async function saveGame() {
  const saveData = getSaveData();

  if (currentUser) {
    await setDoc(
      doc(
        db,
        "users",
        currentUser.uid,
        "games",
        GAME_ID
      ),
      saveData
    );
  } else {
    localStorage.setItem(
      LOCAL_SAVE_KEY,
      JSON.stringify(saveData)
    );
  }

  autoSaveRemaining = 30;
  updateAutoSaveText();
}

async function loadGame() {
  if (currentUser) {
    const docSnap = await getDoc(
      doc(
        db,
        "users",
        currentUser.uid,
        "games",
        GAME_ID
      )
    );

    if (docSnap.exists()) {
      const data = docSnap.data();

      crystals =
        data.crystals ?? 0;

      minerCount =
        data.minerCount ?? 0;
    }
  } else {
    const rawData =
      localStorage.getItem(
        LOCAL_SAVE_KEY
      );

    if (rawData) {
      const data =
        JSON.parse(rawData);

      crystals =
        data.crystals ?? 0;

      minerCount =
        data.minerCount ?? 0;
    }
  }

  render();
}

mineButton.addEventListener(
  "click",
  () => {
    crystals += 1;
    render();
  }
);

buyMinerButton.addEventListener(
  "click",
  () => {
    const cost =
      getMinerCost();

    if (crystals < cost) {
      return;
    }

    crystals -= cost;
    minerCount += 1;

    render();
  }
);

saveButton.addEventListener(
  "click",
  async () => {
    await saveGame();
  }
);

onAuthStateChanged(
  auth,
  async (user) => {
    currentUser = user;

    if (user) {
      loginStatusEl.innerText =
        `${user.displayName} 로그인 중`;
    } else {
      loginStatusEl.innerText =
        "비로그인 상태";
    }

    await loadGame();
  }
);

setInterval(() => {
  crystals += getPerSecond();

  render();
}, 1000);

setInterval(async () => {
  autoSaveRemaining--;

  if (autoSaveRemaining <= 0) {
    await saveGame();
  }

  updateAutoSaveText();
}, 1000);

render();
updateAutoSaveText();
