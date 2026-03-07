import { Source } from "@storybook/addon-docs/blocks";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserTypescript from "prettier/plugins/typescript";
import estreePlugin from "prettier/plugins/estree";
import { useEffect, useState } from "react";

interface FormattedSourceProps {
  code: string;
  language?: string;
  dark?: boolean;
}

export const FormattedSource = ({
  code,
  language = "tsx",
  dark,
}: FormattedSourceProps) => {
  const [formattedCode, setFormattedCode] = useState(code);

  useEffect(() => {
    const formatCode = async () => {
      try {
        if (language === "bash") {
          // Для bash просто очищаем лишние пробелы
          setFormattedCode(code.trim());
          return;
        }

        // Оборачиваем JSX/TSX фрагменты в валидный код для форматирования
        const wrappedCode = `const Component = () => (
${code}
);`;

        const formatted = await prettier.format(wrappedCode, {
          parser: "babel-ts",
          plugins: [parserBabel, parserTypescript, estreePlugin],
          semi: true,
          singleQuote: false,
          trailingComma: "es5",
          printWidth: 80,
        });

        // Извлекаем только отформатированное содержимое без обёртки
        const lines = formatted.split("\n");
        // Убираем первую строку "const Component = () => (" и последние ");"
        const extracted = lines.slice(1, -2).join("\n");

        setFormattedCode(extracted.trim());
      } catch (error) {
        // Если форматирование не удалось, показываем оригинальный код
        console.warn("Failed to format code:", error);
        setFormattedCode(code);
      }
    };

    formatCode();
  }, [code, language]);

  return <Source code={formattedCode} language={language} dark={dark} />;
};
