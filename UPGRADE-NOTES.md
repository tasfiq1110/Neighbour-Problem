# Field Build 02

The Neighbour Problem is the game; Operation Moyukh is the first playable operation. Viktor Sable is a wholly original fictional smuggling boss, not a journalist or a representation of any real person.

## Implemented

- 240 × 340 meter navigation area, over five times the previous playable area, with four frontier crossings, settlements, a depot, relay station, archive, guarded compound and extraction dock.
- Eight linked objectives: briefing dossier, border crossing, depot card/weapon, relay shutdown, generator shutdown, vault codes, capture, captive escort and timed extraction.
- Original Bangla mission text and dialogue, plus English core mission/UI translations.
- Animated skinned human characters, locally bundled PBR texture sets, glTF props and foliage, terrain, rain, moving water normals, reflective materials, searchlights, shadow maps, bloom and optional SSAO.
- Performance / High / Ultra graphics settings, portrait and landscape touch controls, dual analog sticks, interaction holds, inventory actions and tactical map.
- Patrol, suspicious, investigate, search, combat and incapacitated AI states. Last-known-position memory, hearing, radio calls, reinforcement limits, discovery of downed guards, flanking offsets and retreat to nearby cover when injured.
- Companion navigation and combat assistance; captive follows via navigation after capture. Enemy markers are limited to nearby guards except on Operative difficulty.
- Rifle hitscan blocked by solid cover, ammunition and reloads, muzzle flashes, tracers, shell casings, impacts, camera recoil, synthesized positional gunfire, smoke, decoys and medkits.
- Three difficulty configurations. Supply caches and best completion time per difficulty. Non-graphic fictional crowd-scuffle epilogue after extraction.

## Scope and limitations

This is a single-player browser game, not online multiplayer. Graphics are an authored mixture of licensed assets and procedural scene construction, not a photogrammetric reproduction of a real border. The model set is shared between characters with clothing/tint differences; there is no bespoke full-body cinematic animation or recorded voice acting. Music, ambience and weapon effects are synthesized with Web Audio. Current runs are not persisted across page reloads; best successful time is stored locally.

## Code and testing

- `dist/simulation.js`: deterministic gameplay, navigation, perception, inventory and combat.
- `dist/mission.js`: mission registry data, map layout, difficulties and authored dialogue.
- `dist/world.js`: assets, environment, animation, post-processing, effects and foliage LOD.
- `dist/game.js`: input, menus, responsive HUD, minimaps and epilogue.
- `dist/audio.js`: audio synthesis.
- `tests/simulation.test.mjs`: route reachability, occlusion, smoke, ammunition, perception memory, consumables, mission completion and reinforcement rules.
- `dist/assets/ASSET-CREDITS.md`: asset sources and license details.

Run `npm run dev`, then open http://127.0.0.1:5173. Run `npm run check` to validate JavaScript and gameplay tests. Dependencies are vendored for gameplay; npm installation is only required when updating vendor files.


## Combat and animation polish (2.1)

- Rifle, carbine and marksman rifle with separate magazines and shared finite reserve ammunition. Collect weapons from guards and supply caches; T cycles collected weapons and B changes supported fire modes. Burst fires three rounds per trigger.
- F performs a timed melee strike even when armed. An unaware guard approached from behind can be silently knocked out; front attacks cause noise and require more hits.
- Skeletal two-hand rifle hold layered over continuous speed-based locomotion. Companion follow hysteresis prevents repeated stopping at the follow boundary.
- Pooled tracers, muzzle flashes, sparks and casings replace transient lights and allocations. Combat shaders compile during loading; detailed weapon meshes are merged and shared.
- Veteran and Ghost have stronger detection, higher damage, tighter ammunition and more reinforcements. Operative remains available.
- Training range exposes all three weapons for practice. Mobile includes weapon, fire mode and melee controls.
- Regression checks cover the actual Soldier skeleton through idle, movement and crouch; ammunition conservation, bursts, takedown timing and bounded combat effects.
