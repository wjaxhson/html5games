export const MIN_MAP_SIZE = 5;
export const MAX_MAP_SIZE = 10;

export const TERRAIN = {
  FLOOR: "floor",
  GRASS: "grass",
  TALL_GRASS: "tall_grass",
  FLOWER: "flower",
  WATER: "water",
  DEEP_WATER: "deep_water",
  REED: "reed",
  DESERT: "desert",
  DUNE: "dune",
  CACTUS: "cactus",
  SNOW: "snow",
  ICE: "ice",
  FROST: "frost",
  WALL: "wall"
};

export const OBJECT = {
  NONE: "none",
  COIN: "coin",
  HEAL: "heal",
  ENEMY: "enemy",
  ITEM: "item"
};

export const BIOME = {
  PLAIN: "plain",
  GRASS: "grass",
  WATER: "water",
  DESERT: "desert",
  SNOW: "snow"
};

export const techTree = [
  { id: "size_6", name: "6x6 확장", icon: "⬛", description: "새로 생성되는 맵이 최대 6x6까지 커질 수 있습니다.", requires: [] },
  { id: "size_7", name: "7x7 확장", icon: "⬛", description: "새로 생성되는 맵이 최대 7x7까지 커질 수 있습니다.", requires: ["size_6"] },
  { id: "size_8", name: "8x8 확장", icon: "⬛", description: "새로 생성되는 맵이 최대 8x8까지 커질 수 있습니다.", requires: ["size_7"] },
  { id: "size_9", name: "9x9 확장", icon: "⬛", description: "새로 생성되는 맵이 최대 9x9까지 커질 수 있습니다.", requires: ["size_8"] },
  { id: "size_10", name: "10x10 확장", icon: "⬛", description: "새로 생성되는 맵이 최대 10x10까지 커질 수 있습니다.", requires: ["size_9"] },

  { id: "score_1", name: "+1 점수 아이템", icon: "🪙", description: "+1 코인이 등장합니다.", requires: [] },
  { id: "score_2", name: "+2 점수 아이템", icon: "🪙", description: "+2 코인이 등장합니다.", requires: ["score_1"] },
  { id: "score_3", name: "+3 점수 아이템", icon: "🪙", description: "+3 코인이 등장합니다.", requires: ["score_2"] },
  { id: "score_4", name: "+4 점수 아이템", icon: "🪙", description: "+4 코인이 등장합니다.", requires: ["score_3"] },
  { id: "score_5", name: "+5 점수 아이템", icon: "🪙", description: "+5 코인이 등장합니다.", requires: ["score_4"] },
  { id: "score_6", name: "+6 점수 아이템", icon: "🪙", description: "+6 코인이 등장합니다.", requires: ["score_5"] },
  { id: "score_7", name: "+7 점수 아이템", icon: "🪙", description: "+7 코인이 등장합니다.", requires: ["score_6"] },
  { id: "score_8", name: "+8 점수 아이템", icon: "🪙", description: "+8 코인이 등장합니다.", requires: ["score_7"] },
  { id: "score_9", name: "+9 점수 아이템", icon: "🪙", description: "+9 코인이 등장합니다.", requires: ["score_8"] },
  { id: "score_10", name: "+10 점수 아이템", icon: "🪙", description: "+10 코인이 등장합니다.", requires: ["score_9"] },

  { id: "grass_biome", name: "잔디 지형", icon: "🌿", description: "잔디 지형이 등장합니다.", requires: [] },
  { id: "tall_grass", name: "긴 풀", icon: "🌾", description: "긴 풀이 등장합니다.", requires: ["grass_biome"] },
  { id: "flower_field", name: "꽃밭", icon: "🌼", description: "꽃밭 지형이 등장합니다.", requires: ["tall_grass"] },

  { id: "water_biome", name: "물 지형", icon: "💧", description: "물 지형이 등장합니다.", requires: [] },
  { id: "deep_water", name: "깊은 물", icon: "🌊", description: "깊은 물이 등장합니다.", requires: ["water_biome"] },
  { id: "reed_field", name: "갈대밭", icon: "🪷", description: "물가에 갈대밭이 등장합니다.", requires: ["deep_water"] },

  { id: "desert_biome", name: "사막 지형", icon: "🏜️", description: "사막 지형이 등장합니다.", requires: [] },
  { id: "sand_dune", name: "모래 언덕", icon: "⛰️", description: "모래 언덕이 등장합니다.", requires: ["desert_biome"] },
  { id: "cactus_field", name: "선인장", icon: "🌵", description: "선인장이 등장합니다.", requires: ["sand_dune"] },

  { id: "snow_biome", name: "설원 지형", icon: "❄️", description: "설원 지형이 등장합니다.", requires: [] },
  { id: "ice_floor", name: "빙판", icon: "🧊", description: "빙판 지형이 등장합니다.", requires: ["snow_biome"] },
  { id: "frost_field", name: "서리 지대", icon: "🌨️", description: "서리 지대가 등장합니다.", requires: ["ice_floor"] },

  { id: "health", name: "체력 규칙", icon: "❤️", description: "체력이 생기고 회복 타일이 등장합니다.", requires: ["score_1"] },

  { id: "grass_enemy_1", name: "잔디 적: 슬라임", icon: "🟢", description: "잔디 지형에 약한 적이 등장합니다.", requires: ["health", "grass_biome"] },
  { id: "water_enemy_1", name: "물 적: 물방울", icon: "🔵", description: "물 지형에 약한 적이 등장합니다.", requires: ["health", "water_biome"] },
  { id: "desert_enemy_1", name: "사막 적: 모래벌레", icon: "🟠", description: "사막 지형에 약한 적이 등장합니다.", requires: ["health", "desert_biome"] },
  { id: "snow_enemy_1", name: "설원 적: 눈덩이", icon: "⚪", description: "설원 지형에 약한 적이 등장합니다.", requires: ["health", "snow_biome"] },

  { id: "attack_item", name: "공격 아이템", icon: "⚔️", description: "적을 공격할 수 있는 아이템이 등장합니다.", requires: ["health"] },
  { id: "water_boots", name: "물 건너기 아이템", icon: "🥾", description: "물을 쉽게 건널 수 있는 아이템이 등장합니다.", requires: ["water_biome"] },
  { id: "wall_breaker", name: "벽 파괴 아이템", icon: "🔨", description: "벽을 뚫는 아이템이 등장합니다.", requires: ["size_6"] }
];

