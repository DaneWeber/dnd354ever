/**
 * Tests for React Components
 * 
 * This test suite validates the React component behavior including:
 * - Basic rendering
 * - Class selection
 * - Spellbook manager UI
 * - localStorage integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component - Basic Rendering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the app header', () => {
    render(<App />);
    expect(screen.getByText(/D&D 3.5 Spellbook Generator/i)).toBeInTheDocument();
  });

  it('should render class selection buttons', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Wizard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cleric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Druid/i })).toBeInTheDocument();
  });

  it('should render spellbook manager', () => {
    render(<App />);
    expect(screen.getByText(/Saved Spellbooks/i)).toBeInTheDocument();
  });

  it('should create a default spellbook on first load', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Expand manager to see spellbooks
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    // Should have a default spellbook "My Spellbook"
    await waitFor(() => {
      const spellbooks = screen.getAllByText('My Spellbook');
      expect(spellbooks.length).toBeGreaterThan(0);
    });
  });
});

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
});

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

describe('App Component - Print Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have window.print available', () => {
    expect(window.print).toBeDefined();
  });
});

describe('App Component - Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('should render floating navigation with base buttons', () => {
    render(<App />);

    // The floating nav buttons don't have accessible text, they use emojis
    // Check for the nav container instead
    const navButtons = document.querySelectorAll('.floating-nav .nav-button');
    // Should have at least 2 base buttons (Spellbooks and Class)
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should show additional nav buttons when class is selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // Initial nav buttons
    let navButtons = document.querySelectorAll('.floating-nav .nav-button');
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
      navButtons = document.querySelectorAll('.floating-nav .nav-button');
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
      const navButtons = document.querySelectorAll('.floating-nav .nav-button');
      expect(navButtons.length).toBe(4); // All 4 nav buttons should be visible
    });
  });

  it('should render level navigation when class is selected', async () => {
    const user = userEvent.setup();
    (window.prompt as unknown as ReturnType<typeof vi.fn>).mockReturnValue('Test Book');

    render(<App />);

    // No level nav initially
    expect(document.querySelector('.level-nav')).not.toBeInTheDocument();

    // Setup spellbook and class
    const toggleButton = screen.getByText(/Show.*Manager/i);
    await user.click(toggleButton);

    const newButton = screen.getByText(/New Spellbook/i);
    await user.click(newButton);

    const wizardButton = screen.getByRole('button', { name: /^Wizard$/i });
    await user.click(wizardButton);

    // Level nav should now appear
    await waitFor(() => {
      expect(document.querySelector('.level-nav')).toBeInTheDocument();
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
      const levelButtons = document.querySelectorAll('.level-nav-button');
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
      expect(document.querySelector('.level-nav')).toBeInTheDocument();
    });

    // Click a level button
    const levelButtons = document.querySelectorAll('.level-nav-button');
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

    // Find and click the class nav button (second button - index 1)
    const navButtons = document.querySelectorAll('.floating-nav .nav-button');
    expect(navButtons.length).toBeGreaterThanOrEqual(2);

    await user.click(navButtons[1] as HTMLElement);

    // Should call scrollIntoView on the class section
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
      const classSectionElement = document.getElementById('class-section');
      expect(classSectionElement).toBeInTheDocument();
    });
  });
});