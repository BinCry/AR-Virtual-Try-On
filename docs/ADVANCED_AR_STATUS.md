# Trạng thái AR nâng cao

## Đã triển khai

- MediaPipe model và WASM được self-host trong `apps/demo/public/models`.
- `Studio Blazer GLB` là asset demo nội bộ có skeleton `Hips`, `Spine`, `LeftUpperArm`, `RightUpperArm`.
- Loader xác thực `SkinnedMesh` + bone names trước khi bật retarget; chuyển động upper-arm dùng pose landmarks, EMA và clamp góc.
- Profile số đo nhập cục bộ chỉ hiệu chỉnh scale tham khảo; không lưu, upload hoặc đưa ra size recommendation.
- Metrics FPS/inference và GPU/CPU delegate được đưa qua session event.

## Giới hạn trung thực

Occlusion cơ bản dùng segmentation mask của PoseLandmarker: lớp video foreground được dựng trên garment và vùng torso theo vai/hông được khoét để giữ áo hiển thị. Đây không phải che khuất 3D chính xác và có thể sai ở tư thế/ánh sáng khó; fallback tự clear khi không có mask. Cloth physics, body deformation, forearm retargeting và fitting chính xác vẫn là R&D tiếp theo. Camera/material acceptance trên Chrome/Edge, Android Chrome và Safari iOS phải thực hiện trên thiết bị thật. Frame loop ưu tiên `requestVideoFrameCallback` và chỉ fallback `requestAnimationFrame` ở browser cũ.
