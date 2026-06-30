import type { SavedTrip } from "./types";

const KEY = "tripbuddy.trips.v1";

function read(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(trips: SavedTrip[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event("tripbuddy:update"));
}

export function listTrips(): SavedTrip[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getTrip(id: string): SavedTrip | undefined {
  return read().find((t) => t.id === id);
}

export function saveTrip(trip: SavedTrip) {
  const all = read().filter((t) => t.id !== trip.id);
  all.push(trip);
  write(all);
}

export function deleteTrip(id: string) {
  write(read().filter((t) => t.id !== id));
}

export function toggleFavorite(id: string) {
  const all = read();
  const t = all.find((x) => x.id === id);
  if (t) {
    t.favorite = !t.favorite;
    write(all);
  }
}
