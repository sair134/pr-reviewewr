// src/adapters/goAdapter.ts
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

export async function runGoChecks(filePath: string, content: string): Promise<Diagnostic[]> {
  const tmp = await writeTmp(filePath, content);
  // We'll run `golangci-lint` or `go vet`. For minimal: run `go vet` on a temp single-file module.
  // Simpler approach: use `golangci-lint run --out-format json` if installed.
  return new Promise((resolve, reject) => {
    const proc = spawn('golangci-lint', ['run', '--out-format', 'json', tmp]);
    let out = '';
    let err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', async (code) => {
      try {
        await fs.unlink(tmp).catch(()=>{});
        if (!out) return resolve([]);
        const parsed = JSON.parse(out);
        // parsed.Issues => map to diagnostics
        const diagnostics: Diagnostic[] = [];
        (parsed.Issues || []).forEach((iss: any) => {
          diagnostics.push({
            file: filePath,
            line: iss.Pos.Line,
            col: iss.Pos.Column,
            severity: 'warning',
            message: `${iss.FromLinter}: ${iss.Text}`,
            rule: iss.FromLinter,
          });
        });
        resolve(diagnostics);
      } catch (e) {
        reject(err || e);
      }
    });
  });
}
