import type { SchemaObject } from '../core/types';

export function getSchemaTypeLabel(schema: SchemaObject): string {
  if (!schema) return 'any';
  if (schema.$ref) return schema.$ref.split('/').pop() || 'ref';

  let type = schema.type || '';
  if (schema.allOf) type = 'allOf';
  else if (schema.oneOf) type = 'oneOf';
  else if (schema.anyOf) type = 'anyOf';
  else if (schema.enum) type = 'enum';
  else if (schema.format) type += `<${schema.format}>`;

  if (schema.type === 'array' && schema.items && !schema.enum) {
    const itemType = schema.items.type || schema.items.$ref?.split('/').pop() || 'any';
    type = `${itemType}[]`;
  }

  if (schema.nullable) type += ' | null';
  return type || 'object';
}
