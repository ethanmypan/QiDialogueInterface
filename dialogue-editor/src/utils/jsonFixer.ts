/**
 * JSON Fixer Utility
 *
 * Fixes malformed JSON files that are missing array brackets.
 * Common issue: {obj1},{obj2},{obj3} instead of [{obj1},{obj2},{obj3}]
 */

export interface FixResult {
  wasFixed: boolean;
  content: string;
  message: string;
}

/**
 * Fix malformed JSON by wrapping in array brackets if needed
 *
 * @param content - Raw JSON string content
 * @returns FixResult with fixed content and metadata
 */
export function fixJSONFormat(content: string): FixResult {
  const trimmed = content.trim();

  // Try parsing as-is first
  try {
    JSON.parse(trimmed);
    return {
      wasFixed: false,
      content: trimmed,
      message: 'JSON is already valid',
    };
  } catch (e) {
    // Not valid, continue to fix
  }

  // Check if it's missing array brackets
  // Pattern: starts with { and ends with }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    // Check if there are multiple objects (comma-separated)
    if (trimmed.includes('},{')) {
      // Multiple objects without brackets
      const fixed = `[${trimmed}]`;

      try {
        JSON.parse(fixed);
        return {
          wasFixed: true,
          content: fixed,
          message: 'Fixed: Added array brackets around multiple objects',
        };
      } catch (e) {
        throw new Error(`Cannot fix JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } else {
      // Single object without brackets
      const fixed = `[${trimmed}]`;

      try {
        JSON.parse(fixed);
        return {
          wasFixed: true,
          content: fixed,
          message: 'Fixed: Wrapped single object in array',
        };
      } catch (e) {
        throw new Error(`Cannot fix JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  }

  // If it starts with [ and ends with ], it's probably already an array with errors
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    throw new Error('JSON appears to be an array but has parsing errors');
  }

  throw new Error('Unrecognized JSON format - cannot automatically fix');
}

/**
 * Parse JSON with automatic fixing
 *
 * @param content - Raw JSON string content
 * @returns Parsed JSON object and fix info
 */
export function parseWithFix(content: string): { data: any; wasFixed: boolean; message: string } {
  const result = fixJSONFormat(content);
  const data = JSON.parse(result.content);

  return {
    data,
    wasFixed: result.wasFixed,
    message: result.message,
  };
}
