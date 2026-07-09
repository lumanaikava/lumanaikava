# 3D product model — drop zone

Drop the finished model in this folder as exactly:

    lumanai-bottle.glb

The site auto-detects it — the featured product card on /products swaps
from the photo to an interactive, auto-rotating 3D viewer. No code
changes needed.

## Spec for the 3D artist

- Format: **GLB (glTF 2.0 binary)** — single file, textures embedded
- Size budget: **under 5 MB** (~50–150k triangles)
- Textures: PBR (base color / metallic-roughness / normal), 2048×2048
- Origin centered at the product's base, **Y-up**, real-world scale (meters)
- Label art as texture — request layered source art so flavors can swap
- Also collect the source file (.blend / .c4d) for future edits
