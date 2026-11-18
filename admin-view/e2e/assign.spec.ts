import { expect, Page, test } from '@playwright/test';
import { resetDatabase } from './db-helper';
import { dragAndDrop, errorToast, getMatch, resetTournament, tableCard } from './helpers';

// Herren A, group A: match 1 Nicolas Kowalska vs Babajide Santos, 2 Nicolas Kowalska vs Priyanka Sow,
// 3 Priyanka Sow vs Babajide Santos; group B: match 4 Ji-hoon Mensah vs Mei Castro. Tables 1 to 9 are free.

async function chooseDiscipline(page: Page, name: string): Promise<void> {
  await page.locator('toma-discipline-match-list mat-select').click();
  await page.getByRole('option', { name, exact: true }).click();
}

function matchItem(page: Page, player1: string, player2: string) {
  return page.locator('.discipline-match-list-item').filter({ hasText: player1 }).filter({ hasText: player2 }).first();
}

/** Types like a user: the result dialog checks the input on every key. */
async function typeResult(page: Page, text: string): Promise<void> {
  const input = page.locator('mat-dialog-container input');
  await input.clear();
  await input.pressSequentially(text);
}

async function openTableActions(page: Page, number: number): Promise<void> {
  await tableCard(page, number).locator('mat-panel-title').click();
}

function dialog(page: Page) {
  return page.locator('mat-dialog-container');
}

