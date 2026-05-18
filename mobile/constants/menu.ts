export interface GyroType {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export interface Size {
  id: string;
  label: string;
  emoji: string;
}

export interface Side {
  id: string;
  label: string;
  emoji: string;
}

export const GYRO_TYPES: GyroType[] = [
  { id: "chicken", label: "Chicken", description: "Marinated Chicken", emoji: "🍗" },
  { id: "pork",    label: "Pork",    description: "Seasoned Pork",     emoji: "🐷" },
  { id: "mixed",   label: "Mixed",   description: "Chicken & Pork",    emoji: "🌯" },
];

export const SIZES: Size[] = [
  { id: "small", label: "Small", emoji: "🤏" },
  { id: "big",   label: "Big",   emoji: "👐" },
  { id: "box",   label: "Box",   emoji: "📦" },
];

export const SIDES: Side[] = [
  { id: "tzatziki", label: "Tzatziki", emoji: "🥣" },
  { id: "tomato",   label: "Tomato",   emoji: "🍅" },
  { id: "onions",   label: "Onions",   emoji: "🧅" },
  { id: "salad",    label: "Salad",    emoji: "🥗" },
  { id: "ketchup",  label: "Ketchup",  emoji: "🟥" },
  { id: "mayo",     label: "Mayo",     emoji: "🫙" },
  { id: "mustard",  label: "Mustard",  emoji: "🟡" },
];

export const GYRO_LABELS: Record<string, string> = Object.fromEntries(
  GYRO_TYPES.map(g => [g.id, g.label])
);

export const SIZE_LABELS: Record<string, string> = Object.fromEntries(
  SIZES.map(s => [s.id, s.label])
);

export const SIZE_EMOJIS: Record<string, string> = Object.fromEntries(
  SIZES.map(s => [s.id, s.emoji])
);

export const SIDE_LABELS: Record<string, string> = Object.fromEntries(
  SIDES.map(s => [s.id, s.label])
);
