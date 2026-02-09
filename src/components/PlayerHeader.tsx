import type { Player } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Coins } from "lucide-react";

interface Props {
  player: Player;
}

export function PlayerHeader({ player }: Props) {
  const xpNeeded = player.level * 100;

  return (
    <div className="flex items-center gap-4 flex-wrap p-3 border-b border-border bg-surface">
      <span className="text-gold font-bold text-lg">{player.name}</span>
      <Badge variant="default">Lv {player.level}</Badge>

      <div className="flex items-center gap-1.5">
        <span className="text-hp text-xs">HP</span>
        <Progress
          value={player.hp}
          max={player.max_hp}
          label={`${player.hp}/${player.max_hp}`}
          barClass="bg-hp"
          className="w-28"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xp text-xs">XP</span>
        <Progress
          value={player.xp}
          max={xpNeeded}
          label={`${player.xp}/${xpNeeded}`}
          barClass="bg-xp"
          className="w-28"
        />
      </div>

      <div className="flex items-center gap-1 text-sm">
        <Sword className="w-3.5 h-3.5 text-muted" />
        <span className="text-gold">{player.attack}</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Shield className="w-3.5 h-3.5 text-muted" />
        <span className="text-gold">{player.defense}</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Coins className="w-3.5 h-3.5 text-gold" />
        <span className="text-gold">{player.gold}</span>
      </div>
    </div>
  );
}
