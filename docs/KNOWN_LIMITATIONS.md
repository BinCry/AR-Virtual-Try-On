# Giới hạn đã biết

DONE: webcam lifecycle, pose inference local, smoothing, torso 3D overlay, chuyển mẫu, capture theo thao tác, cleanup logic.

PARTIAL: calibration hiện theo normalized landmarks và cần test webcam thật. Mapper đã bù vùng crop `object-fit: cover`, nhưng vẫn không suy ra chiều sâu/kích thước cơ thể.

PARTIAL: GLB loader và asset demo rigged đã có; upper-arm retargeting chỉ dùng pose landmarks và cần nghiệm thu camera thật. Chưa có cloth simulation, body-shape deformation, occlusion/segmentation, đo size chính xác, analytics/backend. Không có benchmark FPS hay nghiệm thu physical camera trong môi trường hiện tại.
