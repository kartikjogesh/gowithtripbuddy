export interface TripInput {
  budget: number;
  people: number;
  location: string;
  destination?: string;
  date: string;
  duration: string;
  motives: string[];
  transport: string;
  personality?: string;
  preferences?: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  description: string;
}

export interface CostBreakdown {
  travel: number;
  food: number;
  tickets: number;
  shopping: number;
  misc: number;
}

export interface AlternativePlan {
  tier: "budget" | "value" | "premium";
  title: string;
  costPerPerson: number;
  description: string;
  activities: string[];
  transport: string;
  duration: string;
}

export interface TripPlan {
  name: string;
  theme: string;
  totalBudget: number;
  costPerPerson: number;
  distanceKm: number;
  travelTime: string;
  bestTimeToLeave: string;
  difficulty: string;
  funScore: number;
  itinerary: ItineraryStop[];
  costs: CostBreakdown;
  transportReason: string;
  packingList: string[];
  tips: string[];
  alternatives: AlternativePlan[];
}

export interface SavedTrip {
  id: string;
  createdAt: number;
  input: TripInput;
  plan: TripPlan;
  favorite?: boolean;
}
