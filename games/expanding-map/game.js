const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mapInfoEl = document.getElementById("mapInfo");
const ruleInfoEl = document.getElementById("ruleInfo");
const messageEl = document.getElementById("message");
const featureListEl = document.getElementById("featureList");

const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const VIEW_SIZE = 5;
const TILE_SIZE = canvas.width / VIEW_SIZE;

const TILE = {
  FLOOR: "floor",
  WALL: "wall",
  WATER: "water",
  COIN: "coin",
  HEAL: "heal"
};

const featurePool = [
  {
    id: "walls",
    name: "벽",
    description: "일부 칸이 벽이 되어 지나갈 수 없습니다."
  },
  {
    id: "water",
    name: "물",
    description: "물 칸이 생깁니다. 아직은 지나갈 수 있지만 이동이 불편해 보입니다."
  },
  {
    id: "coins",
    name: "코인",
    description: "코인을 주울 수 있습니다."
  },
  {
    id: "heal",
    name: "회복 타일",
    description: "초록색 회복 타일이 생깁니다."
  }
];

let world;
let player;
let visitedMapOrder;
let unlockedFeatures;
let score;

function createEmptyMap(x, y, featureId = null) {
  const tiles = [];

  for (let row = 0; row < VIEW_SIZE; row += 1) {
    const line = [];

    for (let col = 0; col < VIEW_SIZE; col += 1) {
      line.push({
        type: TILE.FLOOR,
        collected: false
      });
    }

    tiles.push(line);
  }

  const map = {
    x,
    y,
    featureId,
    tiles
  };

  applyFeatureToMap(map, featureId);

  return map;
}

function applyFeatureToMap(map, featureId) {
  if (!featureId) return;

  const center = Math.floor(VIEW_SIZE / 2);

  for (let row = 0; row < VIEW_SIZE; row += 1) {
    for (let col = 0; col < VIEW_SIZE; col += 1) {
      const isCenter = row === center && col === center;
      if (isCenter) continue;

      const seed = Math.abs((map.x * 92821 + map.y * 68917 + row * 31 + col * 17) % 100);

      if (featureId === "walls" && seed < 18) {
        map.tiles[row][col].type = TILE.WALL;
      }

      if (featureId === "water" && seed >= 18 && seed < 36) {
        map.tiles[row][col].type = TILE.WATER;
      }

      if (featureId === "coins" && seed >= 36 && seed < 48) {
        map.tiles[row][col].type = TILE.COIN;
      }

      if (featureId === "heal" && seed >= 48 && seed < 56) {
        map.tiles[row][col].type = TILE.HEAL;
      }
    }
  }
}

function getMapKey(x, y) {
  return `${x},${y}`;
}

function getCurrentMap() {
  return world[getMapKey(player.mapX, player.mapY)];
}

function getNextFeatureId() {
  const used = new Set(unlockedFeatures);
  const next = featurePool.find((feature) => !used.has(feature.id));
  return next ? next.id : null;
}

function moveToMap(dx, dy) {
  const nextMapX = player.mapX + dx;
  const nextMapY = player.mapY + dy;
  const key = getMapKey(nextMapX, nextMapY);

  const isNewMap = !world[key];

  if (isNewMap) {
    const nextFeatureId = getNextFeatureId();

    world[key] = createEmptyMap(nextMapX, nextMapY, nextFeatureId);
    visitedMapOrder.push(key);

    if (nextFeatureId) {
      unlockedFeatures.push(nextFeatureId);
      const feature = featurePool.find((item) => item.id === nextFeatureId);
      messageEl.textContent = `새 맵 생성! 새로운 규칙 '${feature.name}'이 추가되었습니다.`;
    } else {
      messageEl.textContent = "새 맵 생성! 더 이상 추가할 규칙이 없어 기본 맵이 생성되었습니다.";
    }
  } else {
    messageEl.textContent = "이미 방문한 맵으로 돌아왔습니다. 새 규칙은 추가되지 않습니다.";
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
    messageEl.textContent = `코인을 주웠습니다. 점수 +1`;
    return;
  }

  if (tile.type === TILE.HEAL) {
    messageEl.textContent = "회복 타일입니다. 아직 체력 시스템은 없지만 따뜻합니다.";
    return;
  }

  if (tile.type === TILE.WATER) {
    messageEl.textContent = "물이 있는 칸입니다.";
    return;
  }

  messageEl.textContent = "이동했습니다.";
}

function drawTile(tile, x, y) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;

  if (tile.type === TILE.FLOOR) ctx.fillStyle = "#1e293b";
  if (tile.type === TILE.WALL) ctx.fillStyle = "#64748b";
  if (tile.type === TILE.WATER) ctx.fillStyle = "#0284c7";
  if (tile.type === TILE.COIN) ctx.fillStyle = tile.collected ? "#1e293b" : "#eab308";
  if (tile.type === TILE.HEAL) ctx.fillStyle = "#22c55e";

  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

function drawPlayer() {
  const centerX = player.x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = player.y * TILE_SIZE + TILE_SIZE / 2;

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function updateInfo() {
  const map = getCurrentMap();
  const feature = featurePool.find((item) => item.id === map.featureId);

  mapInfoEl.textContent = `현재 맵: ${player.mapX}, ${player.mapY} / 점수: ${score}`;

  if (feature) {
    ruleInfoEl.textContent = `현재 맵 규칙: ${feature.name} - ${feature.description}`;
  } else {
    ruleInfoEl.textContent = "현재 맵 규칙: 없음";
  }

  if (unlockedFeatures.length === 0) {
    featureListEl.textContent = "누적 규칙: 없음";
  } else {
    const names = unlockedFeatures
      .map((id) => featurePool.find((featureItem) => featureItem.id === id)?.name)
      .filter(Boolean);

    featureListEl.textContent = `누적 규칙: ${names.join(", ")}`;
  }
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

function resetGame() {
  world = {};
  visitedMapOrder = [];
  unlockedFeatures = [];
  score = 0;

  player = {
    mapX: 0,
    mapY: 0,
    x: 2,
    y: 2
  };

  const startKey = getMapKey(0, 0);
  world[startKey] = createEmptyMap(0, 0, null);
  visitedMapOrder.push(startKey);

  messageEl.textContent = "방향키 또는 버튼으로 이동하세요.";
  draw();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    movePlayer(0, -1);
  }

  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    movePlayer(0, 1);
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    movePlayer(-1, 0);
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    movePlayer(1, 0);
  }
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
