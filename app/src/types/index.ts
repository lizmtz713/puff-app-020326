export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isPro: boolean;
}

export type StrainType = 'sativa' | 'indica' | 'hybrid';
export type ConsumptionMethod = 'smoke' | 'vape' | 'edible' | 'tincture' | 'topical' | 'dab';

export interface Strain {
  id: string;
  userId: string;
  name: string;
  type: StrainType;
  thcPercent?: number;
  cbdPercent?: number;
  rating: 1 | 2 | 3 | 4 | 5;
  effects: string[];
  notes?: string;
  photoUrl?: string;
  dispensary?: string;
  price?: number;
  purchaseDate?: Date;
  favorite: boolean;
  wouldBuyAgain: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  strainId: string;
  strainName: string;
  method: ConsumptionMethod;
  amount?: string;
  moodBefore: 1 | 2 | 3 | 4 | 5;
  moodAfter?: 1 | 2 | 3 | 4 | 5;
  effects: string[];
  duration?: number; // minutes
  notes?: string;
  createdAt: Date;
}

export interface Dispensary {
  id: string;
  userId: string;
  name: string;
  address?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: Date;
}

export const STRAIN_TYPES: Record<StrainType, { label: string; color: string; emoji: string }> = {
  sativa: { label: 'Sativa', color: '#F59E0B', emoji: '☀️' },
  indica: { label: 'Indica', color: '#8B5CF6', emoji: '🌙' },
  hybrid: { label: 'Hybrid', color: '#10B981', emoji: '🌿' },
};

export const EFFECTS = [
  'Relaxed', 'Happy', 'Euphoric', 'Creative', 'Focused',
  'Energetic', 'Uplifted', 'Sleepy', 'Hungry', 'Talkative',
  'Giggly', 'Pain Relief', 'Stress Relief', 'Anxiety Relief',
  'Aroused', 'Tingly', 'Dry Mouth', 'Dry Eyes', 'Paranoid', 'Dizzy'
];

export const METHODS: Record<ConsumptionMethod, { label: string; emoji: string }> = {
  smoke: { label: 'Smoke', emoji: '🚬' },
  vape: { label: 'Vape', emoji: '💨' },
  edible: { label: 'Edible', emoji: '🍪' },
  tincture: { label: 'Tincture', emoji: '💧' },
  topical: { label: 'Topical', emoji: '🧴' },
  dab: { label: 'Dab', emoji: '🔥' },
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄',
};
