import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { SurpriseButton } from "@/components/SurpriseButton";
import { generateTrip } from "@/lib/trip.functions";
import { saveTrip } from "@/lib/storage";
import type { TripInput } from "@/lib/types";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan a Trip — TripBuddy AI" },
      { name: "description", content: "Set your budget, vibe and group — TripBuddy AI builds the rest." },
    ],
  }),
  component: PlanPage,
});

const MOTIVES = [
  { v: "Food", i: "🍔" },
  { v: "Trekking", i: "🥾" },
  { v: "Nature", i: "🌿" },
  { v: "Cafe Hopping", i: "☕" },
  { v: "Movies", i: "🎬" },
  { v: "Bowling", i: "🎳" },
  { v: "Shopping", i: "🛍" },
  { v: "Gaming", i: "🎮" },
  { v: "Long Drive", i: "🚗" },
  { v: "Photography", i: "📷" },
  { v: "Beach", i: "🏖" },
  { v: "Party", i: "🎉" },
  { v: "Camping", i: "🏕" },
];

const TRANSPORT = ["Car", "Bike", "Train", "Metro", "Bus", "Cab", "Walking", "AI Suggest"];
const DURATIONS = ["2 Hours", "Half Day", "Full Day", "Weekend"];
const PERSONALITIES = ["Adventurous", "Food Lovers", "Chill Group", "Nature Lovers", "Party Group", "Family Friendly"];

const LOADING_MSGS = [
  "Finding amazing places...",
  "Calculating the best budget...",
  "Planning your adventure...",
  "Searching hidden gems...",
  "Almost done...",
];

function PlanPage() {
  const navigate = useNavigate();
  const fn = useServerFn(generateTrip);

  const [budget, setBudget] = useState(1500);
  const [people, setPeople] = useState(4);
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("Full Day");
  const [motives, setMotives] = useState<string[]>(["Food"]);
  const [transport, setTransport] = useState("AI Suggest");
  const [personality, setPersonality] = useState("");
  const [preferences, setPreferences] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);

  function toggleMotive(m: string) {
    setMotives((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function detectLocation() {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(`Lat ${pos.coords.latitude.toFixed(3)}, Lng ${pos.coords.longitude.toFixed(3)}`),
      () => toast.error("Couldn't get your location"),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim()) return toast.error("Please add your starting location");
    if (motives.length === 0) return toast.error("Pick at least one vibe");

    setLoading(true);
    let idx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const ticker = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
    }, 1800);

    const input: TripInput = {
      budget,
      people,
      location: location.trim(),
      destination: destination.trim() || undefined,
      date,
      duration,
      motives,
      transport,
      personality: personality || undefined,
      preferences: preferences.trim() || undefined,
    };

    try {
      const plan = await fn({ data: input });
      const id = crypto.randomUUID();
      saveTrip({ id, createdAt: Date.now(), input, plan });
      navigate({ to: "/trip/$id", params: { id } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Trip generation failed";
      toast.error(msg);
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
          <div className="relative mb-10 size-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-accent/20"></div>
            <div className="absolute inset-2 animate-pulse rounded-full bg-accent/40"></div>
            <div className="absolute inset-6 rounded-full bg-accent grid place-items-center text-3xl">
              ✨
            </div>
          </div>
          <h2 className="font-display text-4xl italic">{loadingMsg}</h2>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Our AI is curating your day
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10 text-center animate-unfold">
          <h1 className="font-display text-5xl italic md:text-6xl">Tell us your vibe.</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            The more you share, the sharper the plan. Skip anything optional.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-[2rem] border border-border bg-card p-6 shadow-soft md:p-10"
        >
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-8">
              <Field label="Budget per person">
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-border accent-accent"
                />
                <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
                  <span>₹500</span>
                  <span className="font-bold text-accent">
                    ₹{budget.toLocaleString("en-IN")}
                    {budget === 5000 ? "+" : ""}
                  </span>
                  <span>₹5,000+</span>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Travelers">
                  <div className="flex items-center rounded-lg border border-border px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setPeople((p) => Math.max(1, p - 1))}
                      className="px-2 text-lg hover:text-accent"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-semibold">{people}</span>
                    <button
                      type="button"
                      onClick={() => setPeople((p) => Math.min(30, p + 1))}
                      className="px-2 text-lg hover:text-accent"
                    >
                      +
                    </button>
                  </div>
                </Field>
                <Field label="Duration">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Outing Motive">
                <div className="flex flex-wrap gap-2">
                  {MOTIVES.map((m) => {
                    const active = motives.includes(m.v);
                    return (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => toggleMotive(m.v)}
                        className={
                          "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors " +
                          (active
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-border hover:border-accent")
                        }
                      >
                        <span>{m.i}</span> {m.v}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Mode of Transport">
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTransport(t)}
                      className={
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
                        (transport === t
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-accent")
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="space-y-8">
              <Field label="Starting Location">
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mumbai, MH"
                    className="w-full border-b border-border bg-transparent py-2 pr-16 font-medium outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="absolute right-0 top-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                  >
                    Detect
                  </button>
                </div>
              </Field>

              <Field label="Destination (Optional)">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Leave blank if AI should choose"
                  className="w-full border-b border-border bg-transparent py-2 font-medium outline-none focus:border-accent"
                />
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Group Personality (Optional)">
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITIES.map((p) => (
                    <label
                      key={p}
                      className={
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors " +
                        (personality === p ? "border-accent bg-accent/5" : "border-border hover:border-accent")
                      }
                    >
                      <input
                        type="radio"
                        name="pers"
                        checked={personality === p}
                        onChange={() => setPersonality(p)}
                        className="accent-accent"
                      />
                      <span className="font-medium">{p}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Additional Preferences (Optional)">
                <textarea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  rows={3}
                  placeholder="e.g. vegetarian, pet friendly, avoid crowds"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="mt-10 w-full rounded-2xl bg-accent py-5 font-display text-xl font-bold italic text-accent-foreground shadow-lift transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Generate My Trip →
          </button>
        </form>
      </div>

      <SurpriseButton />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
