export async function readStdin() {
    return new Promise((resolve) => {
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        process.stdin.on('end', () => {
            try {
                resolve(JSON.parse(data));
            }
            catch {
                resolve({});
            }
        });
        // Timeout safety — don't hang if stdin is empty
        setTimeout(() => resolve({}), 500);
    });
}
//# sourceMappingURL=stdin.js.map