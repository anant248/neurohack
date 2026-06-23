import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Disable base JS rules that TS versions supersede
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    // scripts/** are one-off Node dev tools (CommonJS, Node globals) — not part
    // of the app build, so they're excluded from the browser-oriented lint.
    ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**", "scripts/**"],
  },
]
