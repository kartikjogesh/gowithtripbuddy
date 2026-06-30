import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { generateTrip } from "@/lib/trip.functions";
import { saveTrip } from "@/lib/storage";
import { toast } from "sonner";

export function SurpriseButton() {
  const navigate = useNavigate();
  const fn = useServerFn(generateTrip);
  const [loading, setLoading] = useState(false);

  async function onSurprise() {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const plan = await fn({
        data: {
          budget: 1500,
          people: 4,
          location: "my city",
          date: today,
          duration: "Full Day",
          motives: [],
          transport: "AI Suggest",
          surprise: true,
        },
      });
      const id = crypto.randomUUID();
      saveTrip({
        id,
        createdAt: Date.now(),
        input: {
          budget: 1500,
          people: 4,
          location: "my city",
          date: today,
          duration: "Full Day",
          motives: [],
          transport: "AI Suggest",
        },
        plan,
      });
      navigate({ to: "/trip/$id", params: { id } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not surprise you";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onSurprise}
      disabled={loading}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lift transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
    >
      <span className="text-2xl transition-transform group-hover:rotate-12">
        {loading ? "✨" : "🎲"}
      </span>
      <div className="text-left">
        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          {loading ? "Conjuring..." : "Surprise Me"}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {loading ? "Hold tight" : "Quick decision?"}
        </div>
      </div>
    </button>
  );
}
