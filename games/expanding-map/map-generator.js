export const TILE = {
  FLOOR: "floor",
  WALL: "wall",
  WATER: "water",
  COIN: "coin",
  HEAL: "heal"
};

export const VIEW_SIZE = 5;

export const rulePool = [
  {
    id: "walls",
    name: "벽 규칙",
    icon: "🧱",
    description: "일부 칸에 벽이 나타납니다. 벽은 통과할 수 없습니다."
  },
  {
    id: "water",
    name: "물 규칙",
    icon: "💧",
    description: "일부 칸에 물이 나타납니다. 아직은 통과할 수 있습니다."
  },
  {
    id: "coins",
    name: "코인 규칙",
    icon: "🪙",
    description: "맵 곳곳에 코인이 나타납니다."
  },
  {
    id: "heal",
    name: "회복 규칙",
    icon: "💚",
    description: "초록색 회복 타일이 나타납니다. 아직 체력 시스템은 없습니다."
  }
];

export function createStartMap() {
  return createMap({
    x: 0,
    y: 0,
    activeRules: [],
    newlyAddedRule: null
  });
}

export function pickNewRule(activeRules) {
  const activeIds = new Set(activeRules.map((rule) => rule.id));
  const candidates = rulePool.filter((rule) => !activeIds.has(rule.id));

  if (candidates.length === 0) return null;

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

export function createMap({ x, y, activeRules, newlyAddedRule }) {
  const tiles = createFloorTiles();

  activeRules.forEach((rule) => {
    applyRuleToMap({
      tiles,
      rule,
      x,
      y
    });
  });

  return {
    x,
    y,
    newlyAddedRuleId: newlyAddedRule?.id ?? null,
    activeRuleIds: activeRules.map((rule) => rule.id),
    tiles
  };
}

function createFloorTiles() {
  return Array.from({ length: VIEW_SIZE }, () =>
    Array.from({ length: VIEW_SIZE }, () => ({
      type: TILE.FLOOR,
      collected: false
    }))
  );
}

function applyRuleToMap({ tiles, rule, x, y }) {
  const center = Math.floor(VIEW_SIZE / 2);

  for (let row = 0; row < VIEW_SIZE; row += 1) {
    for (let col = 0; col < VIEW_SIZE; col += 1) {
      const isCenter = row === center && col === center;
      if (isCenter) continue;

      const tile = tiles[row][col];
      const seed = seededValue(x, y, row, col, rule.id);

      if (rule.id === "walls") {
        if (tile.type === TILE.FLOOR && seed < 16) {
          tile.type = TILE.WALL;
        }
      }

      if (rule.id === "water") {
        if (tile.type === TILE.FLOOR && seed >= 16 && seed < 34) {
          tile.type = TILE.WATER;
        }
      }

      if (rule.id === "coins") {
        if (tile.type === TILE.FLOOR && seed >= 34 && seed < 50) {
          tile.type = TILE.COIN;
        }
      }

      if (rule.id === "heal") {
        if (tile.type === TILE.FLOOR && seed >= 50 && seed < 60) {
          tile.type = TILE.HEAL;
        }
      }
    }
  }
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
