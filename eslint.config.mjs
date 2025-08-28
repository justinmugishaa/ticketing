// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Use Next.js recommended rules + Core Web Vitals
  ...compat.extends("next/core-web-vitals"),

  // ✅ Add custom rules to fix common issues
  {
    rules: {
      // ❌ Disable annoying quote warning in JSX
      "react/no-unescaped-entities": "off",

      // Optional: Disable if you're using console.log during dev
      "no-console": "warn",

      // Optional: Enforce consistent imports
      "import/order": ["warn", {
        "groups": ["builtin", "external", "internal"],
        "pathGroups": [
          { type: "string", value: "^@/", group: "internal" }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "alphabetize": { order: "asc" }
      }],
    },
  },
];