import { expect, Page, test } from '@playwright/test';
import { resetDatabase } from './db-helper';
import { dragAndDrop, getMatch, resetTournament } from './helpers';

// Herren A, group A: match 1 Nicolas Kowalska vs Babajide Santos, 2 Nicolas Kowalska vs Priyanka Sow,
// 3 Priyanka Sow vs Babajide Santos; group B: match 4 Ji-hoon Mensah vs Mei Castro, 5 Arjun Morozov vs Ji-hoon Mensah.

async function openDiscipline(page: Page, name: string): Promise<void> {
  await page.goto('/admin-view/supervisorView');
  await page.getByRole('button', { name, exact: true }).click();
}

function group(page: Page, name: string) {
  return page
    .locator('toma-discipline-group')
    .filter({ has: page.locator('.group-view-header span', { hasText: new RegExp(`^\\s*Gruppe ${name}\\s*$`) }) });
}

function groupMatch(page: Page, groupName: string, player1: string, player2: string) {
  return group(page, groupName).locator('.collection-item').filter({ hasText: player1 }).filter({ hasText: player2 });
}

function queue(page: Page) {
  return page.locator('toma-matchlist-view mat-list.waiting-list-drop-zone');
}

function dialog(page: Page) {
  return page.locator('mat-dialog-container');
}

/** Types like a user: the result dialog checks the input on every key. */
async function typeResult(page: Page, text: string): Promise<void> {
  const input = dialog(page).locator('input');
  await input.clear();
  await input.pressSequentially(text);
}

async function queueMatches(page: Page, ...matchIds: number[]): Promise<void> {
  for (const [position, id] of matchIds.entries()) {
    const response = await page.request.post('/api/v2/matchlist/add', {
      data: { matchIds: [id], asGroup: null, position },
    });
    expect(response.ok()).toBeTruthy();
  }
}

