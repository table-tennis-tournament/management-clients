import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';
import { dragAndDrop } from './helpers';

test.describe('Zuweiser View', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should assign a match to a table via drag and drop with "Alle" selected', async ({ page }) => {
    await page.goto('/admin-view/assignView');

    // Open the discipline dropdown and check the menu entries.
    const select = page.locator('toma-discipline-match-list mat-select');
    await select.click();
    const options = page.locator('mat-option');
    await expect(options.filter({ hasText: 'Warteschlange' })).toBeVisible();
    await expect(options.filter({ hasText: 'Alle' })).toBeVisible();

    // Select "Alle".
    await options.filter({ hasText: 'Alle' }).click();

    // Match 3 is uniquely identified by both of its players.
    const matchItem = page
      .locator('.discipline-match-list-item')
      .filter({ hasText: 'Priyanka Sow' })
      .filter({ hasText: 'Babajide Santos' })
      .first();
    await expect(matchItem).toBeVisible({ timeout: 15000 });

    const firstTable = page.locator('toma-tt-table').first();
    await expect(firstTable).toContainText('Frei');

    await dragAndDrop(page, matchItem, firstTable.locator('span.card-title'));

    await expect(firstTable.locator('toma-tt-table-match-item')).toBeVisible({ timeout: 15000 });
    await expect(firstTable).toContainText('Priyanka Sow');
    await expect(firstTable).toContainText('Babajide Santos');
  });
});
