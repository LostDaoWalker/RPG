export interface Player {
  id: number;
  name: string;
  hp: number;
  max_hp: number;
  attack: number;
  defense: number;
  xp: number;
  level: number;
  gold: number;
  location: string;
}

export interface Location {
  name: string;
  description: string;
  actions: string[];
  monsters: string[] | null;
  travel: string[];
}

export interface InventoryItem {
  item_key: string;
  quantity: number;
}

export interface LogEntry {
  message: string;
  created_at: string;
}

export interface ShopItem {
  name: string;
  cost: number;
  description: string;
  heal?: number;
  attack?: number;
  defense?: number;
}

export interface GameState {
  player: Player;
  inventory: InventoryItem[];
  location: Location;
  logs: LogEntry[];
}
