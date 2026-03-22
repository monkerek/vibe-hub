import type { StdinData } from '../types.js';

export async function readStdin(): Promise<StdinData> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk: string) => {
      data += chunk;
    });
    // Clear the timeout when stdin actually finishes — prevents the race where
    // the timeout fires before a slow pipe delivers its data.
    const timer = setTimeout(() => resolve({}), 500);
    process.stdin.on('end', () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(data) as StdinData);
      } catch {
        resolve({});
      }
    });
  });
}
