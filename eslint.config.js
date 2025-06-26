import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next', 'out']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_|^Component$'
      }],
      'no-case-declarations': 'off', // Allow let/const in case blocks
      'no-undef': 'error',
    },
  },
  {
    // Specific rules for API routes
    files: ['pages/api/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // Ignore build directories
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
    ],
  },
])
