/**
 * Squircle corner utilities for Tailwind CSS.
 *
 * Built on the native CSS `corner-shape` property (Chromium 139+), which
 * reshapes the corners produced by `border-radius` into a superellipse. That
 * means the existing Tailwind radius utilities — `rounded-md`, `rounded-2xl`,
 * `rounded-[20px]`, etc. — keep defining the radius, and these utilities just
 * change the corner *shape* to a squircle.
 *
 * Usage in tailwind.config.js:
 *
 *   const squircle = require("@spatio-labs/squircle/tailwind");
 *   module.exports = { plugins: [squircle] };
 *
 *   // or make EVERY rounded-* a squircle automatically (no extra class):
 *   module.exports = { plugins: [squircle({ global: true })] };
 *
 * Then in markup:
 *
 *   <div class="rounded-2xl corner-squircle">…</div>          // opt-in per element
 *   <div class="rounded-2xl corner-superellipse-3">…</div>    // custom smoothing
 *
 * `corner-shape: superellipse(k)` maps k to the corner curvature:
 *   0 = bevel, 1 = round, 2 = squircle (Apple-like), higher = squarer.
 *
 * @param {{ smoothing?: number, global?: boolean }} [options]
 *   - `smoothing`: superellipse exponent for the `corner-squircle`/`squircle`
 *     utilities and the global rule. Default 2 (the classic squircle).
 *   - `global`: when true, applies `corner-shape` to every element so any
 *     `border-radius` (e.g. `rounded-md`) renders as a squircle with no extra
 *     class. Safe because `corner-shape` is a no-op without a radius.
 */
const plugin = require("tailwindcss/plugin");

module.exports = plugin.withOptions(
  (options = {}) =>
    ({ addBase, addUtilities, matchUtilities, theme }) => {
      // `smoothing` is the SwiftUI/Figma corner smoothing (0..1) for the
      // squircle. iOS uses ≈ 0.6, which is the default.
      const smoothing = options.smoothing ?? 0.6;

      // The `squircle` utility renders SwiftUI's `.continuous` corner. It sets
      // `--se-smooth` (read by the `@spatio-labs/squircle/corners` runtime, which draws
      // the exact Apple curve via clip-path in EVERY browser) and, as a no-JS
      // fallback, the closest native value `corner-shape: superellipse(2)`.
      const squircle = (s) => ({
        "corner-shape": "superellipse(2)",
        "--se-smooth": `${s}`,
      });

      // The geometric `<corner-shape-value>` family sets the native
      // `corner-shape` (used directly by Chromium 139+) plus `--se-shape`, the
      // MDN parameter `s` the runtime uses to reproduce the shape elsewhere.
      const shape = (native, s) => ({ "corner-shape": native, "--se-shape": `${s}` });

      if (options.global) {
        // Make every rounded element a SwiftUI squircle, no extra class needed.
        addBase({ "*, ::before, ::after": squircle(smoothing) });
      }

      addUtilities({
        ".corner-squircle": squircle(smoothing),
        ".squircle": squircle(smoothing),
        ".corner-round": shape("round", 1),
        ".corner-bevel": shape("bevel", 0),
        ".corner-notch": shape("notch", -8),
        ".corner-scoop": shape("scoop", -1),
        ".corner-square": shape("square", 8),
      });

      // Custom SwiftUI smoothing: corner-smooth-60, corner-smooth-[0.8]
      matchUtilities(
        { "corner-smooth": (value) => squircle(value) },
        { values: theme("cornerSmoothing") },
      );

      // Raw CSS superellipse exponent: corner-superellipse-2, -[3.5], -[-1]
      matchUtilities(
        { "corner-superellipse": (value) => shape(`superellipse(${value})`, value) },
        { values: theme("cornerSuperellipse") },
      );
    },
  () => ({
    theme: {
      // SwiftUI smoothing presets (0..1). Tailwind also accepts arbitrary
      // values, e.g. corner-smooth-[0.45].
      cornerSmoothing: {
        0: "0",
        45: "0.45",
        ios: "0.6",
        60: "0.6",
        full: "1",
        100: "1",
      },
      // Raw superellipse exponents for the CSS corner-shape family.
      cornerSuperellipse: {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
      },
    },
  }),
);
