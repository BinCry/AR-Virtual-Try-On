# Tích hợp vào React khác

1. Cài `@studio-ar/core`, Three và MediaPipe Tasks Vision.
2. Tạo `<video muted playsInline>` và `<canvas>` chồng cùng container.
3. Tạo `new GarmentRenderer(canvas)`, `new ArSession(video, renderer)` trong effect sau khi user bấm nút.
4. Gọi `session.setGarment(definition)` rồi `await session.start()`.
5. Subscribe `session.on(...)` để cập nhật UI; cleanup `session.dispose()` trong effect cleanup.

Không tự bật webcam. Host phải là HTTPS/localhost; iframe cần cấp `allow="camera"`. Contract hiện tại dùng `GarmentDefinition` với id/label/color/accent; loader GLB chưa là public API.
