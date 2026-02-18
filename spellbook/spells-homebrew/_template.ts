import type { Spell } from "../src/types";

/**
 * TEMPLATE FILE - Copy this file to create your own homebrew spells
 *
 * Steps:
 * 1. Copy this file and rename it (e.g., my-spells.ts)
 * 2. Add your spell objects to the spells array below
 * 3. Save the file - your spells will automatically load!
 *
 * You can have multiple spell files in this directory.
 */

export const spells: Spell[] = [
  // Uncomment and modify this template to add a spell:
  /*
  {
    id: 'unique-spell-id',
    name: 'Spell Name',
    school: 'Evocation', // Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation, Universal
    subschool: 'Optional', // e.g., Healing, Creation, Calling (optional)
    descriptor: 'Fire', // e.g., Fire, Cold, Acid, Electricity, Sonic, Evil, Good, Law, Chaos (optional)
    level: {
      // Add the classes that can cast this spell and at what level
      'Wizard': 3,
      'Sorcerer': 3,
      // Other options: 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'
    },
    components: 'V, S, M', // V=Verbal, S=Somatic, M=Material, F=Focus, DF=Divine Focus, XP=XP Cost
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)', // Personal, Touch, Close, Medium, Long, or specific
    target: 'One creature', // Use target, area, or effect (at least one required)
    // area: '20-ft.-radius burst',
    // effect: 'One summoned creature',
    duration: 'Instantaneous', // or '1 round/level', 'Concentration', 'Permanent', etc.
    savingThrow: 'Reflex half', // None, Will negates, Fortitude negates, Reflex half, etc.
    spellResistance: 'Yes', // Yes, No, or 'Yes (harmless)'
    description: 'Full description of what the spell does and its effects. Include damage, saving throw DCs, and any special rules or limitations.',
    materialComponent: 'A pinch of sulfur and bat guano.', // Optional: describe material components
    // focus: 'A small crystal sphere', // Optional: describe focus items
    // arcaneFocus: 'A wand', // Optional: arcane focus
    homebrew: true // Always set this to true for homebrew spells
  },
  */
];
