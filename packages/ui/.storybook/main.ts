import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      css: {
        // Storybook is a self-contained package build. An explicit PostCSS
        // config prevents Vite from inheriting an app-level config from the
        // workspace root; Tailwind v4 is handled by the Vite plugin below.
        postcss: { plugins: [] },
      },
      plugins: [tailwindcss()],
    });
  },
};

export default config;
