import type { PortalState, AuthState, TryItState, RouteInfo } from './types';

type Listener = (state: PortalState) => void;
type PartialUpdate = Partial<PortalState>;

/** Simple reactive state store */
class Store {
  private state: PortalState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.defaultState();
  }

  private defaultState(): PortalState {
    return {
      spec: null,
      loading: true,
      error: null,
      route: { type: 'overview' },
      theme: 'light',
      sidebarOpen: true,
      searchOpen: false,
      activeEnvironment: 'default',
      environments: [{ name: 'default', baseUrl: '' }],
      initialEnvironments: [{ name: 'default', baseUrl: '' }],
      auth: { schemes: {}, activeScheme: '', token: '', locked: false, source: 'manual' },
      tryItState: null,
    };
  }

  get(): PortalState {
    return this.state;
  }

  set(update: PartialUpdate): void {
    this.state = { ...this.state, ...update };
    this.notify();
  }

  setAuth(update: Partial<AuthState>): void {
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, ...update },
    };
    this.notify();
  }

  /** Update a specific scheme value and sync token if it's the active scheme */
  setSchemeValue(schemeName: string, value: string): void {
    const schemes = { ...this.state.auth.schemes, [schemeName]: value };
    const activeScheme = schemeName; // selecting a scheme makes it active
    const token = value;
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, schemes, activeScheme, token, source: 'manual' },
    };
    this.notify();
  }

  setTryIt(update: Partial<TryItState> | null): void {
    if (update === null) {
      this.state = { ...this.state, tryItState: null };
    } else {
      this.state = {
        ...this.state,
        tryItState: { ...this.state.tryItState!, ...update },
      };
    }
    this.notify();
  }

  setRoute(route: RouteInfo): void {
    this.state = { ...this.state, route };
    this.notify();
  }

  /** Switch active environment */
  setActiveEnvironment(name: string): void {
    this.state = { ...this.state, activeEnvironment: name };
    this.notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn(this.state);
      } catch (e) {
        console.error('[ApiPortal] Subscriber error:', e);
      }
    }
  }

  reset(): void {
    this.state = this.defaultState();
    this.listeners.clear();
  }
}

export const store = new Store();
