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

/* Replaced by the encoding-neutral fixture below.
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const pose of ['arms-up', 'turn']) {
    await page.goto(`/?pose=${pose}`);
    await page.getByRole('button', { name: 'Xem trÆ°á»›c máº«u 3D' }).click();
    await expect(page.getByText('GLB rigged Ä‘Ã£ náº¡p')).toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(page.locator('canvas').first()).toHaveJSProperty('width', expect.any(Number));
  }
  expect(errors).toEqual([]);
}); */

test('renders raised-arm and turned-body rig fixtures without runtime errors', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const pose of ['arms-up', 'turn']) {
    await page.goto(`/?pose=${pose}`);
    await page.locator('button.preview').click();
    await expect(page.locator('canvas.overlay').first()).toBeVisible();
    expect(await page.locator('canvas.overlay').first().evaluate((canvas) => canvas.width)).toBeGreaterThan(0);
    for (const garment of await page.locator('button.garment').all()) {
      await garment.click();
      await expect(page.getByTestId('asset-status')).toContainText('GLB rigged');
      const opaquePixels = await page.locator('canvas.overlay').first().evaluate((canvas) => {
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!gl) return 0;
        const pixels = new Uint8Array(canvas.width * canvas.height * 4);
        gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let count = 0; for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 8) count += 1;
        return count;
      });
      expect(opaquePixels).toBeGreaterThan(200);
    }
    await page.locator('canvas.overlay').first().screenshot({ path: testInfo.outputPath(`${pose}.png`) });
  }
  expect(errors).toEqual([]);
});
