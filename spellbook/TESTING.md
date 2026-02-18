# Testing Documentation

## Overview

This project uses **Vitest** as the testing framework with React Testing Library for component testing. All tests are located in the `src/test/` directory.

## Test Suite Summary

✅ **51 tests passing** across 3 test files

### Test Files

1. **parseMarkdownSpells.test.ts** (17 tests)
   - Spell level parsing (Sor/Wiz, individual classes, full names, domains)
   - School/subschool/descriptor parsing
   - Text cleaning utilities
   - Integration tests for markdown spell parsing

2. **spellbookPersistence.test.ts** (21 tests)
   - Creating spellbooks
   - localStorage persistence
   - Updating spellbooks (name, spells, class)
   - Deleting spellbooks
   - Export/import functionality
   - Spell selection management (add, remove, toggle, bulk operations)

3. **App.test.tsx** (13 tests)
   - Basic rendering
   - Class selection
   - Spellbook management UI
   - localStorage integration
   - Spell selection and display
   - Print functionality

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (interactive)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage (once coverage tool is added)
npm run test:coverage
```

## Test Configuration

Tests are configured in `vite.config.ts` with the following setup:
- **Environment**: happy-dom (lightweight DOM implementation)
- **Globals**: enabled for direct use of `describe`, `it`, `expect`
- **Setup file**: `src/test/setup.ts` for global mocks and cleanup

### Global Mocks

The following window methods are mocked globally in `src/test/setup.ts`:
- `window.prompt`
- `window.alert`
- `window.confirm`
- `window.print`

localStorage is automatically cleared after each test.

## Test Utilities

Custom test utilities are available in `src/test/testUtils.tsx`:
- Custom `render` function for future extensibility
- Re-exports all Testing Library utilities

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';

describe('Feature Name', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should do something', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    // Interact with the component
    const button = screen.getByRole('button', { name: /Click Me/i });
    await user.click(button);
    
    // Assert the outcome
    await waitFor(() => {
      expect(screen.getByText(/Success/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Wait for async updates**: Use `waitFor` when testing asynchronous behavior
3. **Clean up**: Always clear localStorage/sessionStorage in `beforeEach`
4. **Mock window methods**: Use the global mocks for `window.prompt`, etc.
5. **Test user interactions**: Use `@testing-library/user-event` for realistic interactions
6. **Test multiple occurrences**: Use `getAllByText` when elements appear multiple times

## Coverage Goals

- **Markdown Parser**: Full coverage of parsing logic and edge cases
- **Spellbook Persistence**: All CRUD operations and localStorage behavior
- **React Components**: Key user interactions and UI states
- **Edge Cases**: Corrupted data, empty states, error handling

## Future Enhancements

- [ ] Add coverage reporting (`@vitest/coverage-v8`)
- [ ] Add E2E tests for critical user flows
- [ ] Add visual regression testing
- [ ] Test timezone handling in spell metadata
- [ ] Test with different spell data volumes
- [ ] Performance tests for large spellbooks

## Troubleshooting

### Tests failing due to missing window methods
Make sure `src/test/setup.ts` has the necessary mocks.

### Tests timing out
Increase the timeout in individual tests:
```typescript
it('should do something', async () => {
  // test code
}, { timeout: 10000 }); // 10 seconds
```

### localStorage not persisting between tests
This is intentional - localStorage is cleared after each test for isolation.

### Multiple elements with same text
Use `getAllByText` and check the array length, or be more specific with queries:
```typescript
const elements = screen.getAllByText('My Spellbook');
expect(elements.length).toBeGreaterThan(0);
```
