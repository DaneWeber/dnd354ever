/**
 * Tests for App Component - Spell Selection and Display
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - Spell Selection and Display', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should allow toggling spell selection', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Setup - create spellbook
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Wait for spells to load
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    // Toggle a spell
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];

    await user.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // Should show selected spell count in spellbook info
    await waitFor(() => {
      // The spellbook item should show "1 spell" or similar
      const spellbookInfo = screen.queryByText(/1 spell/i);
      expect(spellbookInfo).toBeInTheDocument();
    });
  });

  it('should show print button when spells are selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Setup
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    // Select a spell
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Should show print button
    await waitFor(() => {
      expect(screen.queryByText(/Print Spellbook/i)).toBeInTheDocument();
    });
  });
});
