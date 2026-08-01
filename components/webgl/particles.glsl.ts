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

uniform vec2  uRipple;         // view-space origin of the click shockwave
uniform float uRippleT;        // seconds since the click; < 0 when inactive

uniform vec4  uNet[45];        // packed MLP parameters, see lib/mlp NET_LAYOUT
uniform float uNetMix;        // 0 = ignore the network, 1 = fully driven by it
uniform float uNetDepth;      // hidden layer count: 0 (linear), 1, 2 or 3
uniform vec2  uNetScale;      // world → the net's [-1,1] input domain

varying float vHeat;
varying float vTravel;
varying float vDepth;
varying float vTint;
varying float vSparkle;
varying float vNet;           // this particle's prediction, 0..1
varying float vNetMix;
varying float vRidge;         // proximity to the decision boundary
varying float vRipple;        // strength of the click shockwave on this particle

${SIMPLEX_3D}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

/* ── The network, evaluated per particle ──────────────────────────────────
   Same parameters the Lab is training, read straight out of a uniform block.
   Layout mirrors NET_LAYOUT in lib/mlp.ts and must not drift from it.

   tanh is hand-rolled rather than built in: it only exists from GLSL ES 3.00,
   and this material must survive compiling as 1.00 on a WebGL1 fallback. All
   loop bounds are constant so the uniform indexing stays a constant-index
   expression, which 1.00 also requires.
   ───────────────────────────────────────────────────────────────────────── */
float netAt(int i) {
  return uNet[i / 4][i - (i / 4) * 4];
}

float tanhSafe(float x) {
  float e = exp(-2.0 * clamp(x, -8.0, 8.0));
  return (1.0 - e) / (1.0 + e);
}

