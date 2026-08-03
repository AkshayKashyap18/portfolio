"use client";

/**
 * The only client JavaScript on this route.
 *
 * Ctrl/Cmd-P already works, but a visible affordance means nobody has to guess
 * that this page is meant to become a PDF. Hidden in print via .cv-toolbar.
 */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
