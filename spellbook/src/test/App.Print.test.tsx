/**
 * Tests for App Component - Print Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('App Component - Print Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have window.print available', () => {
    expect(window.print).toBeDefined();
  });
});
