"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { easeExpo } from "@/lib/motion";
import {
  accuracy,
  makeDataset,
  MLP,
  NET_PARAM_SLOTS,
  PRESETS,
  type Point,
  type PresetKey,
} from "@/lib/mlp";
import { publishNet, setNetLive } from "@/lib/netBridge";

/** Boundary is evaluated on a GRID×GRID lattice — the visual cost driver. */
const GRID = 34;
/** Gradient-descent steps per animation frame. */
const EPOCHS_PER_FRAME = 5;
const HIDDEN_OPTIONS = [4, 6, 8] as const;

export default function NeuralTrainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  const [preset, setPreset] = useState<PresetKey>("xor");
  const [hidden, setHidden] = useState<number>(6);
  const [depth, setDepth] = useState<0 | 1 | 2 | 3>(2);
  const [lr, setLr] = useState(0.35);
  const [brush, setBrush] = useState<0 | 1>(1);
  const [running, setRunning] = useState(!reduce);
  const [showInfo, setShowInfo] = useState(false);
  const [stats, setStats] = useState({ epoch: 0, loss: 0, acc: 0 });

  const pointsRef = useRef<Point[]>(makeDataset("xor"));
  const netRef = useRef<MLP | null>(null);
  const epochRef = useRef(0);
  const seedRef = useRef(1);
  // Reused every frame — publishing must not allocate.
  const packed = useRef<Float32Array>(new Float32Array(NET_PARAM_SLOTS));

  const sizes = useMemo(
    () => [2, ...Array.from({ length: depth }, () => hidden), 1],
    [depth, hidden],
  );

  /** Fresh network with the current shape, leaving the dataset untouched. */
  const resetNet = useCallback(() => {
    seedRef.current += 1;
    netRef.current = new MLP(sizes, seedRef.current);
    epochRef.current = 0;
    setStats({ epoch: 0, loss: 0, acc: 0 });
    // Publish immediately: a rebuilt net changes depth, and the field must not
    // keep evaluating the previous architecture for a frame.
    netRef.current.snapshot(packed.current);
    publishNet(packed.current, netRef.current.hiddenDepth(), true);
  }, [sizes]);

  // Rebuild whenever the architecture changes — old weights no longer fit.
  useEffect(() => {
    resetNet();
  }, [resetNet]);

  useEffect(() => {
    pointsRef.current = makeDataset(preset);
    resetNet();
  }, [preset, resetNet]);

  /* ── Render ─────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const net = netRef.current;
    if (!canvas || !net) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(rect.width * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // ── Decision surface. Violet = class 0, cyan = class 1.
    //
    // Cell edges are snapped to whole pixels and each cell ends exactly where
    // the next begins. Padding cells by +1px instead would double-composite the
    // alpha along every shared edge and draw a visible grid over the surface.
    for (let gx = 0; gx < GRID; gx++) {
      const x0 = Math.round((gx * w) / GRID);
      const x1 = Math.round(((gx + 1) * w) / GRID);

      for (let gy = 0; gy < GRID; gy++) {
        const y0 = Math.round((gy * h) / GRID);
        const y1 = Math.round(((gy + 1) * h) / GRID);

        const nx = ((gx + 0.5) / GRID) * 2 - 1;
        const ny = 1 - ((gy + 0.5) / GRID) * 2;
        const p = net.predict(nx, ny);

        // Confidence drives alpha, so the boundary reads as a soft ridge.
        const conf = Math.abs(p - 0.5) * 2;
        const alpha = 0.05 + conf * 0.26;
        ctx.fillStyle =
          p >= 0.5 ? `rgba(34, 211, 238, ${alpha})` : `rgba(124, 92, 255, ${alpha})`;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }

    // ── Points
    for (const pt of pointsRef.current) {
      const px = ((pt.x + 1) / 2) * w;
      const py = ((1 - pt.y) / 2) * h;

      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? "#22d3ee" : "#7c5cff";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(7,7,11,0.85)";
      ctx.stroke();
    }
  }, []);

  /* ── Training loop ──────────────────────────────────── */
  useEffect(() => {
    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const net = netRef.current;
      if (net && running) {
        let loss = 0;
        for (let i = 0; i < EPOCHS_PER_FRAME; i++) {
          loss = net.trainEpoch(pointsRef.current, lr);
        }
        epochRef.current += EPOCHS_PER_FRAME;

        // Hand the live weights to the particle field, which evaluates this
        // same network per particle across the whole viewport.
        net.snapshot(packed.current);
        publishNet(packed.current, net.hiddenDepth(), true);
        // React state at frame rate would be wasteful — sample periodically.
        if (epochRef.current % 20 < EPOCHS_PER_FRAME) {
          setStats({
            epoch: epochRef.current,
            loss,
            acc: accuracy(net, pointsRef.current),
          });
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [running, lr, draw]);

  // Pause when scrolled away — training is real CPU work.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setRunning(entry.isIntersecting);
        // The rAF keeps drawing after training stops, so liveness has to be
        // stated explicitly rather than inferred from the loop.
        setNetLive(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  function addPoint(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    // Alt-click drops the opposite class, so you can sketch both without toggling.
    const label = (e.altKey ? (brush === 1 ? 0 : 1) : brush) as 0 | 1;
    pointsRef.current = [...pointsRef.current, { x, y, label }];
  }

  return (
    <div className="gradient-border glass flex h-full flex-col rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Live neural network</h3>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-faint uppercase">
            Backprop from scratch · no library
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          aria-label="How this works"
          aria-expanded={showInfo}
          className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-colors ${
            showInfo ? "border-violet/50 text-violet" : "border-white/10 text-muted hover:text-text"
          }`}
        >
          <Info className="size-3.5" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeExpo }}
            className="overflow-hidden"
          >
            <p className="mt-4 rounded-xl border border-violet/20 bg-violet/[0.06] p-3 text-[12px] leading-relaxed text-muted">
              A real multi-layer perceptron, training in your browser right now — forward
              pass, binary cross-entropy, analytic gradients, gradient descent, all written
              from scratch in about 150 lines. The background is the network&apos;s decision
              surface, sampled on a {GRID}×{GRID} grid every frame; opacity is its
              confidence. <strong className="font-medium text-text">Click the canvas</strong>{" "}
              to add points and watch it adapt. Set{" "}
              <strong className="font-medium text-text">layers to 0</strong> and it becomes a
              linear model that provably cannot separate XOR — one straight boundary, however
              long you train it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <canvas
          ref={canvasRef}
          onClick={addPoint}
          className="block aspect-[5/4] w-full cursor-crosshair"
          aria-label="Interactive neural network decision boundary. Click to add training points."
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5 font-mono text-[9px] tracking-wider text-faint uppercase">
          <span>click to add · alt-click for other class</span>
          <span className="text-violet/80">{pointsRef.current.length} pts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "epoch", value: stats.epoch.toLocaleString() },
          { label: "loss", value: stats.loss.toFixed(4) },
          { label: "accuracy", value: `${Math.round(stats.acc * 100)}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <p className="font-mono text-base font-semibold tabular-nums text-gradient">
              {s.value}
            </p>
            <p className="mt-0.5 font-mono text-[9px] tracking-wider text-faint uppercase">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              title={p.hint}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-wide transition-colors ${
                preset === p.key
                  ? "border-violet/50 bg-violet/10 text-text"
                  : "border-white/10 text-muted hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] text-faint">
          <label className="flex items-center gap-2">
            <span className="tracking-wider uppercase">Layers</span>
            <span className="flex gap-1">
              {([0, 1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  className={`rounded border px-1.5 py-0.5 transition-colors ${
                    depth === d
                      ? "border-cyan/50 bg-cyan/10 text-text"
                      : "border-white/10 hover:text-text"
                  }`}
                >
                  {d}
                </button>
              ))}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <span className="tracking-wider uppercase">Units</span>
            <span className="flex gap-1">
              {HIDDEN_OPTIONS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setHidden(u)}
                  className={`rounded border px-1.5 py-0.5 transition-colors ${
                    hidden === u
                      ? "border-cyan/50 bg-cyan/10 text-text"
                      : "border-white/10 hover:text-text"
                  }`}
                >
                  {u}
                </button>
              ))}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <span className="tracking-wider uppercase">LR</span>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={lr}
              onChange={(e) => setLr(Number(e.target.value))}
              className="h-1 w-20 accent-violet"
              aria-label="Learning rate"
            />
            <span className="tabular-nums text-muted">{lr.toFixed(2)}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-4 py-2 text-[12px] font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
          >
            {running ? <Pause className="size-3" /> : <Play className="size-3" />}
            {running ? "Pause" : "Train"}
          </button>

          <button
            type="button"
            onClick={resetNet}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
          >
            <RotateCcw className="size-3" />
            Reset weights
          </button>

          <button
            type="button"
            onClick={() => setBrush((b) => (b === 1 ? 0 : 1))}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-2 font-mono text-[11px] text-muted transition-colors hover:text-text"
          >
            <Plus className="size-3" />
            <span
              className="size-2.5 rounded-full"
              style={{ background: brush === 1 ? "#22d3ee" : "#7c5cff" }}
            />
          </button>
        </div>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-wide text-faint">
        {sizes.join(" → ")} · {netRef.current?.paramCount() ?? 0} parameters · tanh + sigmoid
      </p>
    </div>
  );
}