float netEval(vec2 p) {
  float h1[8];
  for (int j = 0; j < 8; j++) {
    float z = netAt(16 + j);
    z += netAt(j * 2 + 0) * p.x;
    z += netAt(j * 2 + 1) * p.y;
    h1[j] = tanhSafe(z);
  }

  float h2[8];
  for (int j = 0; j < 8; j++) {
    float z = netAt(88 + j);
    for (int i = 0; i < 8; i++) z += netAt(24 + j * 8 + i) * h1[i];
    h2[j] = tanhSafe(z);
  }

  // Third hidden layer is zero-filled when the net is only two deep, so this
  // evaluates to tanh(0) = 0 and contributes nothing.
  float h3[8];
  for (int j = 0; j < 8; j++) {
    float z = netAt(160 + j);
    for (int i = 0; i < 8; i++) z += netAt(96 + j * 8 + i) * h2[i];
    h3[j] = tanhSafe(z);
  }

  // The output layer always sits in the final slot, so evaluate it against each
  // possible last hidden layer and select with mixes rather than branches.
  float bias = netAt(176);
  float o1 = bias;
  float o2 = bias;
  float o3 = bias;
  for (int i = 0; i < 8; i++) {
    float w = netAt(168 + i);
    o1 += w * h1[i];
    o2 += w * h2[i];
    o3 += w * h3[i];
  }

  // With no hidden layer the output reads the inputs directly — a linear model,
  // which provably cannot separate XOR. That failure is the point.
  float o0 = bias + netAt(168) * p.x + netAt(169) * p.y;

  // smoothstep rather than step: uNetDepth is eased on the CPU, so this lets one
  // architecture crossfade into the next instead of switching on a threshold.
  float z = mix(
    mix(
      mix(o0, o1, smoothstep(0.0, 1.0, uNetDepth)),
      o2,
      smoothstep(1.0, 2.0, uNetDepth)
    ),
    o3,
    smoothstep(2.0, 3.0, uNetDepth)
  );
  return 1.0 / (1.0 + exp(-clamp(z, -12.0, 12.0)));
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

  // Slow global rotation for parallax — EXCEPT on formation 1. The "AK"
  // wordmark and the typed-word easter egg both live in that slot, and text
  // that slowly turns reads as a spinning sign rather than a name. Fade the
  // rotation out by how much of formation 1 is currently on screen, so it stops
  // dead on the letters and eases back in as you scroll away. textWeight is
  // the already-smoothed morph weight, so there's no pop.
  float textWeight = uWA[1] * (1.0 - uMorph) + uWB[1] * uMorph;
  float ang = uTime * 0.028 * (1.0 - textWeight);
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  pos.xz = rot * pos.xz;

  // ── The field becomes the network's decision surface.
  //
  // Evaluated on the SCREEN plane (x, y) rather than as a heightfield in y:
  // the camera sits on the z axis at y = 0, so a heightfield would be viewed
  // edge-on and read as a line rather than a surface.
  float pr = 0.5;
  float ridge = 0.0;
  if (uNetMix > 0.001) {
    pr = netEval(pos.xy * uNetScale);
    // A narrow band around p = 0.5 — the boundary itself.
    ridge = 1.0 - smoothstep(0.0, 0.035, abs(pr - 0.5));
    // Gentle relief so the two classes separate in depth as well as colour.
    pos.z += (pr - 0.5) * 1.3 * uNetMix;
  }

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

  // ── Click shockwave. A ring expands from the click point at a constant
  // speed; particles the front is passing over get shoved radially outward and
  // flared white, so a single click sends a visible pulse rippling across the
  // whole field — separate from the press-and-hold gravity well.
  float ripple = 0.0;
  if (uRippleT >= 0.0) {
    vec2  toR   = mv.xy - uRipple;
    float rd    = length(toR);
    float front = uRippleT * 10.5;          // view-units/sec the ring travels
    // A soft gaussian shell around the expanding wavefront.
    float shell = exp(-pow((rd - front) / 1.35, 2.0));
    // Rises in a couple of frames, decays over the ripple's ~1.1s life.
    float env   = smoothstep(0.0, 0.05, uRippleT) * (1.0 - smoothstep(0.0, 1.1, uRippleT));
    ripple = shell * env;
    vec2 rDir = normalize(toR + vec2(0.0001));
    mv.xy += rDir * ripple * 1.7;
  }

  gl_Position = projectionMatrix * mv;

  // ── Size: perspective attenuation, plus a flare while travelling.
  float travel = length(to - from) * (1.0 - abs(local * 2.0 - 1.0));
  // Boundary particles grow, but capped — this is the only hard line in an
  // otherwise soft field, and it crosses the most text-heavy beat on the page.
  float sizeBoost = 1.0 + travel * 0.09 + heat * 1.4 + abs(uVelocity) * 0.0012
                  + min(ridge * uNetMix * 1.6, 1.6)
                  + min(ripple * 1.5, 1.5);

  gl_PointSize = uSize * aScale * uPixelRatio * sizeBoost * (1.0 / max(-mv.z, 0.001));

  vHeat = heat;
  vTravel = clamp(travel * 0.22, 0.0, 1.0);
  vDepth = clamp((-mv.z - 3.0) / 12.0, 0.0, 1.0);
  vTint = aTint;

  // A rare few twinkle on their own cycle, so the field never looks like a flat
  // sheet of identical dots. Kept scarce — 2% of particles, not a glitter wall.
  vSparkle = pow(max(sin(uTime * 1.6 + aSeed * 62.8), 0.0), 18.0)
             * step(0.98, fract(aSeed * 7.77));

  vNet = pr;
  vNetMix = uNetMix;
  vRidge = ridge;
  vRipple = ripple;
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
varying float vNet;
varying float vNetMix;
varying float vRidge;
varying float vRipple;

void main() {
  // Soft round sprite: wide falloff plus a tight core. Cheaper and crisper
  // than sampling a texture, and it survives being 2px on a phone.
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  // Core-dominant falloff. A tight bright centre with a thin halo reads as a
  // rendered point; a wide soft blob reads as stock bokeh.
  float halo = smoothstep(0.5, 0.0, d);
  float core = pow(halo, 6.0);
  // A touch more body and a brighter core — the field was reading dim.
  float body = halo * 0.28 + core * 1.08;

  // Base colour varies per particle across the violet→cyan ramp, so the field
  // reads as a spectrum instead of one flat blue.
  vec3 col = mix(uColorCool, uColorWarm, pow(vTint, 1.4));

  // Sharpen the palette. The additive field over a warm-dark ground was landing
  // muted; lift saturation and midtones so the violet→cyan reads vivid and
  // crisp rather than gloomy. Bloom then only sharpens the highlights further.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, 1.28);   // +28% saturation
  col = pow(col, vec3(0.88));        // lift midtones toward brighter

  // Where the network is driving, colour by its prediction instead: the two
  // classes become two territories, with the boundary blown out toward white.
  if (vNetMix > 0.001) {
    vec3 netCol = mix(uColorCool, uColorWarm, smoothstep(0.12, 0.88, vNet));
    col = mix(col, netCol, vNetMix);
    col = mix(col, uColorHot, min(vRidge * vNetMix * 0.75, 0.75));
  }

  // Click ripple: a vivid violet leading ring, blowing out to a white crest at
  // the very peak of the wavefront. vRipple*vRipple keeps the shoulders violet.
  col = mix(col, uColorCool * 1.7, min(vRipple * 0.75, 0.75));
  col = mix(col, uColorHot, min(vRipple * vRipple * 0.9, 0.9));

  // Travelling particles heat up; the cursor blows them out toward white.
  col = mix(col, uColorHot, vTravel * 0.5);
  col = mix(col, uColorHot, vHeat * 0.9);
  col += uColorHot * vSparkle * 0.9;

  // Depth fade keeps the far side of the field from muddying the near side —
  // but eased off, so the back of the field stays livelier than before.
  float alpha = body * uOpacity * mix(1.0, 0.5, vDepth);
  alpha += core * vSparkle * 0.5;

  gl_FragColor = vec4(col, alpha);
}
`;
