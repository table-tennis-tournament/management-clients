import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';
import { clearMatchList, dragAndDrop } from './helpers';

test.describe('Supervisor View', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test.beforeEach(async ({ request }) => {
    await clearMatchList(request);
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
    await page.goto('/admin-view/supervisorView');
    await page.getByRole('button', { name: 'Herren A', exact: true }).click();

    const group = page.locator('toma-discipline-group').first();
    await expect(group).toBeVisible({ timeout: 15000 });

    const matchItem = group.locator('.collection-item:not(.cdk-drag-disabled)').first();
    await expect(matchItem).toBeVisible();

    await dragAndDrop(page, matchItem, page.locator('toma-matchlist-view mat-list.waiting-list-drop-zone'));

    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toBeVisible({ timeout: 15000 });
  });

  test('should drag a KO match to the matchlist', async ({ page }) => {
    await page.goto('/admin-view/supervisorView');
    await page.getByRole('button', { name: 'Herren D (bis 1500)-Doppel', exact: true }).click();

    const stage = page.locator('toma-discipline-stage').first();
    await expect(stage).toBeVisible({ timeout: 15000 });

    const matchItem = stage.locator('.collection-item:not(.cdk-drag-disabled)').first();
    await expect(matchItem).toBeVisible();

    await dragAndDrop(page, matchItem, page.locator('toma-matchlist-view mat-list.waiting-list-drop-zone'));

    await expect(page.locator('toma-matchlist-view toma-matchlist-single-item')).toBeVisible({ timeout: 15000 });
  });

  test('should drop a complete group into the matchlist', async ({ page }) => {
    await page.goto('/admin-view/supervisorView');
    await page.getByRole('button', { name: 'Herren A', exact: true }).click();

    const group = page.locator('toma-discipline-group').first();
    await expect(group).toBeVisible({ timeout: 15000 });

    const groupHeader = group.locator('.group-view-header span').first();
    await expect(groupHeader).toBeVisible();

    await dragAndDrop(page, groupHeader, page.locator('toma-matchlist-view mat-list.waiting-list-drop-zone'));

    await expect(page.locator('toma-matchlist-view toma-matchlist-group-item')).toBeVisible({ timeout: 15000 });
  });
});
