import { defineConfig, devices } from '@playwright/test';

const frontendUrl = process.env.PW_FRONTEND_URL ?? 'http://localhost:3000';
const frontendPort = new URL(frontendUrl).port || '3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  forbidOnly: true,
  retries: 0,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: '.omo/evidence/playwright-report' }],
    ['json', { outputFile: '.omo/evidence/final/playwright-94.json' }],
  ],
  use: {
    baseURL: frontendUrl,
    browserName: 'chromium',
    channel: 'chrome',
    colorScheme: 'dark',
    locale: 'ko-KR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: [
    {
      command: 'npm run start:playwright',
      cwd: '../kaleo_youth_backend',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: process.env.PW_REUSE_EXISTING === '1',
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `PORT=${frontendPort} yarn dev`,
      url: frontendUrl,
      reuseExistingServer: process.env.PW_REUSE_EXISTING === '1',
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
