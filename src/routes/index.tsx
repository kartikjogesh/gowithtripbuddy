import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SurpriseButton } from "@/components/SurpriseButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripBuddy AI — Plan the Perfect Outing in Seconds" },
      {
        name: "description",
        content:
          "Ditch the group-chat indecision. TripBuddy AI weaves your budget, vibe, and location into a seamless day of discovery.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { n: "01", title: "AI Generated Itinerary", body: "Minute-by-minute routing for maximum fun." },
  { n: "02", title: "Budget Planning", body: "₹ Precision for every meal, ticket, and fuel stop." },
  { n: "03", title: "Smart Recommendations", body: "Hidden gems vetted by local insight." },
  { n: "04", title: "Group Personality Tuning", body: "Adventurous or chill? We match the tempo." },
  { n: "05", title: "Alternative Plans", body: "Budget, best-value and premium — switch anytime." },
  { n: "06", title: "Share & Save", body: "Favorite trips, share the plan, keep the memories." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="mx-auto max-w-5xl px-6 py-24 text-center animate-unfold">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-accent"></span>
          Powered by Lovable AI
        </div>
        <h1 className="text-balance font-display text-5xl font-bold italic leading-[0.95] md:text-7xl lg:text-8xl">
          Plan the Perfect Outing with{" "}
          <span className="text-accent">AI in Seconds.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-pretty text-lg text-muted-foreground">
          Ditch the group-chat indecision. TripBuddy AI weaves your budget, vibe, and location
          into a seamless day of discovery.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/plan"
            className="group inline-flex items-center gap-4 rounded-full bg-accent px-10 py-5 text-lg font-semibold text-accent-foreground transition-all hover:scale-105 active:scale-95"
          >
            <span>Plan My Trip</span>
            <span className="font-mono text-sm opacity-50 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center rounded-full border border-border bg-card px-8 py-5 text-base font-medium text-foreground transition-colors hover:border-accent/40"
          >
            My Trips
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              className="animate-unfold rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-accent/40"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="mb-4 font-mono text-xs text-accent">
                {f.n}. {f.title}
              </div>
              <p className="font-medium leading-snug text-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft md:p-16">
          <h2 className="font-display text-4xl italic md:text-5xl">
            Your next adventure is one click away.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Tell us the vibe. We'll handle the rest — from morning chai to sunset point.
          </p>
          <Link
            to="/plan"
            className="mt-8 inline-block rounded-full bg-foreground px-8 py-4 font-bold uppercase tracking-widest text-background transition-colors hover:bg-accent"
            style={{ fontSize: "0.75rem" }}
          >
            Start Planning →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center">
        <div className="font-display text-xl italic">TripBuddy AI</div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Made for adventure • {new Date().getFullYear()}
        </div>
      </footer>

      <SurpriseButton />
    </div>
  );
}
