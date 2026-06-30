import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-bold italic tracking-tight">
          TripBuddy <span className="text-accent">AI</span>
        </Link>
        <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest">
          <Link
            to="/history"
            className="hidden text-foreground/70 transition-colors hover:text-accent sm:inline"
            activeProps={{ className: "text-accent" }}
          >
            History
          </Link>
          <Link
            to="/plan"
            className="rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:bg-accent"
          >
            Plan Outing
          </Link>
        </div>
      </div>
    </nav>
  );
}
