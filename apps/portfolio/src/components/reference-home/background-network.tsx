import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type NetworkNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hub: boolean;
};

export function BackgroundNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvasCandidate = canvasRef.current;
    if (!canvasCandidate) return;
    const contextCandidate = canvasCandidate.getContext("2d");
    if (!contextCandidate) return;
    const canvas: HTMLCanvasElement = canvasCandidate;
    const context: CanvasRenderingContext2D = contextCandidate;

    let width = 0;
    let height = 0;
    let nodes: NetworkNode[] = [];
    let frame = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999 };
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    function palette() {
      const dark = document.documentElement.classList.contains("dark");
      return {
        line: dark ? "148, 163, 184" : "71, 85, 105",
        signal: "20, 184, 166",
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const mobile = width < 640;
      const count = mobile ? 22 : Math.min(60, Math.round((width * height) / 22000));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.6 + 0.8,
        hub: index % 7 === 0,
      }));
    }

    function draw() {
      if (!running) return;
      const { line, signal } = palette();
      context.clearRect(0, 0, width, height);
      const maxDistance = width < 640 ? 110 : 150;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        const deltaX = pointer.x - node.x;
        const deltaY = pointer.y - node.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > 0 && distance < 160) {
          node.x += (deltaX / distance) * 0.4;
          node.y += (deltaY / distance) * 0.4;
        }
      }

      for (let index = 0; index < nodes.length; index += 1) {
        const start = nodes[index];
        if (!start) continue;
        for (let candidate = index + 1; candidate < nodes.length; candidate += 1) {
          const end = nodes[candidate];
          if (!end) continue;
          const distance = Math.hypot(start.x - end.x, start.y - end.y);
          if (distance >= maxDistance) continue;
          const alpha = (1 - distance / maxDistance) * 0.5;
          const nearPointer =
            Math.hypot(pointer.x - (start.x + end.x) / 2, pointer.y - (start.y + end.y) / 2) < 130;
          context.strokeStyle = nearPointer
            ? `rgba(${signal}, ${alpha * 0.9})`
            : `rgba(${line}, ${alpha * 0.35})`;
          context.lineWidth = nearPointer ? 0.9 : 0.6;
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.stroke();
        }
      }

      for (const node of nodes) {
        context.beginPath();
        context.arc(node.x, node.y, node.hub ? node.radius + 1.4 : node.radius, 0, Math.PI * 2);
        context.fillStyle = node.hub ? `rgba(${signal}, 0.9)` : `rgba(${line}, 0.55)`;
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    function onMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }

    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    resize();

    if (reduce) {
      draw();
      running = false;
      cancelAnimationFrame(frame);
      const observer = new ResizeObserver(() => {
        resize();
        running = true;
        draw();
        running = false;
        cancelAnimationFrame(frame);
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    frame = requestAnimationFrame(draw);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        running = entry.isIntersecting && !document.hidden;
        if (running) frame = requestAnimationFrame(draw);
        else cancelAnimationFrame(frame);
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const onVisibilityChange = () => {
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
