import { useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
import "./vscode-theme.css";
import "../src/index.css";

type VSCodeThemeName = "vscode-dark" | "vscode-light" | "vscode-high-contrast";

const VSCODE_THEME_CLASSES: VSCodeThemeName[] = [
  "vscode-dark",
  "vscode-light",
  "vscode-high-contrast",
];

if (typeof window !== "undefined") {
  (
    window as Window & { __materialIconBaseUri?: string }
  ).__materialIconBaseUri = "/material-icon-theme";
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    backgrounds: { disable: true },
  },

  globalTypes: {
    vscodeTheme: {
      description: "VS Code theme class applied to <body>",
      defaultValue: "vscode-dark",
      toolbar: {
        title: "VS Code Theme",
        icon: "paintbrush",
        items: [
          { value: "vscode-dark", title: "Dark Modern" },
          // { value: "vscode-light", title: "Light" },
          // { value: "vscode-high-contrast", title: "High Contrast" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = (context.globals.vscodeTheme ??
        "vscode-dark") as VSCodeThemeName;
      useEffect(() => {
        const { body } = document;
        VSCODE_THEME_CLASSES.forEach((cls) => body.classList.remove(cls));
        body.classList.add(theme);
        return () => {
          body.classList.remove(theme);
        };
      }, [theme]);
      return <Story />;
    },
  ],
};

export default preview;
