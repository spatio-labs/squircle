import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The demo imports the library straight from ../src so it exercises the real
// component source (including the new borderWidth/borderColor code), not a build.
export default defineConfig({
  plugins: [react()],
  // The library ships both compiled .js (CommonJS) and .ts/.tsx source side by
  // side. Prefer the TypeScript source so the demo runs the real component code
  // (with proper ESM named exports) rather than the CommonJS build.
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  server: {
    port: 5174,
    open: false,
    // The library source lives one level up (../src), outside this demo dir.
    fs: { allow: [".."] },
  },
});
