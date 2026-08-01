"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildFormations, textFormation } from "@/lib/formations";
import { NET_PARAM_SLOTS, NET_VEC4_COUNT } from "@/lib/mlp";
import type { Tier } from "@/lib/deviceTier";
import { netBridge } from "@/lib/netBridge";
import { onSecret, secretDisplay, secretState } from "@/lib/secret";
import { hasBeats, opacityFromStage, stageFromScroll } from "@/lib/beats";
import { introState } from "@/lib/intro";
import { scrollState } from "@/lib/scrollStore";
import { PARTICLE_FRAG, PARTICLE_VERT } from "./particles.glsl";

const STAGE_COUNT = 6;

/** Resting cursor behaviour: a gentle push away from the pointer. */
const REST_FORCE = 0.85;
const REST_RADIUS = 2.6;
/** How long the release shockwave lasts. */
const BURST_MS = 430;
/** Life of the click ripple ring, in seconds — must match uRippleT's decay. */
const RIPPLE_LIFE = 1.15;

/** Dwell at each formation, then travel quickly between them. */
function shapeTransition(t: number): number {
  // Nothing happens in the first/last 22% of a stage — that's the plateau.
  const eased = THREE.MathUtils.smoothstep(t, 0.22, 0.78);
  return eased;
}

