export interface InitCornersOptions {
  /** Subtree to scan. Defaults to `document`. */
  root?: ParentNode;
  /** Selector for candidate elements. Defaults to corner-* / .squircle / [data-corner-shape]. */
  selector?: string;
  /** Apply the clip-path even when native `corner-shape` is supported. Default false. */
  force?: boolean;
  /** Observe DOM mutations to shape newly-added elements. Default true. */
  watch?: boolean;
}

export interface CornerRadii {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

/** Parse a `<corner-shape-value>` (keyword or `superellipse(n)`) to the parameter `s`. */
export function parseShape(value: string | null | undefined): number;

/**
 * SwiftUI / Apple continuous-corner outline (Figma smoothing model). `smoothing`
 * is 0..1; iOS uses ≈ 0.6. This is the curve SwiftUI's `.continuous`
 * RoundedRectangle draws — distinct from CSS `superellipse(2)`.
 */
export function squirclePath(
  w: number,
  h: number,
  radii: CornerRadii,
  smoothing: number,
): string;

/** Build an SVG path string outlining a box with superellipse corners. */
export function superellipsePath(
  w: number,
  h: number,
  radii: CornerRadii,
  s: number,
  segments?: number,
): string;

/** True when the browser implements native CSS `corner-shape`. */
export function supportsNative(): boolean;

/**
 * Scan a root for corner-shaped elements and keep their `clip-path` in sync
 * with size changes. No-op when native `corner-shape` is supported unless
 * `force` is set. Returns a cleanup function.
 */
export function initCorners(opts?: InitCornersOptions): () => void;
