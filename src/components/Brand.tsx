
// src/components/Brand.tsx
import * as React from "react";

/**
 * Wavo wordmark in pure SVG (inherits currentColor).
 * Usage: <Brand className="h-8 text-foreground" />
 */
export default function Brand({
  className = "h-8",
  title = "Wavo",
}: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
    >
      <title>{title}</title>
      <path
        d="M10 32 L2 8 h6 l4 14 4-14h6l-8 24h-4Zm40 0L42 8h6l4 14 4-14h6l-8 24h-4Zm44-24h-6l-8 24h6l5-16 5 16h6l-8-24Zm28 0c6 0 10 4.2 10 12s-4 12-10 12-10-4.2-10-12 4-12 10-12Zm0 6c-2.7 0-4 2.6-4 6s1.3 6 4 6 4-2.6 4-6-1.3-6-4-6Z"
        fill="currentColor"
      />
    </svg>
  );
}
