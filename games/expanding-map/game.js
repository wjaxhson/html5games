import {
  TILE,
  VIEW_SIZE,
  rulePool,
  createStartMap,
  createMap,
  pickNewRule
} from "./map-generator.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mapInfoEl = document.getElementById("mapInfo");
const scoreInfoEl = document.getElementById("scoreInfo");
const ruleCountInfoEl = document.getElementById("ruleCountInfo");
const ruleIconEl = document.getElementById("ruleIcon");
const ruleInfoEl = document.getElementById("ruleInfo");
const featureListEl = document.getElementById("featureList");
const messageEl = document.getElementById("message");

const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const TILE_SIZE = canvas.width / VIEW_SIZE;

let world;
let player;
let activeRules;
let score;

function getMapKey(x, y) {
  return `${x},${y}`;
}

function getCurrentMap() {
  return world[getMapKey(player.mapX, player.mapY)];
}

function resetGame() {
  world = {};
  activeRules = [];
  score = 0;

  player = {
    mapX: 0,
    mapY: 0,
    x: 2,
    y: 2
  };

  world[getMapKey(0, 0)] = createStartMap();

  messageEl.textContent = "방향키 또는 아래 버튼으로 이동하세요.";
  draw();
}

function moveToMap(dx, dy) {
  const nextMapX = player.mapX + dx;
  const nextMapY = player.mapY + dy;
  const key = getMapKey(nextMapX, nextMapY);

  const isNewMap = !world[key];

  if (isNewMap) {
    const newRule = pickNewRule(activeRules);

    if (newRule) {
      activeRules.push(newRule);
      messageEl.textContent = `새 맵 생성! '${newRule.name}'이 추가되었습니다.`;
    } else {
      messageEl.textContent = "새 맵 생성! 모든 규칙을 이미 보유 중입니다.";
    }

    world[key] = createMap({
      x: nextMapX,
      y: nextMapY,
      activeRules,
      newlyAddedRule: newRule
    });
  } else {
    messageEl.textContent = "이미 방문한 맵입니다. 새 규칙은 추가되지 않습니다.";
  }

  player.mapX = nextMapX;
  player.mapY = nextMapY;

  if (dx === 1) player.x = 0;
  if (dx === -1) player.x = VIEW_SIZE - 1;
  if (dy === 1) player.y = 0;
  if (dy === -1) player.y = VIEW_SIZE - 1;

  draw();
}

function movePlayer(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (nextX < 0) {
    moveToMap(-1, 0);
    return;
  }

  if (nextX >= VIEW_SIZE) {
    moveToMap(1, 0);
    return;
  }

  if (nextY < 0) {
    moveToMap(0, -1);
    return;
  }

  if (nextY >= VIEW_SIZE) {
    moveToMap(0, 1);
    return;
  }

  const map = getCurrentMap();
  const nextTile = map.tiles[nextY][nextX];

  if (nextTile.type === TILE.WALL) {
    messageEl.textContent = "벽이 막고 있습니다.";
    draw();
    return;
  }

  player.x = nextX;
  player.y = nextY;

  handleTile(nextTile);
  draw();
}

function handleTile(tile) {
  if (tile.type === TILE.COIN && !tile.collected) {
    tile.collected = true;
    score += 1;
    messageEl.textContent = "코인을 주웠습니다. 점수 +1";
    return;
  }

  if (tile.type === TILE.HEAL) {
    messageEl.textContent = "회복 타일입니다. 아직 체력 시스템은 없습니다.";
    return;
  }

  if (tile.type === TILE.WATER) {
    messageEl.textContent = "물이 있는 칸입니다.";
    return;
  }

  messageEl.textContent = "이동했습니다.";
}

function draw() {
  const map = getCurrentMap();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < VIEW_SIZE; row += 1) {
    for (let col = 0; col < VIEW_SIZE; col += 1) {
      drawTile(map.tiles[row][col], col, row);
    }
  }

  drawPlayer();
  updateInfo();
}

