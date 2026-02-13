interface SnippetParams {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

type Language = 'curl' | 'javascript' | 'python' | 'go';

export interface Snippet {
  language: Language;
  label: string;
  code: string;
}

/** Generate code snippets for multiple languages */
export function generateSnippets(params: SnippetParams): Snippet[] {
  return [
    { language: 'curl', label: 'cURL', code: generateCurl(params) },
    { language: 'javascript', label: 'JavaScript', code: generateJS(params) },
    { language: 'python', label: 'Python', code: generatePython(params) },
    { language: 'go', label: 'Go', code: generateGo(params) },
  ];
}

function generateCurl({ method, url, headers, body }: SnippetParams): string {
  const lines = [`curl -X ${method.toUpperCase()} '${url}'`];

  for (const [key, value] of Object.entries(headers)) {
    lines.push(`  -H '${key}: ${value}'`);
  }

  if (body) {
    lines.push(`  -d '${body}'`);
  }

  return lines.join(' \\\n');
}

function generateJS({ method, url, headers, body }: SnippetParams): string {
  const opts: string[] = [];
  opts.push(`  method: '${method.toUpperCase()}'`);

  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    const h = headerEntries.map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    opts.push(`  headers: {\n${h}\n  }`);
  }

  if (body) {
    opts.push(`  body: JSON.stringify(${body})`);
  }

  return `const response = await fetch('${url}', {\n${opts.join(',\n')}\n});\n\nconst data = await response.json();\nconsole.log(data);`;
}

function generatePython({ method, url, headers, body }: SnippetParams): string {
  const lines = ['import requests', ''];

  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    const h = headerEntries.map(([k, v]) => `    "${k}": "${v}"`).join(',\n');
    lines.push(`headers = {\n${h}\n}`);
  }

  if (body) {
    lines.push(`payload = ${body}`);
  }

  const args = [`"${url}"`];
  if (headerEntries.length > 0) args.push('headers=headers');
  if (body) args.push('json=payload');

  lines.push('');
  lines.push(`response = requests.${method.toLowerCase()}(${args.join(', ')})`);
  lines.push('print(response.json())');

  return lines.join('\n');
}

function generateGo({ method, url, headers, body }: SnippetParams): string {
  const lines = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
  ];

  if (body) {
    lines.push('    "strings"');
  }

  lines.push(')', '', 'func main() {');

  if (body) {
    lines.push(`    body := strings.NewReader(\`${body}\`)`);
    lines.push(`    req, err := http.NewRequest("${method.toUpperCase()}", "${url}", body)`);
  } else {
    lines.push(`    req, err := http.NewRequest("${method.toUpperCase()}", "${url}", nil)`);
  }

  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');

  for (const [key, value] of Object.entries(headers)) {
    lines.push(`    req.Header.Set("${key}", "${value}")`);
  }

  lines.push('');
  lines.push('    resp, err := http.DefaultClient.Do(req)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    defer resp.Body.Close()');
  lines.push('');
  lines.push('    data, _ := io.ReadAll(resp.Body)');
  lines.push('    fmt.Println(string(data))');
  lines.push('}');

  return lines.join('\n');
}
