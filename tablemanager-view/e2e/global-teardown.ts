import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

async function globalTeardown(): Promise<void> {
  // In CI the workflow starts and owns the docker compose stack, so we must not tear it down.
  if (process.env['CI']) {
    return;
  }

  const composeFile = resolve(__dirname, '..', '..', 'docker-compose.yml');
  try {
    execFileSync('docker', ['compose', '-f', composeFile, 'down'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to tear down docker compose:', error);
  }
}

export default globalTeardown;
