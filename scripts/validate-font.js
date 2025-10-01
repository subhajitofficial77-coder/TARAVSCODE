const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'fonts', 'Inter_Bold.json');

function fail(code, msg) {
  console.error(msg);
  process.exit(code);
}

if (!fs.existsSync(file)) {
  fail(2, 'Font JSON not found at public/fonts/Inter_Bold.json');
}

try {
  const raw = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(raw);
  if (!json.glyphs || Object.keys(json.glyphs).length === 0) {
    fail(3, 'Font JSON appears to be a stub: missing glyphs. Please convert a TTF/OTF to a full Three.js font JSON.');
  }

  if (!json.boundingBox) {
    console.warn('Warning: font missing "boundingBox" field. Some Text3D features may not work as expected.');
  }

  if (!json.underlineThickness && json.underlineThickness !== 0) {
    console.warn('Warning: font missing "underlineThickness" field. This is optional but recommended.');
  }

  console.log('Font JSON validated: glyphs present (count=' + Object.keys(json.glyphs).length + ').');
  process.exit(0);
} catch (err) {
  fail(4, 'Error parsing font JSON: ' + err.message);
}
