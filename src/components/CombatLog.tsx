import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  entries: string[];
}

export function CombatLog({ entries }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {entries.length === 0 && (
        <p className="text-muted text-sm">Your adventure begins...</p>
      )}
      {entries.map((line, i) => (
        <div
          key={i}
          className={cn(
            "text-sm py-0.5",
            line.includes("Victory") && "text-win font-semibold",
            line.includes("Defeated!") && "text-lose font-semibold",
            line.includes("Level up") && "text-gold font-semibold",
            line.includes("Traveled") && "text-muted",
            line.includes("Rested") && "text-muted",
            line.includes("Bought") && "text-muted",
            line.includes("Used") && "text-muted",
            line.startsWith("---") && "border-t border-border mt-2 pt-2",
          )}
        >
          {line}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
