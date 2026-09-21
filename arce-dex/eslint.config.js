import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features/*/components/*',
                '@/features/*/hooks/*',
                '@/features/*/store/*',
                '@/features/*/lib/*',
              ],
              message:
                'Import from the feature barrel (@/features/<name>) instead — never reach into another feature\'s internals. Same-feature code should use a relative import (./ or ../), not this alias form.',
            },
          ],
        },
      ],
    },
  },
])
