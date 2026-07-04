# Homebrew Spells

This directory contains homebrew spell files. Each `.ts` file in this directory can define one or more custom spells.

## How It Works

The application automatically discovers and loads all `.ts` files in this directory using Vite's `import.meta.glob` feature. You don't need to manually import or register your spell files - just add them to this folder and they'll appear in the app!

## File Structure

Each homebrew spell file should:

1. Import the `Spell` type from `../src/types`
2. Export a `spells` array containing your spell objects
3. Mark each spell with `homebrew: true`

### Example File

Create a new file like `spells-homebrew/my-custom-spells.ts`:

```typescript
import type { Spell } from '../src/types';

/**
 * My Custom Spells
 *
 * Description of this spell collection
 */

export const spells: Spell[] = [
  {
    id: 'my-awesome-spell',
    name: 'My Awesome Spell',
    school: 'Evocation',
    descriptor: 'Fire',
    level: { 'Wizard': 3, 'Sorcerer': 3 },
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    area: '20-ft.-radius burst',
    duration: 'Instantaneous',
    savingThrow: 'Reflex half',
    spellResistance: 'Yes',
    description: 'You unleash a burst of magical fire that deals 1d6 points of fire damage per caster level (maximum 10d6) to all creatures in the area.',
    materialComponent: 'A piece of sulfur.',
    homebrew: true
  },
  // Add more spells here...
];
```

## Converting from Markdown

If you have spells written in markdown format, you can convert them to TypeScript files automatically:

1. Create or update markdown files in `spells-homebrew/` with your spell definitions
2. Run the parser from the project root:
   ```bash
   npm run parse-spells
   # or
   pnpm parse-spells
   ```
3. The parser will generate `src/homebrewSpellsGenerated.ts` with all your spells

For markdown spell file structure, see the `spells-srd/srd-spells.md` file for examples.

## Included Example Files

### arcane-spells.ts
Contains homebrew spells for arcane casters (Wizards, Sorcerers, Bards):
- **Arcane Mark, Enhanced** (Sor/Wiz 1)

### divine-spells.ts
Contains homebrew spells for divine casters (Clerics, Druids, Paladins, Rangers):
- **Restore Vitality** (Clr/Drd/Pal 3)

## Adding New Spells

### Option 1: Add to Existing File

Open one of the existing files (like `arcane-spells.ts` or `divine-spells.ts`) and add new spell objects to the `spells` array.

### Option 2: Create New File

1. Create a new `.ts` file in this directory (e.g., `nature-spells.ts`)
2. Copy the file template from above
3. Add your spells to the `spells` array
4. Save the file
5. The spells will automatically appear in the app!

## Organizing Your Spells

You can organize spell files however you like:

- **By source**: `players-handbook-homebrew.ts`, `campaign-specific.ts`
- **By theme**: `nature-spells.ts`, `necromancy-spells.ts`, `utility-spells.ts`
- **By caster type**: `arcane-spells.ts`, `divine-spells.ts`, `bard-spells.ts`
- **By level**: `cantrips.ts`, `low-level.ts`, `high-level.ts`
- **By campaign**: `stormwind-campaign.ts`, `desert-adventure.ts`

## Required Spell Fields

Every spell must include:

- **id**: Unique identifier (lowercase-with-dashes)
- **name**: Display name
- **school**: One of: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation, Universal
- **level**: Object mapping class names to spell levels
- **components**: V, S, M, F, DF, XP (comma-separated)
- **castingTime**: How long it takes to cast
- **range**: Personal, Touch, Close, Medium, Long, or specific distance
- **duration**: How long the spell lasts
- **savingThrow**: Type of save required
- **spellResistance**: Yes, No, or Yes (harmless)
- **description**: Full text description
- **homebrew**: Must be `true`

At least one of these is also required:
- **target**: What can be targeted
- **area**: Area of effect
- **effect**: What the spell creates

## Optional Fields

- **subschool**: e.g., Healing, Creation, Calling
- **descriptor**: e.g., Fire, Cold, Evil, Good, Law, Chaos
- **materialComponent**: Required material components
- **focus**: Required focus items
- **arcaneFocus**: Required arcane focus
- **arcaneMaterialComponent**: Arcane material components

## Visual Indication

All homebrew spells are automatically marked with a purple "HOMEBREW" badge in the app, making them easy to identify in both the selection interface and the printed spellbook.

## Tips

- Use descriptive file names for easy organization
- Add comments at the top of each file to describe its contents
- Keep the `homebrew: true` flag on all spells
- Use unique IDs to avoid conflicts
- Test your spells by selecting the appropriate class in the app