export default function ParticleField({ count, tier }: { count: number; tier: Tier }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size, camera } = useThree();

  // Smoothed values so nothing snaps when scroll velocity spikes.
  const smooth = useRef({ stageF: 0, pointerX: 0, pointerY: 0, pointerAmt: 0, velocity: 0 });
  const secretMorph = useRef(0);
  // Smoothed copy of the Lab's weights, so architecture and dataset changes
  // morph the surface instead of teleporting it.
  const netSmooth = useRef<Float32Array>(new Float32Array(NET_PARAM_SLOTS));
  const netDepthSmooth = useRef(2);
  const netPrimed = useRef(false);

  const geometry = useMemo(() => {
    const formations = buildFormations(count);
    const geo = new THREE.BufferGeometry();

    // Formation 0 occupies the mandatory `position` attribute.
    geo.setAttribute("position", new THREE.BufferAttribute(formations[0], 3));
    for (let i = 1; i < STAGE_COUNT; i++) {
      geo.setAttribute(`aP${i}`, new THREE.BufferAttribute(formations[i], 3));
    }

    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    const tints = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random();
      // Long tail of sizes — a few bright particles carry the composition.
      scales[i] = 0.75 + Math.pow(Math.random(), 2.4) * 2.2;
      // Skewed toward violet, with a cyan minority for contrast.
      tints[i] = Math.pow(Math.random(), 1.7);
    }
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

    // Generous bounds — the shader displaces well past the base positions.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

    return geo;
  }, [count]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uWA: { value: [1, 0, 0, 0, 0, 0] },
        uWB: { value: [0, 1, 0, 0, 0, 0] },
        uMorph: { value: 0 },
        uStagger: { value: 0.42 },
        uTime: { value: 0 },
        uSize: { value: 25 },
        uPixelRatio: { value: 1 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uPointerActive: { value: 0 },
        uPointerForce: { value: 0.85 },
        uPointerRadius: { value: 2.6 },
        uVelocity: { value: 0 },
        uDrift: { value: 0.34 },
        uRipple: { value: new THREE.Vector2(0, 0) },
        uRippleT: { value: -1 },
        uOpacity: { value: 1 },
        uColorCool: { value: new THREE.Color("#7b5cff") },
        uColorWarm: { value: new THREE.Color("#35e0f0") },
        uColorHot: { value: new THREE.Color("#dbe4ff") },
        // The Lab's network, evaluated per particle. See lib/netBridge.
        uNet: {
          value: Array.from({ length: NET_VEC4_COUNT }, () => new THREE.Vector4()),
        },
        uNetMix: { value: 0 },
        uNetDepth: { value: 2 },
        uNetScale: { value: new THREE.Vector2(1, 1) },
      },
    });
  }, []);

  /**
   * Easter egg buffer swap. The "initials" slot (aP1) is rewritten with the
   * hidden word while active and restored to the initials afterwards, so the egg
   * costs nothing at rest — no extra attribute, no extra draw call.
   */
  useEffect(() => {
    const attr = geometry.getAttribute("aP1") as THREE.BufferAttribute | undefined;
    if (!attr) return;

    const restore = attr.array.slice() as Float32Array;

    const swap = () => {
      // Narrower than the frustum so it never clips, and lifted above the hero
      // headline so the two don't sit on top of each other.
      const src = secretState.active
        ? textFormation(count, secretDisplay(), 9.4, 1.7)
        : restore;
      (attr.array as Float32Array).set(src);
      attr.needsUpdate = true;
    };

    return onSecret(swap);
  }, [geometry, count]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const s = smooth.current;
    const dt = Math.min(delta, 0.05);

    u.uTime.value = state.clock.elapsedTime;

    // ── Scroll → stage, keyed off real section geometry so each formation
    // resolves exactly when its section is centred. Damped so a flung scroll
    // doesn't tear the field apart.
    const targetStageF = hasBeats()
      ? stageFromScroll(scrollState.y, size.height)
      : scrollState.progress * (STAGE_COUNT - 1);
    s.stageF = THREE.MathUtils.damp(s.stageF, targetStageF, 6, dt);

    // Field steps back behind text-heavy beats.
    u.uOpacity.value = THREE.MathUtils.damp(
      u.uOpacity.value as number,
      opacityFromStage(s.stageF),
      5,
      dt,
    );

    const wa = u.uWA.value as number[];
    const wb = u.uWB.value as number[];

    // ── Easter egg: hold the text formation while it's active, whatever the
    // scroll position says. The buffer swap happens in the effect below.
    if (secretState.active && !introState.active) {
      for (let i = 0; i < STAGE_COUNT; i++) {
        wa[i] = i === 0 ? 1 : 0;
        wb[i] = i === 1 ? 1 : 0;
      }
      secretMorph.current = THREE.MathUtils.damp(secretMorph.current, 1, 3.2, dt);
      u.uMorph.value = secretMorph.current;
      u.uStagger.value = 0.5;
      u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value as number, 1, 4, dt);
      u.uDrift.value = 0.07;
      return;
    }
    secretMorph.current = 0;

    if (introState.active || introState.t < 1) {
      // Intro: bloom out of the singularity into the opening nebula. Wide
      // stagger so particles stream outward instead of arriving together.
      for (let i = 0; i < STAGE_COUNT; i++) {
        wa[i] = i === 5 ? 1 : 0;
        wb[i] = i === 0 ? 1 : 0;
      }
      u.uMorph.value = introState.t;
      u.uStagger.value = 0.62;
      u.uOpacity.value = introState.t;
      // Keep the scroll stage pinned at the start so the handoff is seamless.
      s.stageF = 0;
    } else {
      const stageA = Math.min(Math.floor(s.stageF), STAGE_COUNT - 2);
      const stageB = stageA + 1;
      const raw = s.stageF - stageA;

      for (let i = 0; i < STAGE_COUNT; i++) {
        wa[i] = i === stageA ? 1 : 0;
        wb[i] = i === stageB ? 1 : 0;
      }
      u.uMorph.value = shapeTransition(raw);
      u.uStagger.value = 0.42;
    }

    // ── Pointer → view-space units at the z=0 plane.
    const cam = camera as THREE.PerspectiveCamera;
    const visibleHeight = 2 * Math.tan((cam.fov * Math.PI) / 360) * Math.abs(cam.position.z);
    const visibleWidth = visibleHeight * (size.width / size.height);

    s.pointerX = THREE.MathUtils.damp(s.pointerX, scrollState.pointerX, 9, dt);
    s.pointerY = THREE.MathUtils.damp(s.pointerY, scrollState.pointerY, 9, dt);
    s.pointerAmt = THREE.MathUtils.damp(
      s.pointerAmt,
      scrollState.pointerActive ? 1 : 0,
      5,
      dt,
    );

    (u.uPointer.value as THREE.Vector2).set(
      (s.pointerX * visibleWidth) / 2,
      (s.pointerY * visibleHeight) / 2,
    );
    u.uPointerActive.value = s.pointerAmt;

    // ── Gravity well. Holding the pointer inverts the cursor force so the field
    // collapses inward; releasing spikes it positive for a moment, throwing a
    // shockwave out before it settles back to the gentle resting repulsion.
    const sinceRelease = performance.now() - scrollState.pointerReleasedAt;
    const bursting = sinceRelease < BURST_MS;

    let targetForce = REST_FORCE;
    let targetRadius = REST_RADIUS;
    if (scrollState.pointerDown) {
      targetForce = -3.1;
      targetRadius = 8.5;
    } else if (bursting) {
      targetForce = 7.5;
      targetRadius = 9.5;
    }

    // Collapse eases in; the burst needs to hit fast, so it damps harder.
    u.uPointerForce.value = THREE.MathUtils.damp(
      u.uPointerForce.value as number,
      targetForce,
      scrollState.pointerDown ? 4.5 : 11,
      dt,
    );
    u.uPointerRadius.value = THREE.MathUtils.damp(
      u.uPointerRadius.value as number,
      targetRadius,
      6,
      dt,
    );

    // ── Click shockwave. A single ripple ring rides outward from the click
    // point; the shader reads the elapsed time and expands the front. The
    // origin is frozen at the click location (not the smoothed pointer), mapped
    // into the same view-space units the pointer uses.
    const rippleElapsed = (performance.now() - scrollState.rippleAt) / 1000;
    if (rippleElapsed >= 0 && rippleElapsed <= RIPPLE_LIFE) {
      (u.uRipple.value as THREE.Vector2).set(
        (scrollState.rippleX * visibleWidth) / 2,
        (scrollState.rippleY * visibleHeight) / 2,
      );
      u.uRippleT.value = rippleElapsed;
    } else {
      u.uRippleT.value = -1;
    }

    // ── Scroll velocity feeds particle size, so the field "breathes" on scroll.
    s.velocity = THREE.MathUtils.damp(s.velocity, scrollState.velocity, 8, dt);
    u.uVelocity.value = s.velocity;

    // ── The Lab's network drives the field around beat 04 (the Playground).
    //
    // Ramped rather than switched, so the field eases into being a decision
    // surface and back out again. Held at zero on the low tier: the per-particle
    // forward pass is ~150 multiply-adds and weak GPUs should not pay it.
    const netTarget =
      netBridge.ready && tier !== "low"
        ? THREE.MathUtils.smoothstep(s.stageF, 3.45, 4.0) *
          (1 - THREE.MathUtils.smoothstep(s.stageF, 4.6, 5.0))
        : 0;
    u.uNetMix.value = THREE.MathUtils.damp(u.uNetMix.value as number, netTarget, 4, dt);

    if ((u.uNetMix.value as number) > 0.001) {
      // Map world units onto the network's [-1, 1] training domain, using the
      // visible plane so class regions are regions of the screen.
      (u.uNetScale.value as THREE.Vector2).set(
        1 / (visibleWidth / 2),
        1 / (visibleHeight / 2),
      );

      /*
        Follow the published weights smoothly rather than copying them.

        Changing dataset or architecture discards the network and publishes fresh
        random weights in one frame. Copying those straight in teleports all
        42,000 particles from a trained boundary to a random one instantly — and
        because prediction also drives depth, they physically pop. Easing through
        weight space turns that snap into a ~0.4s morph.

        First activation still snaps: interpolating up from an all-zero buffer
        would put the network at p = 0.5 everywhere, lighting the entire screen
        as one enormous boundary ridge on the way in.
      */
      const target = netBridge.params;
      const held = netSmooth.current;

      if (!netPrimed.current) {
        held.set(target);
        netDepthSmooth.current = netBridge.depth;
        netPrimed.current = true;
      } else {
        // Frame-rate independent exponential approach.
        const k = 1 - Math.exp(-7 * dt);
        for (let i = 0; i < held.length; i++) {
          held[i] += (target[i] - held[i]) * k;
        }
        netDepthSmooth.current +=
          (netBridge.depth - netDepthSmooth.current) * (1 - Math.exp(-5 * dt));
      }

      u.uNetDepth.value = netDepthSmooth.current;

      // Repack the smoothed parameters into the vec4 uniform block.
      const vecs = u.uNet.value as THREE.Vector4[];
      for (let i = 0; i < vecs.length; i++) {
        const o = i * 4;
        vecs[i].set(held[o] ?? 0, held[o + 1] ?? 0, held[o + 2] ?? 0, held[o + 3] ?? 0);
      }
    } else {
      // Re-prime on the way back in, so returning to the Lab snaps rather than
      // easing up from stale weights.
      netPrimed.current = false;
    }

    // Drift calms down during a morph so the formation stays legible.
    const morphActivity = 1 - Math.abs(u.uMorph.value * 2 - 1);
    u.uDrift.value = THREE.MathUtils.lerp(0.34, 0.1, morphActivity);
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
