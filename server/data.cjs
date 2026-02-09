const LOCATIONS = {
  town: {
    name: "Town",
    description: "A quiet village with a shop and a tavern.",
    actions: ["shop", "rest"],
    monsters: null,
    travel: ["forest", "caves"],
  },
  forest: {
    name: "Dark Forest",
    description: "Twisted trees block the sunlight. Creatures lurk.",
    actions: ["explore"],
    monsters: ["wolf", "bandit"],
    travel: ["town", "caves"],
  },
  caves: {
    name: "Crystal Caves",
    description: "Glowing crystals illuminate damp stone walls.",
    actions: ["explore"],
    monsters: ["bat_swarm", "goblin", "cave_troll"],
    travel: ["town", "forest"],
  },
};

const MONSTERS = {
  wolf: { name: "Wolf", hp: 30, attack: 8, defense: 2, xp: 15, gold: 5 },
  bandit: { name: "Bandit", hp: 45, attack: 12, defense: 4, xp: 25, gold: 15 },
  bat_swarm: { name: "Bat Swarm", hp: 20, attack: 6, defense: 1, xp: 10, gold: 3 },
  goblin: { name: "Goblin", hp: 35, attack: 10, defense: 3, xp: 20, gold: 12 },
  cave_troll: { name: "Cave Troll", hp: 80, attack: 18, defense: 8, xp: 50, gold: 30 },
};

const ITEMS = {
  potion: { name: "Health Potion", cost: 20, heal: 40, description: "Restores 40 HP" },
  iron_sword: { name: "Iron Sword", cost: 80, attack: 5, description: "+5 Attack" },
  leather_armor: { name: "Leather Armor", cost: 60, defense: 3, description: "+3 Defense" },
  steel_sword: { name: "Steel Sword", cost: 200, attack: 12, description: "+12 Attack" },
  chainmail: { name: "Chainmail", cost: 150, defense: 7, description: "+7 Defense" },
};

const XP_PER_LEVEL = 100;

module.exports = { LOCATIONS, MONSTERS, ITEMS, XP_PER_LEVEL };
