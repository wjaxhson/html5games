import {
  TERRAIN,
  OBJECT,
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
const menuBarEl = document.getElementById("menuBar");

const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

let isMapViewOpen = false;

let world;
let player;
let activeRules;
let score;
let money;
let hp;
let items;

function getMapKey(x, y) {
  return `${x},${y}`;
}

function getCurrentMap() {
  return world[getMapKey(player.mapX, player.mapY)];
}

function hasRule(id) {
  return activeRules.some((rule) => rule.id === id);
}

function resetGame() {
  world = {};
  activeRules = [];
  score = 0;
  money = 0;
  hp = 3;
  items = {
    attack: 0,
    waterBoots: false,
    wallBreaker: 0
  };

  const startMap = createStartMap();

  player = {
    mapX: 0,
    mapY: 0,
    x: Math.floor(startMap.size / 2),
    y: Math.floor(startMap.size / 2)
  };

  world[getMapKey(0, 0)] = startMap;

  messageEl.textContent = "방향키 또는 아래 버튼으로 이동하세요.";
  draw();
}

function moveToMap(dx, dy) {
  const currentMap = getCurrentMap();

  const nextMapX = player.mapX + dx;
  const nextMapY = player.mapY + dy;
  const key = getMapKey(nextMapX, nextMapY);

  const isNewMap = !world[key];

  if (isNewMap) {
    const newRule = pickNewRule(activeRules);

    if (newRule) {
      activeRules.push(newRule);
      messageEl.textContent = `새 맵 생성! '${newRule.name}'이 열렸습니다.`;
    } else {
      messageEl.textContent = "새 맵 생성! 현재 열 수 있는 규칙이 없습니다.";
    }

    world[key] = createMap({
      x: nextMapX,
      y: nextMapY,
      activeRules,
      newlyAddedRule: newRule,
      fromBiome: currentMap.biome
    });
  } else {
    messageEl.textContent = "이미 방문한 맵입니다. 새 규칙은 추가되지 않습니다.";
  }

  const nextMap = world[key];

  player.mapX = nextMapX;
  player.mapY = nextMapY;

  if (dx === 1) {
    player.x = 0;
    player.y = clamp(player.y, 0, nextMap.size - 1);
  }

  if (dx === -1) {
    player.x = nextMap.size - 1;
    player.y = clamp(player.y, 0, nextMap.size - 1);
  }

  if (dy === 1) {
    player.y = 0;
    player.x = clamp(player.x, 0, nextMap.size - 1);
  }

  if (dy === -1) {
    player.y = nextMap.size - 1;
    player.x = clamp(player.x, 0, nextMap.size - 1);
  }

  draw();
}

function movePlayer(dx, dy) {
  if (isMapViewOpen) {
    messageEl.textContent = "지도 화면에서는 이동할 수 없습니다. 게임 화면으로 돌아가세요.";
    return;
  }
  
  const map = getCurrentMap();

  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (nextX < 0) {
    moveToMap(-1, 0);
    return;
  }

  if (nextX >= map.size) {
    moveToMap(1, 0);
    return;
  }

  if (nextY < 0) {
    moveToMap(0, -1);
    return;
  }

  if (nextY >= map.size) {
    moveToMap(0, 1);
    return;
  }

  const nextTile = map.tiles[nextY][nextX];

  if (!canEnterTile(nextTile)) {
    draw();
    return;
  }

  player.x = nextX;
  player.y = nextY;

  handleTile(nextTile);
  draw();
}

function canEnterTile(tile) {
  if (tile.terrain === TERRAIN.WALL) {
    if (items.wallBreaker > 0) {
      items.wallBreaker -= 1;
      tile.terrain = TERRAIN.FLOOR;
      messageEl.textContent = "벽 파괴 아이템으로 벽을 뚫었습니다.";
      return true;
    }

    messageEl.textContent = "벽이 막고 있습니다.";
    return false;
  }

  if (tile.terrain === TERRAIN.DEEP_WATER && !items.waterBoots) {
    messageEl.textContent = "깊은 물입니다. 물을 건널 아이템이 필요합니다.";
    return false;
  }

  if (tile.terrain === TERRAIN.CACTUS) {
    if (hasRule("health")) {
      hp -= 1;
      messageEl.textContent = "선인장에 찔렸습니다. 체력 -1";
      if (hp <= 0) resetAfterDeath();
    }
  }

  return true;
}

function handleTile(tile) {
  if (tile.object === OBJECT.MONEY && !tile.collected) {
    tile.collected = true;
    money += tile.scoreValue;
    messageEl.textContent = `돈 +${tile.scoreValue}을 얻었습니다.`;
    return;
  }

  if (tile.object === OBJECT.HEAL && !tile.collected) {
    tile.collected = true;
    hp = Math.min(hp + 1, 5);
    messageEl.textContent = "회복 타일입니다. 체력 +1";
    return;
  }

  if (tile.object === OBJECT.ENEMY && !tile.collected) {
    if (items.attack > 0) {
      items.attack -= 1;
      tile.collected = true;
      score += 1;
      messageEl.textContent = "공격 아이템으로 적을 처치했습니다. 점수 +1";
      return;
    }

    hp -= 1;
    messageEl.textContent = "적과 부딪혔습니다. 체력 -1";

    if (hp <= 0) {
      resetAfterDeath();
    }

    return;
  }

  if (tile.object === OBJECT.ITEM && !tile.collected) {
    tile.collected = true;
    giveRandomItem();
    return;
  }

  if (tile.terrain === TERRAIN.ICE) {
    messageEl.textContent = "빙판입니다. 아직 미끄러짐은 구현 전입니다.";
    return;
  }

  messageEl.textContent = "이동했습니다.";
}

function giveRandomItem() {
  const candidates = [];

  if (hasRule("attack_item")) candidates.push("attack");
  if (hasRule("water_boots")) candidates.push("waterBoots");
  if (hasRule("wall_breaker")) candidates.push("wallBreaker");

  if (candidates.length === 0) {
    messageEl.textContent = "알 수 없는 아이템입니다.";
    return;
  }

  const item = candidates[Math.floor(Math.random() * candidates.length)];

  if (item === "attack") {
    items.attack += 1;
    messageEl.textContent = "공격 아이템을 얻었습니다.";
  }

  if (item === "waterBoots") {
    items.waterBoots = true;
    messageEl.textContent = "물 건너기 아이템을 얻었습니다.";
  }

  if (item === "wallBreaker") {
    items.wallBreaker += 1;
    messageEl.textContent = "벽 파괴 아이템을 얻었습니다.";
  }
}

function resetAfterDeath() {
  messageEl.textContent = "체력이 0이 되어 처음부터 다시 시작합니다.";
  setTimeout(resetGame, 300);
}

function draw() {
  if (isMapViewOpen) {
    drawWorldMap();
    updateInfo();
    renderMenus();
    return;
  }

  const map = getCurrentMap();
  const tileSize = canvas.width / map.size;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < map.size; row += 1) {
    for (let col = 0; col < map.size; col += 1) {
      drawTile(map.tiles[row][col], col, row, tileSize);
    }
  }

  drawPlayer(tileSize);
  updateInfo();
  renderMenus();
}

