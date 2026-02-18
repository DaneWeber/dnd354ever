# Spellbook

[![Deploy to GitHub Pages](https://github.com/DaneWeber/dnd354ever/actions/workflows/deploy-spellbook.yml/badge.svg)](https://github.com/DaneWeber/dnd354ever/actions/workflows/deploy-spellbook.yml)

This app is a browser-only printable spellbook generator for Dungeons & Dragons 3.5th Edition.

It is built using React and TypeScript. The static site is generated using Vite and deployed automatically to GitHub Pages via GitHub Actions.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server at http://localhost:5173/ (or another port if 5173 is in use).

### Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

### Building for Production

```bash
npm run build
```

The built site will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. ✅ Runs all tests
2. ✅ Runs the linter
3. 🏗️ Builds the production bundle
4. 🚀 Deploys to GitHub Pages

See [.github-pages-info.md](.github-pages-info.md) for deployment configuration details.

## How to Use

1. **Select Your Class**: Click on one of the class buttons (Wizard, Cleric, Druid, etc.)
2. **Toggle Spells**: Check the boxes next to the spells you want in your spellbook
3. **Print**: Once you've selected your spells, click the "Print Spellbook" button or use your browser's print function (Ctrl+P / Cmd+P)

The app will automatically hide the selection interface when printing, showing only your selected spells in a clean, print-friendly format.

## Features

- **Class-Based Filtering**: Only see spells available to your selected class
- **Level Organization**: Spells are automatically grouped by level
- **Full Spell Details**: Each spell shows all stats (level, components, range, duration, etc.) and descriptions
- **Print-Optimized**: CSS is optimized for printing with proper page breaks and formatting
- **Quick Selection**: "Select All" / "Deselect All" buttons for each spell level
- **Persistent Selection**: Your spell selections stay active while browsing
- **Homebrew Spell Support**: Add your own custom spells with clear visual indicators

## Adding Homebrew Spells

Homebrew spells are stored as TypeScript files in the [spells-homebrew/](spells-homebrew/) directory. The app automatically loads all `.ts` files from this directory.

### Quick Start

1. Create a new `.ts` file in `spells-homebrew/` (e.g., `my-spells.ts`)
2. Use this template:

```typescript
import type { Spell } from '../src/types';

export const spells: Spell[] = [
  {
    id: 'my-custom-spell',
    name: 'My Custom Spell',
    school: 'Evocation',
    level: { 'Wizard': 3 },
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    target: 'One creature',
    duration: 'Instantaneous',
    savingThrow: 'Reflex half',
    spellResistance: 'Yes',
    description: 'Your spell description goes here...',
    homebrew: true
  }
];
```

3. Save the file - your spells will automatically appear in the app!

### Organization

You can organize spell files however you like:
- By theme: `nature-spells.ts`, `fire-spells.ts`
- By source: `campaign-spells.ts`, `custom-spells.ts`
- By caster type: `arcane-spells.ts`, `divine-spells.ts`

See [spells-homebrew/README.md](spells-homebrew/README.md) for complete documentation and examples.

### Visual Indicators

Homebrew spells are automatically marked with a purple "HOMEBREW" badge for easy identification.

## References

The `./spells-srd` directory contains the spells from the System Reference Document (SRD) for Dungeons & Dragons 3.5th Edition. The spells are grouped together in large HTML files, but we intend to change them to JSON, YAML, or even Markdown files in the future.

The `./spells-homebrew` directory contains the homebrew spells that we have created ourselves. These spells are not part of the official SRD, but they are still available for use in our spellbook generator.

## Future Enhancements

- Parse all spells from the SRD HTML files
- Add homebrew spell support
- Add a field for spell source (e.g., PHB, DMG, Spell Compendium, homebrew)
- Sort spellbook alphabetically or by level
- Allow saving/loading spell selections
- Add filters by school, level, or search
- Export to PDF directly
