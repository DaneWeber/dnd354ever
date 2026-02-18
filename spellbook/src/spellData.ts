import type { Spell } from "./types";
import { HOMEBREW_SPELLS } from "./homebrewSpellsGenerated";
import { SRD_SPELLS } from "./srdSpellsGenerated";

// Combine SRD spells with homebrew spells parsed from markdown
export const SPELLS: Spell[] = [...SRD_SPELLS, ...HOMEBREW_SPELLS];
