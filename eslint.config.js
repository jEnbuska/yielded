import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  importPlugin.flatConfigs.recommended,
  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "parent", "sibling", "index"],
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          "newlines-between": "never",
          named: true,
        },
      ],
      "no-unused-vars": "off",
      "import/no-duplicates": "warn",
      "no-unmodified-loop-condition": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-function-type": "off",
      "linebreak-style": ["error", "unix"],
      "@typescript-eslint/prefer-readonly": "off",
      "@typescript-eslint/method-signature-style": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "spaced-comment": "warn",
      "@typescript-eslint/promise-function-async": "off",
      "@typescript-eslint/return-await": "off",
      "prefer-const": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "lines-between-class-members": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports", // always use `import type`
          disallowTypeAnnotations: false, // optional: allows you to still use types in annotations without prefix
        },
      ],
      "no-duplicate-imports": "warn",
      "@typescript-eslint/no-this-alias": "off",
    },
  },
  eslintConfigPrettier,
];
