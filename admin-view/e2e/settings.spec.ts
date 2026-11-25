import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';

test.describe('Einstellungen View', () => {
  test.beforeAll(async () => {
    // a cold start may (re)build the backend image and initialise MariaDB, so the hook needs more than the default 30s
    test.setTimeout(600_000);
    await resetDatabase();
  });

  test('should show all settings sections', async ({ page }) => {
    await page.goto('/admin-view/settingsView');

    await expect(page.getByText('Allgemeine Einstellungen')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Druck bei Ausruf')).toBeVisible();
    await expect(page.getByText('Automatisch Ausrufen')).toBeVisible();

    await expect(page.getByText('Wähle Drucker')).toBeVisible();

    // one row per discipline with its colors and its short name
    await expect(page.getByRole('heading', { name: 'Konkurrenzen' })).toBeVisible();
    await expect(page.getByTitle('Hintergrundfarbe').first()).toBeVisible();
    await expect(page.getByText('Weiß').first()).toBeVisible();
    await expect(page.getByLabel('Kurzname').first()).toBeVisible();

    await expect(page.getByText('Schnellkonfiguration')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Setze Samstag Farben' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Setze Sonntag Farben' })).toBeVisible();
  });
});
