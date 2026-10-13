import { expect, test } from '@playwright/test';
import { resetDatabase } from './db-helper';

test.describe('Einstellungen View', () => {
  test.beforeAll(async () => {
    await resetDatabase();
  });

  test('should show all settings sections', async ({ page }) => {
    await page.goto('/admin-view/settingsView');

    await expect(page.getByText('Allgemeine Einstellungen')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Druck bei Ausruf')).toBeVisible();
    await expect(page.getByText('Automatisch Ausrufen')).toBeVisible();

    await expect(page.getByText('Wähle Drucker')).toBeVisible();

    await expect(page.getByText('Type-Farben Konfiguration')).toBeVisible();
    await expect(page.getByText('Wähle Type')).toBeVisible();

    await expect(page.getByText('Schnellkonfiguration')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Setze Samstag Farben' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Setze Sonntag Farben' })).toBeVisible();
  });
});
