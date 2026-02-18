/**
 * Tests for App Component - Basic Rendering
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
