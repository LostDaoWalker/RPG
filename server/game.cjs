const db = require("./db.cjs");
const { LOCATIONS, MONSTERS, ITEMS, XP_PER_LEVEL } = require("./data.cjs");

const stmts = {
  getPlayer: db.prepare("SELECT * FROM players WHERE name = ?"),
  createPlayer: db.prepare("INSERT INTO players (name) VALUES (?)"),
  addLog: db.prepare("INSERT INTO game_log (player_id, message) VALUES (?, ?)"),
  getLogs: db.prepare("SELECT message, created_at FROM game_log WHERE player_id = ? ORDER BY id DESC LIMIT ?"),
  getInventory: db.prepare("SELECT item_key, quantity FROM inventory WHERE player_id = ?"),
  getInvItem: db.prepare("SELECT id, quantity FROM inventory WHERE player_id = ? AND item_key = ?"),
  addInvItem: db.prepare("INSERT INTO inventory (player_id, item_key, quantity) VALUES (?, ?, ?)"),
  incInvItem: db.prepare("UPDATE inventory SET quantity = quantity + ? WHERE id = ?"),
  decInvItem: db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?"),
  delInvItem: db.prepare("DELETE FROM inventory WHERE id = ?"),
  setHpXpGold: db.prepare("UPDATE players SET hp = ?, xp = xp + ?, gold = gold + ? WHERE id = ?"),
  defeat: db.prepare("UPDATE players SET hp = 1, gold = max(0, gold - 10), location = 'town' WHERE id = ?"),
  levelUp: db.prepare(`UPDATE players SET level = ?, xp = xp - ?, max_hp = max_hp + ?, hp = min(hp + ?, max_hp + ?), attack = attack + ?, defense = defense + ? WHERE id = ?`),
  rest: db.prepare("UPDATE players SET hp = max_hp, gold = gold - ? WHERE id = ?"),
  travel: db.prepare("UPDATE players SET location = ? WHERE id = ?"),
  spendGold: db.prepare("UPDATE players SET gold = gold - ? WHERE id = ?"),
  addAttack: db.prepare("UPDATE players SET attack = attack + ? WHERE id = ?"),
  addDefense: db.prepare("UPDATE players SET defense = defense + ? WHERE id = ?"),
  heal: db.prepare("UPDATE players SET hp = min(max_hp, hp + ?) WHERE id = ?"),
};

function getPlayer(name) {
  return stmts.getPlayer.get(name);
}

function getOrCreate(name) {
  let p = getPlayer(name);
  if (!p) { stmts.createPlayer.run(name); p = getPlayer(name); }
  return p;
}

function log(pid, msg) { stmts.addLog.run(pid, msg); }
function getLogs(pid, limit = 20) { return stmts.getLogs.all(pid, limit); }
function getInventory(pid) { return stmts.getInventory.all(pid); }

function addItem(pid, key, qty = 1) {
  const row = stmts.getInvItem.get(pid, key);
  row ? stmts.incInvItem.run(qty, row.id) : stmts.addInvItem.run(pid, key, qty);
}

function removeItem(pid, key, qty = 1) {
  const row = stmts.getInvItem.get(pid, key);
  if (!row || row.quantity < qty) return false;
  row.quantity === qty ? stmts.delInvItem.run(row.id) : stmts.decInvItem.run(qty, row.id);
  return true;
}

function checkLevelUp(player) {
  const needed = player.level * XP_PER_LEVEL;
  if (player.xp < needed) return null;
  const nl = player.level + 1;
  stmts.levelUp.run(nl, needed, 15, 15, 15, 3, 2, player.id);
  log(player.id, `Leveled up to ${nl}! +15 HP, +3 ATK, +2 DEF`);
  return nl;
}

function explore(player) {
  const loc = LOCATIONS[player.location];
  if (!loc.monsters) return { error: "Nothing to fight here." };

  const key = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
  const t = MONSTERS[key];
  let mHp = t.hp;
  let pHp = player.hp;
  const combatLog = [];

  while (mHp > 0 && pHp > 0) {
    const pd = Math.max(1, player.attack - t.defense + Math.floor(Math.random() * 5));
    mHp -= pd;
    combatLog.push(`You deal ${pd} damage to ${t.name}.`);
    if (mHp <= 0) break;
    const md = Math.max(1, t.attack - player.defense + Math.floor(Math.random() * 5));
    pHp -= md;
    combatLog.push(`${t.name} deals ${md} damage to you.`);
  }

  const won = pHp > 0;
  pHp = Math.max(0, pHp);

  if (won) {
    stmts.setHpXpGold.run(pHp, t.xp, t.gold, player.id);
    combatLog.push(`Victory! +${t.xp} XP, +${t.gold} gold.`);
    log(player.id, `Defeated ${t.name}: +${t.xp} XP, +${t.gold} gold`);
    const updated = getPlayer(player.name);
    const nl = checkLevelUp(updated);
    if (nl) combatLog.push(`Level up! Now level ${nl}!`);
  } else {
    stmts.defeat.run(player.id);
    combatLog.push("Defeated! Lost 10 gold. Returned to town with 1 HP.");
    log(player.id, `Defeated by ${t.name}. Lost 10 gold.`);
  }

  return { monster: t.name, won, combatLog };
}

function rest(player) {
  if (player.location !== "town") return { error: "Rest only in town." };
  if (player.gold < 10) return { error: "Need 10 gold to rest." };
  stmts.rest.run(10, player.id);
  log(player.id, "Rested at tavern. Full HP.");
  return { message: "Rested at the tavern. HP fully restored." };
}

function travel(player, dest) {
  const loc = LOCATIONS[player.location];
  if (!loc.travel.includes(dest)) return { error: "Can't travel there." };
  stmts.travel.run(dest, player.id);
  log(player.id, `Traveled to ${LOCATIONS[dest].name}`);
  return { message: `Traveled to ${LOCATIONS[dest].name}.` };
}

function buy(player, itemKey) {
  const item = ITEMS[itemKey];
  if (!item) return { error: "Unknown item." };
  if (player.location !== "town") return { error: "Shop only in town." };
  if (player.gold < item.cost) return { error: `Need ${item.cost} gold.` };

  stmts.spendGold.run(item.cost, player.id);
  if (item.attack) { stmts.addAttack.run(item.attack, player.id); log(player.id, `Bought ${item.name}: +${item.attack} ATK`); }
  else if (item.defense) { stmts.addDefense.run(item.defense, player.id); log(player.id, `Bought ${item.name}: +${item.defense} DEF`); }
  else { addItem(player.id, itemKey); log(player.id, `Bought ${item.name}`); }

  return { message: `Bought ${item.name} for ${item.cost}g.` };
}

function useItem(player, itemKey) {
  const item = ITEMS[itemKey];
  if (!item || !item.heal) return { error: "Can't use that." };
  if (!removeItem(player.id, itemKey)) return { error: "Don't have that." };
  stmts.heal.run(item.heal, player.id);
  log(player.id, `Used ${item.name}`);
  return { message: `Used ${item.name}. Restored up to ${item.heal} HP.` };
}

module.exports = { getOrCreate, getPlayer, getLogs, getInventory, explore, rest, travel, buy, useItem, LOCATIONS, ITEMS };
