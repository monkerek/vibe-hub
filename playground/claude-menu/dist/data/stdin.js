export async function readStdin() {
    return new Promise((resolve) => {
        // When stdin is a TTY (no pipe), there will never be an 'end' event and no
        // data will arrive — resolve immediately rather than waiting for a timeout.
        if (process.stdin.isTTY) {
            resolve({});
            return;
        }
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        // Allow up to 2 s for slow pipes (e.g. pipes with buffering or latency).
        // The timeout is cleared when 'end' fires, so fast pipes pay no penalty.
        const timer = setTimeout(() => resolve({}), 2000);
        process.stdin.on('end', () => {
            clearTimeout(timer);
            try {
                resolve(JSON.parse(data));
            }
            catch {
                resolve({});
            }
        });
    });
}
//# sourceMappingURL=stdin.js.map