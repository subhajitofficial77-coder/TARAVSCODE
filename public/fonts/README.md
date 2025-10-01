# Fonts for Text3D

This directory contains Three.js-compatible font JSON files for use with Drei's `<Text3D>` component.

## Adding Fonts

1. Download a TTF/OTF font (e.g., Inter Bold, Roboto Bold)
2. Convert to Three.js JSON format using Facetype.js:
   - Visit: https://gero3.github.io/facetype.js/
   - Upload your font file
   - Download the generated JSON file
3. Place the resulting `*.json` in this folder and name it `Inter_Bold.json`.
4. Run `node ../scripts/validate-font.js` to ensure the file contains glyphs.
Conversion and validation steps (recommended):

1. Open https://gero3.github.io/facetype.js/ in your browser.
2. Upload the Inter Bold TTF/OTF (or another font you have rights to) and export as "three.js" JSON.
3. Save the exported JSON as `Inter_Bold.json` into this folder (`public/fonts`).
4. From the project root run:

    npm run validate-font

    This will check the file exists and contains a non-empty `glyphs` object. If it reports a failure, the exported JSON is likely a stub or malformed.

Notes:
- Do NOT commit TTF/OTF binaries unless you own the fonts or have appropriate licensing. Commit only the generated Three.js JSON if your license allows.
- If you prefer to keep the font out of the repo, place it locally and update `components/hero/TaraText3D.tsx` to point to your local path during development.
4. Use it in the component: `font={'/fonts/Inter_Bold.json'}`
