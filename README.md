# Local Virtual Try-On

<p align="center">
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/MediaPipe-Pose-00A67E?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe Pose" />
  <img src="https://img.shields.io/badge/Canvas-2D-F57C00?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas 2D" />
</p>

Demo thử trang phục realtime, chạy hoàn toàn trong trình duyệt: webcam →
MediaPipe Pose → Canvas 2D. Không dùng API key, backend, tài khoản cloud hay
phí theo thời gian; camera và ảnh trang phục không được upload khỏi thiết bị.

## Chạy dự án

Yêu cầu Node.js 20+ và pnpm 10+.

```bash
pnpm install
pnpm dev
```

Mở URL Vite in ra (thường là `http://localhost:5173`). Chọn một trong ba trang
phục không có nón có sẵn, rồi bấm **Bật camera**. Ứng dụng dùng các mốc vai và
hông để co giãn, đặt ảnh áo lên video webcam; dừng camera khi bấm **Tắt camera**
hoặc rời trang.

## Lưu ý về chất lượng

Đây là overlay 2D realtime, không phải AI tạo video hay mô phỏng vải. Ba mẫu
đã được chuẩn bị với góc nhìn thẳng và nền trong suốt để bám dáng ổn định. Nó
không đo size, không xử lý chính xác độ rủ, che khuất tay hoặc góc xoay mạnh.

## Kiểm tra và triển khai

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

Bản build là static và có thể đặt trên bất kỳ static host nào. Camera chỉ hoạt
động trên `localhost` hoặc website HTTPS.
