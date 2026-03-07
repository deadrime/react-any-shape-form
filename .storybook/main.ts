import type { StorybookConfig } from "@storybook/react-vite";
import path from 'path';

const config: StorybookConfig = {
  addons: ["@storybook/addon-links", "@storybook/addon-docs"],
  stories: ["../docs/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: './vite.config.storybook.ts'
      }
    }
  },

  typescript: {
    // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
    reactDocgen: 'react-docgen',
    check: false,
  },  
};
export default config;
