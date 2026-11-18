import type { APIRequestContext, Locator, Page } from '@playwright/test';

export async function dragAndDrop(page: Page, source: Locator, target: Locator): Promise<void> {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();

  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error('Could not determine bounding box of drag source or target');
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 25 });
  await page.mouse.up();
}

export async function clearMatchList(request: APIRequestContext): Promise<void> {
  const response = await request.get('/api/v2/matchlist/all');
  const items: Array<{ uuid?: string }> = await response.json();
  for (const item of items) {
    if (item.uuid) {
      await request.delete(`/api/v2/matchlist/${item.uuid}`);
    }
  }
}

/**
 * Brings the tournament back to the seed for tests that share one database: an empty queue, no auto-start, no
 * locked table and no match at a table. [matchIds] are matches a test completed or freed; taking them back
 * makes them open again and clears their result.
 */
export async function resetTournament(request: APIRequestContext, matchIds: number[] = []): Promise<void> {
  await clearMatchList(request);
  await request.post('/api/v2/matchlist/active/false');
  const tables: Array<{ number: number; isLocked: boolean; matches: Array<{ id: number }> }> = await (
    await request.get('/api/v2/table/all')
  ).json();
  const onTables = tables.flatMap((table) => table.matches.map((match) => match.id));
  const takeBack = [...new Set([...onTables, ...matchIds])];
  if (takeBack.length > 0) {
    await request.post('/api/v2/match/takeBack', { data: takeBack });
  }
  for (const table of tables.filter((candidate) => candidate.isLocked)) {
    await request.post(`/api/v2/table/${table.number}/unlock`);
  }
}

/** The match with [id] as the backend sees it. */
export async function getMatch(request: APIRequestContext, id: number): Promise<any> {
  return (await request.get(`/api/v2/match/${id}`)).json();
}

/** The table card in the assign or table view with the table number [number]. */
export function tableCard(page: Page, number: number): Locator {
  return page
    .locator('toma-tt-table')
    .filter({ has: page.locator('span.circle', { hasText: new RegExp(`^\\s*${number}\\s*$`) }) });
}

/** An entry of the admin view's error toasts. */
export function errorToast(page: Page, message: string): Locator {
  return page.locator('.toast-error').filter({ hasText: message });
}
