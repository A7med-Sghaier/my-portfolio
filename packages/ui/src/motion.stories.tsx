import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CountUp, Reveal, Stagger, StaggerItem } from ".";

const meta = { title: "Motion/Primitives" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const RevealAndStagger: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Reveal>
        <p className="font-display text-3xl tracking-tight">Motion supports hierarchy.</p>
      </Reveal>
      <Stagger className="mt-6 grid gap-3 sm:grid-cols-3">
        {["Frontend", "Backend", "Data & AI"].map((label) => (
          <StaggerItem key={label}>
            <Card>
              <CardContent className="p-5">{label}</CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  ),
};

export const MetricCounter: Story = {
  render: () => (
    <p className="font-display text-5xl font-semibold text-signal">
      <CountUp value={159} suffix=" stations" />
    </p>
  ),
};
