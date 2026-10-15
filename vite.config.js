import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preserve both standard and prefixed material declarations. The CSS optimiser
// otherwise drops the standard backdrop-filter on some paired declarations.
export default defineConfig({ plugins: [react()], build: { target: 'es2022', cssMinify: false, sourcemap: true } });