function drawTile(tile, x, y, tileSize) {
  const px = x * tileSize;
  const py = y * tileSize;

  ctx.fillStyle = getTerrainColor(tile.terrain);
  ctx.fillRect(px, py, tileSize, tileSize);

  ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, tileSize, tileSize);

  if (tile.object === OBJECT.MONEY && !tile.collected) drawMoney(px, py, tileSize, tile.scoreValue);
  if (tile.object === OBJECT.HEAL && !tile.collected) drawHeal(px, py, tileSize);
  if (tile.object === OBJECT.ENEMY && !tile.collected) drawEnemy(px, py, tileSize);
  if (tile.object === OBJECT.ITEM && !tile.collected) drawItem(px, py, tileSize);
}

function getTerrainColor(terrain) {
  if (terrain === TERRAIN.FLOOR) return "#1e293b";
  if (terrain === TERRAIN.WALL) return "#71717a";

  if (terrain === TERRAIN.GRASS) return "#15803d";
  if (terrain === TERRAIN.TALL_GRASS) return "#166534";
  if (terrain === TERRAIN.FLOWER) return "#65a30d";

  if (terrain === TERRAIN.WATER) return "#0284c7";
  if (terrain === TERRAIN.DEEP_WATER) return "#075985";
  if (terrain === TERRAIN.REED) return "#0f766e";

  if (terrain === TERRAIN.DESERT) return "#ca8a04";
  if (terrain === TERRAIN.DUNE) return "#a16207";
  if (terrain === TERRAIN.CACTUS) return "#15803d";

  if (terrain === TERRAIN.SNOW) return "#e2e8f0";
  if (terrain === TERRAIN.ICE) return "#7dd3fc";
  if (terrain === TERRAIN.FROST) return "#bae6fd";

  return "#1e293b";
}

