const express = require("express");
const path = require("path");
const game = require("./game");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function playerMiddleware(req, res, next) {
  const name = req.headers["x-player-name"];
  if (!name) return res.status(400).json({ error: "Missing player name." });
  req.player = game.getOrCreate(name);
  next();
}

app.post("/api/login", (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 1 || name.trim().length > 20) {
    return res.status(400).json({ error: "Name must be 1-20 characters." });
  }
  const player = game.getOrCreate(name.trim());
  res.json({ player });
});

app.get("/api/status", playerMiddleware, (req, res) => {
  const player = game.getPlayer(req.player.name);
  const inventory = game.getInventory(player.id);
  const location = game.LOCATIONS[player.location];
  const logs = game.getLogs(player.id);
  res.json({ player, inventory, location, logs });
});

app.post("/api/explore", playerMiddleware, (req, res) => {
  const result = game.explore(req.player);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  res.json({ ...result, player });
});

app.post("/api/rest", playerMiddleware, (req, res) => {
  const result = game.rest(req.player);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  res.json({ ...result, player });
});

app.post("/api/travel", playerMiddleware, (req, res) => {
  const { destination } = req.body;
  const result = game.travel(req.player, destination);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  const location = game.LOCATIONS[player.location];
  res.json({ ...result, player, location });
});

app.post("/api/buy", playerMiddleware, (req, res) => {
  const { item } = req.body;
  const result = game.buy(req.player, item);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  const inventory = game.getInventory(player.id);
  res.json({ ...result, player, inventory });
});

app.post("/api/use", playerMiddleware, (req, res) => {
  const { item } = req.body;
  const result = game.useItem(req.player, item);
  if (result.error) return res.status(400).json(result);
  const player = game.getPlayer(req.player.name);
  const inventory = game.getInventory(player.id);
  res.json({ ...result, player, inventory });
});

app.get("/api/shop", playerMiddleware, (_req, res) => {
  res.json({ items: game.ITEMS });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RPG running on http://localhost:${PORT}`));
