import { expect, test } from '@playwright/test';

test('renders local-only try-on controls without opening the camera', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost' && url.protocol !== 'data:') external.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Phòng thử đồ miễn phí' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bật camera' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bomber xanh' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trench coat' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Áo len xanh rêu' })).toBeVisible();
  await expect(page.getByText('Không có API key, backend, upload hay phí theo giây.')).toBeVisible();
  expect(external).toEqual([]);
});
