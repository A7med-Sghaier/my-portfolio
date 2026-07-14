import { useEffect, useState } from "react";

export interface RailItem {
  id: string;
  label: string;
}

export function SectionRail({ items, ariaLabel }: { items: RailItem[]; ariaLabel: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed end-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <ul className="flex flex-col gap-3.5">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                aria-current={isActive ? "true" : undefined}
                className="group flex w-full items-center justify-end gap-2.5"
              >
                <span
                  className={`whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "text-signal opacity-100"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full border transition-all duration-200 ${
                    isActive
                      ? "scale-125 border-signal bg-signal shadow-[0_0_8px_var(--signal)]"
                      : "border-muted-foreground/40 group-hover:scale-110 group-hover:border-signal"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
