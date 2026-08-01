"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { HalfFloatType } from "three";
import type { Tier } from "@/lib/deviceTier";

/**
 * Bloom, applied to the particle field.
 *
 * The field already draws additively with hot white cores, sparkles and a
 * blown-out decision-boundary ridge — all sitting above 1.0 in places. Bloom is
 * *selective by luminance*: only those bright pixels cross the threshold and
 * bleed light, so the body of the field stays crisp instead of smearing into
 * fog. That's the whole point of thresholding rather than blurring everything.
 *
 * Cost control:
 *  - Reserved for `high` / `mid` tiers. `low` (and phones, which never rate
 *    above `low`/`mid`) skip the pass entirely — it's the biggest fill-rate
 *    lever after the field itself.
 *  - `mipmapBlur` does the blur in mip levels, far cheaper than a wide kernel.
 *
 * Transparency: the canvas is created with `alpha: true` and a clear alpha of 0
 * (see Scene), and the composer runs on a HalfFloat RGBA target, so the CSS
 * gradient behind the canvas still shows through the gaps between particles.
 */
export default function Effects({ tier }: { tier: Tier }) {
  if (tier === "low" || tier === "off") return null;

  const high = tier === "high";

  return (
    <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.62}
        luminanceSmoothing={0.22}
        intensity={high ? 0.85 : 0.6}
        radius={high ? 0.72 : 0.62}
      />
    </EffectComposer>
  );
}
