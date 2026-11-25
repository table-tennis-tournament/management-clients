import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';
import { getMatch, tableCard } from './helpers';

test.describe('Ausrufer View', () => {
  test.beforeAll(async () => {
    // a cold start may (re)build the backend image and initialise MariaDB, so the hook needs more than the default 30s
    test.setTimeout(600_000);
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

  test('announces a requested Second call naming only the missing player, and the Assign view shows it', async ({
    page,
    request,
  }) => {
    // match 3 (Priyanka Sow vs Babajide Santos) at table 1, its first Call announced; Babajide Santos is missing
    await request.post('/api/v2/match/takeBack', { data: [3] });
    expect((await request.post('/api/v2/match/matchtotable/1', { data: [3] })).ok()).toBeTruthy();
    expect((await request.post('/api/v2/match/call', { data: [3] })).ok()).toBeTruthy();
    const missing = (await getMatch(request, 3)).team2[0].id;
    expect((await request.post('/api/v2/playercall/3', { data: [missing] })).ok()).toBeTruthy();

    await page.goto('/admin-view/callerView');
    const card = page.locator('toma-second-call-match-detail');
    await expect(card).toContainText('2. Aufruf', { timeout: 15000 });
    await expect(card).toContainText('Babajide Santos');
    await expect(card).not.toContainText('Priyanka Sow');
    await expect(card).toContainText('Erster Aufruf vor 0 min');

    await card.getByRole('button', { name: 'OK' }).click();

    await expect(card).toContainText('Keine weiteren Aufrufe', { timeout: 15000 });
    const match = await getMatch(request, 3);
    expect(match.callNumber).toBe(2);
    expect(match.requestedCallNumber).toBeNull();

    await page.goto('/admin-view/assignView');
    await expect(tableCard(page, 1)).toContainText('2. Aufruf · seit 0 min', { timeout: 15000 });
  });
});
