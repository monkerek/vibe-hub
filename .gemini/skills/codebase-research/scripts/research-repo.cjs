const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node research-repo.cjs <repo-url>');
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
    console.log('\n--- Project Structure (Top Level) ---');
    const tree = execSync(`ls -R ${tempDir} | head -n 50`, { encoding: 'utf8' });
    console.log(tree.split('\n').map(line => line.replace(tempDir, '.')).join('\n'));

    console.log(`\nTemp directory: ${tempDir}`);
    console.log('\n--- Discovery Options ---');
    console.log(`1. Basic: Use 'grep_search' and 'read_file' in ${tempDir}`);
    console.log(`2. Advanced: Run Python analyzer (requires tree-sitter):`);
    console.log(`   python3 .gemini/skills/codebase-research/scripts/codebase-research.py find "auth" ${tempDir}`);
    console.log(`\nFollow the optimized workflow in .gemini/skills/codebase-research/skill.md`);
  } catch (err) {
    console.error(`Failed to clone repository: ${err.message}`);
    process.exit(1);
  }
}

main();
