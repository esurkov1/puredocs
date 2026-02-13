import type { SchemaObject, SpecOperation, SpecParameter } from './types';

export interface ValidationError {
  field: string;
  message: string;
  /** 'param' | 'body' */
  kind: 'param' | 'body';
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** Validate a single parameter value against its schema */
export function validateParam(value: string, param: SpecParameter): ValidationResult {
  const schema = param.schema;

  // Required check
  if (param.required && (!value || value.trim() === '')) {
    return { valid: false, message: 'Required field' };
  }

  // Empty non-required — skip
  if (!value || value.trim() === '') {
    return { valid: true };
  }

  if (!schema) return { valid: true };

  // Type-based checks
  if (schema.type === 'integer') {
    if (!/^-?\d+$/.test(value.trim())) {
      return { valid: false, message: 'Must be an integer' };
    }
    const num = parseInt(value, 10);
    return validateNumberConstraints(num, schema);
  }

  if (schema.type === 'number') {
    if (isNaN(Number(value.trim()))) {
      return { valid: false, message: 'Must be a number' };
    }
    const num = parseFloat(value);
    return validateNumberConstraints(num, schema);
  }

  if (schema.type === 'boolean') {
    if (!['true', 'false', '1', '0'].includes(value.trim().toLowerCase())) {
      return { valid: false, message: 'Must be true or false' };
    }
  }

  // Enum
  if (schema.enum && schema.enum.length > 0) {
    if (!schema.enum.some((e) => String(e) === value.trim())) {
      return { valid: false, message: `Allowed: ${schema.enum.map(String).join(', ')}` };
    }
  }

  // String constraints
  if (schema.type === 'string' || !schema.type) {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      return { valid: false, message: `Min length: ${schema.minLength}` };
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      return { valid: false, message: `Max length: ${schema.maxLength}` };
    }
    if (schema.pattern) {
      try {
        const re = new RegExp(schema.pattern);
        if (!re.test(value)) {
          return { valid: false, message: `Must match pattern: ${schema.pattern}` };
        }
      } catch {
        // invalid regex in spec — skip
      }
    }
  }

  return { valid: true };
}

function validateNumberConstraints(num: number, schema: SchemaObject): ValidationResult {
  if (schema.minimum !== undefined && num < schema.minimum) {
    return { valid: false, message: `Minimum: ${schema.minimum}` };
  }
  if (schema.maximum !== undefined && num > schema.maximum) {
    return { valid: false, message: `Maximum: ${schema.maximum}` };
  }
  return { valid: true };
}

/** Validate the request body string */
export function validateBody(
  bodyStr: string,
  contentType: string,
  schema?: SchemaObject,
  required?: boolean,
): ValidationResult {
  if (required && (!bodyStr || bodyStr.trim() === '')) {
    return { valid: false, message: 'Request body is required' };
  }

  if (!bodyStr || bodyStr.trim() === '') {
    return { valid: true };
  }

  // JSON validation
  if (contentType.includes('json')) {
    try {
      JSON.parse(bodyStr);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      return { valid: false, message: `Invalid JSON: ${msg}` };
    }
  }

  return { valid: true };
}

/** Validate all fields in a Try It form. Returns array of errors (empty = valid). */
export function validateAll(
  container: HTMLElement,
  operation: SpecOperation,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate params
  const paramInputs = container.querySelectorAll('[data-param-name]') as NodeListOf<HTMLInputElement>;
  paramInputs.forEach((input) => {
    const paramName = input.getAttribute('data-param-name')!;
    const param = operation.parameters.find((p) => p.name === paramName);
    if (!param) return;

    const result = validateParam(input.value, param);
    if (!result.valid) {
      errors.push({ field: paramName, message: result.message || 'Invalid', kind: 'param' });
    }
  });

  // Validate body
  if (operation.requestBody) {
    const contentTypes = Object.keys(operation.requestBody.content || {});
    const defaultCT = contentTypes[0] || 'application/json';
    const schema = operation.requestBody.content?.[defaultCT]?.schema;

    const bodyTextarea = container.querySelector('[data-field="body"]') as HTMLTextAreaElement | null;
    const bodyStr = bodyTextarea?.value || '';

    // Skip body validation for multipart (files handled separately)
    if (!defaultCT.includes('multipart')) {
      const result = validateBody(bodyStr, defaultCT, schema, operation.requestBody.required);
      if (!result.valid) {
        errors.push({ field: 'body', message: result.message || 'Invalid body', kind: 'body' });
      }
    }
  }

  return errors;
}
