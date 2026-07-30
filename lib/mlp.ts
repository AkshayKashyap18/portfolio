/**
 * A small multi-layer perceptron with backpropagation, written from scratch.
 *
 * No library, no API, no pre-trained weights — this is the actual algorithm:
 * forward pass, binary cross-entropy loss, analytic gradients, gradient descent.
 * It runs in the browser fast enough to watch a decision boundary form live.
 *
 * Architecture: 2 inputs → N tanh hidden layers → 1 sigmoid output.
 */

export type Point = { x: number; y: number; label: 0 | 1 };

/* ── GPU-shared parameter layout ───────────────────────────
   The vertex shader evaluates this same network per particle, so both sides
   must agree byte for byte. Maximum shape is 2 → 8 → 8 → 8 → 1.
   ───────────────────────────────────────────────────────── */

export const NET_MAX_UNITS = 8;

export const NET_LAYOUT = {
  /** Weight block offsets for the three possible hidden layers. */
  hiddenW: [0, 24, 96] as const,
  /** Bias block offsets for those layers. */
  hiddenB: [16, 88, 160] as const,
  /** Output layer weights (8) and bias (1). */
  outW: 168,
  outB: 176,
} as const;

/** 16+8 + 64+8 + 64+8 + 8+1 = 177 floats. */
export const NET_PARAM_SLOTS = 177;
/** Uploaded as vec4s to stay clear of per-element uniform slot limits. */
export const NET_VEC4_COUNT = Math.ceil(NET_PARAM_SLOTS / 4); // 45

/** Deterministic PRNG so a given seed always initialises the same network. */
function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Standard normal via Box–Muller, for weight initialisation. */
function gaussian(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const EPS = 1e-7;

export class MLP {
  readonly sizes: number[];
  /** weights[l][j][i] — layer l, neuron j, input i */
  private weights: number[][][] = [];
  private biases: number[][] = [];

  constructor(sizes: number[], seed = 1) {
    this.sizes = sizes;
    const rand = makeRng(seed);

    for (let l = 1; l < sizes.length; l++) {
      const fanIn = sizes[l - 1];
      // He initialisation — keeps activations from collapsing in deeper stacks.
      const scale = Math.sqrt(2 / fanIn);
      const layerW: number[][] = [];
      const layerB: number[] = [];

      for (let j = 0; j < sizes[l]; j++) {
        const row: number[] = [];
        for (let i = 0; i < fanIn; i++) row.push(gaussian(rand) * scale);
        layerW.push(row);
        layerB.push(0);
      }
      this.weights.push(layerW);
      this.biases.push(layerB);
    }
  }

  /** Activations for every layer, input included at index 0. */
  private forward(input: number[]): number[][] {
    const acts: number[][] = [input];
    const layers = this.weights.length;

    for (let l = 0; l < layers; l++) {
      const prev = acts[l];
      const out: number[] = [];
      const isLast = l === layers - 1;

      for (let j = 0; j < this.weights[l].length; j++) {
        let z = this.biases[l][j];
        const row = this.weights[l][j];
        for (let i = 0; i < row.length; i++) z += row[i] * prev[i];
        // tanh hidden, sigmoid output
        out.push(isLast ? 1 / (1 + Math.exp(-z)) : Math.tanh(z));
      }
      acts.push(out);
    }
    return acts;
  }

  predict(x: number, y: number): number {
    const acts = this.forward([x, y]);
    return acts[acts.length - 1][0];
  }

  /**
   * One full-batch gradient-descent step. Returns mean binary cross-entropy.
   *
   * Full batch rather than mini-batch deliberately: the datasets here are ~100
   * points, and a smooth loss curve is easier to watch than a noisy one.
   */
  trainEpoch(points: Point[], lr: number): number {
    if (points.length === 0) return 0;

    const layers = this.weights.length;

    // Gradient accumulators, shaped like the parameters.
    const gW: number[][][] = this.weights.map((layer) => layer.map((row) => row.map(() => 0)));
    const gB: number[][] = this.biases.map((layer) => layer.map(() => 0));

    let loss = 0;

    for (const p of points) {
      const acts = this.forward([p.x, p.y]);
      const yhat = Math.min(1 - EPS, Math.max(EPS, acts[layers][0]));
      const y = p.label;

      loss += -(y * Math.log(yhat) + (1 - y) * Math.log(1 - yhat));

      // deltas[l] is dL/dz for layer l+1's pre-activations.
      const deltas: number[][] = new Array(layers);

      // Sigmoid + BCE collapse to a clean (yhat - y).
      deltas[layers - 1] = [yhat - y];

      for (let l = layers - 2; l >= 0; l--) {
        const nextW = this.weights[l + 1];
        const nextDelta = deltas[l + 1];
        const a = acts[l + 1];
        const d: number[] = new Array(a.length).fill(0);

        for (let j = 0; j < a.length; j++) {
          let sum = 0;
          for (let k = 0; k < nextW.length; k++) sum += nextW[k][j] * nextDelta[k];
          // d(tanh)/dz = 1 - tanh²
          d[j] = sum * (1 - a[j] * a[j]);
        }
        deltas[l] = d;
      }

      for (let l = 0; l < layers; l++) {
        const prev = acts[l];
        for (let j = 0; j < this.weights[l].length; j++) {
          const d = deltas[l][j];
          gB[l][j] += d;
          for (let i = 0; i < prev.length; i++) gW[l][j][i] += d * prev[i];
        }
      }
    }

    const n = points.length;
    for (let l = 0; l < layers; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        this.biases[l][j] -= (lr * gB[l][j]) / n;
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.weights[l][j][i] -= (lr * gW[l][j][i]) / n;
        }
      }
    }

    return loss / n;
  }

  /**
   * Pack the weights into a fixed-shape buffer the vertex shader can read.
   *
   * The shader must have ONE uniform layout regardless of the architecture the
   * visitor picks, so everything is normalised to the maximum shape
   * 2 → 8 → 8 → 8 → 1 and zero-padded. Zero padding is an exact no-op:
   * tanh(0) = 0 feeding a zero weight contributes nothing.
   *
   * The output layer always lands in the last slot, whether the net is 2 or 3
   * hidden layers deep, so the shader can evaluate both and pick with a mix()
   * rather than a branch.
   */
  snapshot(out: Float32Array): void {
    out.fill(0);

    const layers = this.weights.length; // 3 when depth 2, 4 when depth 3
    const hiddenLayers = layers - 1;

    // Hidden layers, in order.
    for (let l = 0; l < hiddenLayers; l++) {
      const wBase = NET_LAYOUT.hiddenW[l];
      const bBase = NET_LAYOUT.hiddenB[l];
      const fanIn = l === 0 ? 2 : NET_MAX_UNITS;

      for (let j = 0; j < this.weights[l].length; j++) {
        const row = this.weights[l][j];
        for (let i = 0; i < row.length; i++) out[wBase + j * fanIn + i] = row[i];
        out[bBase + j] = this.biases[l][j];
      }
    }

    // Output layer — always the final slot.
    const ol = layers - 1;
    for (let i = 0; i < this.weights[ol][0].length; i++) {
      out[NET_LAYOUT.outW + i] = this.weights[ol][0][i];
    }
    out[NET_LAYOUT.outB] = this.biases[ol][0];
  }

  /** 2 or 3 — how many hidden layers this net actually has. */
  hiddenDepth(): number {
    return this.weights.length - 1;
  }

  /** Total trainable parameters — shown in the UI. */
  paramCount(): number {
    let n = 0;
    for (let l = 0; l < this.weights.length; l++) {
      n += this.biases[l].length;
      for (const row of this.weights[l]) n += row.length;
    }
    return n;
  }
}

