import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const frontend = process.cwd();
const backend = path.resolve(frontend, '../kaleo_youth_backend');
const evidence = path.resolve(frontend, '.omo/evidence/final');

await mkdir(evidence, { recursive: true });

const gates = [
  { name: 'frontend-lint', cwd: frontend, command: 'npm', args: ['run', 'lint'] },
  { name: 'frontend-build', cwd: frontend, command: 'npm', args: ['run', 'build'] },
  { name: 'backend-lint', cwd: backend, command: 'npm', args: ['run', 'lint'] },
  { name: 'backend-build', cwd: backend, command: 'npm', args: ['run', 'build'] },
  {
    name: 'backend-unit',
    cwd: backend,
    command: 'npm',
    args: ['test', '--', '--runInBand'],
  },
  {
    name: 'backend-e2e',
    cwd: backend,
    command: 'npm',
    args: ['run', 'test:e2e', '--', '--runInBand'],
  },
];

for (const gate of gates) {
  const output = await new Promise((resolve, reject) => {
    const child = spawn(gate.command, gate.args, {
      cwd: gate.cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let transcript = '';
    child.stdout.on('data', (chunk) => {
      transcript += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      transcript += chunk;
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, transcript }));
  });
  await Promise.all([
    writeFile(path.join(evidence, `${gate.name}.txt`), output.transcript),
    writeFile(path.join(evidence, `${gate.name}.exit`), `${output.code}\n`),
  ]);
  if (output.code !== 0) process.exit(output.code);
}
