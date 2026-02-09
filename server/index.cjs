const express = require("express");
const path = require("path");
const game = require("./game.cjs");

const app = express();
const STATIC_DIR = path.resolve(__dirname, "..", "dist", "public");

app.use(express.json());
app.use(express.static(STATIC_DIR));

function auth(req, res, next) {
  const name = req.headers["x-player-name"];
  if (!name) return res.status(400).json({ error: "Missing player name." });
  req.player = game.getOrCreate(name);
  next();
}

app.post("/api/login", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 1 || name.trim().length > 20)
    return res.status(400).json({ error: "Name: 1-20 chars." });
  res.json({ player: game.getOrCreate(name.trim()) });
});

app.get("/api/status", auth, (req, res) => {
  const player = game.getPlayer(req.player.name);
  res.json({
    player,
    inventory: game.getInventory(player.id),
    location: game.LOCATIONS[player.location],
    logs: game.getLogs(player.id),
  });
});

app.post("/api/explore", auth, (req, res) => {
  const result = game.explore(req.player);
  if (result.error) return res.status(400).json(result);
  res.json({ ...result, player: game.getPlayer(req.player.name) });
});

app.post("/api/rest", auth, (req, res) => {
  const result = game.rest(req.player);
  if (result.error) return res.status(400).json(result);
  res.json({ ...result, player: game.getPlayer(req.player.name) });
});

app.post("/api/travel", auth, (req, res) => {
  const result = game.travel(req.player, req.body.destination);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  res.json({ ...result, player, location: game.LOCATIONS[player.location] });
});

app.post("/api/buy", auth, (req, res) => {
  const result = game.buy(req.player, req.body.item);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  res.json({ ...result, player, inventory: game.getInventory(player.id) });
});

app.post("/api/use", auth, (req, res) => {
  const result = game.useItem(req.player, req.body.item);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  res.json({ ...result, player, inventory: game.getInventory(player.id) });
});

app.get("/api/shop", auth, (_req, res) => {
  res.json({ items: game.ITEMS });
});

// SPA fallback
app.use((_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RPG running on http://localhost:${PORT}`));
