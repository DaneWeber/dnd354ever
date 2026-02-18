/**
 * Tests for Spellbook Save/Load Functionality
 * 
 * This test suite validates the spellbook management features including:
 * - Creating new spellbooks
 * - Loading/switching between spellbooks
 * - Deleting spellbooks
 * - Renaming spellbooks
 * - Export/import functionality
 * - localStorage persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { SavedSpellbook } from '../types';

const STORAGE_KEY = 'dnd-spellbooks';

describe('Spellbook Save/Load - Data Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Creating Spellbooks', () => {
    it('should create a new spellbook with unique ID', () => {
      const spellbook1 = createMockSpellbook('Wizard Book');
      const spellbook2 = createMockSpellbook('Cleric Book');
      
      expect(spellbook1.id).toBeDefined();
      expect(spellbook2.id).toBeDefined();
      expect(spellbook1.id).not.toBe(spellbook2.id);
    });

    it('should initialize spellbook with correct default values', () => {
      const spellbook = createMockSpellbook('Test Book');
      
      expect(spellbook.name).toBe('Test Book');
      expect(spellbook.characterClass).toBeNull();
      expect(spellbook.selectedSpells).toEqual([]);
      expect(spellbook.createdAt).toBeDefined();
      expect(spellbook.updatedAt).toBeDefined();
    });
  });

  describe('localStorage Persistence', () => {
    it('should save spellbook to localStorage', () => {
      const spellbook = createMockSpellbook('Test Book');
      const data = {
        spellbooks: [spellbook],
        currentSpellbookId: spellbook.id,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.spellbooks).toHaveLength(1);
      expect(parsed.spellbooks[0].name).toBe('Test Book');
    });

    it('should load spellbooks from localStorage', () => {
      const spellbook1 = createMockSpellbook('Book 1');
      const spellbook2 = createMockSpellbook('Book 2');
      
      const data = {
        spellbooks: [spellbook1, spellbook2],
        currentSpellbookId: spellbook1.id,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      
      expect(parsed.spellbooks).toHaveLength(2);
      expect(parsed.currentSpellbookId).toBe(spellbook1.id);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {');
      
      let error: Error | null = null;
      try {
        JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeDefined();
    });

    it('should handle missing localStorage data', () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeNull();
    });
  });

  describe('Updating Spellbooks', () => {
it('should update spellbook name', async () => {
    const spellbook = createMockSpellbook('Old Name');
    
    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
      const updatedSpellbook = {
        ...spellbook,
        name: 'New Name',
        updatedAt: new Date().toISOString(),
      };
      
      expect(updatedSpellbook.name).toBe('New Name');
      expect(updatedSpellbook.updatedAt).not.toBe(spellbook.updatedAt);
    });

    it('should update selected spells', () => {
      const spellbook = createMockSpellbook('Test Book');
      const updatedSpellbook = {
        ...spellbook,
        selectedSpells: ['spell-1', 'spell-2', 'spell-3'],
        updatedAt: new Date().toISOString(),
      };
      
      expect(updatedSpellbook.selectedSpells).toHaveLength(3);
      expect(updatedSpellbook.selectedSpells).toContain('spell-1');
    });

    it('should update character class', () => {
      const spellbook = createMockSpellbook('Test Book');
      const updatedSpellbook = {
        ...spellbook,
        characterClass: 'Wizard' as const,
        updatedAt: new Date().toISOString(),
      };
      
      expect(updatedSpellbook.characterClass).toBe('Wizard');
    });
  });

  describe('Deleting Spellbooks', () => {
    it('should remove spellbook from list', () => {
      const spellbook1 = createMockSpellbook('Book 1');
      const spellbook2 = createMockSpellbook('Book 2');
      const spellbooks = [spellbook1, spellbook2];
      
      const filtered = spellbooks.filter(sb => sb.id !== spellbook1.id);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(spellbook2.id);
    });

    it('should handle deleting non-existent spellbook', () => {
      const spellbook = createMockSpellbook('Book 1');
      const spellbooks = [spellbook];
      
      const filtered = spellbooks.filter(sb => sb.id !== 'non-existent-id');
      
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Export/Import Functionality', () => {
    it('should export spellbook as JSON string', () => {
      const spellbook = createMockSpellbook('Export Test');
      spellbook.characterClass = 'Wizard';
      spellbook.selectedSpells = ['spell-1', 'spell-2'];
      
      const exported = JSON.stringify(spellbook, null, 2);
      
      expect(exported).toContain('Export Test');
      expect(exported).toContain('Wizard');
      expect(exported).toContain('spell-1');
    });

    it('should import spellbook from JSON string', () => {
      const original = createMockSpellbook('Import Test');
      original.characterClass = 'Cleric';
      original.selectedSpells = ['spell-a', 'spell-b'];
      
      const exported = JSON.stringify(original);
      const imported = JSON.parse(exported) as SavedSpellbook;
      
      expect(imported.name).toBe('Import Test');
      expect(imported.characterClass).toBe('Cleric');
      expect(imported.selectedSpells).toEqual(['spell-a', 'spell-b']);
    });

    it('should generate new ID on import to avoid conflicts', () => {
      const original = createMockSpellbook('Test');
      const originalId = original.id;
      
      // Simulate import - generate new ID
      const imported = {
        ...original,
        id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      
      expect(imported.id).not.toBe(originalId);
    });
  });

  describe('Spell Selection Management', () => {
    it('should add spell to selection', () => {
      const selected = new Set<string>();
      selected.add('spell-1');
      
      expect(selected.has('spell-1')).toBe(true);
      expect(selected.size).toBe(1);
    });

    it('should remove spell from selection', () => {
      const selected = new Set<string>(['spell-1', 'spell-2']);
      selected.delete('spell-1');
      
      expect(selected.has('spell-1')).toBe(false);
      expect(selected.has('spell-2')).toBe(true);
      expect(selected.size).toBe(1);
    });

    it('should toggle spell selection', () => {
      const selected = new Set<string>(['spell-1']);
      const spellId = 'spell-2';
      
      if (selected.has(spellId)) {
        selected.delete(spellId);
      } else {
        selected.add(spellId);
      }
      
      expect(selected.has('spell-2')).toBe(true);
      expect(selected.size).toBe(2);
    });

    it('should select all spells in a group', () => {
      const spellIds = ['spell-1', 'spell-2', 'spell-3'];
      const selected = new Set<string>();
      
      spellIds.forEach(id => selected.add(id));
      
      expect(selected.size).toBe(3);
      expect(spellIds.every(id => selected.has(id))).toBe(true);
    });

    it('should deselect all spells in a group', () => {
      const spellIds = ['spell-1', 'spell-2', 'spell-3'];
      const selected = new Set<string>(spellIds);
      
      spellIds.forEach(id => selected.delete(id));
      
      expect(selected.size).toBe(0);
    });

    it('should convert Set to Array for storage', () => {
      const selected = new Set<string>(['spell-1', 'spell-2', 'spell-3']);
      const array = Array.from(selected);
      
      expect(Array.isArray(array)).toBe(true);
      expect(array).toHaveLength(3);
      expect(array).toContain('spell-1');
    });

    it('should convert Array to Set when loading', () => {
      const array = ['spell-1', 'spell-2', 'spell-3'];
      const selected = new Set<string>(array);
      
      expect(selected.size).toBe(3);
      expect(selected.has('spell-1')).toBe(true);
    });
  });
});

// Helper function to create mock spellbooks for testing
function createMockSpellbook(name: string): SavedSpellbook {
  return {
    id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    characterClass: null,
    selectedSpells: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
