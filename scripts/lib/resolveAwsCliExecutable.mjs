/**
 * Resolve AWS CLI executable (PATH or default Windows install after winget).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const WINDOWS_CANDIDATES = [
  process.env.AWS_CLI_PATH,
  'C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe',
  'C:\\Program Files (x86)\\Amazon\\AWSCLIV2\\aws.exe',
].filter(Boolean);

/**
 * @returns {string}
 */
export function resolveAwsCliExecutable() {
  const fromEnv = process.env.AWS_CLI_EXECUTABLE?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  const pathProbe = spawnSync('where', ['aws'], { encoding: 'utf8', shell: true });
  if (pathProbe.status === 0) {
    const first = (pathProbe.stdout ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (first && fs.existsSync(first)) {
      return first;
    }
  }

  for (const candidate of WINDOWS_CANDIDATES) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'AWS CLI not found. Install AWS CLI v2, restart the terminal, or set AWS_CLI_EXECUTABLE to aws.exe path.'
  );
}
