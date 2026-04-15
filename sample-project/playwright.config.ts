import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3847',
    headless: true,
  },
  webServer: {
    command: 'node ../sample-server.js',
    port: 3847,
    reuseExistingServer: true,
  },
});
