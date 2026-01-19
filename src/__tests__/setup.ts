import '@testing-library/jest-dom/vitest';
import { afterAll, beforeAll, vi } from 'vitest';

// Mock IntersectionObserver
class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
class MockResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

global.ResizeObserver = MockResizeObserver as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
});

// Mock navigator.geolocation
const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
});

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    })),
}));

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: 'div',
        span: 'span',
        button: 'button',
        section: 'section',
        article: 'article',
        nav: 'nav',
        header: 'header',
        footer: 'footer',
        main: 'main',
        aside: 'aside',
        ul: 'ul',
        li: 'li',
        p: 'p',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        h5: 'h5',
        h6: 'h6',
        a: 'a',
        img: 'img',
        form: 'form',
        input: 'input',
        textarea: 'textarea',
        label: 'label',
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn(),
    }),
    useInView: () => true,
    useScroll: () => ({
        scrollY: { get: () => 0 },
        scrollYProgress: { get: () => 0 },
    }),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
                args[0].includes('Warning: An update to') ||
                args[0].includes('act(...)'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
