/**
 * Tests for App Component - Spellbook Management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - Spellbook Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create new spellbook', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('My Spellbook');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Now click the New Spellbook button
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    expect(window.prompt).toHaveBeenCalled();

    // Should show the new spellbook in the manager (appears in multiple places)
    await waitFor(() => {
      const spellbookElements = screen.getAllByText('My Spellbook');
      expect(spellbookElements.length).toBeGreaterThan(0);
    });
  });

  it('should show spellbook manager when toggled', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Manager content should be visible
    await waitFor(() => {
      expect(screen.queryByText(/New Spellbook/i)).toBeInTheDocument();
    });
  });
});
