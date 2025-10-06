import * as React from "react";

/** Wavo wordmark centered precisely over the form */
export default function Brand({ className = "h-10 mb-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 128"
      role="img"
      aria-label="Wavo"
      className={["block mx-auto", className].join(" ")}  // centers the SVG box
    >
      <title>Wavo</title>
      {/* Center the text inside the SVG */}
      <text
        x="50%"                // horizontal center of the viewBox
        y="92"                 // baseline position
        textAnchor="middle"    // anchor text at its middle (centers glyphs)
        fontSize="96"
        fontWeight="700"
        letterSpacing="6"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        fill="currentColor"
      >
        WAVO
      </text>
    </svg>
  );
}
