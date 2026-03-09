import js from "@eslint/js";
import ts from "typescript-eslint";
import tsdoc from "eslint-plugin-tsdoc";
import globals from "globals";

export default ts.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/temp/**",
      "**/dist-types/**"
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    plugins: {
      tsdoc,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "tsdoc/syntax": "warn",
    },
  },
  {
    files: ["**/*.config.mjs", "**/*.config.js", "scripts/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["app/api/**/route.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  }
);
