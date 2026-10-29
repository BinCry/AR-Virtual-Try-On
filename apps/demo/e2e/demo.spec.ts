import { expect, test } from '@playwright/test';
test('renders local-only AR controls without requesting the camera', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { const url = new URL(request.url()); if (url.hostname !== '127.0.0.1' && url.protocol !== 'data:') external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Phòng thử đồ 3D' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bật camera' })).toBeVisible();
  await expect(page.getByText('Không upload video, ảnh, landmark hoặc số đo.')).toBeVisible();
  await expect(page.getByText('AUTO FIT')).toBeVisible();
  await expect(page.getByRole('spinbutton')).toHaveCount(0);
  expect(external).toEqual([]);
});

test('loads all locally bundled rigged garments in the no-camera preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Xem trước mẫu 3D' }).click();
  await expect(page.getByText('GLB rigged đã nạp')).toBeVisible();
  await page.getByRole('button', { name: /CC0 Knit Hoodie/ }).click();
  await expect(page.getByText('GLB rigged đã nạp')).toBeVisible();
  await page.getByRole('button', { name: /CC0 Long Trench Coat/ }).click();
  await expect(page.getByText('GLB rigged đã nạp')).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
});
