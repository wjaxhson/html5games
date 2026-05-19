import { createSaveManager } from "../../shared/save.js";

const GAME_ID = "crystal-miner";

const loginStatusEl = document.getElementById("loginStatus");
const crystalTextEl = document.getElementById("crystalText");
const perSecondTextEl = document.getElementById("perSecondText");
const minerCountTextEl = document.getElementById("minerCountText");
const minerCostTextEl = document.getElementById("minerCostText");
const mineButton = document.getElementById("mineButton");
const buyMinerButton = document.getElementById("buyMinerButton");
const saveButton = document.getElementById("saveButton");
const statusEl = document.getElementById("status");

let crystals = 0;
let minerCount = 0;

function getMinerCost() {
  return Math.floor(10 * Math.pow(1.25, minerCount));
}

function getCrystalsPerSecond() {
  return minerCount;
}

function render() {
  crystalTextEl.innerText = Math.floor(crystals);
  perSecondTextEl.innerText = getCrystalsPerSecond();
  minerCountTextEl.innerText = minerCount;
  minerCostTextEl.innerText = getMinerCost();
}

const saveManager = createSaveManager({
  gameId: GAME_ID,
  statusEl,
  loginStatusEl,

  getSaveData() {
    return {
      crystals,
      minerCount
    };
  },

  applySaveData(data) {
    crystals = data.crystals ?? 0;
    minerCount = data.minerCount ?? 0;
  },

  afterLoad() {
    render();
  }
});

mineButton.addEventListener("click", () => {
  crystals += 1;
  render();
});

buyMinerButton.addEventListener("click", () => {
  const cost = getMinerCost();

  if (crystals < cost) {
    alert("수정이 부족합니다.");
    return;
  }

  crystals -= cost;
  minerCount += 1;

  render();
});

saveButton.addEventListener("click", async () => {
  await saveManager.save();
});

setInterval(() => {
  crystals += getCrystalsPerSecond();
  render();
}, 1000);

render();
