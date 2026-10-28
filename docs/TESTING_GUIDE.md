# Kiểm thử

Automated: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Unit tests kiểm EMA và mapping/mirror; test browser/camera thật không thể thay bằng mock.

Manual: mở demo trên localhost/HTTPS, bấm Bật camera, cấp quyền, đứng chính diện, di chuyển ngang/gần-xa/nghiêng, đổi mẫu, bật diagnostics, chụp ảnh, tắt/bật lại camera và rời trang. Xác nhận track camera đã tắt bằng browser indicator. Ghi thiết bị/browser/FPS khi nghiệm thu; không tự đánh dấu PASS trong môi trường không webcam.