function drawTile(tile, x, y) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;

  ctx.fillStyle = getTileColor(tile);
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  if (tile.type === TILE.WALL) {
    drawBrickPattern(px, py);
  }

  if (tile.type === TILE.COIN && !tile.collected) {
    drawCoin(px, py);
  }

  if (tile.type === TILE.HEAL) {
    drawHeal(px, py);
  }

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

function getTileColor(tile) {
  if (tile.type === TILE.FLOOR) return "#1e293b";
  if (tile.type === TILE.WALL) return "#a1a1aa";
  if (tile.type === TILE.WATER) return "#0284c7";
  if (tile.type === TILE.COIN) return tile.collected ? "#1e293b" : "#1e293b";
  if (tile.type === TILE.HEAL) return "#14532d";

  return "#1e293b";
}

function drawBrickPattern(px, py) {
  ctx.strokeStyle = "rgba(51, 65, 85, 0.85)";
  ctx.lineWidth = 2;

  const brickHeight = TILE_SIZE / 5;

  for (let i = 1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(px, py + brickHeight * i);
    ctx.lineTo(px + TILE_SIZE, py + brickHeight * i);
    ctx.stroke();
  }

  for (let row = 0; row < 5; row += 1) {
    const offset = row % 2 === 0 ? 0 : TILE_SIZE / 4;

    for (let col = 1; col < 4; col += 1) {
      const x = px + offset + (TILE_SIZE / 4) * col;
      ctx.beginPath();
      ctx.moveTo(x, py + brickHeight * row);
      ctx.lineTo(x, py + brickHeight * (row + 1));
      ctx.stroke();
    }
  }
}

function drawCoin(px, py) {
  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(cx, cy, TILE_SIZE * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#854d0e";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawHeal(px, py) {
  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.28;

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(cx - size / 2, cy - size * 1.5, size, size * 3);
  ctx.fillRect(cx - size * 1.5, cy - size / 2, size * 3, size);
}

function drawPlayer() {
  const cx = player.x * TILE_SIZE + TILE_SIZE / 2;
  const cy = player.y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE * 0.3;

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy - radius * 0.25, radius * 0.14, 0, Math.PI * 2);
  ctx.arc(cx + radius * 0.35, cy - radius * 0.25, radius * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy - radius * 0.25, radius * 0.07, 0, Math.PI * 2);
  ctx.arc(cx + radius * 0.35, cy - radius * 0.25, radius * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function updateInfo() {
  const currentMap = getCurrentMap();
  const latestRule = getLatestRule(currentMap);

  mapInfoEl.textContent = `${player.mapX}, ${player.mapY}`;
  scoreInfoEl.textContent = String(score);
  ruleCountInfoEl.textContent = `${activeRules.length}개`;

  if (!latestRule) {
    ruleIconEl.textContent = "▫️";
    ruleInfoEl.textContent = "기본 규칙";
    featureListEl.textContent = "아직 추가된 규칙이 없습니다.";
    return;
  }

  ruleIconEl.textContent = latestRule.icon;
  ruleInfoEl.textContent = latestRule.name;

  const names = activeRules.map((rule) => rule.name).join(", ");
  featureListEl.textContent = `${latestRule.description} / 보유 규칙: ${names}`;
}

function getLatestRule(map) {
  if (map.newlyAddedRuleId) {
    return rulePool.find((rule) => rule.id === map.newlyAddedRuleId);
  }

  if (activeRules.length > 0) {
    return activeRules[activeRules.length - 1];
  }

  return null;
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") movePlayer(0, -1);
  if (key === "arrowdown" || key === "s") movePlayer(0, 1);
  if (key === "arrowleft" || key === "a") movePlayer(-1, 0);
  if (key === "arrowright" || key === "d") movePlayer(1, 0);
});

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;

    if (dir === "up") movePlayer(0, -1);
    if (dir === "down") movePlayer(0, 1);
    if (dir === "left") movePlayer(-1, 0);
    if (dir === "right") movePlayer(1, 0);
  });
});

backBtn.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

resetGame();
