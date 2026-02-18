import type { Spell } from "../src/types";

/**
 * Arcane School Homebrew Spells
 *
 * Custom spells for arcane casters (Wizards, Sorcerers, Bards)
 */

export const spells: Spell[] = [
  {
    id: "arcane-mark-enhanced",
    name: "Arcane Mark, Enhanced",
    school: "Universal",
    level: { Sorcerer: 1, Wizard: 1 },
    components: "V, S, M",
    castingTime: "1 standard action",
    range: "Touch",
    effect: "One personal rune or mark, up to 6 sq. ft. in area",
    duration: "Permanent",
    savingThrow: "None",
    spellResistance: "No",
    description:
      "This enhanced version of arcane mark allows you to inscribe a personal rune or mark that glows faintly (providing light equivalent to a candle) when you are within 30 feet. The mark can be visible or invisible, and you can choose to make it glow in a specific color. You can sense the direction and approximate distance (near, far, very far) to your mark as long as you are on the same plane. The mark can be placed on any creature or object and cannot be dispelled, though it can be removed by the caster or by erase.",
    materialComponent: "A pinch of diamond dust worth 10 gp.",
    homebrew: true,
  },
];
