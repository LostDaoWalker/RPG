let playerName = "";

export function setPlayerName(name: string) {
  playerName = name;
}

export function getPlayerName() {
  return playerName;
}

async function request<T>(url: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    headers: { "x-player-name": playerName, "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    opts.method = "POST";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  login: (name: string) => request<{ player: unknown }>("/api/login", { name }),
  status: () => request<unknown>("/api/status"),
  explore: () => request<unknown>("/api/explore", {}),
  rest: () => request<unknown>("/api/rest", {}),
  travel: (destination: string) => request<unknown>("/api/travel", { destination }),
  buy: (item: string) => request<unknown>("/api/buy", { item }),
  use: (item: string) => request<unknown>("/api/use", { item }),
  shop: () => request<{ items: Record<string, unknown> }>("/api/shop"),
};
