import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./utils";

export const motionEase = {
  standard: [0.4, 0, 0.2, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const motionDuration = {
  fast: 0.18,
  standard: 0.32,
  expressive: 0.55,
  cinematic: 0.9,
} as const;

export function Reveal({
  children,
  className,
  delay = 0,
  offset = 20,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  offset?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: offset }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: motionDuration.expressive, delay, ease: motionEase.emphasized }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.07,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  gap?: number;
}) {
  const reduced = useReducedMotion();
  const variants: Variants = reduced
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: gap } },
      };
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  offset = 18,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  offset?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? undefined
          : {
              hidden: { opacity: 0, y: offset },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: motionDuration.expressive,
                  ease: motionEase.emphasized,
                },
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.4,
  formatter,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - started) / (duration * 1000), 1);
      const eased = 1 - (1 - elapsed) ** 3;
      setDisplay(value * eased);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, reduced, value, visible]);

  const rounded = Number(display.toFixed(decimals));
  const rendered = formatter
    ? formatter(rounded)
    : rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {rendered}
      {suffix}
    </span>
  );
}
