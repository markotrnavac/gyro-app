export interface GyroType {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export interface Side {
  id: string;
  label: string;
  emoji: string;
}

export const GYRO_TYPES: GyroType[] = [
  { id: "classic", label: "Classic",  description: "Lamb & Beef",             emoji: "🥙" },
  { id: "chicken", label: "Chicken",  description: "Marinated Chicken",       emoji: "🍗" },
  { id: "pork",    label: "Pork",     description: "Seasoned Pork",           emoji: "🐷" },
  { id: "mixed",   label: "Mixed",    description: "Lamb, Beef & Pork",       emoji: "🌯" },
  { id: "veggie",  label: "Veggie",   description: "Grilled Vegetables",      emoji: "🥦" },
];

export const SIDES: Side[] = [
  { id: "fries",           label: "Fries",          emoji: "🍟" },
  { id: "greek_salad",     label: "Greek Salad",    emoji: "🥗" },
  { id: "rice",            label: "Rice",           emoji: "🍚" },
  { id: "extra_tzatziki",  label: "Extra Tzatziki", emoji: "🥣" },
  { id: "pita",            label: "Extra Pita",     emoji: "🫓" },
];

export const GYRO_LABELS: Record<string, string> = Object.fromEntries(
  GYRO_TYPES.map(g => [g.id, g.label])
);

export const SIDE_LABELS: Record<string, string> = Object.fromEntries(
  SIDES.map(s => [s.id, s.label])
);
