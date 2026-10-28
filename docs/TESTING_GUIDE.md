# Kiểm thử

Automated: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm --filter @studio-ar/demo test:e2e`. Unit tests kiểm EMA, fit estimate và mapping/mirror. Playwright smoke test xác nhận UI khởi tạo không tự yêu cầu camera và không gọi network ngoài localhost; test browser/camera thật không thể thay bằng mock.

Manual: mở demo trên localhost/HTTPS, bấm Bật camera, cấp quyền, đứng chính diện, di chuyển ngang/gần-xa/nghiêng, đổi mẫu, bật diagnostics, chụp ảnh, tắt/bật lại camera và rời trang. Xác nhận track camera đã tắt bằng browser indicator. Ghi thiết bị/browser/FPS khi nghiệm thu; không tự đánh dấu PASS trong môi trường không webcam.
