# Sẵn sàng triển khai thử nghiệm

## Trạng thái: READY FOR CONTROLLED PILOT

Điều kiện kỹ thuật tự động đã đạt: source sạch, dependencies lockfile, typecheck/lint/test/build PASS, localhost smoke PASS, CDN model/WASM kiểm tra HTTP 200. Không có backend, upload, analytics hoặc lưu biometric data.

## Điều kiện mở pilot

- Dùng HTTPS hoặc localhost; iframe (nếu có) phải `allow="camera"`.
- Chỉ dùng Chromium desktop làm target nghiệm thu đầu tiên.
- Có người quan sát để xác nhận consent camera, stop-camera và ảnh capture.
- Không dùng kết quả để tư vấn kích cỡ hoặc cam kết độ vừa vặn.

## Kịch bản go/no-go (10 phút)

1. Mở demo và bấm Bật camera; xác nhận permission chỉ xuất hiện sau thao tác.
2. Cấp quyền, đứng chính diện, di chuyển trái/phải, gần/xa, nghiêng nhẹ; xác nhận garment theo torso hợp lý.
3. Đổi ba garment, lặp tắt/bật camera ba lần; xác nhận không mất WebGL/camera track.
4. Chụp ảnh; xác nhận ảnh có video và overlay, không có upload tự động.
5. Rời trang hoặc tắt camera; browser camera indicator phải tắt.

**GO** khi năm bước PASS trên thiết bị mục tiêu. **NO-GO** khi permission, cleanup, alignment hoặc console runtime error thất bại; lưu browser/OS/thiết bị và console error để triage.
