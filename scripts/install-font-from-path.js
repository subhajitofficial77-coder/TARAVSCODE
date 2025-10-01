const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

if (process.argv.length < 3) {
  console.error('Usage: node install-font-from-path.js /path/to/converted-font.json');
  process.exit(2);
}

const src = path.resolve(process.argv[2]);
const destDir = path.resolve(__dirname, '../public/fonts');
const dest = path.join(destDir, 'Inter_Bold.json');

if (!fs.existsSync(src)) {
  console.error('Source file does not exist:', src);
  process.exit(2);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copied font to', dest);

// Run validator
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const r = spawnSync(npm, ['run', 'validate-font'], { stdio: 'inherit' });
process.exit(r.status || 0);
