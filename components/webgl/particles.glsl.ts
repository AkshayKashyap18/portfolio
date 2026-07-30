import { SIMPLEX_3D } from "./noise.glsl";

/**
 * Six formations live on the GPU simultaneously as attributes. The CPU sends
 * two one-hot weight vectors (uWA / uWB) plus a morph factor, so the shader can
 * blend between ANY two formations without re-uploading buffers.
 *
 * The morph is staggered per particle from a hashed seed, so the field arrives
 * like a swarm settling rather than a single rigid snap.
 */
export const PARTICLE_VERT = /* glsl */ `
precision highp float;

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute float aSeed;
attribute float aScale;
attribute float aTint;

uniform float uWA[6];
uniform float uWB[6];
uniform float uMorph;
uniform float uStagger;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform vec2  uPointer;
uniform float uPointerActive;
uniform float uPointerForce;   // signed: + repels, − attracts
uniform float uPointerRadius;
uniform float uVelocity;
uniform float uDrift;

varying float vHeat;
varying float vTravel;
varying float vDepth;
varying float vTint;
varying float vSparkle;

${SIMPLEX_3D}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

vec3 blend(float w[6]) {
  return position * w[0]
       + aP1 * w[1]
       + aP2 * w[2]
       + aP3 * w[3]
       + aP4 * w[4]
       + aP5 * w[5];
}

void main() {
  vec3 from = blend(uWA);
  vec3 to   = blend(uWB);

  // ── Per-particle stagger: each particle starts its journey at its own moment.
  float delay = fract(aSeed * 13.137) * uStagger;
  float span  = max(1.0 - uStagger, 0.0001);
  float local = easeInOutCubic(clamp((uMorph - delay) / span, 0.0, 1.0));

  vec3 pos = mix(from, to, local);

  // Particles bow outward mid-flight so paths arc instead of running straight.
  float arc = sin(local * 3.14159265);
  vec3 arcDir = normalize(pos + vec3(0.001));
  pos += arcDir * arc * 0.45 * (0.35 + fract(aSeed * 91.7));

  // ── Ambient curl drift — never lets the field look frozen.
  vec3 flow = curlNoise(pos * 0.24 + vec3(0.0, 0.0, uTime * 0.045));
  pos += flow * uDrift * (0.55 + fract(aSeed * 41.3) * 0.75);

  // Slow global rotation for parallax.
  float ang = uTime * 0.028;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  pos.xz = rot * pos.xz;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // ── Cursor force, applied in view space so it tracks the screen.
  //
  // uPointerForce is signed: positive repels (the resting state), negative pulls
  // the field into a well while the pointer is held down, and it spikes hard
  // positive for a moment on release to throw a shockwave outward.
  vec2 toPointer = mv.xy - uPointer;
  float pd = length(toPointer);
  float influence = uPointerActive * smoothstep(uPointerRadius, 0.0, pd);
  mv.xy += normalize(toPointer + vec2(0.0001)) * influence * uPointerForce;

  // Heat tracks force magnitude, so a collapse and a burst both flare white.
  float heat = influence * clamp(abs(uPointerForce) * 0.5, 0.0, 1.6);

  gl_Position = projectionMatrix * mv;

  // ── Size: perspective attenuation, plus a flare while travelling.
  float travel = length(to - from) * (1.0 - abs(local * 2.0 - 1.0));
  float sizeBoost = 1.0 + travel * 0.09 + heat * 1.4 + abs(uVelocity) * 0.0012;

  gl_PointSize = uSize * aScale * uPixelRatio * sizeBoost * (1.0 / max(-mv.z, 0.001));

  vHeat = heat;
  vTravel = clamp(travel * 0.22, 0.0, 1.0);
  vDepth = clamp((-mv.z - 3.0) / 12.0, 0.0, 1.0);
  vTint = aTint;

  // A rare few twinkle on their own cycle, so the field never looks like a flat
  // sheet of identical dots. Kept scarce — 2% of particles, not a glitter wall.
  vSparkle = pow(max(sin(uTime * 1.6 + aSeed * 62.8), 0.0), 18.0)
             * step(0.98, fract(aSeed * 7.77));
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColorCool;
uniform vec3 uColorWarm;
uniform vec3 uColorHot;
uniform float uOpacity;

varying float vHeat;
varying float vTravel;
varying float vDepth;
varying float vTint;
varying float vSparkle;

void main() {
  // Soft round sprite: wide falloff plus a tight core. Cheaper and crisper
  // than sampling a texture, and it survives being 2px on a phone.
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  // Core-dominant falloff. A tight bright centre with a thin halo reads as a
  // rendered point; a wide soft blob reads as stock bokeh.
  float halo = smoothstep(0.5, 0.0, d);
  float core = pow(halo, 6.0);
  float body = halo * 0.2 + core * 1.0;

  // Base colour varies per particle across the violet→cyan ramp, so the field
  // reads as a spectrum instead of one flat blue.
  vec3 col = mix(uColorCool, uColorWarm, pow(vTint, 1.4));

  // Travelling particles heat up; the cursor blows them out toward white.
  col = mix(col, uColorHot, vTravel * 0.5);
  col = mix(col, uColorHot, vHeat * 0.9);
  col += uColorHot * vSparkle * 0.9;

  // Depth fade keeps the far side of the field from muddying the near side.
  float alpha = body * uOpacity * mix(1.0, 0.3, vDepth);
  alpha += core * vSparkle * 0.5;

  gl_FragColor = vec4(col, alpha);
}
`;
