const https = require('https');
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const OUT_PATH = path.join(__dirname, '..', 'public', 'fonts', 'Inter_Bold.json');
const TMP_TTF = path.join(__dirname, 'Inter-Bold.ttf');

const urls = [
  // rsms/inter repo raw (commonly available)
  'https://github.com/rsms/inter/raw/master/docs/Inter-Bold.ttf',
  // fallback: Google Fonts throwaway link (may not work reliably)
  'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf'
];

function download(url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(TMP_TTF);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(TMP_TTF)));
    }).on('error', reject);
  });
}

function commandsToPathString(commands) {
  // convert opentype.js path.commands into typeface.js style string
  // mapping: moveTo -> m, lineTo -> l, curveTo (cubic) -> b, quadTo -> q, close -> z
  const parts = [];
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        parts.push('m', Math.round(cmd.x), Math.round(-cmd.y));
        break;
      case 'L':
        parts.push('l', Math.round(cmd.x), Math.round(-cmd.y));
        break;
      case 'C':
        // cubic bezier
        parts.push('b', Math.round(cmd.x1), Math.round(-cmd.y1), Math.round(cmd.x2), Math.round(-cmd.y2), Math.round(cmd.x), Math.round(-cmd.y));
        break;
      case 'Q':
        parts.push('q', Math.round(cmd.x1), Math.round(-cmd.y1), Math.round(cmd.x), Math.round(-cmd.y));
        break;
      case 'Z':
        parts.push('z');
        break;
      default:
        // ignore
        break;
    }
  }
  return parts.join(' ');
}

async function convert(ttfPath) {
  const font = await opentype.load(ttfPath);
  // characters to include: uppercase T A R and also space
  const chars = ['T', 'A', 'R', ' '];
  const glyphs = {};

  for (const ch of chars) {
    const glyph = font.charToGlyph(ch);
    if (!glyph) continue;
    const path = glyph.getPath(0, 0, 1);
    const o = commandsToPathString(path.commands);
    glyphs[ch] = {
      o: o || '',
      ha: Math.round(glyph.advanceWidth || font.unitsPerEm)
    };
  }

  const out = {
    glyphs,
    familyName: 'Inter Bold (subset)',
    ascender: font.ascender || (font.unitsPerEm * 0.8),
    descender: font.descender || (-(font.unitsPerEm * 0.2)),
    unitsPerEm: font.unitsPerEm || 1000,
    underlineThickness: 50
  };

  // write out
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote subset font to', OUT_PATH);
}

(async () => {
  let lastErr = null;
  for (const url of urls) {
    try {
      console.log('Attempting download from', url);
      await download(url);
      console.log('Downloaded to', TMP_TTF);
      await convert(TMP_TTF);
      console.log('Conversion complete. Removing temp file.');
      try { fs.unlinkSync(TMP_TTF); } catch (e) {}
      process.exit(0);
    } catch (err) {
      console.warn('Failed to download/convert from', url, err.message);
      lastErr = err;
    }
  }
  console.error('All download attempts failed:', lastErr && lastErr.message);
  process.exit(2);
})();
