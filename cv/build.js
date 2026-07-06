// Build: cv.yaml -> dist/cv.html -> dist/cv.pdf -> ../assets/reports/CV.pdf
// Usage: npm run build   (from the cv/ directory)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { render } = require('./src/render');

const CV_DIR = __dirname;
const YAML_PATH = path.join(CV_DIR, 'cv.yaml');
const CSS_PATH = path.join(CV_DIR, 'style.css');
const DIST_DIR = path.join(CV_DIR, 'dist');
const HTML_OUT = path.join(DIST_DIR, 'cv.html');
const PDF_OUT = path.join(DIST_DIR, 'cv.pdf');
const SITE_PDF_OUT = path.join(CV_DIR, '..', 'assets', 'reports', 'CV.pdf');

// A4 dimensions in CSS px at 96dpi — used only to check whether the
// rendered content overflows a single page. The PDF itself is produced
// with format: 'A4', so page size is authoritative there regardless.
const MM_TO_PX = 96 / 25.4;
const A4_WIDTH_PX = Math.round(210 * MM_TO_PX);
const A4_HEIGHT_PX = Math.round(297 * MM_TO_PX);

async function main() {
  fs.mkdirSync(DIST_DIR, { recursive: true });

  const html = render(YAML_PATH, CSS_PATH);
  fs.writeFileSync(HTML_OUT, html, 'utf8');

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX });
    await page.emulateMediaType('print');
    await page.goto(`file://${HTML_OUT}`, { waitUntil: 'networkidle0' });

    const contentHeightPx = await page.evaluate(
      () => document.querySelector('.page').scrollHeight
    );
    // Safety buffer: PDF pagination can round sub-pixel differently than
    // screen layout, so a few px of "fits" here isn't reliably one page in
    // the actual PDF (observed 2-page output with only 2px to spare).
    // Require real headroom before calling it safe.
    const SAFETY_BUFFER_PX = 20;
    if (contentHeightPx > A4_HEIGHT_PX - SAFETY_BUFFER_PX) {
      const overBy = Math.round(
        ((contentHeightPx - A4_HEIGHT_PX) / A4_HEIGHT_PX) * 100
      );
      console.warn(
        `\n⚠️  Warning: CV content is at or over one A4 page (~${overBy >= 0 ? '+' : ''}${overBy}% vs page height).\n` +
          `   Trim cv.yaml (fewer entries/shorter text) or shrink style.css sizing.\n`
      );
    } else {
      console.log('✓ Fits on one A4 page.');
    }

    await page.pdf({
      path: PDF_OUT,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }

  fs.mkdirSync(path.dirname(SITE_PDF_OUT), { recursive: true });
  fs.copyFileSync(PDF_OUT, SITE_PDF_OUT);

  console.log(`✓ Wrote ${path.relative(CV_DIR, PDF_OUT)}`);
  console.log(`✓ Copied to ${path.relative(CV_DIR, SITE_PDF_OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
