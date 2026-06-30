import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { SurpriseButton } from "@/components/SurpriseButton";
import { getTrip, toggleFavorite, deleteTrip } from "@/lib/storage";
import type { SavedTrip, AlternativePlan } from "@/lib/types";

export const Route = createFileRoute("/trip/$id")({
  head: () => ({
    meta: [{ title: "Your Trip — TripBuddy AI" }],
  }),
  component: TripPage,
});

function TripPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<SavedTrip | undefined>(undefined);
  const [activeAlt, setActiveAlt] = useState<string>("value");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTrip(getTrip(id));
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener("tripbuddy:update", onUpdate);
    return () => window.removeEventListener("tripbuddy:update", onUpdate);
  }, [id, tick]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto max-w-md px-6 py-32 text-center">
          <h2 className="font-display text-4xl italic">Trip not found</h2>
          <p className="mt-3 text-muted-foreground">It may have been deleted on this device.</p>
          <Link
            to="/plan"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground"
          >
            Plan a new trip
          </Link>
        </div>
      </div>
    );
  }

  const { plan, input } = trip;
  const totalCost = Object.values(plan.costs).reduce((a, b) => a + b, 0);

  const altMap: Record<string, AlternativePlan | undefined> = {
    budget: plan.alternatives.find((a) => a.tier === "budget"),
    value: plan.alternatives.find((a) => a.tier === "value"),
    premium: plan.alternatives.find((a) => a.tier === "premium"),
  };
  const activeAltPlan = altMap[activeAlt] ?? plan.alternatives[0];

  function onCopy() {
    const text = [
      `${plan.name} — ${plan.theme}`,
      `Budget: ₹${plan.totalBudget} (₹${plan.costPerPerson}/person)`,
      ``,
      `Itinerary:`,
      ...plan.itinerary.map((s) => `• ${s.time} — ${s.title}: ${s.description}`),
      ``,
      `Packing: ${plan.packingList.join(", ")}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Itinerary copied to clipboard");
  }

  function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: plan.name, text: plan.theme, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  function onDelete() {
    deleteTrip(id);
    toast.success("Trip deleted");
    navigate({ to: "/history" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-6xl px-6 py-10 animate-unfold">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {new Date(input.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
          {input.people} people · {input.duration}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-display text-5xl italic md:text-6xl">{plan.name}</h1>
            <p className="mt-2 text-muted-foreground">{plan.theme}</p>
          </div>
          <div className="flex gap-2">
            <IconButton onClick={() => toggleFavorite(id)} title="Favorite">
              {trip.favorite ? "♥" : "♡"}
            </IconButton>
            <IconButton onClick={onShare} title="Share">↗</IconButton>
            <IconButton onClick={onCopy} title="Copy">⧉</IconButton>
            <IconButton onClick={onDelete} title="Delete">✕</IconButton>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Cost / Person" value={`₹${plan.costPerPerson.toLocaleString("en-IN")}`} />
          <Stat label="Distance" value={`${plan.distanceKm} km`} />
          <Stat label="Travel Time" value={plan.travelTime} />
          <Stat label="Fun Score" value={`${plan.funScore}/10`} accent />
        </div>

        <div className="mt-12 flex flex-col gap-12 md:flex-row">
          {/* Itinerary */}
          <div className="flex-1">
            <SectionTitle>The Itinerary</SectionTitle>
            <div className="relative space-y-10 pt-4">
              <div className="absolute bottom-2 left-4 top-2 w-px bg-border"></div>
              {plan.itinerary.map((stop, i) => (
                <div key={i} className="relative pl-12">
                  <div
                    className={
                      "absolute left-2.5 top-1.5 size-3 rounded-full " +
                      (i === 0 ? "bg-accent" : "border border-accent bg-accent/30")
                    }
                  ></div>
                  <div className="font-mono text-xs text-muted-foreground">{stop.time}</div>
                  <h3 className="mt-1 text-lg font-bold">{stop.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{stop.description}</p>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-16">Important Tips</SectionTitle>
            <ul className="mt-4 space-y-3">
              {plan.tips.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <div className="w-full space-y-6 md:w-80">
            <div className="rounded-3xl bg-accent p-6 text-accent-foreground shadow-lift">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-widest opacity-70">
                Cost Per Person
              </div>
              <div className="font-display text-5xl italic">
                ₹{plan.costPerPerson.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs opacity-80">
                Total: ₹{plan.totalBudget.toLocaleString("en-IN")} · for {input.people}
              </div>

              <div className="mt-6 space-y-2 border-t border-white/20 pt-6 font-mono text-xs uppercase">
                <CostRow label="Travel" value={plan.costs.travel} />
                <CostRow label="Food" value={plan.costs.food} />
                <CostRow label="Tickets" value={plan.costs.tickets} />
                <CostRow label="Shopping" value={plan.costs.shopping} />
                <CostRow label="Misc" value={plan.costs.misc} />
                <div className="flex justify-between border-t border-white/20 pt-2 font-bold">
                  <span>Total</span>
                  <span>₹{totalCost.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Recommended Transport
              </div>
              <p className="text-sm text-foreground/90">{plan.transportReason}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Packing List
              </div>
              <ul className="space-y-3">
                {plan.packingList.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" className="size-4 accent-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Best Time to Leave
              </div>
              <div className="font-display text-2xl italic">{plan.bestTimeToLeave}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Difficulty: <span className="text-foreground">{plan.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="mt-20 border-t border-border pt-12">
          <SectionTitle>Not your vibe? Try an alternative.</SectionTitle>
          <div className="mt-6 flex gap-2 border-b border-border">
            {(["budget", "value", "premium"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveAlt(tier)}
                className={
                  "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors " +
                  (activeAlt === tier
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {tier === "budget" && "Budget"}
                {tier === "value" && "Best Value"}
                {tier === "premium" && "Premium"}
                {altMap[tier] && (
                  <span className="ml-2 font-mono text-[10px] opacity-70">
                    ₹{altMap[tier]!.costPerPerson.toLocaleString("en-IN")}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeAltPlan && (
            <div className="mt-8 grid gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-3">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                  ₹{activeAltPlan.costPerPerson.toLocaleString("en-IN")} / Person
                </div>
                <h3 className="font-display text-3xl italic">{activeAltPlan.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{activeAltPlan.description}</p>
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Main Activities
                    </div>
                    <ul className="space-y-1 text-sm">
                      {activeAltPlan.activities.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Travel Mode
                      </div>
                      <div className="mt-1 font-medium">{activeAltPlan.transport}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Duration
                      </div>
                      <div className="mt-1 font-medium">{activeAltPlan.duration}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-20 flex flex-wrap gap-3">
          <Link
            to="/plan"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:border-accent/40"
          >
            ← Plan another
          </Link>
          <Link
            to="/history"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:border-accent/40"
          >
            All trips
          </Link>
        </div>
      </div>

      <SurpriseButton />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (accent
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-card")
      }
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={"mt-1 font-display text-2xl italic " + (accent ? "text-accent" : "")}>{value}</div>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-80">{label}</span>
      <span>₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={"font-display text-3xl italic " + className}>{children}</h2>
  );
}

function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="grid size-10 place-items-center rounded-full border border-border bg-card text-base hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
