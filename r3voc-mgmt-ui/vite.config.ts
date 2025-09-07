import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // activate source maps in development
    build: {
        sourcemap: true,
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
    preview: {
        allowedHosts: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    }
})
