import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'build', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/index.ts',
            ],
        },
        testTimeout: 10000,
        hookTimeout: 10000,
        // Force re-run tests
        cache: false,
        // Enable watch mode debugging
        reporter: ['verbose'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'figma:asset/1ccf434105a811706fd618a3b652ae052ecf47e1.png': path.resolve(__dirname, './src/assets/1ccf434105a811706fd618a3b652ae052ecf47e1.png'),
        },
    },
});
