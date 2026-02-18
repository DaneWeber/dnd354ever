/**
 * Tests for App Component - Class Selection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - Class Selection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should allow selecting a class', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Create a new spellbook
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select Wizard class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Button should become active
    await waitFor(() => {
      expect(wizardButton).toHaveClass('selected');
    });
  });

  it('should display available spells when class is selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Expand manager first
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Create spellbook
    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select a class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Should show spell checkboxes (actual spell data will be loaded from the real spell data)
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it('should not show confirmation when changing classes with no spells selected', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm');
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select first class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Change to another class without selecting spells
    const clericButton = screen.getByRole('button', { name: /^Cleric$/i });
    await user.click(clericButton);

    // Should not show confirmation
    expect(confirmSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(clericButton).toHaveClass('selected');
    });
  });

  it('should show confirmation when changing classes with spells selected', async () => {
    const user = userEvent.setup();
    const confirmMock = window.confirm as unknown as ReturnType<typeof vi.fn>;
    confirmMock.mockReturnValue(true); // User confirms
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Wait for spells and select one
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Try to change class
    const clericButton = screen.getByRole('button', { name: /^Cleric$/i });
    await user.click(clericButton);

    // Should show confirmation
    expect(confirmMock).toHaveBeenCalledWith(expect.stringContaining('Changing classes will deselect all 1 spell'));

    await waitFor(() => {
      expect(clericButton).toHaveClass('selected');
    });
  });

  it('should not change class when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const confirmMock = window.confirm as unknown as ReturnType<typeof vi.fn>;
    confirmMock.mockReturnValue(false); // User cancels
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Wait for spells and select one
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Try to change class
    const clericButton = screen.getByRole('button', { name: /^Cleric$/i });
    await user.click(clericButton);

    // Should show confirmation
    expect(confirmMock).toHaveBeenCalled();

    // Should still be on Wizard
    expect(wizardButton).toHaveClass('selected');
    expect(clericButton).not.toHaveClass('selected');
  });

  it('should allow clicking the same class without confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm');
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Wait for spells and select one
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Click the same class again
    await user.click(wizardButton);

    // Should not show confirmation
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(wizardButton).toHaveClass('selected');
  });
});
