/**
 * src/test/setup.ts
 * Vitest global setup: jsdom environment + @testing-library/jest-dom matchers
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (target, prop: string) => {
        const Original = (target as any)[prop];
        if (typeof Original === 'function') {
          return ({ children, ...rest }: any) => {
            // Strip framer-motion props to avoid warnings in jsdom
            const {
              initial, animate, exit, transition, variants,
              whileHover, whileTap, whileFocus, whileInView,
              viewport, layout, layoutId,
              ...domProps
            } = rest;
            const React = require('react');
            return React.createElement(prop, domProps, children);
          };
        }
        return Original;
      },
    }),
    AnimatePresence: ({ children }: any) => children,
    useInView: () => true,
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: vi.fn(),
    }),
    animate: vi.fn().mockReturnValue({ stop: vi.fn() }),
  };
});

// Mock IntersectionObserver for jsdom & Framer Motion useInView
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Suppress recharts warnings in test env
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});
