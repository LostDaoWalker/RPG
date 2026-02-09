import type { Location } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Props {
  location: Location;
  onExplore: () => void;
  onRest: () => void;
  onTravel: (dest: string) => void;
  busy: boolean;
}

export function LocationPanel({ location, onExplore, onRest, onTravel, busy }: Props) {
  return (
    <Card className="h-full rounded-none border-0 border-r border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-gold flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {location.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted text-sm">{location.description}</p>

        <div className="flex flex-col gap-2">
          {location.monsters && (
            <Button variant="outline" size="sm" onClick={onExplore} disabled={busy} className="justify-start">
              Explore (Fight)
            </Button>
          )}
          {location.actions.includes("rest") && (
            <Button variant="outline" size="sm" onClick={onRest} disabled={busy} className="justify-start">
              Rest at Tavern (10g)
            </Button>
          )}
        </div>

        <div className="mt-2">
          <h4 className="text-xs text-muted mb-2 uppercase tracking-wider">Travel</h4>
          <div className="flex flex-col gap-1.5">
            {location.travel.map((dest) => (
              <Button
                key={dest}
                variant="ghost"
                size="sm"
                onClick={() => onTravel(dest)}
                disabled={busy}
                className="justify-start capitalize"
              >
                {dest.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
