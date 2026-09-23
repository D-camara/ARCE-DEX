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
  {
    // Design tokens are enforced, not just documented (see @theme in src/index.css).
    // Covers single-color utilities and breakpoints. Gradients/shadows/filters with an
    // rgba() inside (bg-[linear-gradient(...)], shadow-[0_10px_30px_rgba(...)]) are
    // still allowed — they're one-off effects without a token equivalent.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...['Literal[value=/%s/]', 'TemplateElement[value.raw=/%s/]'].flatMap((selector) => [
          {
            selector: selector.replace('%s', String.raw`(^|[\s:'"])(bg|text|border(-[trblxy])?)-\[(rgba?\(|#)`),
            message:
              'Use a color token from @theme with an opacity modifier (e.g. bg-gilt/10, border-parchment/12) instead of a literal color.',
          },
          {
            selector: selector.replace('%s', String.raw`(min|max)-\[\d+(px|rem)\]:`),
            message: 'Use a named breakpoint from @theme (fold, xs, phone, sm, md, lg) instead of an arbitrary one.',
          },
        ]),
      ],
    },
  },
])
