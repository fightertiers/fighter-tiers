export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Tier {
  id: string;
  category_id: string;
  name: string;
  color: string;
  glow_class: string;
  display_order: number;
  description?: string;
}

export interface Player {
  id: string;
  username: string;
  uuid?: string;
  country?: string;
  avatar_url?: string;
  notes?: string;
  created_at: string;
}

export interface PlayerTier {
  id: string;
  player_id: string;
  tier_id: string;
  category_id: string;
  ranked_at: string;
}

export interface TestHistory {
  id: string;
  player_id: string;
  category_id: string;
  tier_id: string;
  notes?: string;
  tested_at: string;
}

export interface AppState {
  categories: Category[];
  tiers: Tier[];
  players: Player[];
  playerTiers: PlayerTier[];
  testHistory: TestHistory[];
}
