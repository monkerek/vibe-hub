const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node research_repo.cjs <repo-url>');
    process.exit(1);
  }

  const repoUrl = args[0];
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  
  // Use project temp directory if available, otherwise workspace .tmp
  const projectTempDir = process.env.GEMINI_PROJECT_TEMP_DIR || path.join(process.cwd(), '.tmp');
  if (!fs.existsSync(projectTempDir)) {
    fs.mkdirSync(projectTempDir, { recursive: true });
  }
  const tempDir = path.join(projectTempDir, `research-${repoName}-${Date.now()}`);

  console.log(`Cloning ${repoUrl} into ${tempDir}...`);

  try {
    execSync(`git clone --depth 1 ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
    console.log(`Successfully cloned ${repoName}.`);

    // List main files to give the agent a quick overview
    console.log('\n--- Project Structure ---');
    const tree = execSync(`find ${tempDir} -maxdepth 2 -not -path '*/.*'`, { encoding: 'utf8' });
    console.log(tree.split('\n').map(line => line.replace(tempDir, '.')).join('\n'));

    console.log(`\nTemp directory: ${tempDir}`);
    console.log('Use this path for further research.');
  } catch (err) {
    console.error(`Failed to clone repository: ${err.message}`);
    process.exit(1);
  }
}

main();
