import { ESLint } from 'eslint';

export async function lintCode(code: string, filePath = 'file.ts') {
  const eslint = new ESLint({
    overrideConfigFile: true, // don't look for a file
    overrideConfig: [
      {
        files: ['**/*.ts', '**/*.js', '**/*.svelte'],
        languageOptions: {
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
        },
        rules: {
          semi: ['error', 'always'],
          quotes: ['error', 'single'],
        },
      },
    ],
  });

  const results = await eslint.lintText(code, { filePath });

  return results[0]?.messages.map((msg) => ({
    file: filePath,
    line: msg.line,
    col: msg.column,
    severity: msg.severity == 1 ? 'error' : 'warning' as 'error' | 'warning',
    message: msg.message,
    ruleId: msg.ruleId ?? 'unknown',
  })) || [];
}
