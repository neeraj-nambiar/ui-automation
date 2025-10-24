import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: [
    ['html', { open: 'never' }], 
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://master.usw2.trial.ezyvet.com',
    trace: process.env.TRACE || 'on-first-retry',
    screenshot: process.env.SCREENSHOT || 'only-on-failure',
    video: process.env.VIDEO || 'retain-on-failure',
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '30000'),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000'),
    headless: process.env.HEADLESS === 'true',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: 'test-results/',
});
