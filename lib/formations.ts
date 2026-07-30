/**
 * Particle formations. Each returns a flat Float32Array of xyz triples, all of
 * the same length, so the shader can linearly blend between any two of them.
 *
 * Client-only: the text formation samples a 2D canvas.
 */

export const PARTICLE_COUNT = 42000;

/** Cheap deterministic PRNG so a reload gives the same field. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * 0 — Nebula: a clustered cloud, not a uniform starfield.
 *
 * Particles gather into ~50 gaussian clumps with a thin haze between them,
 * which is what a real projected embedding space looks like — and it gives the
 * eye structure to read instead of even noise. The mass is pushed right of
 * centre so it never sits under the hero type.
 */
// At fov 55 / camera z 9 the visible plane is roughly 15 × 9.4 units, so
// formations must stay inside ±7 x / ±4.7 y or the mass falls off-frame.
export function nebula(count: number, radius = 4.1): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(1337);

  /** Box–Muller, for gaussian clumps rather than square ones. */
  const gauss = () => {
    const u1 = Math.max(rand(), 1e-6);
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  const CLUSTERS = 50;
  const centers: { x: number; y: number; z: number; s: number }[] = [];

  for (let c = 0; c < CLUSTERS; c++) {
    const angle = rand() * Math.PI * 2;
    // Hollow-ish ring so clumps ring the composition rather than pile up mid-frame.
    const dist = radius * (0.35 + Math.pow(rand(), 0.6) * 0.75);
    centers.push({
      x: Math.cos(angle) * dist * 1.2 + 1.7,
      y: Math.sin(angle) * dist * 0.9,
      z: (rand() - 0.5) * 3.4,
      s: 0.3 + Math.pow(rand(), 1.8) * 1.0,
    });
  }

  for (let i = 0; i < count; i++) {
    // A thin haze binds the clumps together; without it they read as blobs.
    if (rand() > 0.86) {
      out[i * 3] = (rand() - 0.5) * radius * 3.2 + 1.2;
      out[i * 3 + 1] = (rand() - 0.5) * radius * 2.1;
      out[i * 3 + 2] = (rand() - 0.5) * 5;
      continue;
    }

    const c = centers[Math.floor(rand() * CLUSTERS)];
    out[i * 3] = c.x + gauss() * c.s * 1.25;
    out[i * 3 + 1] = c.y + gauss() * c.s;
    out[i * 3 + 2] = c.z + gauss() * c.s * 0.85;
  }

  return out;
}

/** 1 — Initials: particles sampled from rendered glyphs. */
export function textFormation(count: number, text: string): Float32Array {
  const out = new Float32Array(count * 3);
  const W = 512;
  const H = 256;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) return nebula(count);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 190px Inter, system-ui, sans-serif";
  ctx.fillText(text, W / 2, H / 2 + 6);

  const { data } = ctx.getImageData(0, 0, W, H);

  // Collect every lit pixel, then sample from that pool.
  const lit: number[] = [];
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (data[(y * W + x) * 4] > 128) lit.push(x, y);
    }
  }

  const rand = rng(7331);
  const pairs = lit.length / 2;
  if (pairs === 0) return nebula(count);

  const SCALE = 0.019;

  for (let i = 0; i < count; i++) {
    const p = Math.floor(rand() * pairs) * 2;
    // Jitter within the pixel so edges don't look quantized.
    const x = lit[p] + rand() - 0.5;
    const y = lit[p + 1] + rand() - 0.5;

    out[i * 3] = (x - W / 2) * SCALE;
    out[i * 3 + 1] = -(y - H / 2) * SCALE;
    out[i * 3 + 2] = (rand() - 0.5) * 0.55;
  }
  return out;
}

/** 2 — Lattice: a jittered 3D grid, like a network graph frozen mid-layout. */
export function lattice(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(4242);

  const cols = 34;
  const rows = 18;
  const layers = 5;
  const spacingX = 0.34;
  const spacingY = 0.34;
  const spacingZ = 0.5;

  for (let i = 0; i < count; i++) {
    const cx = Math.floor(rand() * cols);
    const cy = Math.floor(rand() * rows);
    const cz = Math.floor(rand() * layers);

    // Most particles cluster on nodes; the rest scatter along edges.
    const onNode = rand() > 0.42;
    const jitter = onNode ? 0.045 : 0.26;

    out[i * 3] = (cx - cols / 2) * spacingX + (rand() - 0.5) * jitter * 2;
    out[i * 3 + 1] = (cy - rows / 2) * spacingY + (rand() - 0.5) * jitter * 2;
    out[i * 3 + 2] = (cz - layers / 2) * spacingZ + (rand() - 0.5) * jitter;
  }
  return out;
}

/** 3 — Sphere: an even Fibonacci shell. */
export function sphere(count: number, radius = 3): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(909);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const shell = radius * (0.97 + rand() * 0.06);

    out[i * 3] = Math.cos(theta) * r * shell;
    out[i * 3 + 1] = y * shell;
    out[i * 3 + 2] = Math.sin(theta) * r * shell;
  }
  return out;
}

/** 4 — Wave: a rippling plane, like an activation surface. */
export function wave(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(5150);
  const spanX = 11;
  const spanZ = 6;

  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * spanX;
    const z = (rand() - 0.5) * spanZ;
    const y =
      Math.sin(x * 0.85) * 0.5 +
      Math.sin(z * 1.15 + x * 0.35) * 0.34 +
      (rand() - 0.5) * 0.07;

    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** 5 — Singularity: collapsed to a dense core with a faint halo. */
export function singularity(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = rng(2718);

  for (let i = 0; i < count; i++) {
    const core = rand() > 0.22;
    const dist = core ? Math.pow(rand(), 2.6) * 0.75 : 1.1 + rand() * 3.6;

    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);

    out[i * 3] = r * Math.cos(theta) * dist;
    out[i * 3 + 1] = r * Math.sin(theta) * dist * 0.8;
    out[i * 3 + 2] = u * dist * 0.6;
  }
  return out;
}

/** Ordered to match the page's six scroll beats. */
export const FORMATION_LABELS = [
  "nebula",
  "initials",
  "lattice",
  "sphere",
  "wave",
  "singularity",
] as const;

export function buildFormations(count = PARTICLE_COUNT): Float32Array[] {
  return [
    nebula(count),
    textFormation(count, "AK"),
    lattice(count),
    sphere(count),
    wave(count),
    singularity(count),
  ];
}
