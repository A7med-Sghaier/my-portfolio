import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TechTag,
  Textarea,
} from ".";

const meta = {
  title: "Components/Primitives",
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ActionsAndLabels: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-wrap items-center gap-3">
      {(["primary", "signal", "secondary", "outline", "ghost", "danger"] as const).map(
        (variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ),
      )}
      <Badge variant="signal">Published</Badge>
      <Badge variant="warning">Review</Badge>
      <Badge variant="success">Operational</Badge>
      <TechTag>TypeScript</TechTag>
    </div>
  ),
};

export const ContentCard: Story = {
  render: () => (
    <Card interactive className="max-w-lg">
      <CardHeader>
        <Badge variant="signal">Case study</Badge>
        <CardTitle>Air Quality Prediction Platform</CardTitle>
        <CardDescription>
          Scientific monitoring and forecasting across 159 stations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <TechTag>React</TechTag>
        <TechTag>Python</TechTag>
        <TechTag>MongoDB</TechTag>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Open case study</Button>
      </CardFooter>
    </Card>
  ),
};

export const FormControls: Story = {
  render: () => (
    <form className="grid max-w-xl gap-5">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" placeholder="Your name" />
        <FieldDescription>Used only to reply to this enquiry.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="opportunity">Opportunity</FieldLabel>
        <Select defaultValue="full-time">
          <SelectTrigger id="opportunity">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time position</SelectItem>
            <SelectItem value="contract">Contract opportunity</SelectItem>
            <SelectItem value="consulting">Architecture consulting</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="message">Message</FieldLabel>
        <Textarea id="message" aria-invalid placeholder="Tell me about the role…" />
        <FieldError>Please add at least ten characters.</FieldError>
      </Field>
      <Button variant="signal" type="submit">
        Send enquiry
      </Button>
    </form>
  ),
};

export const Alerts: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-3">
      <Alert variant="info">
        <Info />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Remote persistence is not configured.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Approval required</AlertTitle>
        <AlertDescription>Private projects remain unpublished.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your verified content is up to date.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const DataTable: Story = {
  render: () => (
    <div className="max-w-3xl rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Air Quality Platform</TableCell>
            <TableCell>
              <Badge variant="success">Published</Badge>
            </TableCell>
            <TableCell>2024</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>AS TINO DEV</TableCell>
            <TableCell>
              <Badge variant="warning">Draft</Badge>
            </TableCell>
            <TableCell>2025</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
