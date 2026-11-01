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
    const tableBadges = page.locator('app-tt-table .mat-badge-content');
    const badgeTexts = await tableBadges.allTextContents();
    console.log(`Found table numbers: ${badgeTexts.join(', ')}`);
  });

  test('should assign match 3 to the first table and start it', async ({ page, request }) => {
    const firstTable = page.locator('app-tt-table').first();

    // 0. Idempotent reset: take match 3 back (sets it Open and removes it from any table)
    const takeBackResponse = await request.post('/api/v2/match/takeBack', { data: [3] });
    expect(takeBackResponse.ok()).toBeTruthy();

    // 1. The first table must be empty
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });

    // 2. Assign match 3 to table_number 1 (same endpoint as admin-view)
    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();

    // 3. Match 3 (Priyanka Sow vs Babajide Santos) appears on the first table via websocket
    const matchItem = firstTable.locator('app-match-item');
    await expect(matchItem).toHaveCount(1, { timeout: 15000 });
    await expect(matchItem).toContainText('Priyanka Sow');
    await expect(matchItem).toContainText('Babajide Santos');

    // 4. Two buttons are available: second call (alarm) and start (play_arrow)
    const secondCallButton = firstTable.locator('button:has(mat-icon:has-text("alarm"))');
    const startButton = firstTable.locator('button:has(mat-icon:has-text("play_arrow"))');
    await expect(secondCallButton).toBeVisible({ timeout: 15000 });
    await expect(startButton).toBeVisible({ timeout: 15000 });

    // 5. Start the match
    await startButton.click();

    // 6. After starting, the Erfassen and Zurück buttons appear
    await expect(firstTable.locator('button:has-text("Erfassen")')).toBeVisible({ timeout: 15000 });
    await expect(firstTable.locator('button:has-text("Zurück")')).toBeVisible({ timeout: 15000 });
  });

  test('should record a result for match 4 and move it off the table', async ({ page, request }) => {
    const firstTable = page.locator('app-tt-table').first();

    // 0. Idempotent reset: clear matches 3 and 4 (match 3 is left started by the previous test)
    const resetResponse = await request.post('/api/v2/match/takeBack', { data: [3, 4] });
    expect(resetResponse.ok()).toBeTruthy();

    // 1. The first table is empty
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });

    // 2. Assign match 4 to table_number 1
    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [4] });
    expect(assignResponse.ok()).toBeTruthy();

    // 3. Match 4 (Ji-hoon Mensah vs Mei Castro) appears
    const matchItem = firstTable.locator('app-match-item');
    await expect(matchItem).toHaveCount(1, { timeout: 15000 });
    await expect(matchItem).toContainText('Ji-hoon Mensah');
    await expect(matchItem).toContainText('Mei Castro');

    // 4. Start the match so the "Erfassen" button becomes available
    await firstTable.locator('button:has(mat-icon:has-text("play_arrow"))').click();
    const erfassenButton = firstTable.locator('button:has-text("Erfassen")');
    await expect(erfassenButton).toBeVisible({ timeout: 15000 });

    // 5. Record the result (player A wins 3:2) and confirm
    await erfassenButton.click();
    const resultInput = page.locator('app-result-dialog input');
    await expect(resultInput).toBeVisible({ timeout: 15000 });
    await resultInput.fill('10 -4 -4 10 10');
    await page.locator('app-result-dialog button:has-text("Ok")').click();

    // 6. The result is saved and the match is decided -> "Beenden" appears, match still on the table
    const beendenButton = firstTable.locator('button:has-text("Beenden")');
    await expect(beendenButton).toBeVisible({ timeout: 15000 });

    // 7. Finish the match -> it is moved off the table
    await beendenButton.click();
    await expect(beendenButton).toBeHidden({ timeout: 15000 });
    await expect(erfassenButton).toBeHidden();
    await expect(firstTable.locator('app-match-item')).toHaveCount(0);
    await expect(firstTable).toContainText('Kein Spiel aktiv');
  });

  test('should clear a started match when the table manager takes it back with "Zurück"', async ({ page, request }) => {
    const firstTable = page.locator('app-tt-table').first();

    const resetResponse = await request.post('/api/v2/match/takeBack', { data: [3, 4] });
    expect(resetResponse.ok()).toBeTruthy();
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });

    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();
    await expect(firstTable.locator('app-match-item')).toHaveCount(1, { timeout: 15000 });

    await firstTable.locator('button:has(mat-icon:has-text("play_arrow"))').click();
    const zurueckButton = firstTable.locator('button:has-text("Zurück")');
    await expect(zurueckButton).toBeVisible({ timeout: 15000 });

    // taking the match back publishes MATCH_TAKEN_BACK and reloads the tables of the initiating client
    await zurueckButton.click();
    await expect(zurueckButton).toBeHidden({ timeout: 15000 });
    await expect(firstTable).toContainText('Kein Spiel aktiv', { timeout: 15000 });
  });

  test('should follow a take back made by another client (admin)', async ({ page, request }) => {
    const firstTable = page.locator('app-tt-table').first();

    const resetResponse = await request.post('/api/v2/match/takeBack', { data: [3, 4] });
    expect(resetResponse.ok()).toBeTruthy();
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });

    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();
    await expect(firstTable.locator('app-match-item')).toHaveCount(1, { timeout: 15000 });

    // another client removes the match from the table
    const removeResponse = await request.post('/api/v2/match/takeBack', { data: [3] });
    expect(removeResponse.ok()).toBeTruthy();
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });
    await expect(firstTable).toContainText('Kein Spiel aktiv');
  });

  test('should resynchronize after the websocket connection was lost', async ({ page, request }) => {
    // reset and open the page with a controllable websocket: the first connection is proxied to the
    // backend, and while `blocked` is set every (re)connect attempt is rejected
    let blocked = false;
    let current: { close: () => Promise<void> } | undefined;
    await page.routeWebSocket('**/ttt-websocket', async (ws) => {
      if (blocked) {
        await ws.close();
        return;
      }
      ws.connectToServer();
      current = ws;
    });

    const resetResponse = await request.post('/api/v2/match/takeBack', { data: [3, 4] });
    expect(resetResponse.ok()).toBeTruthy();
    await page.goto('/tablemanager1');
    const firstTable = page.locator('app-tt-table').first();
    await expect(page.locator('app-tt-table')).toHaveCount(5, { timeout: 30000 });
    await expect(firstTable.locator('app-match-item')).toHaveCount(0, { timeout: 15000 });
    await expect.poll(() => current !== undefined, { timeout: 15000 }).toBe(true);

    // the connection drops and a change happens while the client is offline: its event is never received
    blocked = true;
    await current!.close();
    const assignResponse = await request.post('/api/v2/match/matchtotable/1', { data: [3] });
    expect(assignResponse.ok()).toBeTruthy();
    await page.waitForTimeout(1500);
    await expect(firstTable.locator('app-match-item')).toHaveCount(0);

    // the client reconnects (reconnect delay 5 s) and reloads the tables without any event
    blocked = false;
    await expect(firstTable.locator('app-match-item')).toHaveCount(1, { timeout: 20000 });
    await expect(firstTable).toContainText('Priyanka Sow');
  });
});
