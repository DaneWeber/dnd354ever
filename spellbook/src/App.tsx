import { useState, useMemo, useEffect } from 'react';
import type { CharacterClass, Spell, SavedSpellbook } from './types';
import { ALL_CLASSES } from './types';
import { SPELLS } from './spellData';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const STORAGE_KEY = 'dnd-spellbooks';

// Helper function to create a default spellbook
const createDefaultSpellbook = (): SavedSpellbook => ({
  id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'My Spellbook',
  characterClass: null,
  selectedSpells: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function App() {
  // Load initial state from localStorage using lazy initialization
  // We need to compute spellbooks and currentSpellbookId together
  const getInitialState = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const loadedSpellbooks = parsed.spellbooks || [];

        // Always ensure at least one spellbook exists
        if (loadedSpellbooks.length === 0) {
          const defaultBook = createDefaultSpellbook();
          return {
            spellbooks: [defaultBook],
            currentSpellbookId: defaultBook.id,
          };
        }

        // Return loaded spellbooks with current ID
        const currentId = parsed.currentSpellbookId || loadedSpellbooks[0].id;
        return {
          spellbooks: loadedSpellbooks,
          currentSpellbookId: currentId,
        };
      } catch (e) {
        console.error('Failed to load spellbooks from localStorage:', e);
        const defaultBook = createDefaultSpellbook();
        return {
          spellbooks: [defaultBook],
          currentSpellbookId: defaultBook.id,
        };
      }
    }
    // No stored data - create default spellbook
    const defaultBook = createDefaultSpellbook();
    return {
      spellbooks: [defaultBook],
      currentSpellbookId: defaultBook.id,
    };
  };

  const initialState = getInitialState();
  const [spellbooks, setSpellbooks] = useState<SavedSpellbook[]>(initialState.spellbooks);
  const [currentSpellbookId, setCurrentSpellbookId] = useState<string | null>(initialState.currentSpellbookId);

  const [showSpellbookManager, setShowSpellbookManager] = useState(false);

  // Current working state - load from current spellbook if it exists
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.currentSpellbookId && parsed.spellbooks) {
          const current = parsed.spellbooks.find(
            (sb: SavedSpellbook) => sb.id === parsed.currentSpellbookId
          );
          if (current) {
            return current.characterClass;
          }
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.currentSpellbookId && parsed.spellbooks) {
          const current = parsed.spellbooks.find(
            (sb: SavedSpellbook) => sb.id === parsed.currentSpellbookId
          );
          if (current) {
            return new Set(current.selectedSpells);
          }
        }
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const [sortOrder, setSortOrder] = useState<'level' | 'alphabetical'>('level');

  // Helper function to update spellbook when selections change
  const updateCurrentSpellbook = (
    newClass: CharacterClass | null,
    newSpells: Set<string>
  ) => {
    if (currentSpellbookId) {
      setSpellbooks(prev =>
        prev.map(sb =>
          sb.id === currentSpellbookId
            ? {
              ...sb,
              characterClass: newClass,
              selectedSpells: Array.from(newSpells),
              updatedAt: new Date().toISOString(),
            }
            : sb
        )
      );
    }
  };

  // Save spellbooks list when it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ spellbooks, currentSpellbookId })
    );
  }, [spellbooks, currentSpellbookId]);

  const createNewSpellbook = (name: string) => {
    const newSpellbook: SavedSpellbook = {
      id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      characterClass: null,
      selectedSpells: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSpellbooks([...spellbooks, newSpellbook]);
    setCurrentSpellbookId(newSpellbook.id);
    setSelectedClass(null);
    setSelectedSpells(new Set());
  };

  const loadSpellbook = (id: string) => {
    const spellbook = spellbooks.find(sb => sb.id === id);
    if (spellbook) {
      setCurrentSpellbookId(id);
      setSelectedClass(spellbook.characterClass);
      setSelectedSpells(new Set(spellbook.selectedSpells));
    }
  };

  const deleteSpellbook = (id: string) => {
    const filtered = spellbooks.filter(sb => sb.id !== id);
    setSpellbooks(filtered);
    if (currentSpellbookId === id) {
      setCurrentSpellbookId(null);
      setSelectedClass(null);
      setSelectedSpells(new Set());
    }
  };

  const renameSpellbook = (id: string, newName: string) => {
    setSpellbooks(
      spellbooks.map(sb =>
        sb.id === id
          ? { ...sb, name: newName, updatedAt: new Date().toISOString() }
          : sb
      )
    );
  };

  const exportSpellbook = (id: string) => {
    const spellbook = spellbooks.find(sb => sb.id === id);
    if (!spellbook) return;

    const dataStr = JSON.stringify(spellbook, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spellbook.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSpellbookToMarkdown = (id: string, sortOrder: 'level' | 'alphabetical' = 'level') => {
    const spellbook = spellbooks.find(sb => sb.id === id);
    if (!spellbook) return;

    // Get selected spell objects
    let selectedSpellsData = SPELLS.filter(spell =>
      spellbook.selectedSpells.includes(spell.id)
    );

    if (selectedSpellsData.length === 0) {
      alert('No spells selected to export.');
      return;
    }

    // Build markdown content
    let markdown = `# ${spellbook.name}\n\n`;

    if (spellbook.characterClass) {
      markdown += `**Class:** ${spellbook.characterClass}\n\n`;
    }

    markdown += `**Spells:** ${selectedSpellsData.length}\n\n`;
    markdown += `---\n\n`;

    if (sortOrder === 'alphabetical') {
      // Sort spells alphabetically
      selectedSpellsData.sort((a, b) => a.name.localeCompare(b.name));

      // Add all spells in alphabetical order without level grouping
      selectedSpellsData.forEach(spell => {
        markdown += `## ${spell.name}\n\n`;

        // School and descriptors
        let schoolLine = `- **School:** ${spell.school}`;
        if (spell.subschool) schoolLine += ` (${spell.subschool})`;
        if (spell.descriptor) schoolLine += ` [${spell.descriptor}]`;
        markdown += `${schoolLine}\n`;

        // Level info
        const levelEntries = Object.entries(spell.level)
          .map(([cls, lvl]) => `${cls} ${lvl}`)
          .join(', ');
        markdown += `- **Level:** ${levelEntries}\n`;

        // Components and casting details
        markdown += `- **Components:** ${spell.components}\n`;
        markdown += `- **Casting Time:** ${spell.castingTime}\n`;
        markdown += `- **Range:** ${spell.range}\n`;

        if (spell.target) markdown += `- **Target:** ${spell.target}\n`;
        if (spell.area) markdown += `- **Area:** ${spell.area}\n`;
        if (spell.effect) markdown += `- **Effect:** ${spell.effect}\n`;

        markdown += `- **Duration:** ${spell.duration}\n`;
        if (spell.savingThrow && spell.savingThrow.trim()) markdown += `- **Saving Throw:** ${spell.savingThrow}\n`;
        if (spell.spellResistance && spell.spellResistance.trim()) markdown += `- **Spell Resistance:** ${spell.spellResistance}\n`;

        markdown += `\n`;

        // Description
        markdown += `${spell.description}\n\n`;

        // Additional components
        if (spell.materialComponent) {
          markdown += `- **Material Component:** ${spell.materialComponent}\n`;
        }
        if (spell.focus) {
          markdown += `- **Focus:** ${spell.focus}\n`;
        }
        if (spell.arcaneFocus) {
          markdown += `- **Arcane Focus:** ${spell.arcaneFocus}\n`;
        }
        if (spell.arcaneMaterialComponent) {
          markdown += `- **Arcane Material Component:** ${spell.arcaneMaterialComponent}\n`;
        }
        if (spell.xpCost) {
          markdown += `- **XP Cost:** ${spell.xpCost}\n`;
        }
        if (spell.materialComponent || spell.focus || spell.arcaneFocus || spell.arcaneMaterialComponent || spell.xpCost) {
          markdown += `\n`;
        }

        if (spell.homebrew) {
          markdown += `*This is a homebrew spell.*\n\n`;
        }

        markdown += `---\n\n`;
      });
    } else {
      // Group spells by level for the character class
      const spellsByLevel = new Map<number, typeof selectedSpellsData>();
      selectedSpellsData.forEach(spell => {
        if (spellbook.characterClass && spellbook.characterClass in spell.level) {
          const level = spell.level[spellbook.characterClass];
          if (!spellsByLevel.has(level)) {
            spellsByLevel.set(level, []);
          }
          spellsByLevel.get(level)!.push(spell);
        }
      });

      // Sort spells within each level alphabetically
      spellsByLevel.forEach(spells => {
        spells.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Add spells grouped by level
      const sortedLevels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b);

      sortedLevels.forEach(level => {
        const spells = spellsByLevel.get(level)!;
        const levelName = level === 0
          ? (spellbook.characterClass === 'Cleric' || spellbook.characterClass === 'Druid' ? 'Orisons' : 'Cantrips')
          : `Level ${level}`;

        markdown += `## ${levelName}\n\n`;

        spells.forEach(spell => {
          markdown += `### ${spell.name}\n\n`;

          // School and descriptors
          let schoolLine = `- **School:** ${spell.school}`;
          if (spell.subschool) schoolLine += ` (${spell.subschool})`;
          if (spell.descriptor) schoolLine += ` [${spell.descriptor}]`;
          markdown += `${schoolLine}\n`;

          // Level info
          const levelEntries = Object.entries(spell.level)
            .map(([cls, lvl]) => `${cls} ${lvl}`)
            .join(', ');
          markdown += `- **Level:** ${levelEntries}\n`;

          // Components and casting details
          markdown += `- **Components:** ${spell.components}\n`;
          markdown += `- **Casting Time:** ${spell.castingTime}\n`;
          markdown += `- **Range:** ${spell.range}\n`;

          if (spell.target) markdown += `- **Target:** ${spell.target}\n`;
          if (spell.area) markdown += `- **Area:** ${spell.area}\n`;
          if (spell.effect) markdown += `- **Effect:** ${spell.effect}\n`;

          markdown += `- **Duration:** ${spell.duration}\n`;
          if (spell.savingThrow && spell.savingThrow.trim()) markdown += `- **Saving Throw:** ${spell.savingThrow}\n`;
          if (spell.spellResistance && spell.spellResistance.trim()) markdown += `- **Spell Resistance:** ${spell.spellResistance}\n`;

          markdown += `\n`;

          // Description
          markdown += `${spell.description}\n\n`;

          // Additional components
          if (spell.materialComponent) {
            markdown += `- **Material Component:** ${spell.materialComponent}\n`;
          }
          if (spell.focus) {
            markdown += `- **Focus:** ${spell.focus}\n`;
          }
          if (spell.arcaneFocus) {
            markdown += `- **Arcane Focus:** ${spell.arcaneFocus}\n`;
          }
          if (spell.arcaneMaterialComponent) {
            markdown += `- **Arcane Material Component:** ${spell.arcaneMaterialComponent}\n`;
          }
          if (spell.xpCost) {
            markdown += `- **XP Cost:** ${spell.xpCost}\n`;
          }
          if (spell.materialComponent || spell.focus || spell.arcaneFocus || spell.arcaneMaterialComponent || spell.xpCost) {
            markdown += `\n`;
          }

          if (spell.homebrew) {
            markdown += `*This is a homebrew spell.*\n\n`;
          }

          markdown += `---\n\n`;
        });
      });
    }

    // Create and download the file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spellbook.name.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSpellbook = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as SavedSpellbook;
        // Generate new ID to avoid conflicts
        const newSpellbook: SavedSpellbook = {
          ...imported,
          id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSpellbooks([...spellbooks, newSpellbook]);
        alert(`Imported spellbook: ${newSpellbook.name}`);
      } catch (error) {
        alert('Failed to import spellbook. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const currentSpellbook = spellbooks.find(sb => sb.id === currentSpellbookId);

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
    updateCurrentSpellbook(selectedClass, newSelected);
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
    updateCurrentSpellbook(selectedClass, newSelected);
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app">
      {/* Unified Navigation */}
      <nav className="unified-nav no-print">
        <div className="nav-sections">
          <button
            className="nav-button"
            onClick={() => scrollToSection('spellbooks-section')}
            title="Spellbooks"
          >
            📚
          </button>
          <button
            className="nav-button"
            onClick={() => scrollToSection('class-section')}
            title="Class Selection"
          >
            🎓
          </button>
          {selectedClass && (
            <button
              className="nav-button"
              onClick={() => scrollToSection('selection-section')}
              title="Spell Selection"
            >
              ✨
            </button>
          )}
          {selectedClass && selectedSpellsData.length > 0 && (
            <button
              className="nav-button"
              onClick={() => scrollToSection('printable-section')}
              title="Printable Spellbook"
            >
              📖
            </button>
          )}
        </div>

        {/* Level Navigation - shown when class is selected */}
        {selectedClass && spellsByLevel.size > 0 && (
          <>
            <div className="nav-divider"></div>
            <div className="nav-levels">
              {[...spellsByLevel.keys()].map((level) => (
                <button
                  key={level}
                  className="nav-button nav-level-button"
                  onClick={() => scrollToSection(`level-${level}`)}
                  title={`Level ${level}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      <header className="no-print">
        <h1>D&D 3.5 Spellbook Generator</h1>
        <p>Select your class, toggle the spells you want, and print your custom spellbook.</p>
      </header>

      {/* Spellbook Manager */}
      <div id="spellbooks-section" className="spellbook-manager no-print">
        <div className="manager-header">
          <h2>Saved Spellbooks</h2>
          <button
            className="toggle-manager-button"
            onClick={() => setShowSpellbookManager(!showSpellbookManager)}
          >
            {showSpellbookManager ? '▼ Hide' : '▶ Show'} Manager
          </button>
        </div>

        {showSpellbookManager && (
          <div className="manager-content">
            <div className="manager-actions">
              <button
                className="action-button create-button"
                onClick={() => {
                  const name = prompt('Enter spellbook name:');
                  if (name) createNewSpellbook(name);
                }}
              >
                ➕ New Spellbook
              </button>
              <label className="action-button import-button">
                📁 Import Spellbook
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importSpellbook(file);
                    e.target.value = ''; // Reset input
                  }}
                />
              </label>
            </div>

            <div className="spellbook-list">
              {spellbooks.length === 0 ? (
                <p className="empty-message">No saved spellbooks. Create one to get started!</p>
              ) : (
                spellbooks.map(sb => (
                  <div
                    key={sb.id}
                    className={`spellbook-item ${currentSpellbookId === sb.id ? 'active' : ''}`}
                  >
                    <div className="spellbook-info" onClick={() => loadSpellbook(sb.id)}>
                      <div className="spellbook-name">{sb.name}</div>
                      <div className="spellbook-details">
                        {sb.characterClass || 'No class selected'} • {sb.selectedSpells.length} spells
                      </div>
                    </div>
                    <div className="spellbook-actions">
                      <button
                        className="icon-button"
                        title="Rename"
                        onClick={() => {
                          const newName = prompt('Enter new name:', sb.name);
                          if (newName) renameSpellbook(sb.id, newName);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button"
                        title="Export to JSON"
                        onClick={() => exportSpellbook(sb.id)}
                      >
                        💾
                      </button>
                      <button
                        className="icon-button delete-button"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete "${sb.name}"?`)) deleteSpellbook(sb.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentSpellbook && (
          <div className="current-spellbook-indicator">
            <strong>Current:</strong> {currentSpellbook.name}
            {currentSpellbook.characterClass && ` (${currentSpellbook.characterClass})`}
          </div>
        )}
      </div>

      {/* Class Selection */}
      <div id="class-section" className="class-selection no-print">
        <h2>Select Your Class</h2>
        <div className="class-buttons">
          {ALL_CLASSES.map(className => (
            <button
              key={className}
              className={`class-button ${selectedClass === className ? 'selected' : ''}`}
              onClick={() => {
                // Skip if clicking the same class
                if (selectedClass === className) {
                  return;
                }

                // Warn if changing classes with selected spells
                if (selectedClass && selectedSpells.size > 0) {
                  const confirmed = confirm(
                    `Changing classes will deselect all ${selectedSpells.size} spell${selectedSpells.size === 1 ? '' : 's'}. Continue?`
                  );
                  if (!confirmed) {
                    return;
                  }
                }

                const newSpells = new Set<string>();
                setSelectedClass(className);
                setSelectedSpells(newSpells);
                updateCurrentSpellbook(className, newSpells);
              }}
            >
              {className}
            </button>
          ))}
        </div>
      </div>

      {/* Spell Selection */}
      {selectedClass && (
        <div id="selection-section" className="spell-selection no-print">
          <h2>{selectedClass} Spells</h2>
          <p className="info">
            Click on spell names to toggle them. Selected spells will appear in your printable spellbook below.
          </p>

          {[...spellsByLevel.entries()].map(([level, spells]) => (
            <div key={level} id={`level-${level}`} className="spell-level-group">
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
        <div id="printable-section" className="spellbook">
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
              <div className="export-buttons no-print">
                <button className="print-button" onClick={() => window.print()}>
                  🖨️ Print Spellbook
                </button>
                <button
                  className="print-button"
                  onClick={() => currentSpellbook && exportSpellbookToMarkdown(currentSpellbook.id, sortOrder)}
                >
                  📝 Export to Markdown
                </button>
              </div>
            </div>
          </div>

          <div className="spell-cards-container">
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
                  {spell.components && (
                    <div className="stat-row">
                      <strong>Components:</strong> {spell.components}
                    </div>
                  )}
                  {spell.castingTime && (
                    <div className="stat-row">
                      <strong>Casting Time:</strong> {spell.castingTime}
                    </div>
                  )}
                  {spell.range && (
                    <div className="stat-row">
                      <strong>Range:</strong> {spell.range}
                    </div>
                  )}
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
                  {spell.duration && (
                    <div className="stat-row">
                      <strong>Duration:</strong> {spell.duration}
                    </div>
                  )}
                  {spell.savingThrow && (
                    <div className="stat-row">
                      <strong>Saving Throw:</strong> {spell.savingThrow}
                    </div>
                  )}
                  {spell.spellResistance && (
                    <div className="stat-row">
                      <strong>Spell Resistance:</strong> {spell.spellResistance}
                    </div>
                  )}
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
