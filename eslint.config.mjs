import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/out/**", "**/coverage/**", "**/build/**", "**/patches/**"]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  }
);
