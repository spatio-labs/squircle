# API Reference

`@spatio-labs/squircle` is a Tailwind CSS plugin plus a small browser runtime.
There is no React component (removed in v2).

## Tailwind plugin — `@spatio-labs/squircle`

```js
const squircle = require("@spatio-labs/squircle");

module.exports = {
  plugins: [
    squircle,              // default options
    // squircle({ smoothing: 0.6, global: false }),
  ],
};
```

### Options

| Option      | Type      | Default | Description |
|-------------|-----------|---------|-------------|
| `smoothing` | `number`  | `0.6`   | SwiftUI/Figma corner smoothing (`0`–`1`) for `squircle` / `corner-squircle` and global mode. iOS uses `0.6`. |
| `global`    | `boolean` | `false` | Apply a SwiftUI squircle to **every** element with a `border-radius`, no per-element class needed. |

### Utilities

| Class | Effect |
|-------|--------|
| `squircle`, `corner-squircle` | SwiftUI continuous corner at the configured smoothing. |
| `squircle-{0,45,ios,60,full,100}` | SwiftUI corner at preset smoothing; arbitrary `squircle-[0.35]` supported. |
| `corner-round` | `corner-shape: round` (`superellipse(1)`). |
| `corner-bevel` | `corner-shape: bevel` (`superellipse(0)`). |
| `corner-scoop` | `corner-shape: scoop` (`superellipse(-1)`, concave). |
| `corner-notch` | `corner-shape: notch` (concave right angle). |
| `corner-square` | `corner-shape: square` (sharp corner). |
| `corner-superellipse-{0..4}` | Raw CSS superellipse exponent; arbitrary/negative values supported, e.g. `corner-superellipse-[3.5]`, `corner-superellipse-[-1]`. |

Each utility sets the relevant CSS (`corner-shape` and/or a `--se-smooth` /
`--se-shape` custom property) that the runtime reads. The radius itself comes
from your normal radius utilities (`rounded-*`, `rounded-[20px]`).

## Runtime — `@spatio-labs/squircle/corners`

```js
import { initCorners } from "@spatio-labs/squircle/corners";
const cleanup = initCorners();
```

### `initCorners(options?) => () => void`

Scans a root for corner-shaped elements and keeps each element's `clip-path` in
sync with size and DOM changes. Returns a cleanup function that disconnects the
observers.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `ParentNode` | `document` | Subtree to scan. |
| `selector` | `string` | `[class*="corner-"],.squircle,[data-corner-shape]` | Candidate elements. |
| `force` | `boolean` | `false` | Also draw the superellipse family via `clip-path` even where native `corner-shape` is supported. |
| `watch` | `boolean` | `true` | Observe DOM mutations to shape newly-added elements. |

Without Tailwind, target elements with a `data-corner-shape` attribute that
accepts `squircle` / `continuous` (SwiftUI) or any
[`<corner-shape-value>`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/corner-shape-value).

**Borders.** If a shaped element has a CSS `border`, the runtime strokes the
same path (clipped to the shape) so the border follows the curve instead of
being shaved off at the corners. Just use a normal border — no extra API.

### Path helpers

- `squirclePath(w, h, radii, smoothing)` — SwiftUI continuous-corner outline
  (Figma smoothing model). `radii` is `{ tl, tr, br, bl }` in px.
- `superellipsePath(w, h, radii, s, segments?)` — CSS `corner-shape` superellipse
  outline for parameter `s` (curve exponent `n = 2^s`).
- `parseShape(value)` — parse a `<corner-shape-value>` string to the parameter `s`.
- `supportsNative()` — `true` when the browser implements native CSS `corner-shape`.

All helpers return SVG path strings suitable for `clip-path: path('…')`.

## Browser support

`clip-path` and `ResizeObserver` are required and supported in every evergreen
browser. Native `corner-shape` (Chromium 139+) is used as an enhancement for the
geometric values; the SwiftUI `squircle` is always rendered by the runtime.
