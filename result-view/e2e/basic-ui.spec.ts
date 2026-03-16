import { test, expect } from '@playwright/test';

test.describe('Result View Basic UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the result view application
    await page.goto('/');
  });

  test('should show available disciplines', async ({ page }) => {
    // Check that there are buttons for disciplines (types)
    // Based on result.component.html: <button mat-raised-button ...>{{ currentType.name }}</button>
    const disciplineButtons = page.locator('button[mat-raised-button]');
    await expect(disciplineButtons.first()).toBeVisible({ timeout: 10000 });
    const count = await disciplineButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // Log the available disciplines for debugging
    const names = await disciplineButtons.allTextContents();
    console.log('Available disciplines:', names.map(n => n.trim()));
  });

  test('should show groups and KO systems for the first discipline', async ({ page }) => {
    // Wait for the first discipline to be selected (default behavior in onTabSelected)
    // and wait for either group-view or stage-view to appear
    const groupView = page.locator('app-group-view');
    const stageView = page.locator('app-stage-view');

    // At least one of them should eventually be visible if test data is present
    await expect(groupView.first().or(stageView.first())).toBeVisible({ timeout: 15000 });

    const groupCount = await groupView.count();
    const stageCount = await stageView.count();

    console.log(`Found ${groupCount} groups and ${stageCount} KO stages.`);
    
    expect(groupCount + stageCount).toBeGreaterThan(0);
  });

  test('should be able to switch between disciplines', async ({ page }) => {
    const disciplineButtons = page.locator('button[mat-raised-button]');
    await expect(disciplineButtons.nth(1)).toBeVisible();
    
    const secondDisciplineName = (await disciplineButtons.nth(1).textContent())?.trim();
    await disciplineButtons.nth(1).click();
    
    // Verify that data is still loaded (or reloaded) for the new selection
    const groupView = page.locator('app-group-view');
    const stageView = page.locator('app-stage-view');
    await expect(groupView.first().or(stageView.first())).toBeVisible({ timeout: 10000 });
    
    console.log(`Switched to discipline: ${secondDisciplineName}`);
  });
});
