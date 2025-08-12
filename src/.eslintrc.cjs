const js = require('@eslint/js'); // For recommended JavaScript rules
const tseslint = require('typescript-eslint'); // For TypeScript ESLint configuration
const svelte3 = require('eslint-plugin-svelte'); // For Svelte support

module.exports = [
  // Base configuration
  {
    ignores: ['node_modules/', 'dist/', 'build/'], // You might want to define global ignores
  },
  {
    // Apply general settings for all files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true, // Enable browser globals
        node: true, // Enable Node.js globals
      },
    },
    rules: {
      'no-console': 'warn', // General rule for console logging
    },
  },

  // --- TypeScript Configuration ---
  {
    files: ['**/*.ts', '**/*.tsx'], // Target TypeScript files
    extends: [
      js.configs.recommended, // Extend ESLint's recommended JavaScript rules
      ...tseslint.configs.recommended, // Extend recommended TypeScript rules
    ],
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': ['error'], // Specific rule for TypeScript unused vars
    },
    languageOptions: {
      parser: tseslint.parser, // Specify the TypeScript parser
      parserOptions: {
        project: './tsconfig.json', // Required for some advanced TypeScript rules
      },
    },
  },

  // --- JavaScript Configuration ---
  {
    files: ['**/*.js'], // Target JavaScript files
    extends: [js.configs.recommended], // Extend ESLint's recommended JavaScript rules
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn'], // Specific rule for JavaScript unused vars
    },
  },

  // --- Svelte Configuration ---
  {
    files: ['**/*.svelte'], // Target Svelte files
    processor: svelte3.processors.svelte3, // Specify the Svelte processor
    extends: [
      // You might need to add base configurations here if the Svelte plugin doesn't handle them
      // For instance, if Svelte files can contain TypeScript, you might need to extend
      // @typescript-eslint/recommended inside this block as well, if applicable.
    ],
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn'],
    },
    settings: {
      // Svelte plugin specific settings for TypeScript integration
      'svelte3/typescript': true, // Use TypeScript inside Svelte files
      // You might also need to specify the path to your TypeScript installation if not default:
      // 'svelte3/typescript': require('typescript'),
    },
  },
];