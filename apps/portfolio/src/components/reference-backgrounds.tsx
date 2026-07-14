import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

function seeded(n: number) {
  let seed = n * 9301 + 49297;
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function BlueprintGrid({
  className = "",
  fade = "top",
}: {
  className?: string;
  fade?: "top" | "center" | "bottom";
}) {
  const mask =
    fade === "center"
      ? "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 78%)"
      : fade === "bottom"
        ? "linear-gradient(to top, black, transparent 70%)"
        : "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

export function NeuralField({
  className = "",
  nodes = 16,
}: {
  className?: string;
  nodes?: number;
}) {
  const reduce = useReducedMotion();
  const { points, edges } = useMemo(() => {
    const random = seeded(nodes * 7);
    const points = Array.from({ length: nodes }, () => ({
      x: random() * 100,
      y: random() * 100,
    }));
    const edges: [number, number][] = [];

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index]!;
      const distances = points
        .map((candidate, candidateIndex) => ({
          index: candidateIndex,
          distance: (candidate.x - point.x) ** 2 + (candidate.y - point.y) ** 2,
        }))
        .filter((candidate) => candidate.index !== index)
        .sort((a, b) => a.distance - b.distance);
      if (distances[0]) edges.push([index, distances[0].index]);
      if (distances[1]) edges.push([index, distances[1].index]);
    }

    return { points, edges };
  }, [nodes]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {edges.map(([from, to], index) => {
        const a = points[from]!;
        const b = points[to]!;
        return (
          <line
            key={`${from}-${to}-${index}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--signal)"
            strokeWidth={0.12}
            opacity={0.25}
          />
        );
      })}
      {edges.slice(0, reduce ? 0 : 8).map(([from, to], index) => {
        const a = points[from]!;
        const b = points[to]!;
        return (
          <motion.circle
            key={`pulse-${from}-${to}-${index}`}
            r={0.5}
            fill="var(--signal-2)"
            initial={{ cx: a.x, cy: a.y, opacity: 0 }}
            animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 0] }}
            transition={{
              duration: 3 + (index % 4),
              repeat: Infinity,
              delay: index * 0.6,
              ease: "easeInOut",
            }}
          />
        );
      })}
      {points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r={index % 5 === 0 ? 0.9 : 0.5}
          fill={index % 5 === 0 ? "var(--signal)" : "var(--foreground)"}
          opacity={index % 5 === 0 ? 0.8 : 0.3}
        />
      ))}
    </svg>
  );
}

export function DataFlow({ className = "", lines = 5 }: { className?: string; lines?: number }) {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {Array.from({ length: lines }).map((_, index) => {
        const y = (40 / (lines + 1)) * (index + 1);
        const path = `M0 ${y} Q 30 ${y - 4}, 55 ${y} T 100 ${y}`;
        return (
          <g key={y}>
            <path d={path} fill="none" stroke="var(--grid-line)" strokeWidth={0.25} />
            <motion.path
              d={path}
              fill="none"
              stroke={index % 2 ? "var(--signal)" : "var(--signal-2)"}
              strokeWidth={0.35}
              strokeDasharray="3 12"
              initial={{ strokeDashoffset: 0 }}
              animate={reduce ? undefined : { strokeDashoffset: [0, -60] }}
              transition={{ duration: 4 + index, repeat: Infinity, ease: "linear" }}
              opacity={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function CircuitTrace({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={`pointer-events-none absolute ${className}`}>
      <g fill="none" stroke="var(--signal)" strokeWidth={0.8} opacity={0.4}>
        <path d="M4 30 H40 L52 42 H80" />
        <path d="M4 60 H24 L36 48" />
        <path d="M4 90 H60 L72 78 H116" />
        <path d="M52 42 V72" />
      </g>
      {[
        [40, 30],
        [80, 42],
        [24, 60],
        [60, 90],
        [116, 78],
      ].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={1.6} fill="var(--signal-2)" opacity={0.7} />
      ))}
    </svg>
  );
}

export function PageBackdrop({ motif = "grid" }: { motif?: "grid" | "neural" | "flow" }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden"
    >
      <BlueprintGrid fade="top" />
      {motif === "neural" ? (
        <div className="absolute inset-0 opacity-45">
          <NeuralField nodes={18} />
        </div>
      ) : null}
      {motif === "flow" ? (
        <div className="absolute inset-0 opacity-40">
          <DataFlow lines={6} />
        </div>
      ) : null}
      <div
        className="absolute -top-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--signal) 0%, transparent 62%)" }}
      />
      <div
        className="absolute -top-24 right-[8%] h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--signal-2) 0%, transparent 65%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

export function IntelligenceField({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <BlueprintGrid fade="center" />
      <div className="absolute inset-0 opacity-60">
        <NeuralField nodes={20} />
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--signal) 0%, transparent 60%)" }}
      />
      <div
        className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--signal-2) 0%, transparent 65%)" }}
      />
    </div>
  );
}
