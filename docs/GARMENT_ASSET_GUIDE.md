# Hướng dẫn asset garment

MVP có `apps/demo/public/assets/garments/studio-blazer.glb`, một asset GLB self-generated, cùng fallback geometry Three.js. Tạo lại asset bằng `pnpm --filter @studio-ar/core generate:demo-garment`. Với GLB sản xuất: đơn vị mét, +Y up, pivot ở giữa torso, mesh A/T-pose, material PBR, texture nén, license rõ ràng. Manifest cần `id`, `url`, reference shoulder/torso dimensions, transform offsets; retarget chỉ bật khi asset có `SkinnedMesh` và mapping xương đã test.

`studio-blazer.glb` là mesh GLB không rig, nên không kích hoạt retarget. Không dùng ảnh PNG làm garment và không tuyên bố mô phỏng vải/fit chính xác.
