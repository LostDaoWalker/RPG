const db = require("./db");
const { LOCATIONS, MONSTERS, ITEMS, xpToLevel } = require("./data");

function getPlayer(name) {
  return db.prepare("SELECT * FROM players WHERE name = ?").get(name);
}

function createPlayer(name) {
  db.prepare("INSERT INTO players (name) VALUES (?)").run(name);
  return getPlayer(name);
}

function getOrCreate(name) {
  return getPlayer(name) || createPlayer(name);
}

function log(playerId, message) {
  db.prepare("INSERT INTO game_log (player_id, message) VALUES (?, ?)").run(playerId, message);
}

function getLogs(playerId, limit = 20) {
  return db
    .prepare("SELECT message, created_at FROM game_log WHERE player_id = ? ORDER BY id DESC LIMIT ?")
    .all(playerId, limit);
}

function getInventory(playerId) {
  return db.prepare("SELECT item_key, quantity FROM inventory WHERE player_id = ?").all(playerId);
}

function addItem(playerId, itemKey, qty = 1) {
  const row = db
    .prepare("SELECT id, quantity FROM inventory WHERE player_id = ? AND item_key = ?")
    .get(playerId, itemKey);
  if (row) {
    db.prepare("UPDATE inventory SET quantity = quantity + ? WHERE id = ?").run(qty, row.id);
  } else {
    db.prepare("INSERT INTO inventory (player_id, item_key, quantity) VALUES (?, ?, ?)").run(playerId, itemKey, qty);
  }
}

function removeItem(playerId, itemKey, qty = 1) {
  const row = db
    .prepare("SELECT id, quantity FROM inventory WHERE player_id = ? AND item_key = ?")
    .get(playerId, itemKey);
  if (!row || row.quantity < qty) return false;
  if (row.quantity === qty) {
    db.prepare("DELETE FROM inventory WHERE id = ?").run(row.id);
  } else {
    db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?").run(qty, row.id);
  }
  return true;
}

function checkLevelUp(player) {
  const needed = xpToLevel(player.level);
  if (player.xp < needed) return null;
  const newLevel = player.level + 1;
  const hpBonus = 15;
  const atkBonus = 3;
  const defBonus = 2;
  db.prepare(`
    UPDATE players
    SET level = ?, xp = xp - ?, max_hp = max_hp + ?, hp = min(hp + ?, max_hp + ?),
        attack = attack + ?, defense = defense + ?
    WHERE id = ?
  `).run(newLevel, needed, hpBonus, hpBonus, hpBonus, atkBonus, defBonus, player.id);
  log(player.id, `Leveled up to ${newLevel}! +${hpBonus} HP, +${atkBonus} ATK, +${defBonus} DEF`);
  return newLevel;
}

function explore(player) {
  const loc = LOCATIONS[player.location];
  if (!loc.monsters) return { error: "Nothing to fight here." };

  const monsterKey = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
  const template = MONSTERS[monsterKey];
  const monster = { ...template, currentHp: template.hp };
  const combatLog = [];
  let playerHp = player.hp;

  while (monster.currentHp > 0 && playerHp > 0) {
    const playerDmg = Math.max(1, player.attack - monster.defense + Math.floor(Math.random() * 5));
    monster.currentHp -= playerDmg;
    combatLog.push(`You deal ${playerDmg} damage to ${monster.name}.`);

    if (monster.currentHp <= 0) break;

    const monsterDmg = Math.max(1, monster.attack - player.defense + Math.floor(Math.random() * 5));
    playerHp -= monsterDmg;
    combatLog.push(`${monster.name} deals ${monsterDmg} damage to you.`);
  }

  const won = playerHp > 0;
  playerHp = Math.max(0, playerHp);

  if (won) {
    db.prepare("UPDATE players SET hp = ?, xp = xp + ?, gold = gold + ? WHERE id = ?").run(
      playerHp, template.xp, template.gold, player.id
    );
    combatLog.push(`Victory! +${template.xp} XP, +${template.gold} gold.`);
    log(player.id, `Defeated ${monster.name}: +${template.xp} XP, +${template.gold} gold`);

    const updated = getPlayer(player.name);
    const newLevel = checkLevelUp(updated);
    if (newLevel) combatLog.push(`Level up! You are now level ${newLevel}!`);
  } else {
    db.prepare("UPDATE players SET hp = 1, gold = max(0, gold - 10), location = 'town' WHERE id = ?").run(player.id);
    combatLog.push("You were defeated! Lost 10 gold. Returned to town with 1 HP.");
    log(player.id, `Defeated by ${monster.name}. Lost 10 gold.`);
  }

  return { monster: monster.name, won, combatLog, playerHp };
}

function rest(player) {
  if (player.location !== "town") return { error: "You can only rest in town." };
  const cost = 10;
  if (player.gold < cost) return { error: "Not enough gold (10g required)." };
  db.prepare("UPDATE players SET hp = max_hp, gold = gold - ? WHERE id = ?").run(cost, player.id);
  log(player.id, "Rested at the tavern. Full HP restored.");
  return { message: "You rest at the tavern. HP fully restored.", cost };
}

function travel(player, destination) {
  const loc = LOCATIONS[player.location];
  if (!loc.travel.includes(destination)) return { error: "Can't travel there from here." };
  db.prepare("UPDATE players SET location = ? WHERE id = ?").run(destination, player.id);
  log(player.id, `Traveled to ${LOCATIONS[destination].name}`);
  return { message: `Traveled to ${LOCATIONS[destination].name}.`, location: destination };
}

function buy(player, itemKey) {
  const item = ITEMS[itemKey];
  if (!item) return { error: "Unknown item." };
  if (player.location !== "town") return { error: "Shop is only in town." };
  if (player.gold < item.cost) return { error: `Not enough gold (${item.cost}g required).` };

  db.prepare("UPDATE players SET gold = gold - ? WHERE id = ?").run(item.cost, player.id);

  if (item.attack) {
    db.prepare("UPDATE players SET attack = attack + ? WHERE id = ?").run(item.attack, player.id);
    log(player.id, `Bought ${item.name}: +${item.attack} ATK`);
  } else if (item.defense) {
    db.prepare("UPDATE players SET defense = defense + ? WHERE id = ?").run(item.defense, player.id);
    log(player.id, `Bought ${item.name}: +${item.defense} DEF`);
  } else {
    addItem(player.id, itemKey);
    log(player.id, `Bought ${item.name}`);
  }

  return { message: `Bought ${item.name} for ${item.cost}g.` };
}

function useItem(player, itemKey) {
  const item = ITEMS[itemKey];
  if (!item || !item.heal) return { error: "Can't use that." };
  if (!removeItem(player.id, itemKey)) return { error: "You don't have that item." };
  const healed = Math.min(item.heal, player.max_hp - player.hp);
  db.prepare("UPDATE players SET hp = min(max_hp, hp + ?) WHERE id = ?").run(item.heal, player.id);
  log(player.id, `Used ${item.name}: +${healed} HP`);
  return { message: `Used ${item.name}. Restored ${healed} HP.` };
}

module.exports = { getOrCreate, getPlayer, getLogs, getInventory, explore, rest, travel, buy, useItem, LOCATIONS, ITEMS };
