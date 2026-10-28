import { expect, test } from '@playwright/test';
test('renders local-only AR controls without requesting the camera', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { const url = new URL(request.url()); if (url.hostname !== '127.0.0.1' && url.protocol !== 'data:') external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Phòng thử đồ 3D' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bật camera' })).toBeVisible();
  await expect(page.getByText('Không upload video, ảnh, landmark hoặc số đo.')).toBeVisible();
  expect(external).toEqual([]);
});
