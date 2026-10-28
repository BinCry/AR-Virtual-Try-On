# Khắc phục sự cố

- `NotAllowedError`: cấp camera trong browser/site settings.
- Không có camera: kiểm tra webcam, HTTPS/localhost và iframe policy.
- `NotReadableError`: đóng Zoom/Teams hoặc app khác đang giữ camera.
- Model không tải: kiểm tra mạng/CDN/CSP; production nên tự host WASM/model.
- Overlay lệch: dùng layout video/canvas cùng aspect; không crop cover khác nhau.
- WebGL lỗi: cập nhật driver/browser, tắt hardware acceleration only để chẩn đoán.
