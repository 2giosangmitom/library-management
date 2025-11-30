import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/node_modules/**/*', '**/dist/**/*', '**/coverage/**/*']),
  {
    files: ['**/*.{ts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  }
]);
