import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => {
  return {
    plugins: [angular()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['src/**/*.spec.ts'],
      exclude: ['e2e/**', 'node_modules/**'],
      reporters: ['default'],
      // npm run test:coverage; report in coverage/ (index.html)
      coverage: {
        provider: 'v8',
        include: ['src/app/**/*.ts'],
        exclude: ['src/app/**/*.spec.ts', 'src/app/testing/**'],
        reporter: ['text-summary', 'html', 'json-summary'],
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
