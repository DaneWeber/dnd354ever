import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock window methods not available in happy-dom
globalThis.window.prompt = vi.fn();
globalThis.window.alert = vi.fn();
globalThis.window.confirm = vi.fn();
globalThis.window.print = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear localStorage
  localStorage.clear();
  // Clear all mocks
  vi.clearAllMocks();
});
