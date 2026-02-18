import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock window methods not available in happy-dom
global.window.prompt = vi.fn();
global.window.alert = vi.fn();
global.window.confirm = vi.fn();
global.window.print = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear localStorage
  localStorage.clear();
  // Clear all mocks
  vi.clearAllMocks();
});
