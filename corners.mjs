/**
 * @spatio-labs/squircle/corners — cross-browser squircle corners for any browser.
 *
 * Renders corner shapes by computing a `clip-path: path()` from the element's
 * measured size and `border-radius`, kept in sync with size via ResizeObserver.
 * `clip-path` + `ResizeObserver` are supported in every evergreen browser
 * (Chrome, Firefox, Safari), so results match wherever Tailwind runs.
 *
 * Two corner models are supported:
 *
 * 1. SwiftUI / Apple continuous corner (the `squircle` standard). This is the
 *    Figma "smoothing" model (https://www.figma.com/blog/desperately-seeking-squircles/),
 *    which spreads the curve onto the straight edges exactly like SwiftUI's
 *    `RoundedRectangle(cornerRadius:, style: .continuous)`. iOS uses smoothing
 *    ≈ 0.6. Driven by the `--se-smooth` custom property (0..1). Because the
 *    native CSS `corner-shape: squircle` is `superellipse(2)` — close but NOT
 *    the SwiftUI curve — the squircle is always rendered with this model, in
 *    every browser, for an exact match.
 *
 * 2. The CSS `<corner-shape-value>` superellipse family (round / scoop / bevel /
 *    notch / square / superellipse(n)). Driven by `--se-shape`, the MDN
 *    parameter `s` (bevel 0, round 1, squircle 2, scoop -1; ±∞ ≈ notch/square),
 *    curve exponent n = 2^s. Where native `corner-shape` exists these defer to
 *    CSS; elsewhere they fall back to the equivalent clip-path.
 *
 * Usage with the Tailwind plugin (sets the custom properties for you):
 *   import { initCorners } from "@spatio-labs/squircle/corners";
 *   initCorners();
 *
 * Or standalone, no Tailwind, via a data attribute that accepts any
 * <corner-shape-value> plus `squircle`/`continuous` for the SwiftUI curve:
 *   <div style="border-radius:24px" data-corner-shape="squircle"></div>
 *   <div style="border-radius:24px" data-corner-shape="superellipse(3)"></div>
 */

// ---------------------------------------------------------------------------
// SwiftUI / Apple continuous corner (Figma smoothing model)
// Ported from src/utils/draw — kept dependency-free for the browser runtime.
// ---------------------------------------------------------------------------

const toRadians = (deg) => (deg * Math.PI) / 180;
const round4 = (n) => (typeof n === "number" ? Math.round(n * 1e4) / 1e4 : n);

function cornerPathParams(cornerRadius, cornerSmoothing, budget) {
  let p = (1 + cornerSmoothing) * cornerRadius;
  const maxSmoothing = budget / cornerRadius - 1;
  cornerSmoothing = Math.min(cornerSmoothing, maxSmoothing);
  p = Math.min(p, budget);

  const arcMeasure = 90 * (1 - cornerSmoothing);
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);

  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4 = cornerRadius * Math.tan(toRadians(angleAlpha / 2));

  const angleBeta = 45 * cornerSmoothing;
  const c = p3ToP4 * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));

  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arcSectionLength, cornerRadius };
}

// Relative-command corner segments (matching the React component's output).
function tr({ cornerRadius: r, a, b, c, d, p, arcSectionLength: s }) {
  if (!r) return `l ${round4(p)} 0`;
  return `c ${round4(a)} 0 ${round4(a + b)} 0 ${round4(a + b + c)} ${round4(d)} a ${round4(r)} ${round4(r)} 0 0 1 ${round4(s)} ${round4(s)} c ${round4(d)} ${round4(c)} ${round4(d)} ${round4(b + c)} ${round4(d)} ${round4(a + b + c)}`;
}
function br({ cornerRadius: r, a, b, c, d, p, arcSectionLength: s }) {
  if (!r) return `l 0 ${round4(p)}`;
  return `c 0 ${round4(a)} 0 ${round4(a + b)} ${round4(-d)} ${round4(a + b + c)} a ${round4(r)} ${round4(r)} 0 0 1 -${round4(s)} ${round4(s)} c ${round4(-c)} ${round4(d)} ${round4(-(b + c))} ${round4(d)} ${round4(-(a + b + c))} ${round4(d)}`;
}
function bl({ cornerRadius: r, a, b, c, d, p, arcSectionLength: s }) {
  if (!r) return `l ${round4(-p)} 0`;
  return `c ${round4(-a)} 0 ${round4(-(a + b))} 0 ${round4(-(a + b + c))} ${round4(-d)} a ${round4(r)} ${round4(r)} 0 0 1 -${round4(s)} -${round4(s)} c ${round4(-d)} ${round4(-c)} ${round4(-d)} ${round4(-(b + c))} ${round4(-d)} ${round4(-(a + b + c))}`;
}
function tl({ cornerRadius: r, a, b, c, d, p, arcSectionLength: s }) {
  if (!r) return `l 0 ${round4(-p)}`;
  return `c 0 ${round4(-a)} 0 ${round4(-(a + b))} ${round4(d)} ${round4(-(a + b + c))} a ${round4(r)} ${round4(r)} 0 0 1 ${round4(s)} -${round4(s)} c ${round4(c)} ${round4(-d)} ${round4(b + c)} ${round4(-d)} ${round4(a + b + c)} ${round4(-d)}`;
}

