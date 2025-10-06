
import * as React from "react";

/** Minimal Wavo wordmark. Inherits current text color. */
export default function Brand({
  className = "h-10",
}: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 128"
      role="img"
      aria-label="Wavo"
      className={className}
    >
      <title>Wavo</title>
      <text
        x="0"
        y="96"
        fontSize="96"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
        fill="currentColor"
        letterSpacing="4"
      >
        WAVO
      </text>
    </svg>
  );
}
