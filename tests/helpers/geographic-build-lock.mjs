import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../../', import.meta.url)));
const key = createHash('sha256').update(root).digest('hex');
const lockPath = join(tmpdir(), `mapas-gps-geographic-build-${key}.lock`);
const lockProgram = `
import fcntl, sys
with open(sys.argv[1], 'a') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    print('locked', flush=True)
    sys.stdin.read()
`;

// Node runs test files in separate processes. Hold the OS lock until all async
// reads finish, not just until the builder exits. Closing stdin also releases
// the lock if the Node process is interrupted, without stale lock directories.
export async function withGeographicBuildLock(checkBuild) {
  const holder = spawn('python3', ['-c', lockProgram, lockPath]);
  let stderr = '';
  holder.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  const exited = new Promise((resolve, reject) => {
    holder.once('error', reject);
    holder.once('close', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Geographic build lock exited (${signal ?? code}): ${stderr}`));
    });
  });
  // A lock-holder failure must be reported even if it happens during assertions.
  exited.catch(() => {});
  try {
    await Promise.race([
      new Promise(resolve => holder.stdout.once('data', resolve)),
      exited.then(() => { throw new Error('Geographic build lock closed before acquisition'); }),
    ]);
    return await checkBuild();
  } finally {
    holder.stdin.end();
    await exited;
  }
}
