/**
 * Spell Parser - Markdown Edition
 *
 * This script parses markdown spell files from:
 * - spells-srd/srd-spells.md (official SRD spells)
 * - spells-homebrew/*.md (homebrew spells)
 *
 * Run with: node scripts/parseMarkdownSpells.js
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to clean up text
function cleanText(text) {
  return text.trim().replace(/\s+/g, " ");
}

// Parse spell levels from level string
function parseSpellLevels(levelStr) {
  const levels = {};

  // Split by comma and parse each part
  const parts = levelStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();

    // Handle different class abbreviations, full names, and cleric domains
    const classMap = {
      // Standard abbreviations
      "Sor/Wiz": ["Sorcerer", "Wizard"],
      Sor: ["Sorcerer"],
      Wiz: ["Wizard"],
      Clr: ["Cleric"],
      Drd: ["Druid"],
      Brd: ["Bard"],
      Pal: ["Paladin"],
      Rgr: ["Ranger"],
      // Full class names (case-insensitive match needed)
      "sorcerer/wizard": ["Sorcerer", "Wizard"],
      sorcerer: ["Sorcerer"],
      wizard: ["Wizard"],
      cleric: ["Cleric"],
      druid: ["Druid"],
      bard: ["Bard"],
      paladin: ["Paladin"],
      ranger: ["Ranger"],
      // Cleric domains - treat as cleric spells
      Air: ["Cleric"],
      Animal: ["Cleric"],
      Chaos: ["Cleric"],
      Death: ["Cleric"],
      Destruction: ["Cleric"],
      Earth: ["Cleric"],
      Evil: ["Cleric"],
      Fire: ["Cleric"],
      Good: ["Cleric"],
      Healing: ["Cleric"],
      Knowledge: ["Cleric"],
      Law: ["Cleric"],
      Luck: ["Cleric"],
      Magic: ["Cleric"],
      Plant: ["Cleric"],
      Protection: ["Cleric"],
      Strength: ["Cleric"],
      Sun: ["Cleric"],
      Travel: ["Cleric"],
      Trickery: ["Cleric"],
      War: ["Cleric"],
      Water: ["Cleric"],
    };

    // Try to match class and level (case-insensitive for full names)
    for (const [abbrev, classes] of Object.entries(classMap)) {
      const regex = new RegExp(`\\b${abbrev}\\s*(\\d+)`, "i");
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

// Parse school and descriptors from the line
function parseSchool(schoolStr) {
  const result = {
    school: "",
    subschool: undefined,
    descriptor: undefined,
  };

  // Match pattern like: "Conjuration (Creation) [Acid]"
  const match = schoolStr.match(
    /^([A-Za-z]+)(?:\s*\(([^)]+)\))?(?:\s*\[([^\]]+)\])?/,
  );

  if (match) {
    result.school = cleanText(match[1]);
    if (match[2]) {
      result.subschool = cleanText(match[2]);
    }
    if (match[3]) {
      result.descriptor = cleanText(match[3]);
    }
  }

  return result;
}

// Parse the markdown file
function parseMarkdownSpells(filePath) {
  console.log(`Parsing ${path.basename(filePath)}...`);

  const content = fs.readFileSync(filePath, "utf-8");
  const spells = [];

  // Extract the level 1 header (# ...) as the source
  let source = undefined;
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    source = cleanText(headerMatch[1]);
  }

  // Split into spell sections by ## headers
  const spellSections = content.split(/^## /m).slice(1); // Skip the first empty section

  console.log(`Found ${spellSections.length} spell sections`);

  for (const section of spellSections) {
    const lines = section.split("\n");
    const name = lines[0].trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const spell = {
      id,
      name,
      school: "",
      level: {},
      components: "",
      castingTime: "",
      range: "",
      duration: "",
      savingThrow: "",
      spellResistance: "",
      description: "",
    };

    // Add source if extracted
    if (source) {
      spell.source = source;
    }

    let inDescription = false;
    const descriptionLines = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines unless we're in description
      if (!line && !inDescription) continue;

      // Parse school line (first bullet point, no bold) - handle escaped brackets
      // Handle both * and - as bullet markers
      if (
        (line.startsWith("*") || line.startsWith("-")) &&
        !line.includes("**") &&
        !spell.school
      ) {
        const schoolStr = line.replace(/^[*-]\s+/, "").replace(/\\/g, "");
        const schoolInfo = parseSchool(schoolStr);
        spell.school = schoolInfo.school;
        if (schoolInfo.subschool) spell.subschool = schoolInfo.subschool;
        if (schoolInfo.descriptor) spell.descriptor = schoolInfo.descriptor;
        continue;
      }

      // Parse stat block lines - handle both single and double colons, and both * and - bullets
      const statMatch = line.match(/^[*-]\s+\*\*([^*:]+)::?\*\*\s*(.+)$/);
      if (statMatch) {
        const key = statMatch[1].trim();
        const value = statMatch[2].trim();

        switch (key) {
          case "Level":
            spell.level = parseSpellLevels(value);
            break;
          case "Components":
            spell.components = value;
            break;
          case "Casting Time":
            spell.castingTime = value;
            break;
          case "Range":
            spell.range = value;
            break;
          case "Target":
          case "Targets":
            spell.target = value;
            break;
          case "Area":
            spell.area = value;
            break;
          case "Effect":
            spell.effect = value;
            break;
          case "Duration":
            spell.duration = value;
            break;
          case "Saving Throw":
            spell.savingThrow = value;
            break;
          case "Spell Resistance":
            spell.spellResistance = value;
            break;
        }
        continue;
      }

      // Check for component detail sections - handle both single and double colons
      const componentMatch = line.match(
        /^_(Material Component|Focus|Arcane Material Component|Arcane Focus|XP Cost)::?_\s*(.*)$/,
      );
      if (componentMatch) {
        const key = componentMatch[1];
        let value = componentMatch[2].trim();

        // If the value continues on next lines, collect them
        let j = i + 1;
        while (
          j < lines.length &&
          lines[j].trim() &&
          !lines[j].startsWith("_") &&
          !lines[j].startsWith("*") &&
          !lines[j].startsWith("##")
        ) {
          value += " " + lines[j].trim();
          j++;
        }
        i = j - 1;

        const cleanValue = cleanText(value);

        switch (key) {
          case "Material Component":
            spell.materialComponent = cleanValue;
            break;
          case "Focus":
            spell.focus = cleanValue;
            break;
          case "Arcane Material Component":
            spell.arcaneMaterialComponent = cleanValue;
            break;
          case "Arcane Focus":
            spell.arcaneFocus = cleanValue;
            break;
          case "XP Cost":
            spell.xpCost = cleanValue;
            break;
        }
        continue;
      }

      // If we've finished parsing stat blocks and haven't hit a component section,
      // we're in the description
      // Note: Stat blocks starting with * or - have already been handled above with continue,
      // so lines starting with * or - here are description content (like bullet points)
      if (!line.startsWith("##")) {
        // Skip component detail lines (already handled above)
        if (
          line.match(
            /^_(Material Component|Focus|Arcane Material Component|Arcane Focus|XP Cost)::?_/,
          )
        ) {
          continue;
        }

        inDescription = true;
        if (line) {
          descriptionLines.push(line);
        }
      }
    }

    // Smart join for description: table rows get single newlines, everything else gets double newlines
    let description = "";
    for (let i = 0; i < descriptionLines.length; i++) {
      const line = descriptionLines[i];
      const nextLine = descriptionLines[i + 1];

      description += line;

      if (nextLine !== undefined) {
        // If both current and next line are table rows, use single newline
        if (line.startsWith("|") && nextLine.startsWith("|")) {
          description += "\n";
        } else {
          description += "\n\n";
        }
      }
    }
    spell.description = description.trim();

    // Only add spells that have at least one class level
    if (Object.keys(spell.level).length > 0) {
      spells.push(spell);
    }
  }

  return spells;
}

// Main execution
console.log("=== Parsing SRD Spells ===\n");
const srdPath = path.join(__dirname, "../spells-srd/srd-spells.md");
const srdSpells = parseMarkdownSpells(srdPath);
console.log(`\nParsed ${srdSpells.length} SRD spells.\n`);

// Parse homebrew spells from all .md files in spells-homebrew/ (excluding README.md)
console.log("=== Parsing Homebrew Spells ===\n");
const homebrewDir = path.join(__dirname, "../spells-homebrew");
const homebrewFiles = fs
  .readdirSync(homebrewDir)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .map((file) => path.join(homebrewDir, file));

let homebrewSpells = [];
for (const filePath of homebrewFiles) {
  console.log(`Parsing ${path.basename(filePath)}...`);
  const spells = parseMarkdownSpells(filePath);
  console.log(`  Found ${spells.length} spells`);
  homebrewSpells = homebrewSpells.concat(spells);
}
console.log(`\nTotal homebrew spells: ${homebrewSpells.length}\n`);

// Generate SRD TypeScript file
const srdOutputPath = path.join(__dirname, "../src/srdSpellsGenerated.ts");
const srdTsContent = `// Auto-generated spell data from SRD markdown
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT THIS FILE MANUALLY

import type { Spell } from "./types";

export const SRD_SPELLS: Spell[] = ${JSON.stringify(srdSpells, null, 2)};
`;
fs.writeFileSync(srdOutputPath, srdTsContent, "utf-8");
console.log(`Generated ${srdOutputPath}`);
console.log(`Total SRD spells exported: ${srdSpells.length}\n`);

// Generate Homebrew TypeScript file
const homebrewOutputPath = path.join(
  __dirname,
  "../src/homebrewSpellsGenerated.ts",
);
const homebrewTsContent = `// Auto-generated spell data from homebrew markdown files
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT THIS FILE MANUALLY

import type { Spell } from "./types";

export const HOMEBREW_SPELLS: Spell[] = ${JSON.stringify(homebrewSpells, null, 2)};
`;
fs.writeFileSync(homebrewOutputPath, homebrewTsContent, "utf-8");
console.log(`Generated ${homebrewOutputPath}`);
console.log(`Total homebrew spells exported: ${homebrewSpells.length}\n`);

console.log(`=== Summary ===`);
console.log(`SRD spells: ${srdSpells.length}`);
console.log(`Homebrew spells: ${homebrewSpells.length}`);
console.log(`Total: ${srdSpells.length + homebrewSpells.length}`);
