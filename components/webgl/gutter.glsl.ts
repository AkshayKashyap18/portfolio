/**
 * Gutter streams — the nebula continuing past the edges of the reading column.
 *
 * Each particle is drawn as several points ("ghosts") offset along its direction
 * of travel with decreasing size and alpha. At rest the ghosts sit on top of one
 * another and read as a single glowing dot; as scroll velocity grows they spread
 * apart into a motion trail.
 *
 * Points rather than LineSegments deliberately: WebGL clamps line width to 1px
 * on most drivers and ignores gl_PointSize for line primitives, so a
 * line-segment trail renders as an invisible hairline. Points also let these
 * reuse the exact soft round sprite the main particle field uses, which is what
 * keeps the two layers looking like one system.
 *
 * `position` is packed rather than literal:
 *   x = side * bandT   (sign picks the gutter, |x| is 0–1 across its width)
 *   y = normalised height, -1 … 1
 *   z = depth offset
 */
export const GUTTER_VERT = /* glsl */ `
precision highp float;

attribute float aGhost;  // 0 = head … 1 = furthest tail
attribute float aSeed;
attribute float aTint;

uniform float uTime;
uniform float uHalfH;
uniform float uXInner;
uniform float uXOuter;
uniform float uTrail;
uniform float uSpeedBoost;
uniform float uSize;
uniform float uPixelRatio;

varying float vFade;
varying float vTint;

void main() {
  float side = sign(position.x);
  float bandT = abs(position.x);

  // Ease the band so particles crowd the outer edge and thin toward the text.
  float eased = pow(bandT, 0.7);
  float x = side * mix(uXInner, uXOuter, eased);

  float speed = (0.34 + fract(aSeed * 17.3) * 0.6) * (1.0 + uSpeedBoost);

  float span = uHalfH * 2.0;
  float y = mod(position.y * uHalfH + uTime * speed + aSeed * span, span) - uHalfH;

  // Lateral wander so the streams breathe instead of running dead straight.
  float wander = sin(uTime * 0.45 + aSeed * 31.4 + y * 0.32) * 0.2;

  vec3 pos = vec3(x + wander, y, position.z);

  // Ghosts trail behind the direction of travel, which is upward.
  pos.y -= aGhost * uTrail * (0.55 + fract(aSeed * 7.1) * 0.9);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float sizeFalloff = 1.0 - aGhost * 0.55;
  gl_PointSize = uSize * sizeFalloff * uPixelRatio * (1.0 / max(-mv.z, 0.001));

  vFade = (1.0 - aGhost * 0.82) * (0.55 + fract(aSeed * 3.7) * 0.45);
  vTint = aTint;
}
`;

export const GUTTER_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColorCool;
uniform vec3 uColorWarm;
uniform float uOpacity;

varying float vFade;
varying float vTint;

void main() {
  // Same core-dominant sprite as the main field, so the layers match.
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float halo = smoothstep(0.5, 0.0, d);
  float core = pow(halo, 5.0);
  float body = halo * 0.18 + core * 1.0;

  vec3 col = mix(uColorCool, uColorWarm, pow(vTint, 1.3));
  gl_FragColor = vec4(col, body * vFade * uOpacity);
}
`;
