import { expect, test } from '@playwright/test';

const backend = 'http://localhost:8080/api/v2';

interface Player {
  firstName?: string;
  lastName?: string;
}
interface Match {
  id: number;
  team1: Player[];
  team2: Player[];
  playGroup?: { name?: string } | null;
  isPlayed: boolean;
}

test.describe('Result View live updates', () => {
  test('shows a result entered elsewhere without reloading the page', async ({ page, request }) => {
    // result-view shows the first open discipline first
    const types = await (await request.get(`${backend}/types/open/all`)).json();
    const matches: Match[] = await (await request.get(`${backend}/match/typeid/${types[0].id}`)).json();
    const match = matches.find(
      (m) => !m.isPlayed && m.playGroup && m.team1.length === 1 && m.team2.length === 1 && m.team1[0].lastName
    );
    test.skip(!match, 'the first discipline has no open singles group match');

    await page.goto('/');
    const row = page
      .locator('app-match-item')
      .filter({ hasText: `${match!.team1[0].firstName} ${match!.team1[0].lastName}` })
      .filter({ hasText: `${match!.team2[0].firstName} ${match!.team2[0].lastName}` })
      .first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row).not.toContainText('3');

    try {
      const response = await request.post(`${backend}/match/setResult/${match!.id}`, {
        data: [
          [11, 1],
          [11, 2],
          [11, 4],
        ],
      });
      expect(response.ok()).toBeTruthy();

      // the MATCH_COMPLETED event reloads the displayed discipline
      await expect(row).toContainText('3', { timeout: 10000 });
    } finally {
      // take back clears the result again, so the test data stays as it was
      await request.post(`${backend}/match/takeBack`, { data: [match!.id] });
    }
  });
});
