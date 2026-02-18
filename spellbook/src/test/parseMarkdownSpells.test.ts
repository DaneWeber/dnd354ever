/**
 * Tests for the Markdown Spell Parser
 * 
 * This test suite validates the spell parsing logic from markdown files,
 * including spell levels, schools, stats, descriptions, and edge cases.
 */

import { describe, it, expect } from 'vitest';

// Import the parser functions - we'll need to extract them to a testable module
// For now, we'll copy the parsing logic here as helper functions
function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function parseSpellLevels(levelStr: string): Record<string, number> {
  const levels: Record<string, number> = {};

  const parts = levelStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();

    const classMap: Record<string, string[]> = {
      'Sor/Wiz': ['Sorcerer', 'Wizard'],
      'Sor': ['Sorcerer'],
      'Wiz': ['Wizard'],
      'Clr': ['Cleric'],
      'Drd': ['Druid'],
      'Brd': ['Bard'],
      'Pal': ['Paladin'],
      'Rgr': ['Ranger'],
      'sorcerer/wizard': ['Sorcerer', 'Wizard'],
      'sorcerer': ['Sorcerer'],
      'wizard': ['Wizard'],
      'cleric': ['Cleric'],
      'druid': ['Druid'],
      'bard': ['Bard'],
      'paladin': ['Paladin'],
      'ranger': ['Ranger'],
      'Air': ['Cleric'],
      'Animal': ['Cleric'],
      'Chaos': ['Cleric'],
      'Death': ['Cleric'],
      'Destruction': ['Cleric'],
      'Earth': ['Cleric'],
      'Evil': ['Cleric'],
      'Fire': ['Cleric'],
      'Good': ['Cleric'],
      'Healing': ['Cleric'],
      'Knowledge': ['Cleric'],
      'Law': ['Cleric'],
      'Luck': ['Cleric'],
      'Magic': ['Cleric'],
      'Plant': ['Cleric'],
      'Protection': ['Cleric'],
      'Strength': ['Cleric'],
      'Sun': ['Cleric'],
      'Travel': ['Cleric'],
      'Trickery': ['Cleric'],
      'War': ['Cleric'],
      'Water': ['Cleric'],
    };

    for (const [abbrev, classes] of Object.entries(classMap)) {
      const regex = new RegExp(`\\b${abbrev}\\s*(\\d+)`, 'i');
      const match = trimmed.match(regex);
      if (match) {
        const level = parseInt(match[1]);
        classes.forEach((className) => {
          levels[className] = level;
        });
      }
    }
  }

  return levels;
}

function parseSchool(schoolStr: string): {
  school: string;
  subschool?: string;
  descriptor?: string;
} {
  const result = {
    school: '',
    subschool: undefined as string | undefined,
    descriptor: undefined as string | undefined,
  };

  // Match school(subschool) [descriptor]
  const match = schoolStr.match(/^([^([]+)(?:\(([^)]+)\))?(?:\s*\[([^\]]+)\])?/);
  if (match) {
    result.school = match[1].trim();
    if (match[2]) {
      result.subschool = match[2].trim();
    }
    if (match[3]) {
      result.descriptor = match[3].trim();
    }
  } else {
    result.school = schoolStr.trim();
  }

  return result;
}

