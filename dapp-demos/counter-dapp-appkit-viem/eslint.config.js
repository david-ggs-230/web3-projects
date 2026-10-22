import js from "@eslint/js";
import globals from "globals";
import reactDom from "eslint-plugin-react-dom";
import reactX from "eslint-plugin-react-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "@eslint-react/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "*.config.js", "tsconfig*.json"]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      js.configs.recommended,
      react.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs["recommended-typescript"],
      reactX.configs.recommended,
      reactDom.configs.recommended,
      reactRefresh.configs.vite,
      eslintPluginPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },

    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: react,
      "react-hooks": reactHooks,
      prettier: prettier,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          "allowNumber": true
        }
      ],
      "prettier/prettier": "warn",
      "@typescript-eslint/no-non-null-assertion": "off"
    },
  },
]);
