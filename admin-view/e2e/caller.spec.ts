import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';

test.describe('Ausrufer View', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should show an assigned match and remove it after clicking OK', async ({ page, request }) => {
    // Assign match 3 (Priyanka Sow vs Babajide Santos) to table 1 via the API.
    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();

    await page.goto('/admin-view/callerView');

    const detail = page.locator('toma-caller-match-detail');
    await expect(detail).toContainText('Priyanka Sow', { timeout: 15000 });
    await expect(detail).toContainText('Babajide Santos');

    await detail.locator('button:has-text("OK")').click();

    await expect(detail).toContainText('Keine Spiele zum Ausrufen', { timeout: 15000 });
  });
});
