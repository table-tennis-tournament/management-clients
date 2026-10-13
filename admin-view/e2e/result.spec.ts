import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';

test.describe('Ergebnisse View', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('freigeben moves a match to Ergebnisse and entering a result removes it', async ({ page, request }) => {
    // 1. Put match 3 (Priyanka Sow vs Babajide Santos) on table 1 via the API.
    const assignResponse = await request.post('/api/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();

    // 2. Free the match (freigeben) instead of completing it.
    await page.goto('/admin-view/tableView');
    const tableWithMatch = page.locator('toma-tt-table').filter({ hasText: 'Priyanka Sow' }).first();
    await expect(tableWithMatch).toBeVisible({ timeout: 15000 });

    const freiButton = tableWithMatch.locator('button:has-text("Frei")');
    await freiButton.click();
    await expect(freiButton).toBeHidden({ timeout: 15000 });

    // 3. The freed match now appears in the Ergebnisse view.
    await page.goto('/admin-view/resultView');
    const matchRow = page.locator('tr').filter({ hasText: 'Priyanka Sow' }).first();
    await expect(matchRow).toBeVisible({ timeout: 15000 });

    // 4. Enter a result (player 1 wins 3:0) and press Enter -> the match disappears.
    const resultInput = matchRow.locator('input').first();
    await resultInput.click();
    await resultInput.pressSequentially('5 5 5');
    await resultInput.press('Enter');

    await expect(matchRow).toBeHidden({ timeout: 15000 });
  });
});
