/**
 * SRD Spell Parser
 *
 * This script parses the HTML spell files from the sovelior_sage_srd directory
 * and generates TypeScript spell data files.
 *
 * Run with: node scripts/parseSpells.js
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  return text
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

// Helper function to clean up text
function cleanText(text) {
  return decodeHtmlEntities(text.trim().replace(/\s+/g, " "));
}

// Parse spell levels from level string
function parseSpellLevels(levelStr) {
  const levels = {};

  // Split by comma and parse each part
  const parts = levelStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();

    // Handle different class abbreviations
    const classMap = {
      "Sor/Wiz": ["Sorcerer", "Wizard"],
      Sor: ["Sorcerer"],
      Wiz: ["Wizard"],
      Clr: ["Cleric"],
      Drd: ["Druid"],
      Brd: ["Bard"],
      Pal: ["Paladin"],
      Rgr: ["Ranger"],
    };

    // Try to match class and level
    for (const [abbrev, classes] of Object.entries(classMap)) {
      const regex = new RegExp(`${abbrev}\\s*(\\d+)`);
      const match = trimmed.match(regex);
      if (match) {
        const level = parseInt(match[1]);
        classes.forEach((className) => {
          levels[className] = level;
        });
      }
    }

    // Handle domain spells (e.g., "Fire 5")
    if (!Object.keys(levels).length) {
      const domainMatch = trimmed.match(/^([A-Za-z]+)\s+(\d+)$/);
      if (domainMatch) {
        // Skip domain-only spells for now, as they're not standard class spells
        continue;
      }
    }
  }

  return levels;
}

// Parse school and descriptors from the initial line
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

// Parse a single spell from HTML content
function parseSpell(spellHtml, spellId, spellName) {
  const spell = {
    id: spellId,
    name: spellName,
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

  // Extract school/subschool/descriptor from the initial line
  const schoolMatch = spellHtml.match(
    /<p[^>]*class="initial"[^>]*><i>(.*?)<\/i><\/p>/,
  );
  if (schoolMatch) {
    const schoolInfo = parseSchool(schoolMatch[1]);
    spell.school = schoolInfo.school;
    if (schoolInfo.subschool) spell.subschool = schoolInfo.subschool;
    if (schoolInfo.descriptor) spell.descriptor = schoolInfo.descriptor;
  }

  // Extract stat blocks
  const statBlocks = spellHtml.match(
    /<span[^>]*class="stat-block"[^>]*><b>(.*?)<\/b>:\s*(.*?)<\/span>/g,
  );
  if (statBlocks) {
    statBlocks.forEach((block) => {
      const match = block.match(/<b>(.*?)<\/b>:\s*(.*?)<\/span>/);
      if (match) {
        const key = cleanText(match[1]);
        const value = cleanText(match[2].replace(/<[^>]+>/g, ""));

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
      }
    });
  }

  // Also check for inline style stat blocks (not in span.stat-block)
  const inlineStats = spellHtml.match(
    /<span[^>]*style="font-weight: bold;"[^>]*>(Target, Effect, or Area|Duration|Saving Throw|Spell Resistance):<\/span>\s*([^<]*)/g,
  );
  if (inlineStats) {
    inlineStats.forEach((block) => {
      const match = block.match(
        /<span[^>]*>(Target, Effect, or Area|Duration|Saving Throw|Spell Resistance):<\/span>\s*([^<]*)/,
      );
      if (match) {
        const key = cleanText(match[1]);
        const value = cleanText(match[2]);

        switch (key) {
          case "Target, Effect, or Area":
            // This could be target, area, or effect - we'll store as target for now
            if (!spell.target) spell.target = value;
            break;
          case "Duration":
            if (!spell.duration) spell.duration = value;
            break;
          case "Saving Throw":
            if (!spell.savingThrow) spell.savingThrow = value;
            break;
          case "Spell Resistance":
            if (!spell.spellResistance) spell.spellResistance = value;
            break;
        }
      }
    });
  }

  // Extract component details BEFORE processing description
  const materialMatch = spellHtml.match(
    /<p><i>Material Component<\/i>:\s*([\s\S]*?)<\/p>/,
  );
  if (materialMatch) {
    spell.materialComponent = cleanText(
      materialMatch[1].replace(/<[^>]+>/g, ""),
    );
  }

  const focusMatch = spellHtml.match(/<p><i>Focus<\/i>:\s*([\s\S]*?)<\/p>/);
  if (focusMatch) {
    spell.focus = cleanText(focusMatch[1].replace(/<[^>]+>/g, ""));
  }

  const arcaneMaterialMatch = spellHtml.match(
    /<p><i>Arcane Material Component<\/i>:\s*([\s\S]*?)<\/p>/,
  );
  if (arcaneMaterialMatch) {
    spell.arcaneMaterialComponent = cleanText(
      arcaneMaterialMatch[1].replace(/<[^>]+>/g, ""),
    );
  }

  const arcaneFocusMatch = spellHtml.match(
    /<p><i>Arcane Focus<\/i>:\s*([\s\S]*?)<\/p>/,
  );
  if (arcaneFocusMatch) {
    spell.arcaneFocus = cleanText(arcaneFocusMatch[1].replace(/<[^>]+>/g, ""));
  }

  const xpCostMatch = spellHtml.match(/<p><i>XP Cost<\/i>:\s*([\s\S]*?)<\/p>/);
  if (xpCostMatch) {
    spell.xpCost = cleanText(xpCostMatch[1].replace(/<[^>]+>/g, ""));
  }

  // Extract description - remove header, stat blocks, and material/focus sections
  let description = spellHtml;

  // Remove the school line
  description = description.replace(
    /<p[^>]*class="initial"[^>]*>[\s\S]*?<\/p>/g,
    "",
  );

  // Remove stat blocks
  description = description.replace(
    /<span[^>]*class="stat-block"[^>]*>[\s\S]*?<\/span>/g,
    "",
  );

  // Remove inline stat blocks and their values
  description = description.replace(
    /<span[^>]*style="font-weight: bold;"[^>]*>[^<]*<\/span>[^<]*(<br\s*\/?>)?/g,
    "",
  );

  // Remove material/focus sections at the end (use [\s\S] to match newlines)
  description = description.replace(
    /<p><i>(Material Component|Focus|Arcane Material Component|Arcane Focus|XP Cost)<\/i>:[\s\S]*?<\/p>/g,
    "",
  );

  // Remove all HTML tags but keep the text
  description = description.replace(/<[^>]+>/g, " ");

  // Clean up whitespace
  description = cleanText(description);

  spell.description = description;

  return spell;
}

// Main parsing function
function parseSpellFile(filePath) {
  console.log(`Parsing ${path.basename(filePath)}...`);

  const content = fs.readFileSync(filePath, "utf-8");
  const spells = [];

  // Find all spell sections (marked with <h6><a id="...">Spell Name</a></h6>)
  const spellRegex =
    /<h6><a id="([^"]+)">([^<]+)<\/a><\/h6>([\s\S]*?)(?=<h6>|<!-- end|$)/g;

  let match;
  while ((match = spellRegex.exec(content)) !== null) {
    const spellId = match[1];
    const spellName = cleanText(match[2]);
    const spellHtml = match[3];

    try {
      const spell = parseSpell(spellHtml, spellId, spellName);

      // Only include spells with valid class levels
      if (Object.keys(spell.level).length > 0) {
        spells.push(spell);
      }
    } catch (error) {
      console.error(`Error parsing spell ${spellName}:`, error.message);
    }
  }

  return spells;
}

// Main execution
function main() {
  const srdPath = path.join(__dirname, "../../sovelior_sage_srd");
  const outputPath = path.join(__dirname, "../src/srdSpellsGenerated.ts");

  // Spell files to parse
  const spellFiles = [
    "spellsAtoB.html",
    "spellsC.html",
    "spellsDtoE.html",
    "spellsFtoG.html",
    "spellsHtoL.html",
    "spellsMtoO.html",
    "spellsPtoR.html",
    "spellsS.html",
    "spellsTtoZ.html",
  ];

  const allSpells = [];

  for (const file of spellFiles) {
    const filePath = path.join(srdPath, file);
    if (fs.existsSync(filePath)) {
      const spells = parseSpellFile(filePath);
      allSpells.push(...spells);
    }
  }

  console.log(`\nParsed ${allSpells.length} spells total.`);

  // Generate TypeScript file
  let output = `import type { Spell } from './types';\n\n`;
  output += `/**\n`;
  output += ` * SRD Spells - Auto-generated from HTML files\n`;
  output += ` * \n`;
  output += ` * Generated: ${new Date().toISOString()}\n`;
  output += ` * Total spells: ${allSpells.length}\n`;
  output += ` */\n\n`;
  output += `export const SRD_SPELLS: Spell[] = `;
  output += JSON.stringify(allSpells, null, 2);
  output += `;\n`;

  fs.writeFileSync(outputPath, output);
  console.log(`\nGenerated ${outputPath}`);
  console.log(`Total spells exported: ${allSpells.length}`);
}

main();
