/**
 * Carries the Lab's neural network weights to the particle shader.
 *
 * Same pattern as `scrollStore` — a module-level object mutated in place, read
 * once per frame inside useFrame. Weights change hundreds of times a second
 * while training, so this must never touch React state.
 */

import { NET_PARAM_SLOTS } from "./mlp";

export const netBridge = {
  /** Packed parameters, layout defined by NET_LAYOUT in ./mlp. */
  params: new Float32Array(NET_PARAM_SLOTS),
  /** Hidden layer count — 2 or 3. Selects which output the shader reads. */
  depth: 2,
  /** True once a network has published at least one snapshot. */
  ready: false,
  /**
   * True while the Lab is actually on screen and training. The trainer's rAF
   * keeps drawing after its IntersectionObserver stops training, so this cannot
   * be inferred from the loop still running.
   */
  live: false,
  /** Bumped on every publish, so consumers can detect staleness cheaply. */
  revision: 0,
};

export function publishNet(params: Float32Array, depth: number, live: boolean): void {
  netBridge.params.set(params);
  netBridge.depth = depth;
  netBridge.live = live;
  netBridge.ready = true;
  netBridge.revision++;
}

export function setNetLive(live: boolean): void {
  netBridge.live = live;
}
