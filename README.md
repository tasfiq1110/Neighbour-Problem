# The Neighbour Problem

A browser-based 3D stealth game with Bangla/English UI, an AI companion, mobile dual-stick controls, three weapons, a training range, and an eight-stage fictional capture/extraction mission.

## Run locally

Install Node.js 22.12 or newer, then run:

```sh
git clone https://github.com/tasfiq1110/Neighbour-Problem.git
cd Neighbour-Problem
npm ci
npm start
```

Open **http://127.0.0.1:5173/**. The game assets and Three.js runtime are included in `dist`, so `npm start` can also serve the game without installing dependencies. Installation is needed for tests and the build check. Use a web server; opening `index.html` directly will not load module/3D assets correctly.

## Publish with GitHub Pages

In this repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included **Test and deploy game** workflow validates the game and publishes `dist` on pushes to `main`. After enabling Pages, run the workflow from the Actions tab if needed.

Expected URL after the first successful deployment: **https://tasfiq1110.github.io/Neighbour-Problem/**.

This URL is not live until Pages is enabled and the deployment completes. No API keys, paid services, or application backend are required. All game resources use relative paths, including on GitHub's repository subpath.

## Controls

| Control | Action |
| --- | --- |
| WASD / left stick | Move |
| Mouse / right stick | Aim; click / hold right stick to fire |
| Shift | Sprint |
| C | Crouch |
| E (hold) | Interact / collect equipment |
| F | Melee; approach an unaware guard from behind for a takedown |
| T | Cycle collected weapons |
| B | Cycle supported fire modes |
| R | Reload |
| Q | Companion follow / hold |
| J | Companion cover fire / hold fire |
| Z | Mark the enemy in your aim direction |
| Space (hold) / K (toggle) | Steady aim; slower movement and tighter spread |
| G / X / H | Decoy / smoke / medkit |
| M / Escape | Map / pause |

Use **অনুশীলন মাঠ / Training range** to try all three weapons. On mobile, the action buttons expose weapon switching, fire mode, melee, and equipment. Performance graphics are available for slower devices.

## Development and validation

```sh
npm run check
npm run build
```

This is a static application: `dist` is the maintained source and deployment directory. The build command runs syntax and regression checks; no bundler is required. Tests cover mission progression, combat, companion behavior, ammunition conservation, pooled effects, and the actual animated Soldier skeleton.

Asset attribution and license conditions are in [ASSET-CREDITS.md](dist/assets/ASSET-CREDITS.md). Environment assets are CC0; the Soldier character has separate Mixamo usage terms. See [UPGRADE-NOTES.md](UPGRADE-NOTES.md) for implementation details.

All characters and events are fictional. The game is single-player with an AI companion; it does not implement online multiplayer.

## Audio, strategy and controls (2.2)

Includes 21 bundled Bangla radio lines, layered ambience and an adaptive synthesized score. Audio begins after Deploy/Training is pressed; pause settings have separate effects, background/music and voice sliders. Sound stops during pause and when the tab loses focus.

The companion has an independent weapon, three-shot bursts, finite reserve ammunition and reloads. Holding position does not disable covering fire. Hold-fire orders preserve stealth; mark a visible target to prioritize it when cover fire is enabled. Smoke and friendlies block its shots. Supply caches replenish companion ammunition.

Steady aim improves precision at the cost of speed. Sustained fire increases spread, while shots passing close to a guard temporarily reduce their firing rate. Legs turn toward strafing movement, backward movement reverses the gait, and the spine counter-turns to preserve the aim direction.

Controls are automatically selected from device capabilities and mobile/tablet detection, not viewport width. Desktop hides touch buttons; touch hides keyboard badges and keyboard instructions. The menu provides an override for hybrid devices.
