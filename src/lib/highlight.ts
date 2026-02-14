/**
 * Custom regex-based syntax highlighter — zero dependencies.
 * Supports: JSON, JavaScript, Bash/curl, Go, Python.
 * ~80 lines TS → ~1.2 KB min → ~0.5 KB gzip (vs ~18 KB for highlight.js).
 */
import { escapeHtml, looksLikeJson } from '../helpers/text';

type Rule = [RegExp, string];

/* ─── Language rules (ordered by priority) ─── */

const JSON_RULES: Rule[] = [
  [/"(?:[^"\\]|\\.)*"(?=\s*:)/g, 'property'],
  [/"(?:[^"\\]|\\.)*"/g, 'string'],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, 'number'],
  [/\b(?:true|false|null)\b/g, 'literal'],
  [/[{}[\]:,]/g, 'punctuation'],
];

const BASH_RULES: Rule[] = [
  [/#.*/g, 'comment'],
  [/"(?:[^"\\]|\\.)*"|'[^']*'/g, 'string'],
  [/\$\w+|\$\{[^}]+\}/g, 'sign'],
  [/--?\w[\w-]*/g, 'sign'],
  [/\b(?:curl|wget|echo|export|if|then|else|fi|for|do|done|while|case|esac|function|return|local|set|unset|source|cd|ls|cat|grep|sed|awk|chmod|mkdir|rm|cp|mv|sudo|apt|brew|npm|pip|docker|http|https)\b/g, 'keyword'],
  [/-?\b\d+(?:\.\d+)?\b/g, 'number'],
];

const GO_RULES: Rule[] = [
  [/\/\/.*/g, 'comment'],
  [/\/\*[\s\S]*?\*\//g, 'comment'],
  [/"(?:[^"\\]|\\.)*"|`[^`]*`/g, 'string'],
  [/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, 'keyword'],
  [/\b(?:bool|byte|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|true|false|nil|iota)\b/g, 'literal'],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, 'number'],
  [/[{}[\]();:.,]/g, 'punctuation'],
];

const JS_RULES: Rule[] = [
  [/\/\/.*/g, 'comment'],
  [/\/\*[\s\S]*?\*\//g, 'comment'],
  [/`(?:[^`\\]|\\.)*`/g, 'string'],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 'string'],
  [/\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/g, 'keyword'],
  [/\b(?:true|false|null|undefined|NaN|Infinity)\b/g, 'literal'],
  [/\b(?:console|document|window|fetch|Promise|Array|Object|String|Number|Boolean|Map|Set|JSON|Math|Date|RegExp|Error)\b/g, 'sign'],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, 'number'],
  [/[{}[\]();:.,]/g, 'punctuation'],
];

const PYTHON_RULES: Rule[] = [
  [/#.*/g, 'comment'],
  [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, 'string'],
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 'string'],
  [/\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, 'keyword'],
  [/\b(?:True|False|None)\b/g, 'literal'],
  [/@\w+/g, 'sign'],
  [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g, 'number'],
  [/[{}[\]():.,;]/g, 'punctuation'],
];

const LANG_MAP: Record<string, Rule[]> = {
  json: JSON_RULES,
  javascript: JS_RULES,
  js: JS_RULES,
  typescript: JS_RULES,
  ts: JS_RULES,
  bash: BASH_RULES,
  curl: BASH_RULES,
  go: GO_RULES,
  python: PYTHON_RULES,
  py: PYTHON_RULES,
};

/* ─── Engine ─── */

function applyRules(code: string, rules: Rule[]): string {
  let result = '';
  let pos = 0;

  while (pos < code.length) {
    let best: { start: number; end: number; cls: string } | null = null;

    for (const [re, cls] of rules) {
      re.lastIndex = pos;
      const m = re.exec(code);
      if (m && (!best || m.index < best.start || (m.index === best.start && m[0].length > best.end - best.start))) {
        best = { start: m.index, end: m.index + m[0].length, cls };
      }
    }

    if (!best) {
      result += escapeHtml(code.slice(pos));
      break;
    }

    if (best.start > pos) result += escapeHtml(code.slice(pos, best.start));
    result += `<span class="hl-${best.cls}">${escapeHtml(code.slice(best.start, best.end))}</span>`;
    pos = best.end;
  }

  return result;
}

export function highlightCode(code: string, language: string): string {
  const rules = LANG_MAP[language] ?? (looksLikeJson(code) ? JSON_RULES : null);
  if (!rules) return escapeHtml(code);
  return applyRules(code, rules);
}

export { looksLikeJson };
