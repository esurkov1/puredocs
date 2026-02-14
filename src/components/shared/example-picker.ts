import type { SpecMediaType, SpecExample, SpecParameter } from '../../core/types';
import { generateExample } from '../../core/parser';

export interface ParamExampleSet {
  name: string;
  summary?: string;
  values: Record<string, string>;
}

/** Extract example sets from path/query parameters (for GET, DELETE etc.) */
export function extractParamExampleSets(params: SpecParameter[]): ParamExampleSet[] {
  if (params.length === 0) return [];

  const getParamValue = (param: SpecParameter, setName: string | null, enumIdx?: number): string => {
    if (setName && param.examples?.[setName] !== undefined) {
      const ex = param.examples[setName] as SpecExample | { value?: unknown };
      const v = (ex as { value?: unknown })?.value ?? (ex as SpecExample).value;
      if (v !== undefined && v !== null) return String(v);
    }
    if (enumIdx !== undefined && param.schema?.enum && param.schema.enum[enumIdx] !== undefined) {
      return String(param.schema.enum[enumIdx]);
    }
    if (param.example !== undefined && param.example !== null) return String(param.example);
    if (param.schema?.example !== undefined && param.schema.example !== null) return String(param.schema.example);
    if (param.schema?.default !== undefined && param.schema.default !== null) return String(param.schema.default);
    if (param.schema?.enum && param.schema.enum.length > 0) return String(param.schema.enum[0]);
    if (param.schema?.type === 'integer' || param.schema?.type === 'number') return '0';
    if (param.schema?.type === 'boolean') return 'true';
    return param.in === 'path' ? 'id' : 'value';
  };

  const setNames = new Set<string>();
  for (const param of params) {
    if (param.examples && typeof param.examples === 'object') {
      for (const name of Object.keys(param.examples)) setNames.add(name);
    }
  }

  const sets: ParamExampleSet[] = [];

  if (setNames.size > 0) {
    for (const name of setNames) {
      const values: Record<string, string> = {};
      for (const param of params) {
        values[param.name] = getParamValue(param, name);
      }
      const firstParam = params.find((p) => p.examples?.[name]);
      const ex = firstParam?.examples?.[name] as SpecExample | undefined;
      sets.push({ name, summary: ex?.summary, values });
    }
  } else {
    const paramWithEnum = params.find((p) => p.schema?.enum && p.schema.enum.length > 1);
    if (paramWithEnum?.schema?.enum) {
      for (let i = 0; i < paramWithEnum.schema.enum.length; i++) {
        const values: Record<string, string> = {};
        for (const param of params) {
          values[param.name] = param === paramWithEnum ? getParamValue(param, null, i) : getParamValue(param, null);
        }
        const label = String(paramWithEnum.schema.enum[i]);
        sets.push({ name: label, values });
      }
    } else {
      const defaultValues: Record<string, string> = {};
      for (const param of params) {
        defaultValues[param.name] = getParamValue(param, null);
      }
      sets.push({ name: 'Default', values: defaultValues });
    }
  }

  return sets;
}

export interface ExampleOption {
  name: string;
  summary?: string;
  description?: string;
  value: unknown;
}

/** Extract named examples from a media type, with schema fallback */
export function extractExamples(mediaType: SpecMediaType): ExampleOption[] {
  const options: ExampleOption[] = [];

  // Named examples (OAS 3.x)
  if (mediaType.examples && typeof mediaType.examples === 'object') {
    for (const [name, ex] of Object.entries(mediaType.examples)) {
      options.push({
        name,
        summary: ex.summary,
        description: ex.description,
        value: ex.value,
      });
    }
  }

  // Single example
  if (options.length === 0 && mediaType.example !== undefined) {
    options.push({ name: 'Default', value: mediaType.example });
  }

  // Schema-generated fallback
  if (options.length === 0 && mediaType.schema) {
    const generated = generateExample(mediaType.schema);
    if (generated !== undefined) {
      options.push({ name: 'Generated', value: generated });
    }
  }

  return options;
}

/** Get display label for example, without duplicating summary/description */
export function getExampleLabel(ex: ExampleOption): string {
  const parts = [ex.summary, ex.description].filter(Boolean);
  return [...new Set(parts)].join(' — ') || ex.name;
}

/** Format an example value as pretty JSON string */
export function formatExampleValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
