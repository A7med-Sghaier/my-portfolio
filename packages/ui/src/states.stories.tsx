import { Briefcase, Gauge, Inbox } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, MetricCard, MetricGrid, PageState, Panel, Skeleton } from ".";

const meta = { title: "Patterns/States & metrics" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Metrics: Story = {
  render: () => (
    <MetricGrid className="max-w-5xl">
      <MetricCard icon={Briefcase} value={4} label="Published case studies" />
      <MetricCard icon={Inbox} value={2} label="Messages needing a reply" hint="Action" />
      <MetricCard icon={Gauge} value={700} suffix="ms" label="Measured object-view load time" />
      <MetricCard value="50+" suffix="GB" label="Database growth addressed" />
    </MetricGrid>
  ),
};

export const Loading: Story = {
  render: () => (
    <PageState
      kind="loading"
      title="Loading content"
      description="Fetching the latest published portfolio data."
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <PageState
      kind="empty"
      title="No messages yet"
      description="New contact enquiries will appear here."
      action={<Button variant="outline">Clear filters</Button>}
    />
  ),
};

export const Error: Story = {
  render: () => (
    <PageState
      kind="error"
      title="Content unavailable"
      description="The request failed without exposing private details."
      action={<Button variant="outline">Try again</Button>}
    />
  ),
};

export const SkeletonPanel: Story = {
  render: () => (
    <Panel title="Content library" description="Loading verified entities" className="max-w-2xl">
      <div className="grid gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-10 w-3/5" />
      </div>
    </Panel>
  ),
};
