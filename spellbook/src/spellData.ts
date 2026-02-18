import type { Spell } from "./types";
import { HOMEBREW_SPELLS } from "./homebrewSpells";
import { SRD_SPELLS } from "./srdSpellsGenerated";

// Combine SRD spells (527 spells from the d20 SRD) with homebrew spells
export const SPELLS: Spell[] = [...SRD_SPELLS, ...HOMEBREW_SPELLS];
