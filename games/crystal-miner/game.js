import { createSaveManager } from "../../shared/save.js";

const GAME_ID = "upgrade-clicker";

const loginStatusEl = document.getElementById("loginStatus");
const scoreTextEl = document.getElementById("scoreText");
const powerTextEl = document.getElementById("powerText");
const upgradeTextEl = document.getElementById("upgradeText");
const clickButton = document.getElementById("clickButton");
const upgradeButton = document.getElementById("upgradeButton");
const saveButton = document.getElementById("saveButton");
const statusEl = document.getElementById("status");

let score = 0;
let clickPower = 1;
let upgradeLevel = 0;

function getUpgradeCost() {
  return 10 + upgradeLevel * 15;
}

function render() {
  scoreTextEl.innerText = `점수: ${score}`;
  powerTextEl.innerText = `클릭 파워: ${clickPower}`;
  upgradeTextEl.innerText = `업그레이드 비용: ${getUpgradeCost()}`;
}

const saveManager = createSaveManager({
  gameId: GAME_ID,
  statusEl,
  loginStatusEl,

  getSaveData() {
    return {
      score,
      clickPower,
      upgradeLevel
    };
  },

  applySaveData(data) {
    score = data.score ?? 0;
    clickPower = data.clickPower ?? 1;
    upgradeLevel = data.upgradeLevel ?? 0;
  },

  afterLoad() {
    render();
  }
});

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
  await saveManager.save();
});

render();
