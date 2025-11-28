import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Happy_BirthDay.github.io/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
});