function drawMoney(px, py, tileSize, value) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(cx, cy, tileSize * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#713f12";
  ctx.font = `${Math.max(10, tileSize * 0.18)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(value), cx, cy);
}

function drawHeal(px, py, tileSize) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;
  const size = tileSize * 0.26;

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(cx - size / 2, cy - size * 1.5, size, size * 3);
  ctx.fillRect(cx - size * 1.5, cy - size / 2, size * 3, size);
}

function drawEnemy(px, py, tileSize) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(cx, cy, tileSize * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(cx - tileSize * 0.08, cy - tileSize * 0.05, tileSize * 0.035, 0, Math.PI * 2);
  ctx.arc(cx + tileSize * 0.08, cy - tileSize * 0.05, tileSize * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

function drawItem(px, py, tileSize) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;

  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(cx, cy, tileSize * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.max(12, tileSize * 0.22)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", cx, cy);
}

function drawPlayer(tileSize) {
  const cx = player.x * tileSize + tileSize / 2;
  const cy = player.y * tileSize + tileSize / 2;
  const radius = tileSize * 0.3;

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

function drawWorldMap() {
  const viewSize = 7;
  const center = Math.floor(viewSize / 2);
  const cellSize = canvas.width / viewSize;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < viewSize; row += 1) {
    for (let col = 0; col < viewSize; col += 1) {
      const mapX = player.mapX + (col - center);
      const mapY = player.mapY + (row - center);
      const key = getMapKey(mapX, mapY);
      const map = world[key];

      const px = col * cellSize;
      const py = row * cellSize;

      ctx.fillStyle = map ? getMapPreviewColor(map) : "#111827";
      ctx.fillRect(px + 4, py + 4, cellSize - 8, cellSize - 8);

      ctx.strokeStyle = mapX === player.mapX && mapY === player.mapY
        ? "#f97316"
        : "rgba(148, 163, 184, 0.5)";
      ctx.lineWidth = mapX === player.mapX && mapY === player.mapY ? 4 : 2;
      ctx.strokeRect(px + 4, py + 4, cellSize - 8, cellSize - 8);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (mapX === player.mapX && mapY === player.mapY) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.max(18, cellSize * 0.28)}px sans-serif`;
        ctx.fillText("나", px + cellSize / 2, py + cellSize / 2);
      } else if (!map) {
        ctx.fillStyle = "#64748b";
        ctx.font = `${Math.max(18, cellSize * 0.34)}px sans-serif`;
        ctx.fillText("?", px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("방문한 맵은 대표 지형 색으로 표시됩니다.", canvas.width / 2, canvas.height - 10);
}

function getMapPreviewColor(map) {
  const counts = new Map();

  for (const row of map.tiles) {
    for (const tile of row) {
      counts.set(tile.terrain, (counts.get(tile.terrain) ?? 0) + 1);
    }
  }

  let mainTerrain = TERRAIN.FLOOR;
  let maxCount = 0;

  counts.forEach((count, terrain) => {
    if (count > maxCount) {
      mainTerrain = terrain;
      maxCount = count;
    }
  });

  return getTerrainColor(mainTerrain);
}

function updateInfo() {
  const currentMap = getCurrentMap();
  const latestRule = getLatestRule(currentMap);

  mapInfoEl.textContent = `${player.mapX}, ${player.mapY}`;
  scoreInfoEl.textContent = hasRule("health")
    ? `점수 ${score} / 돈 ${money} / HP ${hp}`
    : `점수 ${score} / 돈 ${money}`;
  ruleCountInfoEl.textContent = `${activeRules.length}개`;

  if (!latestRule) {
    ruleIconEl.textContent = "▫️";
    ruleInfoEl.textContent = "기본 규칙";
    featureListEl.textContent = "아직 추가된 규칙이 없습니다.";
    return;
  }

  ruleIconEl.textContent = latestRule.icon;
  ruleInfoEl.textContent = latestRule.name;

  const names = activeRules.slice(-5).map((rule) => rule.name).join(", ");
  featureListEl.textContent = `${latestRule.description} / 최근 규칙: ${names}`;
}

function renderMenus() {
  if (!menuBarEl) return;

  const menus = [];

  if (hasRule("inventory_menu")) {
    menus.push({ label: "🎒 인벤토리", message: `공격 ${items.attack} / 벽파괴 ${items.wallBreaker} / 물신발 ${items.waterBoots ? "보유" : "없음"}` });
  }

  if (hasRule("map_menu")) {
    menus.push({
      label: isMapViewOpen ? "게임 화면" : "지도",
      action: () => {
        isMapViewOpen = !isMapViewOpen;
        messageEl.textContent = isMapViewOpen
          ? "지도 화면입니다. 현재 위치를 중심으로 주변 맵을 표시합니다."
          : "게임 화면으로 돌아왔습니다.";
        draw();
      }
    });
  }

  if (hasRule("shop_menu")) {
    menus.push({ label: "🏪 상점", message: `소지금 ${money}. 상점 기능은 다음 단계에서 확장합니다.` });
  }

  menuBarEl.innerHTML = "";

  menus.forEach((menu) => {
    const button = document.createElement("button");
    button.textContent = menu.label;
    button.addEventListener("click", () => {
      if (menu.action) {
        menu.action();
        return;
      }
    
      messageEl.textContent = menu.message;
    });
    menuBarEl.appendChild(button);
  });
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
