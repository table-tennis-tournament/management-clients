import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';

test.describe('Websocket live updates', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('reflects a remote match assignment via the STOMP websocket', async ({ page, request }) => {
    await page.goto('/admin-view/assignView');

    // Idempotent reset: take match 3 back so it is Open and on no table.
    const takeBackResponse = await request.post('/api/v2/match/takeBack', { data: [3] });
    expect(takeBackResponse.ok()).toBeTruthy();

    const firstTable = page.locator('toma-tt-table').first();
    await expect(firstTable).toContainText('Frei', { timeout: 15000 });

    // Another client assigns match 3 (Priyanka Sow vs Babajide Santos) to table 1.
    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();

    // The already-open page reflects the assignment without a reload, driven by the websocket.
    await expect(firstTable.locator('toma-tt-table-match-item')).toBeVisible({ timeout: 15000 });
    await expect(firstTable).toContainText('Priyanka Sow');
    await expect(firstTable).toContainText('Babajide Santos');
  });
});
