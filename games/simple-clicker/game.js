import { createSaveManager } from "../../shared/save.js";
import { createSaveUI } from "../../shared/save-ui.js";

const GAME_ID = "simple-clicker";

const scoreEl = document.getElementById("score");
const clickButton = document.getElementById("clickButton");
const loginStatusEl = document.getElementById("loginStatus");
const statusEl = document.getElementById("status");
const saveUiRootEl = document.getElementById("save-ui");

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
      score,
    };
  },
  applySaveData(data) {
    score = data.score ?? 0;
  },
  afterLoad() {
    render();
  },
});

createSaveUI({
  root: saveUiRootEl,
  autoSaveSeconds: 30,
  onSave: async () => {
    await saveManager.save();
  },
});

clickButton.addEventListener("click", () => {
  score += 1;
  render();
});

render();
