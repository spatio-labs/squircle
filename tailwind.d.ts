export interface SquirclePluginOptions {
  /**
   * Superellipse exponent for the `corner-squircle` / `squircle` utilities and
   * the optional global rule. 0 = bevel, 1 = round, 2 = squircle (default),
   * higher = squarer.
   */
  smoothing?: number;
  /**
   * When true, applies `corner-shape` to every element so any `border-radius`
   * (e.g. `rounded-md`) renders as a squircle with no extra class. Safe because
   * `corner-shape` is a no-op on elements without a radius.
   */
  global?: boolean;
}

/**
 * Tailwind CSS plugin that adds superellipse (squircle) corner utilities on top
 * of the native CSS `corner-shape` property. Callable with options.
 */
declare const squirclePlugin: {
  (options?: SquirclePluginOptions): { handler: () => void };
  handler: () => void;
};

export default squirclePlugin;
