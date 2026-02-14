interface SnippetParams {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

type Language = 'curl' | 'javascript' | 'python' | 'go' | 'rust';

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
    { language: 'rust', label: 'Rust', code: generateRust(params) },
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

function generateRust({ method, url, headers, body }: SnippetParams): string {
  const lines = [
    'use reqwest::header::{HeaderMap, HeaderValue};',
    '',
    '#[tokio::main]',
    'async fn main() -> Result<(), reqwest::Error> {',
    '    let client = reqwest::Client::new();',
  ];

  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    lines.push('');
    lines.push('    let mut headers = HeaderMap::new();');
    for (const [key, value] of headerEntries) {
      lines.push(`    headers.insert("${key}", HeaderValue::from_static("${value}"));`);
    }
  }

  lines.push('');

  const m = method.toLowerCase();
  const builderParts = [`    let response = client.${m}("${url}")`];

  if (headerEntries.length > 0) {
    builderParts.push('        .headers(headers)');
  }

  if (body) {
    builderParts.push(`        .body(r#"${body}"#.to_string())`);
  }

  builderParts.push('        .send()');
  builderParts.push('        .await?;');

  lines.push(builderParts.join('\n'));
  lines.push('');
  lines.push('    let body = response.text().await?;');
  lines.push('    println!("{}", body);');
  lines.push('');
  lines.push('    Ok(())');
  lines.push('}');

  return lines.join('\n');
}
