import { expect, Page, test, WebSocketRoute } from '@playwright/test';
import { resetDatabase } from './db-helper';

/** Waits for the reload request an update event triggers; register before causing the event. */
function reloadOf(page: Page, path: string) {
  return page.waitForRequest((request) => request.method() === 'GET' && request.url().endsWith(path), {
    timeout: 15000,
  });
}

test.describe('Live updates of the newer topics and after a reconnect', () => {
  test.beforeAll(async () => {
    // a cold start may (re)build the backend image and initialise MariaDB, so the hook needs more than the default 30s
    test.setTimeout(600_000);
    await resetDatabase();
  });

  test('shows a table locked and unlocked by another client (TABLE_LOCKED, TABLE_UNLOCKED)', async ({
    page,
    request,
  }) => {
    const tables = await (await request.get('/api/v2/table/all')).json();
    const free = tables.find((table: any) => table.matches.length === 0 && !table.isLocked);
    expect(free).toBeTruthy();

    await page.goto('/admin-view/tableView');
    const card = page
      .locator('toma-tt-table')
      .filter({ has: page.locator('span.circle', { hasText: new RegExp(`^\\s*${free.number}\\s*$`) }) });
    await expect(card.getByRole('button', { name: 'Sperren' })).toBeVisible({ timeout: 15000 });

    try {
      expect((await request.post(`/api/v2/table/${free.number}/lock`)).ok()).toBeTruthy();
      await expect(card.getByRole('button', { name: 'Entsperren' })).toBeVisible({ timeout: 15000 });
    } finally {
      expect((await request.post(`/api/v2/table/${free.number}/unlock`)).ok()).toBeTruthy();
    }
    await expect(card.getByRole('button', { name: 'Sperren' })).toBeVisible({ timeout: 15000 });
  });

  test('reloads the disciplines when a player is deactivated elsewhere (PLAYER_ACTIVE_CHANGED)', async ({
    page,
    request,
  }) => {
    const players = await (await request.get('/api/v2/players/all')).json();
    const player = players.find((candidate: any) => candidate.active !== false);
    expect(player).toBeTruthy();

    await page.goto('/admin-view/assignView');
    await page.waitForLoadState('networkidle');

    const reload = reloadOf(page, '/api/v2/types/all');
    try {
      expect((await request.post(`/api/v2/players/${player.id}/active/false`)).ok()).toBeTruthy();
      await reload;
    } finally {
      await request.post(`/api/v2/players/${player.id}/active/true`);
    }
  });

  test('reloads the discipline colors when they are saved elsewhere (DISCIPLINE_COLORS_CHANGED)', async ({
    page,
    request,
  }) => {
    const types = await (await request.get('/api/v2/types/all')).json();
    const colors = await (await request.get('/api/v2/disciplines/colors')).json();
    const typeId = types[0].id;
    // save the colors the discipline already has, so the test data stays as it was
    const current = colors[typeId] ?? { bgColor: '#ffffff', textColor: '#000000' };

    await page.goto('/admin-view/assignView');
    await page.waitForLoadState('networkidle');

    const reload = reloadOf(page, '/api/v2/disciplines/colors');
    expect((await request.post(`/api/v2/disciplines/${typeId}/color`, { data: current })).ok()).toBeTruthy();
    await reload;
  });

  test('resynchronizes after a reconnect and shows a change whose event it missed', async ({ page, request }) => {
    // Sit between the page and the backend: while `dropping`, the page receives nothing from the server.
    let dropping = false;
    const sockets: WebSocketRoute[] = [];
    await page.routeWebSocket(/\/ttt-websocket/, (ws) => {
      const server = ws.connectToServer();
      server.onMessage((message) => {
        if (!dropping) ws.send(message);
      });
      ws.onMessage((message) => server.send(message));
      sockets.push(ws);
    });

    expect((await request.post('/api/v2/match/takeBack', { data: [3] })).ok()).toBeTruthy();
    await page.goto('/admin-view/assignView');
    const firstTable = page.locator('toma-tt-table').first();
    await expect(firstTable).toContainText('Frei', { timeout: 15000 });

    try {
      dropping = true;
      // match 3 is Priyanka Sow vs Babajide Santos; its MATCH_ASSIGNED event is dropped
      expect((await request.post('/api/v2/match/matchtotable/1', { data: [3] })).ok()).toBeTruthy();
      await page.waitForTimeout(1500);
      await expect(firstTable).not.toContainText('Priyanka Sow');

      // drop the connection: the client reconnects and reloads everything it shows
      dropping = false;
      await sockets[sockets.length - 1].close();
      await expect(firstTable).toContainText('Priyanka Sow', { timeout: 20000 });
      await expect(firstTable).toContainText('Babajide Santos');
    } finally {
      await request.post('/api/v2/match/takeBack', { data: [3] });
    }
  });

  // Last, because it deletes the matches of a discipline; the next spec file resets the database.
  test('shows a payment recorded by another client (PLAYER_PAID)', async ({ page, request }) => {
    // The player list shows the registrations of singles disciplines without matches (before the draw),
    // and every discipline of the seed has matches: delete those of the smallest singles discipline
    // that match 3 (used above) does not belong to.
    const match3 = await (await request.get('/api/v2/match/3')).json();
    const singles = (await (await request.get('/api/v2/types/all')).json()).filter(
      (type: any) => type.kind === 1 && type.id !== match3.typeId
    );
    const sizes = await Promise.all(
      singles.map(async (type: any) => (await (await request.get(`/api/v2/match/typeid/${type.id}`)).json()).length)
    );
    const discipline = singles[sizes.indexOf(Math.min(...sizes))];
    expect((await request.delete(`/api/v2/match/type/${discipline.id}`)).ok()).toBeTruthy();

    const registrations = await (await request.get('/api/v2/players/allTypePerPlayer')).json();
    // every registration of the seed is paid: another client takes a payment back
    const paid = registrations.find((registration: any) => registration.paid && registration.type.id === discipline.id);
    expect(paid).toBeTruthy();

    await page.goto('/admin-view/playerView');
    const row = page
      .locator('tr')
      .filter({ hasText: `${paid.player.lastName}` })
      .filter({ hasText: discipline.name })
      .first();
    const checkbox = row.getByRole('checkbox');
    await expect(checkbox).toBeChecked({ timeout: 15000 });

    try {
      expect((await request.post(`/api/v2/players/${paid.id}/paid?paid=false`)).ok()).toBeTruthy();
      await expect(checkbox).not.toBeChecked({ timeout: 15000 });
    } finally {
      await request.post(`/api/v2/players/${paid.id}/paid?paid=true`);
    }
  });
});