/**
 * SwiftUI-accurate continuous-corner outline (Figma smoothing model).
 * @param {number} w border-box width  @param {number} h border-box height
 * @param {{tl,tr,br,bl}} radii per-corner radius in px
 * @param {number} smoothing 0..1 (iOS ≈ 0.6)
 */
export function squirclePath(w, h, radii, smoothing) {
  const budget = Math.min(w, h) / 2;
  const params = (r) =>
    cornerPathParams(Math.max(0, Math.min(r, budget)), smoothing, budget);
  const P = {
    tl: params(radii.tl),
    tr: params(radii.tr),
    br: params(radii.br),
    bl: params(radii.bl),
  };
  return [
    `M ${round4(w - P.tr.p)} 0`,
    tr(P.tr),
    `L ${round4(w)} ${round4(h - P.br.p)}`,
    br(P.br),
    `L ${round4(P.bl.p)} ${round4(h)}`,
    bl(P.bl),
    `L 0 ${round4(P.tl.p)}`,
    tl(P.tl),
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// CSS <corner-shape-value> superellipse family
// ---------------------------------------------------------------------------

const SHAPE_KEYWORDS = {
  notch: -8, // finite stand-ins for ∓∞ — visually indistinguishable
  scoop: -1,
  bevel: 0,
  round: 1,
  squircle: 2,
  square: 8,
};

/** Parse a `<corner-shape-value>` string (keyword or `superellipse(n)`) to s. */
export function parseShape(value) {
  if (value == null) return NaN;
  const v = String(value).trim().toLowerCase();
  if (v in SHAPE_KEYWORDS) return SHAPE_KEYWORDS[v];
  const m = v.match(/^superellipse\(\s*(-?infinity|[-+]?[0-9]*\.?[0-9]+)\s*\)$/);
  if (m) {
    if (m[1] === "infinity") return 8;
    if (m[1] === "-infinity") return -8;
    return parseFloat(m[1]);
  }
  const num = parseFloat(v);
  return Number.isNaN(num) ? NaN : num;
}

function spow(base, exp) {
  if (base <= 0) return exp <= 0 ? 1 : 0; // crisp square/notch limits
  return Math.pow(base, exp);
}

/** Build a superellipse outline for the given MDN corner-shape parameter `s`. */
export function superellipsePath(w, h, radii, s, segments = 24) {
  const p = Math.pow(2, 1 - s);
  const lim = Math.min(w, h) / 2;
  const r = {
    tl: Math.max(0, Math.min(radii.tl, lim)),
    tr: Math.max(0, Math.min(radii.tr, lim)),
    br: Math.max(0, Math.min(radii.br, lim)),
    bl: Math.max(0, Math.min(radii.bl, lim)),
  };
  const arc = (cx, cy, sx, sy, rad, reverse) => {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = (Math.PI / 2) * (i / segments);
      pts.push([cx + sx * rad * spow(Math.cos(t), p), cy + sy * rad * spow(Math.sin(t), p)]);
    }
    return reverse ? pts.reverse() : pts;
  };
  const f = (n) => round4(n);
  const out = [`M ${f(r.tl)} 0`, `L ${f(w - r.tr)} 0`];
  const push = (pts) => pts.forEach(([x, y]) => out.push(`${f(x)} ${f(y)}`));
  push(arc(w - r.tr, r.tr, +1, -1, r.tr, true));
  out.push(`L ${f(w)} ${f(h - r.br)}`);
  push(arc(w - r.br, h - r.br, +1, +1, r.br, false));
  out.push(`L ${f(r.bl)} ${f(h)}`);
  push(arc(r.bl, h - r.bl, -1, +1, r.bl, true));
  out.push(`L 0 ${f(r.tl)}`);
  push(arc(r.tl, r.tl, -1, -1, r.tl, false));
  out.push("Z");
  return out.join(" ");
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

const DEFAULT_SELECTOR = '[class*="corner-"],.squircle,[data-corner-shape]';

/** True when the browser implements native CSS `corner-shape`. */
export function supportsNative() {
  return (
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("corner-shape", "round")
  );
}

function readRadii(el) {
  const cs = getComputedStyle(el);
  const num = (v) => parseFloat(v) || 0;
  return {
    tl: num(cs.borderTopLeftRadius),
    tr: num(cs.borderTopRightRadius),
    br: num(cs.borderBottomRightRadius),
    bl: num(cs.borderBottomLeftRadius),
  };
}

function applyOne(el, force) {
  const cs = getComputedStyle(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;
  const radii = readRadii(el);
  if (!(radii.tl || radii.tr || radii.br || radii.bl)) return;

  // SwiftUI continuous corner takes priority and always renders via clip-path,
  // because no native CSS value reproduces it exactly.
  const smoothVar = cs.getPropertyValue("--se-smooth").trim();
  const dataShape = (el.getAttribute("data-corner-shape") || "").trim().toLowerCase();
  const wantsContinuous =
    smoothVar !== "" || dataShape === "squircle" || dataShape === "continuous";

  let d;
  if (wantsContinuous) {
    const smoothing = smoothVar !== "" ? parseFloat(smoothVar) : 0.6;
    d = squirclePath(w, h, radii, Number.isNaN(smoothing) ? 0.6 : smoothing);
  } else {
    // Superellipse family: defer to native CSS when available.
    if (supportsNative() && !force) return;
    const shapeVar = cs.getPropertyValue("--se-shape").trim();
    const s = shapeVar !== "" ? parseShape(shapeVar) : parseShape(dataShape);
    if (Number.isNaN(s)) return;
    d = superellipsePath(w, h, radii, s);
  }

  const value = `path('${d}')`;
  el.style.clipPath = value;
  el.style.webkitClipPath = value;
}

/**
 * Scan a root for corner-shaped elements and keep their clip-path in sync with
 * size changes. Returns a cleanup function.
 *
 * @param {Object} [opts]
 * @param {ParentNode} [opts.root=document]
 * @param {string} [opts.selector]
 * @param {boolean} [opts.force=false] also clip superellipse shapes where native corner-shape exists
 * @param {boolean} [opts.watch=true] observe DOM mutations for new elements
 */
export function initCorners(opts = {}) {
  if (typeof document === "undefined") return () => {};
  const { root = document, selector = DEFAULT_SELECTOR, force = false, watch = true } = opts;

  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver((entries) => entries.forEach((e) => applyOne(e.target, force)))
      : null;

  const seen = new WeakSet();
  const register = (el) => {
    if (seen.has(el)) return;
    seen.add(el);
    applyOne(el, force);
    if (ro) ro.observe(el);
  };
  const scan = (node) => {
    if (node.nodeType !== 1) return;
    if (node.matches && node.matches(selector)) register(node);
    node.querySelectorAll && node.querySelectorAll(selector).forEach(register);
  };

  scan(root === document ? document.body || document.documentElement : root);

  let mo = null;
  if (watch && typeof MutationObserver !== "undefined") {
    mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(scan)));
    mo.observe(root === document ? document.documentElement : root, {
      childList: true,
      subtree: true,
    });
  }

  return () => {
    if (ro) ro.disconnect();
    if (mo) mo.disconnect();
  };
}

if (typeof window !== "undefined") {
  window.SquircleCorners = {
    initCorners,
    squirclePath,
    superellipsePath,
    parseShape,
    supportsNative,
  };
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCorners());
  } else {
    initCorners();
  }
}
