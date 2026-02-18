/**
 * Tests for App Component - Navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('should render unified navigation with base buttons', () => {
    render(<App />);

    // The unified nav buttons don't have accessible text, they use emojis
    // Check for the nav container instead
    const navButtons = document.querySelectorAll('.unified-nav .nav-button');
    // Should have at least 2 base buttons (Spellbooks and Class)
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should show additional nav buttons when class is selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Initial nav buttons
    let navButtons = document.querySelectorAll('.unified-nav .nav-button');
    const initialCount = navButtons.length;

    // Expand manager and create spellbook
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    // Select a class
    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Should show spell selection nav button after class selection
    await waitFor(() => {
      navButtons = document.querySelectorAll('.unified-nav .nav-button');
      expect(navButtons.length).toBeGreaterThan(initialCount);
    });
  });

  it('should show printable nav button when spells are selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup spellbook and class
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Select a spell
    await waitFor(() => {
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Should now show printable section nav button
    await waitFor(() => {
      const navButtons = document.querySelectorAll('.unified-nav .nav-button');
      expect(navButtons.length).toBeGreaterThan(3); // At least section buttons + level buttons
    });
  });

  it('should render level navigation when class is selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // No level nav initially
    expect(document.querySelector('.nav-levels')).not.toBeInTheDocument();

    // Setup spellbook and class
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Level nav should now appear
    await waitFor(() => {
      expect(document.querySelector('.nav-levels')).toBeInTheDocument();
    });
  });

  it('should have level buttons for each spell level', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup spellbook and class
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Check for level navigation buttons (Wizard has spells from level 0-9)
    await waitFor(() => {
      const levelButtons = document.querySelectorAll('.nav-levels .nav-button');
      expect(levelButtons.length).toBeGreaterThan(0);
      // Wizard should have multiple spell levels
      expect(levelButtons.length).toBeGreaterThanOrEqual(10); // 0-9
    });
  });

  it('should call scrollIntoView when nav button is clicked', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;

    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Setup spellbook and class
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Wait for level nav to appear
    await waitFor(() => {
      expect(document.querySelector('.nav-levels')).toBeInTheDocument();
    });

    // Click a level button
    const levelButtons = document.querySelectorAll('.nav-levels .nav-button');
    if (levelButtons.length > 0) {
      await user.click(levelButtons[0] as HTMLElement);

      // scrollIntoView should have been called
      await waitFor(() => {
        expect(scrollSpy).toHaveBeenCalled();
      });
    }
  });

  it('should navigate to class section when class nav button clicked', async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;

    render(<App />);

    // Find and click the class nav button (second button in nav-sections)
    const navSections = document.querySelector('.nav-sections');
    const navButtons = navSections?.querySelectorAll('.nav-button');
    expect(navButtons).toBeDefined();
    expect(navButtons!.length).toBeGreaterThanOrEqual(2);

    await user.click(navButtons![1] as HTMLElement);

    // Should call scrollIntoView on the class section
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
      const classSectionElement = document.getElementById('class-section');
      expect(classSectionElement).toBeInTheDocument();
    });
  });
});
