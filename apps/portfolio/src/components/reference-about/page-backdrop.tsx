import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

function seeded(seed: number) {
  let value = seed * 9301 + 49297;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function BlueprintGrid() {
  const mask = "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

function NeuralField({ nodes = 18 }: { nodes?: number }) {
  const reduce = useReducedMotion();
  const field = useMemo(() => {
    const random = seeded(nodes * 7);
    const points = Array.from({ length: nodes }, () => ({
      x: random() * 100,
      y: random() * 100,
    }));
    const edges: Array<[number, number]> = [];

    for (let index = 0; index < points.length; index += 1) {
      const currentPoint = points[index];
      if (!currentPoint) continue;
      const distances = points
        .map((point, candidate) => ({
          candidate,
          distance: (point.x - currentPoint.x) ** 2 + (point.y - currentPoint.y) ** 2,
        }))
        .filter(({ candidate }) => candidate !== index)
        .sort((left, right) => left.distance - right.distance);

      if (distances[0]) edges.push([index, distances[0].candidate]);
      if (distances[1]) edges.push([index, distances[1].candidate]);
    }

    return { points, edges };
  }, [nodes]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {field.edges.map(([from, to], index) => {
        const fromPoint = field.points[from];
        const toPoint = field.points[to];
        if (!fromPoint || !toPoint) return null;
        return (
          <line
            key={`${from}-${to}-${index}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            stroke="var(--signal)"
            strokeWidth={0.12}
            opacity={0.25}
          />
        );
      })}
      {field.edges.slice(0, reduce ? 0 : 8).map(([from, to], index) => {
        const fromPoint = field.points[from];
        const toPoint = field.points[to];
        if (!fromPoint || !toPoint) return null;
        return (
          <motion.circle
            key={`pulse-${from}-${to}-${index}`}
            r={0.5}
            fill="var(--signal-2)"
            initial={{ cx: fromPoint.x, cy: fromPoint.y, opacity: 0 }}
            animate={{
              cx: [fromPoint.x, toPoint.x],
              cy: [fromPoint.y, toPoint.y],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (index % 4),
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.6,
              ease: "easeInOut",
            }}
          />
        );
      })}
      {field.points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}-${index}`}
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

function DataFlow({ lines = 6 }: { lines?: number }) {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {Array.from({ length: lines }, (_, index) => {
        const y = (40 / (lines + 1)) * (index + 1);
        const path = `M0 ${y} Q 30 ${y - 4}, 55 ${y} T 100 ${y}`;
        return (
          <g key={index}>
            <path
              d={path}
              fill="none"
              stroke="var(--grid-line, var(--mk-grid-line))"
              strokeWidth={0.25}
            />
            <motion.path
              d={path}
              fill="none"
              stroke={index % 2 ? "var(--signal)" : "var(--signal-2)"}
              strokeWidth={0.35}
              strokeDasharray="3 12"
              initial={{ strokeDashoffset: 0 }}
              animate={reduce ? {} : { strokeDashoffset: [0, -60] }}
              transition={{
                duration: 4 + index,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              opacity={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function PageBackdrop({ motif = "grid" }: { motif?: "grid" | "neural" | "flow" }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden"
    >
      <BlueprintGrid />
      {motif === "neural" ? (
        <div className="absolute inset-0 opacity-45">
          <NeuralField />
        </div>
      ) : null}
      {motif === "flow" ? (
        <div className="absolute inset-0 opacity-40">
          <DataFlow />
        </div>
      ) : null}
      <div
        className="absolute -top-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--signal) 0%, transparent 62%)" }}
      />
      <div
        className="absolute -top-24 right-[8%] h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--signal-2) 0%, transparent 65%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
