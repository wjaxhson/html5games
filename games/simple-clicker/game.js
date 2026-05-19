import { createSaveManager } from "../../shared/save.js";

const GAME_ID = "simple-clicker";

const scoreEl = document.getElementById("score");
const clickButton = document.getElementById("clickButton");
const saveButton = document.getElementById("saveButton");
const statusEl = document.getElementById("status");
const loginStatusEl = document.getElementById("loginStatus");

let score = 0;

function render() {
  scoreEl.innerText = score;
}

const saveManager = createSaveManager({
  gameId: GAME_ID,
  statusEl,
  loginStatusEl,

  getSaveData() {
    return {
      score
    };
  },

  applySaveData(data) {
    score = data.score ?? 0;
  },

  afterLoad() {
    render();
  }
});

clickButton.addEventListener("click", () => {
  score += 1;
  render();
});

saveButton.addEventListener("click", async () => {
  await saveManager.save();
});

render();
