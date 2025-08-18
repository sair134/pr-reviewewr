// src/orchestrator.ts
import { runPythonChecks } from './adapters/pythonAdapter';
import { runGoChecks } from './adapters/goAdapter';
import { lintCode } from './linter';

export type Diagnostic = {
  file: string;
  line?: number;
  col?: number;
  severity: 'error'|'warning'|'info';
  message: string;
  rule?: string;
};

type Analyzer = (filePath: string, content: string) => Promise<Diagnostic[]>;

const analyzers: Record<string, Analyzer> = {
  // Frontend JS/TS ecosystem
  js: async (fp, c) => await lintCode(c, fp),
  ts: async (fp, c) => await lintCode(c, fp),
  jsx: async (fp, c) => await lintCode(c, fp),
  tsx: async (fp, c) => await lintCode(c, fp),
  vue: async (fp, c) => await lintCode(c, fp),
  svelte: async (fp, c) => await lintCode(c, fp),
  mjs: async (fp, c) => await lintCode(c, fp),
  cjs: async (fp, c) => await lintCode(c, fp),
  // java: runJavaChecks,
  // cs: runCSharpChecks,


  // Python
  py: runPythonChecks,

  // Go
  go: runGoChecks,
};

export async function analyzeFile(filePath: string, content: string): Promise<Diagnostic[]> {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const handler = ext ? analyzers[ext] : null;

  if (handler) {
    return handler(filePath, content);
  }
  
  return []; // Fallback for unhandled languages
}


