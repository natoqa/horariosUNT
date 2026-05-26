import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: '@/modules',
        replacement: path.resolve(__dirname, 'src/modules'),
      },
      { find: '@/shared', replacement: path.resolve(__dirname, 'src/shared') },
      { find: '@', replacement: path.resolve(__dirname, '.') },
    ],
  },
});
