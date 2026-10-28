# Phân tích repository tham chiếu

## Đã xác minh

`BinCry/Costume-Rental-Studio`, nhánh `main`, commit `7ed1fd3e7dddb4bd812b1362ec434321283de71e`: monorepo pnpm với `apps/web` (React 19, Vite 8, Tailwind 4) và `apps/api` (Express 5, TypeScript, Zod, Prisma/PostgreSQL). Có scripts chuẩn build/test/typecheck/lint và GitHub workflows.

## Kết luận

Repo này là hệ thống quản lý cho thuê, không có engine AR. Studio AR Lab giữ độc lập, dùng React/TypeScript/pnpm tương thích hướng frontend nhưng không lấy dependency vào API, DB, nghiệp vụ hay catalog của repo kia. Khi tích hợp sau này, website chỉ cần cung cấp metadata garment hợp lệ theo API của `ar-core`.

## Rủi ro tích hợp

Vite/version package có thể khác; đóng gói `@studio-ar/core` và kiểm thử peer dependency trước khi đưa vào monorepo chính. Không giả định quyền camera trong iframe: cần HTTPS, Permissions Policy và `allow="camera"`.
