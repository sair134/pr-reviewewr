// src/adapters/pythonAdapter.ts
import fs from 'fs/promises';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import { Diagnostic } from '../orchestrator';

async function writeTmp(filePath: string, content: string) {
  const tmp = path.join(os.tmpdir(), `mcp-${Date.now()}-${path.basename(filePath)}`);
  await fs.writeFile(tmp, content);
  return tmp;
}

export async function runPythonChecks(filePath: string, content: string): Promise<Diagnostic[]> {
  const tmp = await writeTmp(filePath, content);
  // ensure pylint installed in your environment (pip install pylint)
  return new Promise((resolve, reject) => {
    const proc = spawn('pylint', ['--output-format=json', tmp]);
    let out = '';
    let err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', async (code) => {
      try {
        await fs.unlink(tmp).catch(()=>{});
        if (!out) {
          // no issues
          return resolve([]);
        }
        const parsed = JSON.parse(out);
        const diagnostics = parsed.map((p: any) => ({
          file: filePath,
          line: p.line,
          col: p.column,
          severity: p.type === 'error' ? 'error' : 'warning',
          message: `${p.symbol}: ${p.message}`,
          rule: p['message-id'] || p.symbol,
        })) as Diagnostic[];
        resolve(diagnostics);
      } catch (e) {
        reject(err || e);
      }
    });
  });
}
