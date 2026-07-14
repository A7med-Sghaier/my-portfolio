import type { Preview } from "@storybook/react-vite";
import "../src/storybook.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Design theme",
      defaultValue: "dark",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "light" ? "light" : "dark";
      return (
        <div
          className={theme === "dark" ? "dark" : undefined}
          style={{
            minHeight: "100vh",
            padding: "2rem",
            background: "var(--mk-background)",
            color: "var(--mk-foreground)",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
