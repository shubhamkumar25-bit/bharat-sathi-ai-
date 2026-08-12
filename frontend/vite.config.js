var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
    // GitHub Pages serves the app under /<repo-name>/ so we set base accordingly.
    // In local dev (VITE_BASE_PATH is unset) this defaults to '/' which keeps the
    // dev server working normally.
    base: (_a = process.env.VITE_BASE_PATH) !== null && _a !== void 0 ? _a : '/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        proxy: {
            '/api': 'http://localhost:4000',
        },
    },
});
