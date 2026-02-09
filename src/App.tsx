import { useState, useEffect, useCallback } from "react";
import { api, setPlayerName, getPlayerName } from "@/lib/api";
import type { Player, Location, InventoryItem, ShopItem } from "@/lib/types";
import { LoginScreen } from "@/components/LoginScreen";
import { PlayerHeader } from "@/components/PlayerHeader";
import { LocationPanel } from "@/components/LocationPanel";
import { CombatLog } from "@/components/CombatLog";
import { InventoryPanel } from "@/components/InventoryPanel";

export function App() {
  const [loggedIn, setLoggedIn] = useState(!!getPlayerName());
  const [player, setPlayer] = useState<Player | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shop, setShop] = useState<Record<string, ShopItem> | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const addLines = useCallback((...lines: string[]) => {
    setLog((prev) => [...prev, "---", ...lines]);
  }, []);

  const refresh = useCallback(async () => {
    const data = (await api.status()) as {
      player: Player;
      inventory: InventoryItem[];
      location: Location;
      logs: { message: string }[];
    };
    setPlayer(data.player);
    setLocation(data.location);
    setInventory(data.inventory);
    if (data.player.location === "town") {
      const s = await api.shop();
      setShop(s.items as unknown as Record<string, ShopItem>);
    } else {
      setShop(null);
    }
    if (log.length === 0) {
      setLog(data.logs.reverse().map((l) => l.message));
    }
  }, [log.length]);

  useEffect(() => {
    if (loggedIn) refresh();
  }, [loggedIn, refresh]);

  async function handleLogin(name: string) {
    setPlayerName(name);
    await api.login(name);
    setLoggedIn(true);
  }

  async function act<T>(fn: () => Promise<T>, extract: (data: T) => string[]) {
    setBusy(true);
    try {
      const data = await fn();
      const d = data as T & { player?: Player; inventory?: InventoryItem[]; location?: Location };
      if (d.player) setPlayer(d.player);
      if (d.inventory) setInventory(d.inventory);
      if (d.location) setLocation(d.location);
      addLines(...extract(data));
      if (d.player?.location === "town") {
        const s = await api.shop();
        setShop(s.items as unknown as Record<string, ShopItem>);
      } else {
        setShop(null);
      }
    } catch (e) {
      addLines((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;
  if (!player || !location) return <div className="flex items-center justify-center h-screen text-muted">Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <PlayerHeader player={player} />
      <div className="flex-1 grid grid-cols-[240px_1fr_240px] min-h-0">
        <LocationPanel
          location={location}
          busy={busy}
          onExplore={() =>
            act(api.explore, (d: unknown) => {
              const data = d as { combatLog: string[] };
              return data.combatLog;
            })
          }
          onRest={() =>
            act(api.rest, (d: unknown) => {
              const data = d as { message: string };
              return [data.message];
            })
          }
          onTravel={(dest) =>
            act(
              () => api.travel(dest),
              (d: unknown) => {
                const data = d as { message: string };
                return [data.message];
              },
            )
          }
        />
        <CombatLog entries={log} />
        <InventoryPanel
          inventory={inventory}
          shop={shop}
          gold={player.gold}
          busy={busy}
          onUse={(item) =>
            act(
              () => api.use(item),
              (d: unknown) => {
                const data = d as { message: string };
                return [data.message];
              },
            )
          }
          onBuy={(item) =>
            act(
              () => api.buy(item),
              (d: unknown) => {
                const data = d as { message: string };
                return [data.message];
              },
            )
          }
        />
      </div>
    </div>
  );
}
