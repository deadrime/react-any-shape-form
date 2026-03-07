import "./styles.css";
import "prismjs/themes/prism-tomorrow.css";
import { type Preview } from "@storybook/react-vite";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserTypescript from "prettier/plugins/typescript";
import estreePlugin from "prettier/plugins/estree";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Welcome",
          "Documentation",
          ["Basics", "Validation", "Nested Forms", "Arrays", "Hooks", "Advanced", "*"],
          "*",
        ],
      },
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    docs: {
      codePanel: true,
      source: {
        transform: async (src: string, context: any) => {
          const body = extractRenderBody(src);
          if (!body) return src;

          const storyImports = context?.parameters?.imports ?? "";

          const wrappedComponent = `
${storyImports}

const Example = () => {
  ${body}
};
`;

          return prettier.format(wrappedComponent, {
            parser: "babel-ts",
            plugins: [parserBabel, parserTypescript, estreePlugin],
          });
        },
      },
    },
  },
};

export default preview;

function extractRenderBody(src: string): string | null {
  try {
    const wrapped = `(${src})`;

    const ast = (parserBabel as any).parsers["babel-ts"].parse(wrapped, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    const obj = ast.program.body[0].expression;

    const renderProp = obj.properties.find(
      (p: any) => p.key?.name === "render",
    );

    if (!renderProp) return null;

    const functionNode = renderProp.value;

    // тело функции render
    const bodyNode = functionNode.body;

    // возвращаем всё содержимое {...}
    return wrapped.slice(bodyNode.start + 1, bodyNode.end - 1);
  } catch {
    return null;
  }
}
