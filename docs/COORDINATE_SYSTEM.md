# Hệ tọa độ

MediaPipe trả landmark normalized theo video gốc. Canvas và video đều được CSS mirror; vì thế renderer dùng tọa độ video gốc, rồi cả hai cùng flip một lần khi hiển thị. Tâm vai đặt vị trí X/Y, khoảng vai đặt `scaleX`, trung bình vai–hông đặt Y, vector vai đặt `rotationZ`, khoảng vai–hông đặt `scaleY`.

Renderer dùng camera orthographic `[-1,1]` để overlay ổn định. Đây là torso alignment 2D/2.5D, không suy ra chiều sâu hay kích thước người dùng. Bản MVP đang giả định video/canvas cùng aspect; thêm `object-fit: cover` crop compensation là việc bắt buộc trước khi đổi layout không đồng tỷ lệ.
