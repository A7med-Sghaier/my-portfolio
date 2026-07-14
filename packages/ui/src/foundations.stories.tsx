import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const colors = [
  ["Background", "var(--mk-background)"],
  ["Card", "var(--mk-card)"],
  ["Foreground", "var(--mk-foreground)"],
  ["Signal", "var(--mk-signal)"],
  ["Intelligence", "var(--mk-signal-2)"],
  ["Destructive", "var(--mk-destructive)"],
] as const;

export const Palette: Story = {
  render: () => (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl tracking-tight">Architected intelligence</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Warm professional surfaces, graphite foundations, and dual signal colors for software
        engineering and applied intelligence.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map(([label, value]) => (
          <div key={label} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-24" style={{ background: value }} />
            <div className="p-4">
              <p className="font-medium">{label}</p>
              <code className="font-mono text-xs text-muted-foreground">{value}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="mx-auto grid max-w-3xl gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
          Fraunces display
        </p>
        <p className="mt-2 font-display text-5xl leading-none tracking-tight">
          Reliable systems, clearly expressed.
        </p>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Geist sans</p>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Product-minded engineering across frontend, backend, data, and architecture.
        </p>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">JetBrains Mono</p>
        <code className="mt-2 block rounded-lg border border-border bg-card p-4 font-mono text-sm">
          status: operational · latency: 700ms
        </code>
      </div>
    </div>
  ),
};
