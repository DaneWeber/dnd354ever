import type { Spell } from "./types";

/**
 * Homebrew Spells Loader
 *
 * This file automatically imports all homebrew spell files from the ../spells-homebrew directory.
 * Each file in that directory should export a "spells" array containing Spell objects.
 *
 * To add homebrew spells:
 * 1. Create a new .ts file in the spells-homebrew/ directory (e.g., my-spells.ts)
 * 2. Export a "spells" array from that file
 * 3. Add your spell objects to the array with homebrew: true
 * 4. The spells will automatically be loaded into the app
 *
 * Example file structure (spells-homebrew/my-spells.ts):
 *
 * import type { Spell } from '../src/types';
 *
 * export const spells: Spell[] = [
 *   {
 *     id: 'my-spell',
 *     name: 'My Spell',
 *     school: 'Evocation',
 *     level: { 'Wizard': 1 },
 *     components: 'V, S',
 *     castingTime: '1 standard action',
 *     range: 'Close (25 ft. + 5 ft./2 levels)',
 *     target: 'One creature',
 *     duration: 'Instantaneous',
 *     savingThrow: 'None',
 *     spellResistance: 'Yes',
 *     description: 'Description of your spell...',
 *     homebrew: true
 *   }
 * ];
 */

// Dynamically import all .ts files from the spells-homebrew directory
const homebrewModules = import.meta.glob("../spells-homebrew/*.ts", {
  eager: true,
});

// Collect all spells from all homebrew modules
const allHomebrewSpells: Spell[] = [];

for (const path in homebrewModules) {
  const module = homebrewModules[path] as { spells?: Spell[] };
  if (module.spells && Array.isArray(module.spells)) {
    allHomebrewSpells.push(...module.spells);
  }
}

export const HOMEBREW_SPELLS: Spell[] = allHomebrewSpells;

/**
 * Template for creating a new homebrew spell file:
 *
 * File: spells-homebrew/your-spells.ts
 *
 * import type { Spell } from '../src/types';
 *
 * export const spells: Spell[] = [
 *   {
 *     id: 'unique-spell-id',
 *     name: 'Spell Name',
 *     school: 'Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation|Universal',
 *     subschool?: 'Optional subschool',
 *     descriptor?: 'Fire, Cold, Acid, etc.',
 *     level: { 'Bard': 0, 'Cleric': 1, 'Druid': 2, 'Paladin': 3, 'Ranger': 4, 'Sorcerer': 5, 'Wizard': 6 },
 *     components: 'V, S, M, F, DF, XP',
 *     castingTime: '1 standard action',
 *     range: 'Personal|Touch|Close|Medium|Long',
 *     target?: 'Creature touched',
 *     area?: '20-ft. radius',
 *     effect?: 'One object',
 *     duration: 'Instantaneous|1 round/level|Permanent',
 *     savingThrow: 'None|Will negates|Reflex half|Fortitude negates',
 *     spellResistance: 'Yes|No|Yes (harmless)',
 *     description: 'Full description of what the spell does...',
 *     materialComponent?: 'Description of material component',
 *     focus?: 'Description of focus',
 *     arcaneFocus?: 'Description of arcane focus',
 *     arcaneMaterialComponent?: 'Description of arcane material component',
 *     homebrew: true
 *   }
 * ];
 */