test.describe('Supervisor View', () => {
  // matches a test completed, taken back before the next test
  const touched = [1, 2, 3];

  test.beforeAll(async () => {
    // a cold start may (re)build the backend image and initialise MariaDB, so the hook needs more than the default 30s
    test.setTimeout(600_000);
    await resetDatabase();
  });

  test.beforeEach(async ({ request }) => {
    await resetTournament(request, touched);
  });

  test('should show groups for Herren A and KO stages for Herren D-Doppel', async ({ page }) => {
    await page.goto('/admin-view/supervisorView');

    // Herren A -> group stage.
    await page.getByRole('button', { name: 'Herren A', exact: true }).click();
    await expect(page.locator('toma-discipline-group').first()).toBeVisible({ timeout: 15000 });
    expect(await page.locator('toma-discipline-group').count()).toBeGreaterThan(0);
    expect(await page.locator('toma-discipline-stage').count()).toBe(0);

    // Herren D (bis 1500)-Doppel -> knockout stage.
    await page.getByRole('button', { name: 'Herren D (bis 1500)-Doppel', exact: true }).click();
    await expect(page.locator('toma-discipline-stage').first()).toBeVisible({ timeout: 15000 });
    expect(await page.locator('toma-discipline-stage').count()).toBeGreaterThan(0);
    expect(await page.locator('toma-discipline-group').count()).toBe(0);
  });

  test('should drag a group match to the matchlist', async ({ page }) => {
    await openDiscipline(page, 'Herren A');

    const firstGroup = page.locator('toma-discipline-group').first();
    await expect(firstGroup).toBeVisible({ timeout: 15000 });

    const matchItem = firstGroup.locator('.collection-item:not(.cdk-drag-disabled)').first();
    await expect(matchItem).toBeVisible();

    await dragAndDrop(page, matchItem, queue(page));

    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toBeVisible({ timeout: 15000 });
  });

  test('should drag a KO match to the matchlist', async ({ page }) => {
    await openDiscipline(page, 'Herren D (bis 1500)-Doppel');

    const stage = page.locator('toma-discipline-stage').first();
    await expect(stage).toBeVisible({ timeout: 15000 });

    const matchItem = stage.locator('.collection-item:not(.cdk-drag-disabled)').first();
    await expect(matchItem).toBeVisible();

    await dragAndDrop(page, matchItem, queue(page));

    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toBeVisible({ timeout: 15000 });
  });

  test('should drop a complete group into the matchlist', async ({ page, request }) => {
    await openDiscipline(page, 'Herren A');

    const groupHeader = group(page, 'A').locator('.group-view-header span').first();
    await expect(groupHeader).toBeVisible({ timeout: 15000 });

    await dragAndDrop(page, groupHeader, queue(page));

    await expect(page.locator('toma-matchlist-view toma-matchlist-group-item')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('toma-matchlist-view toma-matchlist-group-item')).toContainText('Gruppe A');
    await expect(group(page, 'A').locator('.group-view-header span.circle').filter({ hasText: 'W' })).toBeVisible();
    const entries = await (await request.get('/api/v2/matchlist/all')).json();
    expect(entries.map((entry: any) => [...entry.matchIds].sort())).toEqual([[1, 2, 3]]);
  });

  test('marks a queued match with "W" and does not queue it twice', async ({ page, request }) => {
    await openDiscipline(page, 'Herren A');
    const match = groupMatch(page, 'A', 'Priyanka Sow', 'Babajide Santos');
    await expect(match).toBeVisible({ timeout: 15000 });

    await dragAndDrop(page, match, queue(page));
    await expect(match.locator('span.circle').filter({ hasText: 'W' })).toBeVisible({ timeout: 15000 });
    await expect(match).toHaveClass(/disabled-item/);
    // the group header shows "W" only when all of its matches are queued
    await expect(group(page, 'A').locator('.group-view-header span.circle').filter({ hasText: 'W' })).toHaveCount(0);

    // a queued match is not open any more, so it cannot be dragged again
    await dragAndDrop(page, match, queue(page));
    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toHaveCount(1);
    expect((await (await request.get('/api/v2/matchlist/all')).json()).length).toBe(1);
  });

  test('removes an entry from the queue and the match is open again', async ({ page, request }) => {
    await queueMatches(page, 3);
    await openDiscipline(page, 'Herren A');
    const entry = page.locator('toma-matchlist-view toma-matchlist-single-item');
    await expect(entry).toContainText('Priyanka Sow', { timeout: 15000 });

    await entry.locator('a.secondary-content').click();

    await expect(entry).toHaveCount(0, { timeout: 15000 });
    await expect(groupMatch(page, 'A', 'Priyanka Sow', 'Babajide Santos').locator('span.circle')).toHaveCount(0);
    expect((await getMatch(request, 3)).state).toBe('Open');
  });

  test('reorders the queue by dragging an entry above another', async ({ page, request }) => {
    await queueMatches(page, 3, 4);
    await openDiscipline(page, 'Herren A');
    const entries = page.locator('toma-matchlist-view toma-matchlist-single-item');
    await expect(entries).toHaveCount(2, { timeout: 15000 });
    await expect(entries.first()).toContainText('Priyanka Sow');

    await dragAndDrop(page, entries.nth(1), entries.first());

    await expect(entries.first()).toContainText('Ji-hoon Mensah', { timeout: 15000 });
    const stored = await (await request.get('/api/v2/matchlist/all')).json();
    expect(stored.map((entry: any) => entry.matchIds)).toEqual([[4], [3]]);
  });

  test('shows an entry another client queued', async ({ page }) => {
    await openDiscipline(page, 'Herren A');
    await expect(group(page, 'A')).toBeVisible({ timeout: 15000 });

    await queueMatches(page, 4);

    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toContainText('Ji-hoon Mensah', {
      timeout: 15000,
    });
  });

  test('enters a result by double-clicking a group match', async ({ page, request }) => {
    await openDiscipline(page, 'Herren A');
    const match = groupMatch(page, 'A', 'Priyanka Sow', 'Babajide Santos');
    await expect(match).toBeVisible({ timeout: 15000 });

    await match.dblclick();
    await expect(dialog(page)).toContainText('Priyanka Sow');
    await typeResult(page, '5 -7 8 9');
    await dialog(page).getByRole('button', { name: 'Ok' }).click();

    await expect(match).toContainText('3 : 1', { timeout: 15000 });
    const stored = await getMatch(request, 3);
    expect(stored.state).toBe('Completed');
    expect(stored.resultRaw).toBe('11=5,7=11,11=8,11=9');
    // a completed match cannot be queued
    await expect(match).toHaveClass(/cdk-drag-disabled/);
  });

  test('cancelling the result dialog enters nothing', async ({ page, request }) => {
    await openDiscipline(page, 'Herren A');
    const match = groupMatch(page, 'A', 'Priyanka Sow', 'Babajide Santos');
    await expect(match).toBeVisible({ timeout: 15000 });

    await match.dblclick();
    await typeResult(page, '5 7 3');
    await dialog(page).getByRole('button', { name: 'Abbrechen' }).click();

    await expect(dialog(page)).toHaveCount(0);
    expect((await getMatch(request, 3)).state).toBe('Open');
    await expect(match).not.toContainText('3 : 0');
  });

  test('"Spieler" and "Spiele" fold the players and the matches of every group', async ({ page }) => {
    await openDiscipline(page, 'Herren A');
    const [players, matches] = [0, 1].map((index) => group(page, 'A').locator('mat-expansion-panel').nth(index));
    // both are open by default
    await expect(players.locator('mat-list-item')).toHaveCount(3, { timeout: 15000 });
    await expect(players).toContainText('Nicolas Kowalska');
    await expect(matches.locator('.collection-item').first()).toBeVisible();

    await page.getByRole('checkbox', { name: 'Spieler', exact: true }).uncheck();
    await expect(players.locator('mat-list-item').first()).toBeHidden();
    await expect(matches.locator('.collection-item').first()).toBeVisible();

    await page.getByRole('checkbox', { name: 'Spiele', exact: true }).uncheck();
    await expect(matches.locator('.collection-item').first()).toBeHidden();

    await page.getByRole('checkbox', { name: 'Spieler', exact: true }).check();
    await expect(players.locator('mat-list-item').first()).toBeVisible();
  });

  test('shows the number of the table a match of the group is on', async ({ page }) => {
    await openDiscipline(page, 'Herren A');
    const match = groupMatch(page, 'A', 'Priyanka Sow', 'Babajide Santos');
    await expect(match).toBeVisible({ timeout: 15000 });

    // another client puts match 3 on table 1 (whose id is not 1)
    expect((await page.request.post('/api/v2/match/matchtotable/1', { data: [3] })).ok()).toBeTruthy();

    await expect(match.locator('span.circle')).toHaveText('1', { timeout: 15000 });
    await expect(group(page, 'A').locator('.group-view-header span.circle')).toHaveText('1');
  });

  test('closes a knockout stage in the view', async ({ page }) => {
    await openDiscipline(page, 'Herren D (bis 1500)-Doppel');
    const stages = page.locator('toma-discipline-stage');
    await expect(stages.first()).toBeVisible({ timeout: 15000 });
    const count = await stages.count();

    await stages.first().getByLabel('remove stage button', { exact: true }).click();

    await expect(stages).toHaveCount(count - 1);
  });
});
