import { useState, useMemo } from 'react';
import type { CharacterClass, Spell } from './types';
import { ALL_CLASSES } from './types';
import { SPELLS } from './spellData';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

function App() {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'level' | 'alphabetical'>('level');

  // Filter spells available for the selected class
  const availableSpells = useMemo(() => {
    if (!selectedClass) return [];

    return SPELLS
      .filter(spell => selectedClass in spell.level)
      .sort((a, b) => {
        // Sort by level first, then by name
        const levelA = a.level[selectedClass] ?? 99;
        const levelB = b.level[selectedClass] ?? 99;
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });
  }, [selectedClass]);

  // Group spells by level
  const spellsByLevel = useMemo(() => {
    if (!selectedClass) return new Map();

    const grouped = new Map<number, Spell[]>();
    availableSpells.forEach(spell => {
      const level = spell.level[selectedClass];
      if (level !== undefined) {
        if (!grouped.has(level)) {
          grouped.set(level, []);
        }
        grouped.get(level)!.push(spell);
      }
    });

    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
  }, [availableSpells, selectedClass]);

  const toggleSpell = (spellId: string) => {
    const newSelected = new Set(selectedSpells);
    if (newSelected.has(spellId)) {
      newSelected.delete(spellId);
    } else {
      newSelected.add(spellId);
    }
    setSelectedSpells(newSelected);
  };

  const toggleAllInLevel = (spells: Spell[]) => {
    const newSelected = new Set(selectedSpells);
    const allSelected = spells.every(spell => selectedSpells.has(spell.id));

    spells.forEach(spell => {
      if (allSelected) {
        newSelected.delete(spell.id);
      } else {
        newSelected.add(spell.id);
      }
    });

    setSelectedSpells(newSelected);
  };

  const selectedSpellsData = useMemo(() => {
    const spells = SPELLS.filter(spell => selectedSpells.has(spell.id));

    if (sortOrder === 'alphabetical') {
      return spells.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by level (for the selected class), then alphabetically
      return spells.sort((a, b) => {
        if (!selectedClass) return a.name.localeCompare(b.name);

        const levelA = a.level[selectedClass] ?? 99;
        const levelB = b.level[selectedClass] ?? 99;

        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });
    }
  }, [selectedSpells, sortOrder, selectedClass]);

  return (
    <div className="app">
      <header className="no-print">
        <h1>D&D 3.5 Spellbook Generator</h1>
        <p>Select your class, toggle the spells you want, and print your custom spellbook.</p>
      </header>

      {/* Class Selection */}
      <div className="class-selection no-print">
        <h2>Select Your Class</h2>
        <div className="class-buttons">
          {ALL_CLASSES.map(className => (
            <button
              key={className}
              className={`class-button ${selectedClass === className ? 'selected' : ''}`}
              onClick={() => {
                setSelectedClass(className);
                setSelectedSpells(new Set());
              }}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      {/* Spell Selection */}
      {selectedClass && (
        <div className="spell-selection no-print">
          <h2>{selectedClass} Spells</h2>
          <p className="info">
            Click on spell names to toggle them. Selected spells will appear in your printable spellbook below.
          </p>

          {[...spellsByLevel.entries()].map(([level, spells]) => (
            <div key={level} className="spell-level-group">
              <div className="level-header">
                <h3>
                  Level {level} {level === 0 ? `(${selectedClass === 'Cleric' || selectedClass === 'Druid' ? 'Orisons' : 'Cantrips'})` : ''}
                </h3>
                <button
                  className="toggle-all-button"
                  onClick={() => toggleAllInLevel(spells)}
                >
                  {spells.every((s: Spell) => selectedSpells.has(s.id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="spell-list">
                {spells.map((spell: Spell) => (
                  <label key={spell.id} className="spell-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSpells.has(spell.id)}
                      onChange={() => toggleSpell(spell.id)}
                    />
                    <span className="spell-name">
                      {spell.name}
                      {spell.homebrew && <span className="homebrew-badge">Homebrew</span>}
                    </span>
                    <span className="spell-school">({spell.school})</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Spellbook */}
      {selectedClass && selectedSpellsData.length > 0 && (
        <div className="spellbook">
          <div className="spellbook-header">
            <h1>{selectedClass} Spellbook</h1>
            <div className="spellbook-controls">
              <div className="sort-buttons no-print">
                <label>Sort by:</label>
                <button
                  className={`sort-button ${sortOrder === 'level' ? 'active' : ''}`}
                  onClick={() => setSortOrder('level')}
                >
                  Level
                </button>
                <button
                  className={`sort-button ${sortOrder === 'alphabetical' ? 'active' : ''}`}
                  onClick={() => setSortOrder('alphabetical')}
                >
                  Alphabetical
                </button>
              </div>
              <button className="print-button no-print" onClick={() => window.print()}>
                🖨️ Print Spellbook
              </button>
            </div>
          </div>

          {selectedSpellsData.map(spell => (
            <div key={spell.id} className="spell-card">
              <h2 className="spell-title">
                {spell.name}
                {spell.homebrew && <span className="homebrew-badge-large">Homebrew</span>}
              </h2>

              <div className="spell-meta">
                <div className="spell-school">
                  <strong>{spell.school}</strong>
                  {spell.subschool && ` (${spell.subschool})`}
                  {spell.descriptor && ` [${spell.descriptor}]`}
                </div>
              </div>

              <div className="spell-stats">
                <div className="stat-row">
                  <strong>Level:</strong>{' '}
                  {Object.entries(spell.level)
                    .map(([cls, lvl]) => `${cls} ${lvl}`)
                    .join(', ')}
                </div>
                <div className="stat-row">
                  <strong>Components:</strong> {spell.components}
                </div>
                <div className="stat-row">
                  <strong>Casting Time:</strong> {spell.castingTime}
                </div>
                <div className="stat-row">
                  <strong>Range:</strong> {spell.range}
                </div>
                {spell.target && (
                  <div className="stat-row">
                    <strong>Target:</strong> {spell.target}
                  </div>
                )}
                {spell.area && (
                  <div className="stat-row">
                    <strong>Area:</strong> {spell.area}
                  </div>
                )}
                {spell.effect && (
                  <div className="stat-row">
                    <strong>Effect:</strong> {spell.effect}
                  </div>
                )}
                <div className="stat-row">
                  <strong>Duration:</strong> {spell.duration}
                </div>
                <div className="stat-row">
                  <strong>Saving Throw:</strong> {spell.savingThrow}
                </div>
                <div className="stat-row">
                  <strong>Spell Resistance:</strong> {spell.spellResistance}
                </div>
              </div>

              <div className="spell-description">
                <Markdown remarkPlugins={[remarkGfm]}>{spell.description}</Markdown>
              </div>

              {(spell.materialComponent || spell.focus || spell.arcaneFocus || spell.arcaneMaterialComponent || spell.xpCost) && (
                <div className="spell-components-detail">
                  {spell.materialComponent && (
                    <p><em>Material Component:</em> {spell.materialComponent}</p>
                  )}
                  {spell.focus && (
                    <p><em>Focus:</em> {spell.focus}</p>
                  )}
                  {spell.arcaneFocus && (
                    <p><em>Arcane Focus:</em> {spell.arcaneFocus}</p>
                  )}
                  {spell.arcaneMaterialComponent && (
                    <p><em>Arcane Material Component:</em> {spell.arcaneMaterialComponent}</p>
                  )}
                  {spell.xpCost && (
                    <p><em>XP Cost:</em> {spell.xpCost}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedClass && selectedSpellsData.length === 0 && (
        <div className="empty-state no-print">
          <p>No spells selected. Toggle spells above to build your spellbook.</p>
        </div>
      )}
    </div>
  );
}

export default App;
