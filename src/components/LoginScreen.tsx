import { useState, type FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onLogin: (name: string) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) onLogin(trimmed);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-72">
        <CardHeader>
          <CardTitle className="text-center text-gold text-2xl">RPG</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
            />
            <Button type="submit" variant="gold">Play</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
