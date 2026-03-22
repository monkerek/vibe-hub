import type { StdinData } from '../types.js';

export async function readStdin(): Promise<StdinData> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk: string) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data) as StdinData);
      } catch {
        resolve({});
      }
    });
    // Timeout safety — don't hang if stdin is empty
    setTimeout(() => resolve({}), 500);
  });
}
