import type { InventoryItem, ShopItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Backpack, ShoppingBag } from "lucide-react";

interface Props {
  inventory: InventoryItem[];
  shop: Record<string, ShopItem> | null;
  gold: number;
  onUse: (item: string) => void;
  onBuy: (item: string) => void;
  busy: boolean;
}

export function InventoryPanel({ inventory, shop, gold, onUse, onBuy, busy }: Props) {
  return (
    <Card className="h-full rounded-none border-0 border-l border-border overflow-y-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Backpack className="w-4 h-4" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {inventory.length === 0 && <p className="text-muted text-xs">Empty</p>}
        {inventory.map((item) => (
          <div key={item.item_key} className="flex items-center justify-between text-sm">
            <span className="capitalize">{item.item_key.replace("_", " ")} x{item.quantity}</span>
            {item.item_key === "potion" && (
              <Button variant="ghost" size="sm" onClick={() => onUse(item.item_key)} disabled={busy} className="h-6 px-2 text-xs">
                Use
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      {shop && (
        <>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(shop).map(([key, item]) => (
              <div key={key} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-muted text-xs">{item.description}</span>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => onBuy(key)}
                  disabled={busy || gold < item.cost}
                  className="h-6 px-2 text-xs shrink-0"
                >
                  {item.cost}g
                </Button>
              </div>
            ))}
          </CardContent>
        </>
      )}
    </Card>
  );
}