export const rulePool = techTree;

export function createStartMap() {
  return createMap({
    x: 0,
    y: 0,
    activeRules: [],
    newlyAddedRule: null,
    fromBiome: BIOME.PLAIN
  });
}

export function pickNewRule(activeRules) {
  const activeIds = new Set(activeRules.map((rule) => rule.id));

  const candidates = techTree.filter((rule) => {
    if (activeIds.has(rule.id)) return false;
    return rule.requires.every((requiredId) => activeIds.has(requiredId));
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function createMap({ x, y, activeRules, newlyAddedRule, fromBiome = BIOME.PLAIN }) {
  const size = getMapSize(activeRules);
  const biomeInfo = pickBiomeInfo(activeRules, fromBiome, x, y);
  const tiles = createTiles(size, biomeInfo, activeRules, x, y);

  return {
    x,
    y,
    size,
    biome: biomeInfo.biome,
    secondaryBiome: biomeInfo.secondaryBiome,
    transitionRate: biomeInfo.transitionRate,
    newlyAddedRuleId: newlyAddedRule?.id ?? null,
    activeRuleIds: activeRules.map((rule) => rule.id),
    tiles
  };
}

function getMapSize(activeRules) {
  const ids = new Set(activeRules.map((rule) => rule.id));

  for (let size = MAX_MAP_SIZE; size >= MIN_MAP_SIZE; size -= 1) {
    if (ids.has(`size_${size}`)) return size;
  }

  return MIN_MAP_SIZE;
}

function pickBiomeInfo(activeRules, fromBiome, x, y) {
  const ids = new Set(activeRules.map((rule) => rule.id));
  const unlockedBiomes = [BIOME.PLAIN];

  if (ids.has("grass_biome")) unlockedBiomes.push(BIOME.GRASS);
  if (ids.has("water_biome")) unlockedBiomes.push(BIOME.WATER);
  if (ids.has("desert_biome")) unlockedBiomes.push(BIOME.DESERT);
  if (ids.has("snow_biome")) unlockedBiomes.push(BIOME.SNOW);

  if (unlockedBiomes.length === 1) {
    return {
      biome: BIOME.PLAIN,
      secondaryBiome: null,
      transitionRate: 0
    };
  }

  const changeChance = 28;
  const value = seededValue(x, y, 0, 0, "biome-change");

  if (value >= changeChance && unlockedBiomes.includes(fromBiome)) {
    return {
      biome: fromBiome,
      secondaryBiome: null,
      transitionRate: 0
    };
  }

  const candidates = unlockedBiomes.filter((biome) => biome !== fromBiome);
  const nextBiome = candidates[seededValue(x, y, 0, 1, "biome-pick") % candidates.length];

  return {
    biome: nextBiome,
    secondaryBiome: fromBiome,
    transitionRate: 35
  };
}

function createTiles(size, biomeInfo, activeRules, mapX, mapY) {
  const tiles = [];

  for (let row = 0; row < size; row += 1) {
    const line = [];

    for (let col = 0; col < size; col += 1) {
      const baseBiome = pickTileBiome(biomeInfo, mapX, mapY, row, col);
      line.push({
        terrain: terrainFromBiome(baseBiome, activeRules, mapX, mapY, row, col),
        object: OBJECT.NONE,
        scoreValue: 0,
        enemyType: null,
        enemyHp: 0,
        collected: false
      });
    }

    tiles.push(line);
  }

  applyObjects(tiles, activeRules, mapX, mapY);

  const center = Math.floor(size / 2);
  tiles[center][center] = {
    terrain: TERRAIN.FLOOR,
    object: OBJECT.NONE,
    scoreValue: 0,
    enemyType: null,
    enemyHp: 0,
    collected: false
  };

  return tiles;
}

function pickTileBiome(biomeInfo, mapX, mapY, row, col) {
  if (!biomeInfo.secondaryBiome) return biomeInfo.biome;

  const value = seededValue(mapX, mapY, row, col, "transition");

  if (value < biomeInfo.transitionRate) {
    return biomeInfo.secondaryBiome;
  }

  return biomeInfo.biome;
}

function terrainFromBiome(biome, activeRules, mapX, mapY, row, col) {
  const ids = new Set(activeRules.map((rule) => rule.id));
  const value = seededValue(mapX, mapY, row, col, "terrain-detail");

  if (biome === BIOME.GRASS) {
    if (ids.has("flower_field") && value < 10) return TERRAIN.FLOWER;
    if (ids.has("tall_grass") && value < 28) return TERRAIN.TALL_GRASS;
    return TERRAIN.GRASS;
  }

  if (biome === BIOME.WATER) {
    if (ids.has("reed_field") && value < 12) return TERRAIN.REED;
    if (ids.has("deep_water") && value < 30) return TERRAIN.DEEP_WATER;
    return TERRAIN.WATER;
  }

  if (biome === BIOME.DESERT) {
    if (ids.has("cactus_field") && value < 10) return TERRAIN.CACTUS;
    if (ids.has("sand_dune") && value < 30) return TERRAIN.DUNE;
    return TERRAIN.DESERT;
  }

  if (biome === BIOME.SNOW) {
    if (ids.has("frost_field") && value < 12) return TERRAIN.FROST;
    if (ids.has("ice_floor") && value < 30) return TERRAIN.ICE;
    return TERRAIN.SNOW;
  }

  if (value < 8) return TERRAIN.WALL;

  return TERRAIN.FLOOR;
}

function applyObjects(tiles, activeRules, mapX, mapY) {
  const ids = new Set(activeRules.map((rule) => rule.id));
  const size = tiles.length;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const tile = tiles[row][col];
      if (tile.terrain === TERRAIN.WALL) continue;

      const objectValue = seededValue(mapX, mapY, row, col, "object");

      const maxScore = getMaxScoreValue(ids);
      if (maxScore > 0 && objectValue < 12) {
        tile.object = OBJECT.COIN;
        tile.scoreValue = 1 + (seededValue(mapX, mapY, row, col, "coin-value") % maxScore);
        continue;
      }

      if (ids.has("health") && objectValue >= 12 && objectValue < 17) {
        tile.object = OBJECT.HEAL;
        continue;
      }

      if (canPlaceEnemy(tile, ids) && objectValue >= 17 && objectValue < 24) {
        const enemy = getEnemyForTerrain(tile.terrain, ids);
        if (enemy) {
          tile.object = OBJECT.ENEMY;
          tile.enemyType = enemy.type;
          tile.enemyHp = enemy.hp;
        }
        continue;
      }

      if (canPlaceItem(ids) && objectValue >= 24 && objectValue < 28) {
        tile.object = OBJECT.ITEM;
      }
    }
  }
}

function getMaxScoreValue(ids) {
  for (let score = 10; score >= 1; score -= 1) {
    if (ids.has(`score_${score}`)) return score;
  }

  return 0;
}

function canPlaceEnemy(tile, ids) {
  if (!ids.has("health")) return false;
  return Boolean(getEnemyForTerrain(tile.terrain, ids));
}

function getEnemyForTerrain(terrain, ids) {
  if ([TERRAIN.GRASS, TERRAIN.TALL_GRASS, TERRAIN.FLOWER].includes(terrain) && ids.has("grass_enemy_1")) {
    return { type: "grass_slime", hp: 1 };
  }

  if ([TERRAIN.WATER, TERRAIN.DEEP_WATER, TERRAIN.REED].includes(terrain) && ids.has("water_enemy_1")) {
    return { type: "water_drop", hp: 1 };
  }

  if ([TERRAIN.DESERT, TERRAIN.DUNE, TERRAIN.CACTUS].includes(terrain) && ids.has("desert_enemy_1")) {
    return { type: "sand_worm", hp: 1 };
  }

  if ([TERRAIN.SNOW, TERRAIN.ICE, TERRAIN.FROST].includes(terrain) && ids.has("snow_enemy_1")) {
    return { type: "snow_ball", hp: 1 };
  }

  return null;
}

function canPlaceItem(ids) {
  return ids.has("attack_item") || ids.has("water_boots") || ids.has("wall_breaker");
}

function seededValue(x, y, row, col, salt) {
  let hash = 2166136261;
  const text = `${x},${y},${row},${col},${salt}`;

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return Math.abs(hash) % 100;
}