test.describe('Zuweiser View', () => {
  // matches a test completed or freed, taken back before the next test
  const touched = [1, 2, 3, 4];

  test.beforeAll(async () => {
    // a cold start may (re)build the backend image and initialise MariaDB, so the hook needs more than the default 30s
    test.setTimeout(600_000);
    await resetDatabase();
  });

  test.beforeEach(async ({ request }) => {
    await resetTournament(request, touched);
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
    const item = matchItem(page, 'Priyanka Sow', 'Babajide Santos');
    await expect(item).toBeVisible({ timeout: 15000 });

    const firstTable = page.locator('toma-tt-table').first();
    await expect(firstTable).toContainText('Frei');

    await dragAndDrop(page, item, firstTable.locator('span.card-title'));

    await expect(firstTable.locator('toma-tt-table-match-item')).toBeVisible({ timeout: 15000 });
    await expect(firstTable).toContainText('Priyanka Sow');
    await expect(firstTable).toContainText('Babajide Santos');
  });

  test('lists only the matches of the selected discipline', async ({ page }) => {
    await page.goto('/admin-view/assignView');

    await chooseDiscipline(page, 'Herren A');
    await expect(matchItem(page, 'Priyanka Sow', 'Babajide Santos')).toBeVisible({ timeout: 15000 });

    await chooseDiscipline(page, 'Damen A');
    await expect(page.locator('.discipline-match-list-item').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.discipline-match-list-item').filter({ hasText: 'Priyanka Sow' })).toHaveCount(0);
  });

  test('blocks a match whose player is already at a table', async ({ page, request }) => {
    await page.goto('/admin-view/assignView');
    await chooseDiscipline(page, 'Herren A');
    const blocked = matchItem(page, 'Nicolas Kowalska', 'Babajide Santos');
    await expect(blocked).toBeVisible({ timeout: 15000 });

    // another client puts match 3 (with Babajide Santos) on table 1
    expect((await request.post('/api/v2/match/matchtotable/1', { data: [3] })).ok()).toBeTruthy();
    await expect(blocked.locator('xpath=..')).toHaveClass(/disabled-item/, { timeout: 15000 });

    // the blocked match cannot be dragged to a table
    await dragAndDrop(page, blocked, tableCard(page, 2).locator('span.card-title'));
    await expect(tableCard(page, 2)).toContainText('Frei');
    expect((await getMatch(request, 1)).state).toBe('Open');
  });

  test('assigns a whole group to a table by dragging its group square', async ({ page, request }) => {
    await page.goto('/admin-view/assignView');
    await chooseDiscipline(page, 'Herren A');
    const row = page.locator('.mat-list-item').filter({ has: matchItem(page, 'Priyanka Sow', 'Babajide Santos') });
    await expect(row).toBeVisible({ timeout: 15000 });

    await dragAndDrop(
      page,
      row.locator('.discipline-match-list-square'),
      tableCard(page, 1).locator('span.card-title')
    );

    await expect(tableCard(page, 1)).toContainText('Gruppe A', { timeout: 15000 });
    await expect(tableCard(page, 1)).toContainText('Offene Spiele: 3');
    for (const id of [1, 2, 3]) {
      expect((await getMatch(request, id)).state).toBe('OnTable');
    }
  });

  test('assigns a queued match to a table from the "Warteschlange"', async ({ page, request }) => {
    expect(
      (await request.post('/api/v2/matchlist/add', { data: { matchIds: [4], asGroup: null, position: 0 } })).ok()
    ).toBeTruthy();
    await page.goto('/admin-view/assignView');
    await chooseDiscipline(page, 'Warteschlange');

    const queued = page.locator('toma-single-item').filter({ hasText: 'Ji-hoon Mensah' });
    await expect(queued).toBeVisible({ timeout: 15000 });
    await dragAndDrop(page, queued, tableCard(page, 1).locator('span.card-title'));

    await expect(tableCard(page, 1)).toContainText('Ji-hoon Mensah', { timeout: 15000 });
    await expect(page.locator('toma-single-item').filter({ hasText: 'Ji-hoon Mensah' })).toHaveCount(0);
    expect(await (await request.get('/api/v2/matchlist/all')).json()).toEqual([]);
  });

  test('rejects a match dropped on a locked table', async ({ page, request }) => {
    expect((await request.post('/api/v2/table/1/lock')).ok()).toBeTruthy();
    await page.goto('/admin-view/assignView');
    await chooseDiscipline(page, 'Herren A');
    const item = matchItem(page, 'Priyanka Sow', 'Babajide Santos');
    await expect(item).toBeVisible({ timeout: 15000 });
    await expect(tableCard(page, 1)).toContainText('Gesperrt');

    await dragAndDrop(page, item, tableCard(page, 1).locator('span.card-title'));

    await expect(errorToast(page, 'Could not assign all matches to table.')).toBeVisible({ timeout: 15000 });
    await expect(tableCard(page, 1)).toContainText('Gesperrt');
    expect((await getMatch(request, 3)).state).toBe('Open');
  });

  test.describe('the actions of a table', () => {
    test.beforeEach(async ({ request }) => {
      // match 3 is at table 1
      expect((await request.post('/api/v2/match/matchtotable/1', { data: [3] })).ok()).toBeTruthy();
    });

    test('"Frei" finishes the match as a walkover and frees the table', async ({ page, request }) => {
      await page.goto('/admin-view/assignView');
      await expect(tableCard(page, 1)).toContainText('Priyanka Sow', { timeout: 15000 });

      await tableCard(page, 1).getByRole('button', { name: 'Frei', exact: true }).click();

      await expect(tableCard(page, 1).locator('span.card-title')).toContainText('Frei', { timeout: 15000 });
      expect((await getMatch(request, 3)).state).toBe('Finished');
    });

    test('"Eingeben" completes the match with the entered result', async ({ page, request }) => {
      await page.goto('/admin-view/assignView');
      await tableCard(page, 1).getByRole('button', { name: 'Eingeben', exact: true }).click({ timeout: 15000 });

      await typeResult(page, '5 7 3');
      await dialog(page).getByRole('button', { name: 'Ok' }).click();

      await expect(tableCard(page, 1).locator('span.card-title')).toContainText('Frei', { timeout: 15000 });
      const match = await getMatch(request, 3);
      expect(match.state).toBe('Completed');
      expect(match.resultRaw).toBe('11=5,11=7,11=3');
    });

    test('"Eingeben" accepts no result without a winner, and cancelling changes nothing', async ({ page, request }) => {
      await page.goto('/admin-view/assignView');
      await tableCard(page, 1).getByRole('button', { name: 'Eingeben', exact: true }).click({ timeout: 15000 });
      const ok = dialog(page).getByRole('button', { name: 'Ok' });

      // two sets have no winner yet, and "abc" is no result
      await typeResult(page, '5 7');
      await expect(ok).toBeDisabled();
      await typeResult(page, 'abc');
      await expect(ok).toBeDisabled();

      await dialog(page).getByRole('button', { name: 'Abbrechen' }).click();
      await expect(dialog(page)).toHaveCount(0);
      await expect(tableCard(page, 1)).toContainText('Priyanka Sow');
      expect((await getMatch(request, 3)).state).toBe('OnTable');
    });

    test('"Zurück" takes the match back to the open matches', async ({ page, request }) => {
      await page.goto('/admin-view/assignView');
      await expect(tableCard(page, 1)).toContainText('Priyanka Sow', { timeout: 15000 });

      await openTableActions(page, 1);
      await tableCard(page, 1).getByRole('button', { name: 'Zurück' }).click();

      await expect(tableCard(page, 1).locator('span.card-title')).toContainText('Frei', { timeout: 15000 });
      expect((await getMatch(request, 3)).state).toBe('Open');
    });

    test('"2.Tisch" refuses a single match', async ({ page }) => {
      await page.goto('/admin-view/assignView');
      await expect(tableCard(page, 1)).toContainText('Priyanka Sow', { timeout: 15000 });

      await openTableActions(page, 1);
      await tableCard(page, 1).getByRole('button', { name: '2.Tisch' }).click();

      await expect(errorToast(page, 'Ein Spiel kann nich auf zwei Tische gelegt werden.')).toBeVisible();
    });
  });

  test('"Frei" on a table with a group asks which match to free', async ({ page, request }) => {
    expect((await request.post('/api/v2/match/matchtotable/1', { data: [1, 2, 3] })).ok()).toBeTruthy();
    await page.goto('/admin-view/assignView');
    await expect(tableCard(page, 1)).toContainText('Offene Spiele: 3', { timeout: 15000 });

    await tableCard(page, 1).getByRole('button', { name: 'Frei', exact: true }).click();
    await dialog(page)
      .locator('label')
      .filter({ hasText: 'Priyanka Sow' })
      .filter({ hasText: 'Babajide Santos' })
      .click();
    await dialog(page).getByRole('button', { name: 'Ok' }).click();

    await expect(tableCard(page, 1)).toContainText('Offene Spiele: 2', { timeout: 15000 });
    expect((await getMatch(request, 3)).state).toBe('Finished');
    expect((await getMatch(request, 1)).state).toBe('OnTable');
  });

  test('locks and unlocks a free table', async ({ page, request }) => {
    await page.goto('/admin-view/assignView');
    const card = tableCard(page, 2);
    await expect(card).toContainText('Frei', { timeout: 15000 });

    await card.getByRole('button', { name: 'Sperren' }).click();
    await expect(card).toContainText('Gesperrt', { timeout: 15000 });
    expect((await (await request.get('/api/v2/table/free')).json()).map((table: any) => table.number)).not.toContain(2);

    await card.getByRole('button', { name: 'Entsperren' }).click();
    await expect(card).toContainText('Frei', { timeout: 15000 });
  });
});
