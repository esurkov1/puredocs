import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pureDocsHtml } from 'puredocs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

describe('CDN', () => {
  it('UMD bundle exists and exposes PureDocs global', () => {
    const umdPath = path.join(distDir, 'puredocs.umd.js');
    expect(existsSync(umdPath)).toBe(true);

    const umd = readFileSync(umdPath, 'utf8');
    expect(umd).toContain('PureDocs');
    expect(umd).toContain('bootstrap');
    expect(umd).toContain('(function');
  });

  it('UMD exposes PureDocs.bootstrap at top level', () => {
    const umd = readFileSync(path.join(distDir, 'puredocs.umd.js'), 'utf8');
    expect(umd).toContain('m.bootstrap=s.bootstrap');
  });

  it('CSS bundle exists', () => {
    const cssPath = path.join(distDir, 'puredocs.css');
    expect(existsSync(cssPath)).toBe(true);

    const css = readFileSync(cssPath!, 'utf8');
    expect(css.length).toBeGreaterThan(1000);
    expect(css).toMatch(/\.sidebar|:root|--/);
  });

  it('html() produces CDN-compatible bootstrap config', () => {
    const html = pureDocsHtml({
      specUrl: 'https://unpkg.com/example/spec.json',
      title: 'CDN API',
    });

    expect(html).toContain('.bootstrap(');
    expect(html).toContain('https://unpkg.com/example/spec.json');
    expect(html).toContain('specUrl');
  });

  it('HTML works with CDN script href pattern (no inline script)', () => {
    const template = (payload: { css: string; script: string; bootstrapScript: string; pageTitle: string }) =>
      `<!DOCTYPE html>
<html>
<head><title>${payload.pageTitle}</title></head>
<body>
  <script src="https://unpkg.com/puredocs/dist/puredocs.umd.js"><\/script>
  <script>${payload.bootstrapScript}<\/script>
</body>
</html>`;

    const html = pureDocsHtml(
      { specUrl: '/api.json', title: 'CDN' },
      template,
    );

    expect(html).toContain('unpkg.com/puredocs');
    expect(html).toContain('.bootstrap(');
  });
});
