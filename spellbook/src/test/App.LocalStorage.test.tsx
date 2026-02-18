/**
 * Tests for App Component - localStorage Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - localStorage Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist spellbook to localStorage', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Persisted Book');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Create spellbook
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Wait for localStorage to be updated
    await waitFor(() => {
      const stored = localStorage.getItem('dnd-spellbooks');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.spellbooks).toBeDefined();
        expect(parsed.spellbooks.length).toBeGreaterThan(0);
      }
    });
  });

  it('should load spellbooks from localStorage on mount', async () => {
    const user = userEvent.setup();

    // Pre-populate localStorage
    const mockData = {
      spellbooks: [
        {
          id: 'test-id',
          name: 'Preloaded Book',
          characterClass: 'Wizard',
          selectedSpells: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      currentSpellbookId: 'test-id',
    };

    localStorage.setItem('dnd-spellbooks', JSON.stringify(mockData));

    render(<App />);

    // Toggle manager to see spellbooks
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Should display the preloaded spellbook
    await waitFor(() => {
      expect(screen.queryByText('Preloaded Book')).toBeInTheDocument();
    });
  });

  it('should handle empty localStorage gracefully', () => {
    // Ensure localStorage is empty
    localStorage.clear();

    render(<App />);

    // Should render without errors
    expect(screen.getByText(/D&D 3.5 Spellbook Generator/i)).toBeInTheDocument();
  });
});
