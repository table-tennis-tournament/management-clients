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
