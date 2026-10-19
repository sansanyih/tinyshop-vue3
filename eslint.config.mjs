import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', 'unpackage/**', 'coverage/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: 'readonly',
        wx: 'readonly',
        getCurrentPages: 'readonly',
        UniApp: 'readonly'
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      // uni-app 的页面组件是单文件即页面，强制多词命名没有意义
      'vue/multi-word-component-names': 'off',
      // 纯样式规则交给 Prettier
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/first-attribute-linebreak': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-console': 'off',
      // Mock / 存储不可用时允许空 catch，但不允许静默吞掉大段逻辑
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    // 截图 / 流程验证脚本跑在 Node 里，属于开发工具链，放宽部分规则
    files: ['scripts/**/*.mjs', '*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-empty': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  prettier
)
