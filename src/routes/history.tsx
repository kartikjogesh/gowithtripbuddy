import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SurpriseButton } from "@/components/SurpriseButton";
import { listTrips, toggleFavorite, deleteTrip } from "@/lib/storage";
import type { SavedTrip } from "@/lib/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "Trip History — TripBuddy AI" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [tab, setTab] = useState<"all" | "fav">("all");

  useEffect(() => {
    const load = () => setTrips(listTrips());
    load();
    window.addEventListener("tripbuddy:update", load);
    return () => window.removeEventListener("tripbuddy:update", load);
  }, []);

  const filtered = tab === "fav" ? trips.filter((t) => t.favorite) : trips;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl italic md:text-6xl">Your trips</h1>
            <p className="mt-2 text-muted-foreground">
              Saved on this device. {trips.length} trip{trips.length === 1 ? "" : "s"} so far.
            </p>
          </div>
          <Link
            to="/plan"
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground"
          >
            + New Trip
          </Link>
        </header>

        <div className="mb-8 flex gap-2 border-b border-border">
          {(["all", "fav"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-5 py-3 text-sm font-bold uppercase tracking-widest " +
                (tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground")
              }
            >
              {t === "all" ? "All" : "Favorites"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <div className="text-5xl">🗺️</div>
            <h2 className="mt-6 font-display text-3xl italic">
              {tab === "fav" ? "No favorites yet" : "Your next adventure is waiting!"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fill in your preferences and let AI plan the perfect outing.
            </p>
            <Link
              to="/plan"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest text-background"
            >
              Plan a trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="group relative flex flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-accent/40"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{t.input.people} people · ₹{t.plan.costPerPerson.toLocaleString("en-IN")}/pp
                </div>
                <Link to="/trip/$id" params={{ id: t.id }} className="mt-2">
                  <h3 className="font-display text-2xl italic group-hover:text-accent">
                    {t.plan.name}
                  </h3>
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.plan.theme}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    Fun {t.plan.funScore}/10
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(t.id)}
                      className="grid size-9 place-items-center rounded-full border border-border hover:border-accent hover:text-accent"
                      title="Favorite"
                    >
                      {t.favorite ? "♥" : "♡"}
                    </button>
                    <button
                      onClick={() => deleteTrip(t.id)}
                      className="grid size-9 place-items-center rounded-full border border-border hover:border-destructive hover:text-destructive"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SurpriseButton />
    </div>
  );
}
