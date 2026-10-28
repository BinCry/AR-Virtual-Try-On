# AR tracking

MediaPipe `PoseLandmarker` chạy `VIDEO` mode trên frame webcam mới; guard `currentTime` tránh inference lặp cùng frame. Các landmark vai 11/12 và hông 23/24 phải vượt confidence trước khi render. EMA alpha 0.35 giảm rung; mất tracking thì overlay ẩn thay vì giữ vị trí cũ.

Tracking chạy cục bộ. Model/WASM tải qua CDN của MediaPipe; khi production cần tự host/version-pin nếu chính sách CSP hoặc mạng yêu cầu. Chưa có skeletal retargeting: chỉ thực hiện khi asset là `SkinnedMesh` có bone map được xác minh.
