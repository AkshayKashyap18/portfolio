"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollStore";
import { GUTTER_FRAG, GUTTER_VERT } from "./gutter.glsl";

/** Width of the reading column, in CSS pixels — must match the layout. */
const CONTENT_PX = 1180;
/** Below this viewport width there is no gutter worth filling. */
const MIN_VIEWPORT = 1200;
/** Points per particle: one head plus its motion trail. */
const GHOSTS = 5;

export default function GutterStreams({ count }: { count: number }) {
  const { size, camera } = useThree();
  const smooth = useRef({ trail: 0, boost: 0, opacity: 0 });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = count * GHOSTS;

    const position = new Float32Array(verts * 3);
    const aGhost = new Float32Array(verts);
    const aSeed = new Float32Array(verts);
    const aTint = new Float32Array(verts);

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      // Bias toward the outer edge so the streams thin out near the text.
      const bandT = Math.pow(Math.random(), 0.65);
      const y = Math.random() * 2 - 1;
      const z = (Math.random() - 0.5) * 3;
      const seed = Math.random();
      const tint = Math.pow(Math.random(), 1.6);

      for (let g = 0; g < GHOSTS; g++) {
        const v = i * GHOSTS + g;
        position[v * 3] = side * bandT;
        position[v * 3 + 1] = y;
        position[v * 3 + 2] = z;
        aGhost[v] = g / (GHOSTS - 1);
        aSeed[v] = seed;
        aTint[v] = tint;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aGhost", new THREE.BufferAttribute(aGhost, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
    geo.setAttribute("aTint", new THREE.BufferAttribute(aTint, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GUTTER_VERT,
        fragmentShader: GUTTER_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uHalfH: { value: 6 },
          uXInner: { value: 8 },
          uXOuter: { value: 10 },
          uTrail: { value: 0 },
          uSpeedBoost: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0 },
          uColorCool: { value: new THREE.Color("#7b5cff") },
          uColorWarm: { value: new THREE.Color("#35e0f0") },
        },
      }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.uniforms;
    const s = smooth.current;
    const dt = Math.min(delta, 0.05);

    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);

    // ── Map the CSS reading column into world units, so the streams always sit
    // exactly beside the text regardless of viewport size.
    const cam = camera as THREE.PerspectiveCamera;
    const visibleHeight = 2 * Math.tan((cam.fov * Math.PI) / 360) * Math.abs(cam.position.z);
    const visibleWidth = visibleHeight * (size.width / size.height);

    u.uHalfH.value = visibleHeight / 2;

    const contentFrac = Math.min(1, CONTENT_PX / size.width);
    u.uXInner.value = (visibleWidth / 2) * contentFrac;
    u.uXOuter.value = (visibleWidth / 2) * 1.05;

    // Fade in only when there's real gutter space to occupy.
    const room = size.width - CONTENT_PX;
    const target = size.width < MIN_VIEWPORT ? 0 : Math.min(room / 480, 1) * 0.9;
    s.opacity = THREE.MathUtils.damp(s.opacity, target, 4, dt);
    u.uOpacity.value = s.opacity;

    // ── Scroll velocity spreads the ghosts into trails and speeds the flow.
    const v = Math.abs(scrollState.velocity);
    s.trail = THREE.MathUtils.damp(s.trail, Math.min(v / 30, 1.5), 7, dt);
    s.boost = THREE.MathUtils.damp(s.boost, Math.min(v / 34, 4.5), 6, dt);
    u.uTrail.value = s.trail;
    u.uSpeedBoost.value = s.boost;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
