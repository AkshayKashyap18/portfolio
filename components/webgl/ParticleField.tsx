"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { buildFormations } from "@/lib/formations";
import { hasBeats, opacityFromStage, stageFromScroll } from "@/lib/beats";
import { introState } from "@/lib/intro";
import { scrollState } from "@/lib/scrollStore";
import { PARTICLE_FRAG, PARTICLE_VERT } from "./particles.glsl";

const STAGE_COUNT = 6;

/** Dwell at each formation, then travel quickly between them. */
function shapeTransition(t: number): number {
  // Nothing happens in the first/last 22% of a stage — that's the plateau.
  const eased = THREE.MathUtils.smoothstep(t, 0.22, 0.78);
  return eased;
}

export default function ParticleField({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size, camera } = useThree();

  // Smoothed values so nothing snaps when scroll velocity spikes.
  const smooth = useRef({ stageF: 0, pointerX: 0, pointerY: 0, pointerAmt: 0, velocity: 0 });

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
        uVelocity: { value: 0 },
        uDrift: { value: 0.34 },
        uOpacity: { value: 1 },
        uColorCool: { value: new THREE.Color("#7b5cff") },
        uColorWarm: { value: new THREE.Color("#35e0f0") },
        uColorHot: { value: new THREE.Color("#dbe4ff") },
      },
    });
  }, []);

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

    // ── Scroll velocity feeds particle size, so the field "breathes" on scroll.
    s.velocity = THREE.MathUtils.damp(s.velocity, scrollState.velocity, 8, dt);
    u.uVelocity.value = s.velocity;

    // Drift calms down during a morph so the formation stays legible.
    const morphActivity = 1 - Math.abs(u.uMorph.value * 2 - 1);
    u.uDrift.value = THREE.MathUtils.lerp(0.34, 0.1, morphActivity);
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
