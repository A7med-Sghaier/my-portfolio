import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

function seeded(seed: number) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
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
          "linear-gradient(var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px)",
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
    const generatedPoints = Array.from({ length: nodes }, () => ({
      x: random() * 100,
      y: random() * 100,
    }));
    const generatedEdges: [number, number][] = [];

    for (let index = 0; index < generatedPoints.length; index += 1) {
      const origin = generatedPoints[index];
      if (!origin) continue;
      const distances = generatedPoints
        .map((point, candidate) => ({
          candidate,
          distance: (point.x - origin.x) ** 2 + (point.y - origin.y) ** 2,
        }))
        .filter(({ candidate }) => candidate !== index)
        .sort((a, b) => a.distance - b.distance);
      const first = distances[0];
      const second = distances[1];
      if (first) generatedEdges.push([index, first.candidate]);
      if (second) generatedEdges.push([index, second.candidate]);
    }

    return { points: generatedPoints, edges: generatedEdges };
  }, [nodes]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {edges.map(([startIndex, endIndex], index) => {
        const start = points[startIndex];
        const end = points[endIndex];
        if (!start || !end) return null;
        return (
          <line
            key={index}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="var(--signal)"
            strokeWidth={0.12}
            opacity={0.25}
          />
        );
      })}
      {edges.slice(0, reduce ? 0 : 8).map(([startIndex, endIndex], index) => {
        const start = points[startIndex];
        const end = points[endIndex];
        if (!start || !end) return null;
        return (
          <motion.circle
            key={`pulse-${index}`}
            r={0.5}
            fill="var(--signal-2)"
            initial={{ cx: start.x, cy: start.y, opacity: 0 }}
            animate={{
              cx: [start.x, end.x],
              cy: [start.y, end.y],
              opacity: [0, 1, 0],
            }}
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
          key={index}
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
                repeat: Infinity,
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
        style={{
          background: "radial-gradient(circle, var(--signal) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--signal-2) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
