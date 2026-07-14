import { type RefObject, useEffect, useState } from "react";
import { type MotionValue, useMotionValueEvent } from "motion/react";

export function useLineOpen(
  itemRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  progress: MotionValue<number>,
  {
    iconOffset = 12,
    enabled = true,
    initial = false,
  }: { iconOffset?: number; enabled?: boolean; initial?: boolean } = {},
): [boolean, (value: boolean | ((previous: boolean) => boolean)) => void] {
  const [open, setOpen] = useState(initial);

  const evaluate = (value: number) => {
    if (!enabled) return;
    const item = itemRef.current;
    const container = containerRef.current;
    if (!item || !container) return;

    const lineLength = value * container.clientHeight;
    const iconPosition = item.offsetTop + iconOffset;
    setOpen(lineLength >= iconPosition);
  };

  useMotionValueEvent(progress, "change", evaluate);

  useEffect(() => {
    evaluate(progress.get());
    // The motion value and refs are stable. This sync is intentionally tied to
    // whether scroll-driven opening is enabled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return [open, setOpen];
}
