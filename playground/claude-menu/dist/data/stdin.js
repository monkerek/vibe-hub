export async function readStdin() {
    return new Promise((resolve) => {
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        // Clear the timeout when stdin actually finishes — prevents the race where
        // the timeout fires before a slow pipe delivers its data.
        const timer = setTimeout(() => resolve({}), 500);
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