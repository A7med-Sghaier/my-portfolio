import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from ".";

const meta = { title: "Components/Overlays" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open confirmation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this project?</DialogTitle>
          <DialogDescription>
            Only verified, public content will become visible on the portfolio.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="signal">Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const EditingSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open editor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit project</SheetTitle>
          <SheetDescription>Update verified content and publishing state.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Form content
        </div>
      </SheetContent>
    </Sheet>
  ),
};
