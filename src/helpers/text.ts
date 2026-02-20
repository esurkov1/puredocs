export function looksLikeJson(str: string): boolean {
  const text = str.trim();
  return (text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'));
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Check if URL is safe for href (http/https only) */
function isSafeUrl(url: string): boolean {
  const t = url.trim().toLowerCase();
  return t.startsWith('http://') || t.startsWith('https://');
}

/**
 * Convert basic Markdown to HTML. No external deps.
 * Supports: **bold**, *italic*, `code`, [link](url), newlines.
 * Escapes HTML and sanitizes links for XSS safety.
 */
export function markdownToHtml(md: string): string {
  if (!md || typeof md !== 'string') return '';
  let s = escapeHtml(md);

  // Inline code: `...` — process before other inline so we don't parse inside
  s = s.replace(/`([^`]*)`/g, '<code>$1</code>');

  // Links: [text](url) — only http/https
  s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, text, url) => {
    if (isSafeUrl(url)) {
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return `[${text}](${escapeHtml(url)})`;
  });

  // Bold: **text** or __text__
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* only (underscore skipped to avoid snake_case like file_name)
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Line breaks
  s = s.replace(/\n\n+/g, '</p><p class="md-p">');
  s = s.replace(/\n/g, '<br>');
  return s ? `<p class="md-p">${s}</p>` : '';
}
