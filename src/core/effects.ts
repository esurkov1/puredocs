import type { PortalState } from './types';

type EffectHandler = (state: PortalState) => void;
type CleanupFn = () => void;

/**
 * Page-scoped reactive effects manager.
 *
 * Each page component registers its own effects at render time via `useEffects()`.
 * When state changes (env / auth) without a route change, `notifyEffects()` runs
 * all registered handlers so every component can update itself.
 * On route change, `disposeEffects()` tears everything down cleanly.
 *
 * This replaces the monolithic `updateEnvironmentState` in app.ts — each component
 * now owns its reactive behaviour.
 */
class Effects {
  private handlers = new Map<string, EffectHandler>();
  private cleanupFns: CleanupFn[] = [];

  /** Register a named reactive handler that runs on every state change */
  on(key: string, handler: EffectHandler): void {
    this.handlers.set(key, handler);
  }

  /** Register a cleanup callback (runs on dispose) */
  onCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }

  /** Run all registered handlers with current state */
  notify(state: PortalState): void {
    for (const handler of this.handlers.values()) {
      try {
        handler(state);
      } catch (e) {
        console.error('[Effects] handler error:', e);
      }
    }
  }

  /** Dispose: run cleanups and clear all handlers */
  dispose(): void {
    for (const fn of this.cleanupFns) {
      try { fn(); } catch { /* ignore */ }
    }
    this.cleanupFns.length = 0;
    this.handlers.clear();
  }
}

let current: Effects | null = null;

/** Get the current page effects instance (creates one if needed) */
export function useEffects(): Effects {
  if (!current) current = new Effects();
  return current;
}

/** Notify all page effects of a state change (env / auth) */
export function notifyEffects(state: PortalState): void {
  current?.notify(state);
}

/** Dispose current effects — call on route change / unmount */
export function disposeEffects(): void {
  current?.dispose();
  current = null;
}
