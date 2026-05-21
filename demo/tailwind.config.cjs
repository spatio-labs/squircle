/** Tailwind config for the demo. Loads the local plugin from the repo root. */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [
    require("../tailwind.js"),
    // Try global mode instead — every rounded-* becomes a SwiftUI squircle:
    // require("../tailwind.js")({ global: true }),
  ],
};
