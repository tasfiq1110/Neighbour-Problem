# Game asset credits

Downloaded 2026-11-05. These assets are bundled for use in The Neighbour Problem.

## Poly Haven environment assets — CC0

All following textures and models are provided under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/). [Poly Haven's license page](https://polyhaven.com/license) explicitly permits commercial use and redistribution.

- [Brown Mud 02](https://polyhaven.com/a/brown_mud_02): `textures/brown_mud_02_*_1k.jpg`.
- [Brick Wall 006](https://polyhaven.com/a/brick_wall_006): `textures/brick_wall_006_*_1k.jpg`.
- [Grey Plaster](https://polyhaven.com/a/grey_plaster): `textures/grey_plaster_*_1k.jpg`.
- [Green Metal Rust](https://polyhaven.com/a/green_metal_rust): `textures/green_metal_rust_*_1k.jpg`.
- [Grass Ground](https://polyhaven.com/a/grass_ground): `textures/grass_ground_*_1k.jpg`.
- [Old Military Crate](https://polyhaven.com/a/old_military_crate): `models/old_military_crate/` including glTF, binary, and three texture maps.
- [Barrel 01](https://polyhaven.com/a/Barrel_01): `models/Barrel_01/` including glTF, binary, and three texture maps.

Textures were downloaded through the official `api.polyhaven.com/files/{asset}` metadata and `dl.polyhaven.org` asset downloads. All environment texture images are 1024 × 1024. Suffix `diff` is sRGB base color, `nor_gl` is linear OpenGL normal, and `rough` is linear roughness. Prop `arm` textures pack ambient occlusion, roughness and metalness in R, G and B.

## Soldier character — Adobe Mixamo, via three.js example

`models/Soldier.glb` was downloaded from [three.js r170](https://github.com/mrdoob/three.js/blob/r170/examples/models/gltf/Soldier.glb). The [official three.js example](https://github.com/mrdoob/three.js/blob/r170/examples/webgl_animation_skinning_blending.html) credits Mixamo for the model. The [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) allows royalty-free character and animation use in personal, commercial and nonprofit projects, including video games. This character is included as part of the game, not offered as a standalone asset library. It is not claimed to be CC0 or to inherit the three.js code's MIT license.

The character is 2,160,468 bytes with 11,376 triangles and embedded textures. Animation names: `Idle`, `Run`, `TPose`, `Walk`. The supplied scene already includes centimeter-to-meter conversion and is approximately 1.832 meters tall; do not apply another 0.01 scale. Clone its skeleton with `SkeletonUtils.clone` for independently animated NPCs.

## Integration notes

- Barrel glTF: `models/Barrel_01/Barrel_01.gltf`; 2,682 triangles, size approximately 0.563 × 0.880 × 0.563 meters (X/Y/Z). Ground offset approximately +0.0066 meters.
- Crate glTF: `models/old_military_crate/old_military_crate.gltf`; 10,476 triangles, size approximately 1.815 × 0.301 × 0.979 meters. Its geometry is a long shallow military case, not a cubic crate. Recenter horizontal bounds if needed.
- Both props use ordinary glTF with external relative dependencies and no required compression extensions. Keep each complete directory together.
- Use shared geometries/textures for repeated props; scale clones to suit world units. Normal and roughness maps should not use sRGB color space.

## Additional foliage assets — Poly Haven CC0

- [Shrub 02](https://polyhaven.com/a/shrub_02): `models/shrub_02/shrub_02.gltf` and dependencies; 1,966,425 bytes total. Four separate variants named `shrub_02_a` through `shrub_02_d`, respectively 7,590 / 5,242 / 9,234 / 5,188 triangles. Clone individual meshes rather than the entire display collection. Preserve the authored node rotation and reset horizontal position when placing them. Dense woody foliage suitable for nearby shrubs or scaled tree crowns.
- [Shrub 03](https://polyhaven.com/a/shrub_03): `models/shrub_03/shrub_03.gltf` and dependencies; 1,628,793 bytes total. Four separate upright variants `shrub_03_a` through `shrub_03_d`, 2,385 / 2,134 / 1,790 / 1,978 triangles, height 0.40 / 0.35 / 0.30 / 0.25 meters. Use individual variants, reset X positions, and scale to desired cover height.
- [Bark Brown 01](https://polyhaven.com/a/bark_brown_01): `textures/bark_brown_01_{diff,nor_gl,rough}_1k.jpg`, standard 1024px PBR set.

Foliage models use authored geometry and alpha-tested leaf materials. Preserve double-sided and alpha-mask settings from glTF; avoid converting leaves to transparent blending. Tree candidates were 25–214 MB and omitted to keep the mobile build manageable. Use close-range shrub meshes alongside cheaper distant foliage instead of cloning detailed models for all 300 trees.
