export interface Spell {
  id: string;
  name: string;
  school: string;
  subschool?: string;
  descriptor?: string;
  level: SpellLevel;
  components: string;
  castingTime: string;
  range: string;
  target?: string;
  area?: string;
  effect?: string;
  duration: string;
  savingThrow: string;
  spellResistance: string;
  description: string;
  materialComponent?: string;
  focus?: string;
  arcaneFocus?: string;
  arcaneMaterialComponent?: string;
  xpCost?: string;
  homebrew?: boolean;
  source?: string;
}

export interface SpellLevel {
  [className: string]: number;
}

export type CharacterClass =
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Paladin"
  | "Ranger"
  | "Sorcerer"
  | "Wizard";

export const ALL_CLASSES: CharacterClass[] = [
  "Bard",
  "Cleric",
  "Druid",
  "Paladin",
  "Ranger",
  "Sorcerer",
  "Wizard",
];

export interface SavedSpellbook {
  id: string;
  name: string;
  characterClass: CharacterClass | null;
  selectedSpells: string[];
  spellSlots?: { [level: number]: number };
  createdAt: string;
  updatedAt: string;
}