/* ── Datasets ─────────────────────────────────────────────
   Coordinates live in [-1, 1] on both axes.
   ───────────────────────────────────────────────────────── */

export type PresetKey = "clusters" | "xor" | "circle" | "spiral";

export const PRESETS: { key: PresetKey; label: string; hint: string }[] = [
  { key: "clusters", label: "Clusters", hint: "linearly separable" },
  { key: "xor", label: "XOR", hint: "needs a hidden layer" },
  { key: "circle", label: "Circle", hint: "radial boundary" },
  { key: "spiral", label: "Spiral", hint: "hard — needs depth" },
];

export function makeDataset(preset: PresetKey, n = 120, seed = 7): Point[] {
  const rand = makeRng(seed);
  const pts: Point[] = [];

  const jitter = (amount: number) => (rand() - 0.5) * amount;

  if (preset === "clusters") {
    for (let i = 0; i < n; i++) {
      const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
      const cx = label === 0 ? -0.45 : 0.45;
      const cy = label === 0 ? -0.35 : 0.35;
      pts.push({ x: cx + gaussian(rand) * 0.22, y: cy + gaussian(rand) * 0.22, label });
    }
  } else if (preset === "xor") {
    for (let i = 0; i < n; i++) {
      const x = rand() * 2 - 1;
      const y = rand() * 2 - 1;
      const label: 0 | 1 = x * y > 0 ? 1 : 0;
      pts.push({ x: x + jitter(0.06), y: y + jitter(0.06), label });
    }
  } else if (preset === "circle") {
    for (let i = 0; i < n; i++) {
      const inner = i % 2 === 0;
      const r = inner ? rand() * 0.42 : 0.62 + rand() * 0.32;
      const t = rand() * Math.PI * 2;
      pts.push({
        x: Math.cos(t) * r + jitter(0.05),
        y: Math.sin(t) * r + jitter(0.05),
        label: inner ? 1 : 0,
      });
    }
  } else {
    // Two interleaved spiral arms.
    const per = Math.floor(n / 2);
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < per; i++) {
        const t = (i / per) * 3.2;
        const r = 0.12 + t * 0.26;
        const angle = t * 2.1 + arm * Math.PI;
        pts.push({
          x: Math.cos(angle) * r + jitter(0.05),
          y: Math.sin(angle) * r + jitter(0.05),
          label: arm === 0 ? 0 : 1,
        });
      }
    }
  }

  return pts;
}

/** Fraction of points the network currently classifies correctly. */
export function accuracy(net: MLP, points: Point[]): number {
  if (!points.length) return 0;
  let ok = 0;
  for (const p of points) {
    const pred = net.predict(p.x, p.y) >= 0.5 ? 1 : 0;
    if (pred === p.label) ok++;
  }
  return ok / points.length;
}
