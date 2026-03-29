import { test, expect } from '@playwright/test';

test.describe('Table Manager UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console logs
    page.on('console', msg => {
      console.log(`BROWSER LOG: ${msg.text()}`);
    });

    // Navigate to the table manager 1 application
    await page.goto('/tablemanager1');
  });

  test('should show 5 tables for tablemanager 1', async ({ page }) => {
    // Wait for tables to be loaded
    const tables = page.locator('app-tt-table');
    
    // Sometimes it takes a moment for NgRx to load and render the tables
    await expect(tables).toHaveCount(5, { timeout: 30000 });

    // Log the table numbers found
    const tableBadges = page.locator('app-tt-table mat-badge');
    const badgeTexts = await tableBadges.allTextContents();
    console.log(`Found table numbers: ${badgeTexts.join(', ')}`);
  });

  test('should show a game after assigning match to table via API', async ({ page, request }) => {
    // 1. Assign match 1 to table 1
    // Using the same endpoint as in admin-view: POST api/match/matchtotable/{tableNr}
    const response = await request.post('/api/match/matchtotable/1', {
      data: [1]
    });
    expect(response.ok()).toBeTruthy();

    // 2. Wait for the table to reflect the change
    // The app uses websockets, so it should update automatically.
    // We look for match item in the first table
    const matchItem = page.locator('app-tt-table').first().locator('app-match-item');
    await expect(matchItem).toBeVisible({ timeout: 15000 });
  });

  test('should be able to start a match', async ({ page, request }) => {
    // 1. Ensure a match is assigned to table 1
    await request.post('/api/match/matchtotable/1', {
      data: [1]
    });

    // 2. Find the start button (it has a play_arrow icon)
    // The button is inside app-match-item which is inside app-tt-table
    const startButton = page.locator('app-tt-table').first().locator('button:has(mat-icon:has-text("play_arrow"))');
    await expect(startButton).toBeVisible({ timeout: 15000 });
    
    // 3. Click the start button
    await startButton.click();

    // 4. Verify that the match has started (table content should change)
    // When started, it should show "Erfassen" button
    const erfassenButton = page.locator('app-tt-table').first().locator('button:has-text("Erfassen")');
    await expect(erfassenButton).toBeVisible({ timeout: 15000 });
  });
});
