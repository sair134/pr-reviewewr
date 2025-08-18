// src/adapters/javaAdapter.ts
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

export async function runJavaChecks(filePath: string, content: string): Promise<Diagnostic[]> {
  const tmp = await writeTmp(filePath, content);
  
  // You must have checkstyle installed and a config XML
  // e.g., brew install checkstyle OR download from https://checkstyle.org
  // And have a config like google_checks.xml or sun_checks.xml
  const configPath = path.resolve('./checkstyle.xml'); // path to your config
  
  return new Promise((resolve, reject) => {
    const proc = spawn('checkstyle', [
      '-c', configPath,
      '-f', 'xml',
      tmp
    ]);
    
    let out = '';
    let err = '';
    
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    
    proc.on('close', async () => {
      try {
        await fs.unlink(tmp).catch(() => {});
        
        if (!out.trim()) {
          return resolve([]);
        }
        
        // Parse XML output
        const diagnostics: Diagnostic[] = [];
        const matches = out.matchAll(/<error line="(\d+)" column="(\d+)" severity="(\w+)" message="([^"]+)" source="([^"]+)"\/>/g);
        for (const m of matches) {
          diagnostics.push({
            file: filePath,
            line: parseInt(m[1], 10),
            col: parseInt(m[2], 10),
            severity: m[3] as 'error' | 'warning',
            message: m[4],
            rule: m[5]
          });
        }
        
        resolve(diagnostics);
      } catch (e) {
        reject(err || e);
      }
    });
  });
}