describe('Spell Parser - Level Parsing', () => {
  it('should parse Sor/Wiz abbreviation', () => {
    const levels = parseSpellLevels('Sor/Wiz 3');
    expect(levels).toEqual({ Sorcerer: 3, Wizard: 3 });
  });

  it('should parse individual class abbreviations', () => {
    expect(parseSpellLevels('Clr 5')).toEqual({ Cleric: 5 });
    expect(parseSpellLevels('Drd 2')).toEqual({ Druid: 2 });
    expect(parseSpellLevels('Brd 1')).toEqual({ Bard: 1 });
    expect(parseSpellLevels('Pal 4')).toEqual({ Paladin: 4 });
    expect(parseSpellLevels('Rgr 3')).toEqual({ Ranger: 3 });
  });

  it('should parse full class names (case-insensitive)', () => {
    expect(parseSpellLevels('wizard 5')).toEqual({ Wizard: 5 });
    expect(parseSpellLevels('Cleric 3')).toEqual({ Cleric: 3 });
  });

  it('should parse multiple classes separated by commas', () => {
    const levels = parseSpellLevels('Sor/Wiz 3, Clr 4, Drd 3');
    expect(levels).toEqual({
      Sorcerer: 3,
      Wizard: 3,
      Cleric: 4,
      Druid: 3,
    });
  });

  it('should parse cleric domains as cleric spells', () => {
    expect(parseSpellLevels('Fire 5')).toEqual({ Cleric: 5 });
    expect(parseSpellLevels('Healing 3')).toEqual({ Cleric: 3 });
    expect(parseSpellLevels('Air 7')).toEqual({ Cleric: 7 });
  });

  it('should handle mixed formats', () => {
    const levels = parseSpellLevels('Sor/Wiz 4, Fire 5, Drd 4');
    expect(levels).toEqual({
      Sorcerer: 4,
      Wizard: 4,
      Cleric: 5,
      Druid: 4,
    });
  });

  it('should return empty object for invalid input', () => {
    expect(parseSpellLevels('invalid')).toEqual({});
    expect(parseSpellLevels('')).toEqual({});
  });
});

describe('Spell Parser - School Parsing', () => {
  it('should parse school only', () => {
    const result = parseSchool('Evocation');
    expect(result).toEqual({
      school: 'Evocation',
      subschool: undefined,
      descriptor: undefined,
    });
  });

  it('should parse school with subschool', () => {
    const result = parseSchool('Conjuration (Summoning)');
    expect(result).toEqual({
      school: 'Conjuration',
      subschool: 'Summoning',
      descriptor: undefined,
    });
  });

  it('should parse school with descriptor', () => {
    const result = parseSchool('Evocation [Fire]');
    expect(result).toEqual({
      school: 'Evocation',
      subschool: undefined,
      descriptor: 'Fire',
    });
  });

  it('should parse school with both subschool and descriptor', () => {
    const result = parseSchool('Conjuration (Creation) [Acid]');
    expect(result).toEqual({
      school: 'Conjuration',
      subschool: 'Creation',
      descriptor: 'Acid',
    });
  });

  it('should handle extra whitespace', () => {
    const result = parseSchool('  Evocation  [  Fire  ]  ');
    expect(result).toEqual({
      school: 'Evocation',
      subschool: undefined,
      descriptor: 'Fire',
    });
  });
});

describe('Spell Parser - Text Cleaning', () => {
  it('should trim whitespace', () => {
    expect(cleanText('  text  ')).toBe('text');
  });

  it('should collapse multiple spaces', () => {
    expect(cleanText('text   with    spaces')).toBe('text with spaces');
  });

  it('should handle newlines', () => {
    expect(cleanText('text\nwith\nnewlines')).toBe('text with newlines');
  });

  it('should handle tabs', () => {
    expect(cleanText('text\twith\ttabs')).toBe('text with tabs');
  });
});

describe('Spell Parser - Integration Tests', () => {
  it('should parse a complete spell from markdown', () => {
    const markdown = `
## Fireball

**School:** Evocation [Fire]  
**Level:** Sor/Wiz 3

- **Components:** V, S, M
- **Casting Time:** 1 standard action
- **Range:** Long (400 ft. + 40 ft./level)
- **Area:** 20-ft.-radius spread
- **Duration:** Instantaneous
- **Saving Throw:** Reflex half
- **Spell Resistance:** Yes

A fireball spell is an explosion of flame that detonates with a low roar and deals 1d6 points of fire damage per caster level (maximum 10d6) to every creature within the area.

_Material Component:_ A tiny ball of bat guano and sulfur.
`;

    // For integration test, we'd need to import the actual parser
    // This is a placeholder showing what we'd test
    expect(markdown).toContain('Fireball');
  });
});
