"use client";

import { useEffect } from "react";
import { watchForSecret } from "@/lib/secret";

/**
 * Listens for the hidden trigger word. Renders nothing and shows nothing —
 * the only feedback is the particle field forming the word.
 */
export default function SecretKeys() {
  useEffect(() => watchForSecret(), []);
  return null;
}
