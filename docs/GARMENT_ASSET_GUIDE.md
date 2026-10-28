# Hướng dẫn asset garment

MVP dùng geometry Three.js procedural để chứng minh pipeline 3D. Với GLB sản xuất: đơn vị mét, +Y up, pivot ở giữa torso, mesh A/T-pose, material PBR, texture nén, license rõ ràng. Manifest cần `id`, `url`, reference shoulder/torso dimensions, transform offsets; retarget chỉ bật khi asset có `SkinnedMesh` và mapping xương đã test.

Không dùng ảnh PNG làm garment và không tuyên bố mô phỏng vải/fit chính xác.
