import { execFileSync } from 'node:child_process';
import { get } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const composeFile = resolve(__dirname, '..', '..', 'docker-compose.yml');
const seedFile = resolve(__dirname, '..', '..', 'testdata', 'create-tables.sql');

function dockerCompose(...args: string[]): void {
  execFileSync('docker', ['compose', '-f', composeFile, ...args], { stdio: 'inherit' });
}

function mariadbExec(sql: string): void {
  execFileSync(
    'docker',
    ['compose', '-f', composeFile, 'exec', '-T', 'mariadb', 'mariadb', '--force', '-uroot', '-pttv01'],
    { input: sql, stdio: ['pipe', 'ignore', 'ignore'] }
  );
}

function isMariadbReady(): boolean {
  try {
    execFileSync(
      'docker',
      ['compose', '-f', composeFile, 'exec', '-T', 'mariadb', 'mariadb', '-uroot', '-pttv01', '-e', 'SELECT 1'],
      { stdio: 'ignore' }
    );
    return true;
  } catch {
    return false;
  }
}

function isBackendReady(): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const request = get('http://localhost:9000/api/types/all', (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => resolvePromise(response.statusCode === 200 && body.includes('Herren A')));
    });
    request.on('error', () => resolvePromise(false));
    request.setTimeout(3000, () => {
      request.destroy();
      resolvePromise(false);
    });
  });
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForMariadb(timeoutMs = 120000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isMariadbReady()) {
      return;
    }
    await sleep(2000);
  }
  throw new Error('MariaDB did not become ready in time');
}

async function waitForBackend(timeoutMs = 180000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isBackendReady()) {
      return;
    }
    await sleep(2000);
  }
  throw new Error('Backend did not become ready in time');
}

export async function resetDatabase(): Promise<void> {
  dockerCompose('up', '-d', 'mariadb', 'backend');
  await waitForMariadb();
  mariadbExec(`DROP DATABASE IF EXISTS tournamentManager;\n${readFileSync(seedFile, 'utf8')}`);
  dockerCompose('restart', 'backend');
  await waitForBackend();
}
