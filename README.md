# Demo Showroom

A dumb, fast launcher for demo URLs. Add a URL and a name, get a tile. Click the tile, it opens in a new tab. That's the whole app.

No scraping, no health checks, no tags — deliberately. Demos are stored per-browser in `localStorage`; branding is shared across the deployment.

Shortcuts: `/` focuses search, `[` toggles the sidebar, and pasting a URL anywhere outside a text field opens the Add dialog pre-filled. Drag tiles to reorder them.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Public Sans (self-hosted via `@fontsource/public-sans`). The only server-side piece is `server/index.js`, a dependency-free Node process that serves the built files and stores branding.

## Run with Docker

```bash
docker compose up --build   # http://localhost:5183
```

Podman works the same way (`podman compose up --build`).

## Develop

Requires Node 22+ and pnpm (`corepack enable` will provide the pinned version).


```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Branding

Logo, favicon, and accent colour are set from the Settings panel in the sidebar and apply to **everyone using that deployment**. They're stored as `branding.json` on the server's data volume, not in the browser, so a visitor with a clean profile still sees them.

Uploads only — there's no way to download the assets back out. Images are capped at 300KB each and must be an image data URI; the accent must be a `#rrggbb` hex value. Anything else is rejected by the API.

**There is no auth on this.** Anyone who can reach the app can change the branding for everyone, which is the same trade-off the rest of the app makes. Keep the deployment on a trusted network.

Mount a volume at `/data` or branding is lost when the container is replaced — see `docker-compose.yml`.

## Deployment config

The banner across the top is read from `public/config.json` (served as `/config.json`). Unlike branding, it's ops-controlled: set it by mounting a file over it, as shown commented out in `docker-compose.yml`, with no rebuild and no in-app settings:

```json
{ "bannerMessage": "This is a staging environment." }
```

The banner is pinned above the header, so it stays visible while scrolling, and users can't dismiss it — it shows on every visit for as long as the message is set. It takes up layout space rather than floating over the page, so it never covers tiles, and demos themselves open in their own tab without it. Leave `bannerMessage` empty (or the file absent) to hide it. Changes take effect on the next page load.

## Run the built app locally

```bash
pnpm build
STATIC_DIR=dist DATA_DIR=.data node server/index.js   # http://localhost:8080
```

`pnpm dev` and `pnpm preview` serve the same `/api/branding` contract through a Vite middleware, writing to `.data/` — so branding works in development too.

## Checks

```bash
pnpm lint
pnpm build   # includes the TypeScript type-check
```

## License

MIT — see [LICENSE](LICENSE).
