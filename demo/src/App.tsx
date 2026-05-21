import React from "react";
import { initCorners } from "../../corners.mjs";

/**
 * ⬇️  EDIT THIS LINE  ⬇️
 *
 * Change the classes and save — the shape updates instantly.
 * The `rounded-*` sets the radius; the corner-* / squircle class sets the SHAPE.
 *
 * Try: squircle · corner-round · corner-scoop · corner-bevel · corner-notch
 *      corner-square · corner-superellipse-3 · corner-smooth-[0.85]
 */
const CLASSNAME = "rounded-[64px] squircle";

const mono =
  'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';
const sans =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function App() {
  React.useEffect(() => initCorners({ force: true }));

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        background: "#09090b",
        color: "#fafafa",
        fontFamily: sans,
        backgroundImage:
          "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.05), transparent 60%)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 32,
          fontFamily: mono,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#52525b",
        }}
      >
        squircle
      </span>

      <div
        key={CLASSNAME}
        className={CLASSNAME}
        style={{
          width: 280,
          height: 280,
          background: "#fafafa",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 40px 80px -20px rgba(0,0,0,0.7)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <code
          style={{
            fontFamily: mono,
            fontSize: 14,
            color: "#e4e4e7",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 9,
            padding: "8px 14px",
          }}
        >
          class="{CLASSNAME}"
        </code>
        <p style={{ margin: 0, fontSize: 13, color: "#52525b" }}>
          edit{" "}
          <code style={{ fontFamily: mono, color: "#71717a" }}>CLASSNAME</code> in{" "}
          <code style={{ fontFamily: mono, color: "#71717a" }}>demo/src/App.tsx</code>
        </p>
      </div>
    </main>
  );
}
