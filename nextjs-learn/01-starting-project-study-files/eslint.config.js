import tseslint from 'typescript-eslint'
import next from 'eslint-config-next'

export default tseslint.config(
  ...next,
  {
    // Base recommended rules
    ...tseslint.configs.recommended,
  },
  {
    // Project-wide settings
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // React specific settings
  {
    plugins: ['react', 'react-hooks'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js automatically imports React
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      '**/dist/',
      '**/generated/',
      'apps/web-client/',
      '**/prisma.config.ts',
      'eslint.config.js',
    ],
  }
)
