/** Syntax highlighting for supported languages, fallback is escapeHtml */
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import go from 'highlight.js/lib/languages/go';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import { escapeHtml, looksLikeJson } from '../helpers/text';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('go', go);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);

const langMap: Record<string, string> = {
  curl: 'bash',
  go: 'go',
  json: 'json',
  py: 'python',
  python: 'python',
};

const SUPPORTED = new Set(['bash', 'curl', 'go', 'json', 'py', 'python']);

export function highlightCode(code: string, language: string): string {
  if (language === 'plaintext' || language === '' || !SUPPORTED.has(language)) {
    return escapeHtml(code);
  }
  const lang = langMap[language] ?? (looksLikeJson(code) ? 'json' : 'bash');
  try {
    const result = hljs.highlight(code, { language: lang });
    return result.value;
  } catch {
    return escapeHtml(code);
  }
}

export { looksLikeJson };
