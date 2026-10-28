import type { RegexFlags, RegexTesterOptions } from '@/config/regex-tester-config';

export interface MatchResult {
  match: string;
  index: number;
  groups: string[];
  namedGroups: Record<string, string>;
  fullMatch: string;
}

export interface RegexTestResult {
  isValid: boolean;
  error?: string;
  matches: MatchResult[];
  matchCount: number;
  replacedText?: string;
  executionTime?: number;
  flagsString: string;
}

/**
 * Convert flags object to regex flags string
 * Order: m, s, g, i, y, u, d, v (matching common regex flag display conventions)
 */
export function flagsToString(flags: RegexFlags): string {
  const flagChars: string[] = [];
  if (flags.multiline) flagChars.push('m');
  if (flags.dotall) flagChars.push('s');
  if (flags.global) flagChars.push('g');
  if (flags.caseInsensitive) flagChars.push('i');
  if (flags.sticky) flagChars.push('y');
  if (flags.unicode) flagChars.push('u');
  if (flags.hasIndices) flagChars.push('d');
  if (flags.unicodeSets) flagChars.push('v');
  return flagChars.join('');
}

/**
 * Build JavaScript RegExp from pattern and flags
 */
export function buildRegExp(pattern: string, flags: RegexFlags): RegExp | null {
  try {
    const flagsString = flagsToString(flags);
    return new RegExp(pattern, flagsString);
  } catch {
    return null;
  }
}

/**
 * Validate regex pattern
 */
export function validatePattern(pattern: string, flags: RegexFlags): { isValid: boolean; error?: string } {
  if (!pattern || pattern.trim().length === 0) {
    return { isValid: false, error: 'Pattern cannot be empty' };
  }

  try {
    const flagsString = flagsToString(flags);
    new RegExp(pattern, flagsString);
    return { isValid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid regex pattern';
    return { isValid: false, error: errorMessage };
  }
}

/**
 * Test regex pattern against test string with timeout protection
 */
export function testRegex(options: RegexTesterOptions, timeoutMs: number = 2000): RegexTestResult {
  const startTime = performance.now();

  // Validate pattern
  const validation = validatePattern(options.pattern, options.flags);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      matches: [],
      matchCount: 0,
      flagsString: flagsToString(options.flags)
    };
  }

  // Build regex
  const regex = buildRegExp(options.pattern, options.flags);
  if (!regex) {
    return {
      isValid: false,
      error: 'Failed to build regex',
      matches: [],
      matchCount: 0,
      flagsString: flagsToString(options.flags)
    };
  }

  // Performance check: skip very long test strings
  if (options.testString.length > 100000) {
    return {
      isValid: false,
      error: 'Test string is too long (max 100,000 characters)',
      matches: [],
      matchCount: 0,
      flagsString: flagsToString(options.flags)
    };
  }

  const matches: MatchResult[] = [];
  const testString = options.testString;
  let timedOut = false;

  // Set up timeout protection
  const timeoutId = setTimeout(() => {
    timedOut = true;
  }, timeoutMs);

  try {
    if (options.flags.global) {
      // Global match - find all matches with iteration limit
      let match;
      const regexCopy = new RegExp(regex.source, regex.flags);
      let iterationCount = 0;
      const MAX_ITERATIONS = 10000; // Prevent infinite loops

      while ((match = regexCopy.exec(testString)) !== null && !timedOut && iterationCount < MAX_ITERATIONS) {
        iterationCount++;

        // Prevent infinite loop on zero-length matches
        if (match.index === regexCopy.lastIndex) {
          regexCopy.lastIndex++;
          if (regexCopy.lastIndex > testString.length) break; // Safety check
        }

        const groups: string[] = [];
        const namedGroups: Record<string, string> = {};

        // Extract numbered groups
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            groups.push(match[i]);
          }
        }

        // Extract named groups (if supported)
        if (match.groups) {
          Object.assign(namedGroups, match.groups);
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups,
          namedGroups,
          fullMatch: match[0]
        });

        // Safety check for very large result sets
        if (matches.length > 1000) {
          break;
        }
      }

      if (iterationCount >= MAX_ITERATIONS) {
        clearTimeout(timeoutId);
        return {
          isValid: false,
          error: 'Pattern matched too many times (possible infinite loop)',
          matches: [],
          matchCount: 0,
          flagsString: flagsToString(options.flags)
        };
      }
    } else {
      // Single match
      const match = testString.match(regex);
      if (match) {
        const groups: string[] = [];
        const namedGroups: Record<string, string> = {};

        // Extract numbered groups
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            groups.push(match[i]);
          }
        }

        // Extract named groups
        if (match.groups) {
          Object.assign(namedGroups, match.groups);
        }

        matches.push({
          match: match[0],
          index: match.index || 0,
          groups,
          namedGroups,
          fullMatch: match[0]
        });
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Error executing regex',
      matches: [],
      matchCount: 0,
      flagsString: flagsToString(options.flags)
    };
  }

  clearTimeout(timeoutId);

  if (timedOut) {
    return {
      isValid: false,
      error: `Regex execution timed out after ${timeoutMs}ms (possible catastrophic backtracking)`,
      matches: [],
      matchCount: 0,
      flagsString: flagsToString(options.flags)
    };
  }

  // Perform replacement if replace string is provided
  let replacedText: string | undefined;
  if (options.replaceString !== undefined && options.replaceString !== '') {
    try {
      replacedText = testString.replace(regex, options.replaceString);
    } catch {
      // Replacement failed, but we still have matches
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return {
    isValid: true,
    matches,
    matchCount: matches.length,
    replacedText,
    executionTime,
    flagsString: flagsToString(options.flags)
  };
}

/**
 * Generate JavaScript code snippet
 */
export function generateJavaScriptCode(options: RegexTesterOptions): string {
  const flagsString = flagsToString(options.flags);
  const patternEscaped = options.pattern.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  const testStringEscaped = options.testString.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

  let code = `// Regex Pattern\n`;
  code += `const pattern = /${patternEscaped}/${flagsString};\n\n`;

  code += `// Test String\n`;
  code += `const testString = \`${testStringEscaped}\`;\n\n`;

  if (options.flags.global) {
    code += `// Find all matches\n`;
    code += `const matches = testString.match(pattern);\n`;
    code += `console.log(matches);\n\n`;

    code += `// Or use exec in a loop\n`;
    code += `const regex = new RegExp(pattern);\n`;
    code += `let match;\n`;
    code += `while ((match = regex.exec(testString)) !== null) {\n`;
    code += `  console.log(match[0], match.index);\n`;
    code += `}\n`;
  } else {
    code += `// Find first match\n`;
    code += `const match = testString.match(pattern);\n`;
    code += `console.log(match);\n`;
  }

  if (options.replaceString) {
    code += `\n// Replace matches\n`;
    code += `const replaced = testString.replace(pattern, '${options.replaceString.replace(/'/g, "\\'")}');\n`;
    code += `console.log(replaced);\n`;
  }

  return code;
}

/**
 * Generate Python code snippet
 */
export function generatePythonCode(options: RegexTesterOptions): string {
  const flags = options.flags;
  let code = `import re\n\n`;

  code += `# Regex Pattern\n`;
  code += `pattern = r'${options.pattern.replace(/'/g, "\\'")}'\n\n`;

  code += `# Test String\n`;
  code += `test_string = '''${options.testString.replace(/'''/g, "\\'\\'\\'")}'''\n\n`;

  // Build flags
  const pythonFlags: string[] = [];
  if (flags.caseInsensitive) pythonFlags.push('re.IGNORECASE');
  if (flags.multiline) pythonFlags.push('re.MULTILINE');
  if (flags.dotall) pythonFlags.push('re.DOTALL');
  if (flags.unicode) pythonFlags.push('re.UNICODE');

  const flagsVar = pythonFlags.length > 0 ? `flags = ${pythonFlags.join(' | ')}\n` : '';
  if (flagsVar) {
    code += flagsVar;
    code += `\n`;
  }

  if (options.flags.global) {
    code += `# Find all matches\n`;
    if (flagsVar) {
      code += `matches = re.findall(pattern, test_string, flags)\n`;
    } else {
      code += `matches = re.findall(pattern, test_string)\n`;
    }
    code += `print(matches)\n\n`;

    code += `# Or use finditer for match objects\n`;
    if (flagsVar) {
      code += `for match in re.finditer(pattern, test_string, flags):\n`;
    } else {
      code += `for match in re.finditer(pattern, test_string):\n`;
    }
    code += `    print(match.group(), match.start(), match.end())\n`;
  } else {
    code += `# Find first match\n`;
    if (flagsVar) {
      code += `match = re.search(pattern, test_string, flags)\n`;
    } else {
      code += `match = re.search(pattern, test_string)\n`;
    }
    code += `if match:\n`;
    code += `    print(match.group())\n`;
  }

  if (options.replaceString) {
    code += `\n# Replace matches\n`;
    if (flagsVar) {
      code += `replaced = re.sub(pattern, '${options.replaceString.replace(/'/g, "\\'")}', test_string, flags=flags)\n`;
    } else {
      code += `replaced = re.sub(pattern, '${options.replaceString.replace(/'/g, "\\'")}', test_string)\n`;
    }
    code += `print(replaced)\n`;
  }

  return code;
}

/**
 * Highlight matches in text
 */
export function highlightMatches(text: string, matches: MatchResult[]): string {
  if (matches.length === 0) {
    return text;
  }

  // Sort matches by index in reverse order to avoid index shifting
  const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

  let highlighted = text;
  for (const match of sortedMatches) {
    const before = highlighted.substring(0, match.index);
    const matchText = highlighted.substring(match.index, match.index + match.match.length);
    const after = highlighted.substring(match.index + match.match.length);
    highlighted = `${before}<mark>${matchText}</mark>${after}`;
  }

  return highlighted;
}

/**
 * Type alias for Monaco editor decorations
 */
type MonacoDecoration = {
  range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
  options: { inlineClassName: string };
};

type MonacoModule = typeof import('monaco-editor');

/**
 * Convert decorations to Monaco editor format
 */
export function toMonacoDecorations(
  decorations: MonacoDecoration[],
  monaco: MonacoModule
){
  return decorations.map(dec => ({
    range: new monaco.Range(
      dec.range.startLineNumber,
      dec.range.startColumn,
      dec.range.endLineNumber,
      dec.range.endColumn
    ),
    options: dec.options
  }));
}

/**
 * Get group color name for reference
 */
function getGroupColorName(groupIndex: number): string {
  const names = ['Blue', 'Green', 'Purple', 'Orange', 'Teal'];
  return names[groupIndex % 5];
}

/**
 * Get group color class for highlighting
 */
function getGroupColorClass(groupIndex: number): string {
  return `regex-group-${(groupIndex % 5) + 1}`;
}

/**
 * Create a decoration for a text range
 */
function createDecoration(
  text: string,
  startIndex: number,
  endIndex: number,
  className: string
): MonacoDecoration {
  const startPos = indexToPosition(text, startIndex);
  const endPos = indexToPosition(text, endIndex);
  return {
    range: {
      startLineNumber: startPos.lineNumber,
      startColumn: startPos.column,
      endLineNumber: endPos.lineNumber,
      endColumn: endPos.column
    },
    options: { inlineClassName: className }
  };
}

/**
 * Create a decoration for a line-based range (used in formatted output)
 */
function createLineDecoration(
  lines: string[],
  lineNumber: number,
  startCol: number,
  endCol: number,
  className: string
): MonacoDecoration {
  const text = lines.join('\n');
  const lineStart = getLineStartIndex(lines, lineNumber);
  return createDecoration(text, lineStart + startCol, lineStart + endCol, className);
}

/**
 * Parse regex pattern to find capture groups and their positions
 */
export interface CaptureGroupInfo {
  start: number;
  end: number;
  groupIndex: number;
  name?: string;
  isNamed: boolean;
}

/**
 * Helper class to track regex parsing state (escapes, character classes)
 */
class RegexParserState {
  inCharacterClass = false;
  escapeNext = false;

  advance(char: string): boolean {
    if (this.escapeNext) {
      this.escapeNext = false;
      return true; // Continue to next char
    }

    if (char === '\\') {
      this.escapeNext = true;
      return true;
    }

    if (char === '[' && !this.escapeNext) {
      this.inCharacterClass = true;
      return true;
    }

    if (char === ']' && this.inCharacterClass) {
      this.inCharacterClass = false;
      return true;
    }

    return this.inCharacterClass; // Skip if in character class
  }
}

/**
 * Find the matching closing parenthesis for an opening parenthesis
 */
function findMatchingParen(pattern: string, startPos: number): number {
  let depth = 1;
  const state = new RegexParserState();

  for (let i = startPos; i < pattern.length; i++) {
    const char = pattern[i];

    if (state.advance(char)) continue;

    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

export function parseCaptureGroups(pattern: string): CaptureGroupInfo[] {
  const groups: CaptureGroupInfo[] = [];
  let groupIndex = 0;
  const state = new RegexParserState();

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];

    if (state.advance(char)) continue;

    if (char === '(') {
      const start = i;
      i++;

      // Check for non-capturing groups and special constructs
      if (i < pattern.length && pattern[i] === '?') {
        i++;

        // Named group: (?<name>...)
        if (i < pattern.length && pattern[i] === '<') {
          const nameEnd = pattern.indexOf('>', i + 1);
          if (nameEnd !== -1) {
            const name = pattern.substring(i + 1, nameEnd);
            const end = findMatchingParen(pattern, nameEnd + 1);
            if (end !== -1) {
              groups.push({ start, end: end + 1, groupIndex, name, isNamed: true });
              groupIndex++;
              i = end;
              continue;
            }
          }
        }

        // Non-capturing group: (?:...), (?=...), (?!...), (?<=...), (?<!...)
        const end = findMatchingParen(pattern, i);
        if (end !== -1) {
          i = end;
          continue;
        }
      } else {
        // Regular capture group: (...)
        const end = findMatchingParen(pattern, i);
        if (end !== -1) {
          groups.push({ start, end: end + 1, groupIndex, isNamed: false });
          groupIndex++;
          i = end;
          continue;
        }
      }
    }
  }

  return groups;
}

/**
 * Generate decorations for highlighting capture groups in the pattern
 */
export function generatePatternDecorations(pattern: string): MonacoDecoration[] {
  if (!pattern?.trim()) return [];

  try {
    const decorations: MonacoDecoration[] = [
      // Highlight entire pattern as group 0 (full match)
      createDecoration(pattern, 0, pattern.length, 'regex-match-highlight')
    ];

    // Highlight individual capture groups
    parseCaptureGroups(pattern).forEach((group) => {
      const className = `regex-group-highlight ${getGroupColorClass(group.groupIndex)}`;
      decorations.push(createDecoration(pattern, group.start, group.end, className));
    });

    return decorations;
  } catch (err) {
    console.warn('Failed to parse pattern for decorations:', err);
    return [];
  }
}

/**
 * Format match results for display
 */
export function formatMatchResults(matches: MatchResult[], showGroups: boolean, showPositions: boolean): string {
  if (matches.length === 0) {
    return 'No matches found.';
  }

  let output = `Found ${matches.length} match${matches.length === 1 ? '' : 'es'}:\n\n`;

  matches.forEach((match, index) => {
    output += `Match ${index + 1}:\n`;
    output += `  Text: "${match.match}"\n`;

    if (showPositions) {
      output += `  Position: ${match.index} - ${match.index + match.match.length}\n`;
    }

    if (showGroups && match.groups.length > 0) {
      output += `  Groups:\n`;
      match.groups.forEach((group, groupIndex) => {
        const colorName = getGroupColorName(groupIndex);
        output += `    [${groupIndex + 1}] (${colorName}): "${group}"\n`;
      });
    }

    if (showGroups && Object.keys(match.namedGroups).length > 0) {
      output += `  Named Groups:\n`;
      Object.entries(match.namedGroups).forEach(([name, value], index) => {
        const colorName = getGroupColorName(index);
        output += `    ${name} (${colorName}): "${value}"\n`;
      });
    }

    output += `\n`;
  });

  return output.trim();
}

/**
 * Extract quoted value from a line and return its position
 */
function extractQuotedValue(line: string): { value: string; start: number; end: number } | null {
  const match = line.match(/:\s*"([^"]*)"/);
  if (!match) return null;

  const value = match[1];
  const start = line.indexOf(`: "`) + 3;
  return { value, start, end: start + value.length };
}

/**
 * Generate decorations for highlighting group text in the formatted output
 */
export function generateOutputDecorations(
  matches: MatchResult[],
  formattedOutput: string,
  showGroups: boolean
): MonacoDecoration[] {
  if (matches.length === 0 || !showGroups) return [];

  const decorations: MonacoDecoration[] = [];
  const lines = formattedOutput.split('\n');
  let matchIndex = -1;
  let currentMatch: MatchResult | null = null;
  let groupIndex = -1;

  lines.forEach((line, lineNumber) => {
    // Detect match start
    if (line.match(/^Match \d+:/)) {
      matchIndex++;
      currentMatch = matchIndex < matches.length ? matches[matchIndex] : null;
      groupIndex = -1;
      return;
    }

    if (!currentMatch) return;

    // Detect full match text (group 0): "Text: "value""
    if (line.match(/^\s+Text:\s*"/)) {
      const quoted = extractQuotedValue(line);
      if (quoted) {
        decorations.push(createLineDecoration(
          lines, lineNumber, quoted.start, quoted.end, 'regex-match-highlight'
        ));
      }
      return;
    }

    // Detect numbered groups
    if (line.match(/^\s+\[\d+\] \(/) && currentMatch.groups.length > 0) {
      groupIndex++;
      if (groupIndex < currentMatch.groups.length) {
        const quoted = extractQuotedValue(line);
        if (quoted) {
          const className = `regex-group-highlight ${getGroupColorClass(groupIndex)}`;
          decorations.push(createLineDecoration(
            lines, lineNumber, quoted.start, quoted.end, className
          ));
        }
      }
      return;
    }

    // Detect named groups
    if (line.match(/^\s+[a-zA-Z_][a-zA-Z0-9_]* \(/)) {
      const namedGroups = Object.entries(currentMatch.namedGroups);
      const namedIndex = namedGroups.findIndex(([name]) => line.includes(`${name} (`));
      if (namedIndex >= 0) {
        const quoted = extractQuotedValue(line);
        if (quoted) {
          const className = `regex-group-highlight ${getGroupColorClass(namedIndex)}`;
          decorations.push(createLineDecoration(
            lines, lineNumber, quoted.start, quoted.end, className
          ));
        }
      }
    }
  });

  return decorations;
}

/**
 * Helper to get the character index at the start of a line
 */
function getLineStartIndex(lines: string[], lineNumber: number): number {
  let index = 0;
  for (let i = 0; i < lineNumber; i++) {
    index += lines[i].length + 1; // +1 for newline
  }
  return index;
}

/**
 * Convert character index to line/column position
 */
function indexToPosition(text: string, index: number): { lineNumber: number; column: number } {
  const lines = text.split('\n');
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline

    if (offset + lineLength > index) {
      return {
        lineNumber: i + 1,
        column: index - offset + 1
      };
    }
    offset += lineLength;
  }

  return {
    lineNumber: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

/**
 * Add group decorations for a single match
 */
function addGroupDecorations(
  decorations: MonacoDecoration[],
  text: string,
  match: MatchResult,
  matchStart: number
): void {
  // Add numbered group decorations
  if (match.groups.length > 0) {
    let searchOffset = 0;
    match.groups.forEach((group, groupIndex) => {
      if (!group) return;
      const groupIndexInMatch = match.match.indexOf(group, searchOffset);
      if (groupIndexInMatch === -1) return;
      const groupStart = matchStart + groupIndexInMatch;
      const className = `regex-group-highlight ${getGroupColorClass(groupIndex)}`;
      decorations.push(createDecoration(text, groupStart, groupStart + group.length, className));
      searchOffset = groupIndexInMatch + group.length;
    });
  }

  // Add named group decorations
  Object.values(match.namedGroups).forEach((value, index) => {
    if (!value) return;
    const groupIndexInMatch = match.match.indexOf(value);
    if (groupIndexInMatch === -1) return;
    const groupStart = matchStart + groupIndexInMatch;
    const className = `regex-group-highlight ${getGroupColorClass(index)}`;
    decorations.push(createDecoration(text, groupStart, groupStart + value.length, className));
  });
}

/**
 * Generate Monaco editor decorations for highlighting matches and groups
 */
export function generateMatchDecorations(matches: MatchResult[], text: string, showGroups: boolean = true): MonacoDecoration[] {
  if (matches.length === 0) return [];

  const decorations: MonacoDecoration[] = [];

  matches.forEach((match) => {
    const matchStart = match.index;
    const matchEnd = matchStart + match.match.length;

    // Add full match decoration (groups will appear on top)
    decorations.push(createDecoration(text, matchStart, matchEnd, 'regex-match-highlight'));

    if (showGroups) {
      addGroupDecorations(decorations, text, match, matchStart);
    }
  });

  return decorations;
}

/**
 * Explain regex pattern in human-readable format
 */
export interface RegexExplanation {
  pattern: string;
  explanation: string;
  components: Array<{ part: string; description: string; example?: string }>;
  warnings: string[];
}

export function explainRegex(pattern: string, flags: RegexFlags): RegexExplanation {
  const components: Array<{ part: string; description: string; example?: string }> = [];
  const warnings: string[] = [];
  let explanation = '';

  try {
    // Basic pattern analysis
    if (pattern.startsWith('^')) {
      components.push({ part: '^', description: 'Start of string anchor - matches the beginning of the string' });
      explanation += 'Matches from the start of the string. ';
    }

    if (pattern.endsWith('$') && !pattern.endsWith('\\$')) {
      components.push({ part: '$', description: 'End of string anchor - matches the end of the string' });
      explanation += 'Matches until the end of the string. ';
    }

    // Character classes
    const charClassMatches = pattern.match(/\[([^\]]+)\]/g);
    if (charClassMatches) {
      charClassMatches.forEach(match => {
        const content = match.slice(1, -1);
        if (content.startsWith('^')) {
          components.push({ part: match, description: `Negated character class - matches any character NOT in [${content.slice(1)}]` });
        } else {
          components.push({ part: match, description: `Character class - matches any single character from [${content}]` });
        }
      });
    }

    // Quantifiers
    const quantifierMatches = pattern.match(/(\*|\+|\?|\{[0-9,]+?\})/g);
    if (quantifierMatches) {
      quantifierMatches.forEach(match => {
        let desc = '';
        if (match === '*') desc = 'Zero or more times (greedy)';
        else if (match === '+') desc = 'One or more times (greedy)';
        else if (match === '?') desc = 'Zero or one time (optional)';
        else if (match.startsWith('{')) {
          const range = match.slice(1, -1);
          if (range.includes(',')) {
            const [min, max] = range.split(',');
            desc = `Between ${min} and ${max || 'unlimited'} times`;
          } else {
            desc = `Exactly ${range} times`;
          }
        }
        components.push({ part: match, description: desc });
      });
    }

    // Groups
    const groupMatches = pattern.match(/\(([^)]+)\)/g);
    if (groupMatches) {
      groupMatches.forEach((match, index) => {
        const isNamed = match.includes('?<');
        if (isNamed) {
          const nameMatch = match.match(/\?<([^>]+)>/);
          const name = nameMatch ? nameMatch[1] : 'unknown';
          components.push({ part: match, description: `Named capture group "${name}" - captures matched text for later reference` });
        } else {
          components.push({ part: match, description: `Capture group ${index + 1} - captures matched text for later reference` });
        }
      });
    }

    // Common patterns
    if (pattern.includes('\\b')) {
      components.push({ part: '\\b', description: 'Word boundary - matches between word and non-word characters' });
    }
    if (pattern.includes('\\w')) {
      components.push({ part: '\\w', description: 'Word character - matches letters, digits, and underscore [a-zA-Z0-9_]' });
    }
    if (pattern.includes('\\d')) {
      components.push({ part: '\\d', description: 'Digit - matches any digit [0-9]' });
    }
    if (pattern.includes('\\s')) {
      components.push({ part: '\\s', description: 'Whitespace - matches any whitespace character (space, tab, newline, etc.)' });
    }
    if (pattern.includes('.')) {
      components.push({ part: '.', description: flags.dotall ? 'Any character including newline' : 'Any character except newline' });
    }

    // Flags explanation
    if (flags.global) explanation += 'Finds all matches (global). ';
    if (flags.caseInsensitive) explanation += 'Case-insensitive matching. ';
    if (flags.multiline) explanation += '^ and $ match line breaks. ';
    if (flags.dotall) explanation += '. matches newline characters. ';
    if (flags.unicode) explanation += 'Unicode features enabled. ';

    // Performance warnings - enhanced detection
    const performanceWarnings = detectPerformanceIssues(pattern);
    warnings.push(...performanceWarnings);

    if (explanation === '') {
      explanation = 'Matches the pattern as written.';
    }

  } catch {
    explanation = 'Unable to analyze pattern.';
    warnings.push('Pattern analysis failed');
  }

  return {
    pattern,
    explanation: explanation.trim() || 'Matches the pattern as written.',
    components,
    warnings
  };
}

/**
 * Detect performance issues in regex patterns
 */
export function detectPerformanceIssues(pattern: string): string[] {
  const warnings: string[] = [];

  // Catastrophic backtracking patterns
  if (pattern.includes('.*') || pattern.includes('.+')) {
    warnings.push('⚠️ Potential catastrophic backtracking: .* or .+ can cause exponential time complexity on certain inputs');
  }

  // Nested quantifiers
  if (pattern.match(/\([^)]*[*+?{][^)]*[*+?{]/)) {
    warnings.push('⚠️ Nested quantifiers detected: May cause performance issues');
  }

  // ReDoS patterns - nested quantifiers with alternation
  if (pattern.match(/\([^)]*\|[^)]*\)[*+?{]/)) {
    warnings.push('⚠️ ReDoS risk: Alternation with quantifiers can cause exponential backtracking');
  }

  // Multiple overlapping quantifiers
  const quantifierCount = (pattern.match(/[*+?{]/g) || []).length;
  if (quantifierCount > 5) {
    warnings.push('⚠️ Many quantifiers detected: Pattern may be slow on large inputs');
  }

  // Unbounded quantifiers without anchors
  if ((pattern.includes('*') || pattern.includes('+')) && !pattern.startsWith('^') && !pattern.endsWith('$')) {
    warnings.push('⚠️ Unbounded quantifiers without anchors: May match more than intended');
  }

  // Expensive character classes
  if (pattern.match(/\[[^\]]*\[/)) {
    warnings.push('⚠️ Nested character classes: May cause performance issues');
  }

  // Lookahead/lookbehind with quantifiers
  if (pattern.match(/\(\?[=!][^)]*[*+?{]/)) {
    warnings.push('⚠️ Lookahead/lookbehind with quantifiers: Can be computationally expensive');
  }

  return warnings;
}

/**
 * Generate diff between original and replaced text
 */
export interface ReplacementDiff {
  original: string;
  replaced: string;
  changes: Array<{
    type: 'unchanged' | 'removed' | 'added';
    text: string;
    start: number;
    end: number;
  }>;
}

export function generateReplacementDiff(original: string, replaced: string): ReplacementDiff {
  // Performance optimization: skip diff for identical strings
  if (original === replaced) {
    return {
      original,
      replaced,
      changes: [{
        type: 'unchanged',
        text: original,
        start: 0,
        end: original.length
      }]
    };
  }

  // Performance optimization: limit diff size
  const MAX_DIFF_LENGTH = 5000;
  if (original.length > MAX_DIFF_LENGTH || replaced.length > MAX_DIFF_LENGTH) {
    // For very long strings, just show a simple diff
    return {
      original,
      replaced,
      changes: [
        { type: 'removed', text: original, start: 0, end: original.length },
        { type: 'added', text: replaced, start: 0, end: replaced.length }
      ]
    };
  }

  const changes: ReplacementDiff['changes'] = [];
  let origIndex = 0;
  let replIndex = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 10000; // Prevent infinite loops

  while ((origIndex < original.length || replIndex < replaced.length) && iterations < MAX_ITERATIONS) {
    iterations++;

    if (origIndex >= original.length) {
      // Only replacement text left
      changes.push({
        type: 'added',
        text: replaced.substring(replIndex),
        start: replIndex,
        end: replaced.length
      });
      break;
    }

    if (replIndex >= replaced.length) {
      // Only original text left
      changes.push({
        type: 'removed',
        text: original.substring(origIndex),
        start: origIndex,
        end: original.length
      });
      break;
    }

    if (original[origIndex] === replaced[replIndex]) {
      // Find the longest common substring (optimized)
      let commonLength = 0;
      const maxCheck = Math.min(original.length - origIndex, replaced.length - replIndex, 100);

      while (
        commonLength < maxCheck &&
        original[origIndex + commonLength] === replaced[replIndex + commonLength]
      ) {
        commonLength++;
      }

      if (commonLength > 0) {
        changes.push({
          type: 'unchanged',
          text: original.substring(origIndex, origIndex + commonLength),
          start: origIndex,
          end: origIndex + commonLength
        });
        origIndex += commonLength;
        replIndex += commonLength;
      } else {
        // No match found, advance both
        origIndex++;
        replIndex++;
      }
    } else {
      // Find next match (optimized - limit search distance)
      let origEnd = origIndex;
      let replEnd = replIndex;
      const searchLimit = Math.min(100, Math.max(original.length - origIndex, replaced.length - replIndex));

      // Find next common character in original (limited search)
      for (let i = 0; i < searchLimit && origEnd < original.length; i++) {
        if (replaced.substring(replIndex, replIndex + searchLimit).includes(original[origEnd])) {
          break;
        }
        origEnd++;
      }

      // Find next common character in replacement (limited search)
      for (let i = 0; i < searchLimit && replEnd < replaced.length; i++) {
        if (original.substring(origIndex, origIndex + searchLimit).includes(replaced[replEnd])) {
          break;
        }
        replEnd++;
      }

      if (origEnd > origIndex) {
        changes.push({
          type: 'removed',
          text: original.substring(origIndex, origEnd),
          start: origIndex,
          end: origEnd
        });
        origIndex = origEnd;
      }

      if (replEnd > replIndex) {
        changes.push({
          type: 'added',
          text: replaced.substring(replIndex, replEnd),
          start: replIndex,
          end: replEnd
        });
        replIndex = replEnd;
      } else {
        // No progress, advance to prevent infinite loop
        origIndex++;
        replIndex++;
      }
    }
  }

  return {
    original,
    replaced,
    changes
  };
}

/**
 * Visualize backreferences in replacement string
 */
export interface BackreferenceInfo {
  backref: string;
  groupIndex: number;
  position: number;
  description: string;
}

export function analyzeBackreferences(replaceString: string): BackreferenceInfo[] {
  const backrefs: BackreferenceInfo[] = [];

  // Match $1, $2, etc. or ${1}, ${2}, etc.
  const backrefPattern = /\$(\d+)|\$\{(\d+)\}/g;
  let match;

  while ((match = backrefPattern.exec(replaceString)) !== null) {
    const groupIndex = parseInt(match[1] || match[2], 10);
    backrefs.push({
      backref: match[0],
      groupIndex,
      position: match.index,
      description: `References capture group ${groupIndex}`
    });
  }

  // Match named groups ${name}
  const namedBackrefPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  while ((match = namedBackrefPattern.exec(replaceString)) !== null) {
    backrefs.push({
      backref: match[0],
      groupIndex: -1, // Named group
      position: match.index,
      description: `References named group "${match[1]}"`
    });
  }

  return backrefs;
}

/**
 * Export matches to JSON format
 */
export function exportMatchesToJson(matches: MatchResult[]): string {
  return JSON.stringify({
    matchCount: matches.length,
    matches: matches.map(m => ({
      match: m.match,
      index: m.index,
      length: m.match.length,
      groups: m.groups,
      namedGroups: m.namedGroups
    }))
  }, null, 2);
}

/**
 * Escape CSV field
 */
function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Export matches to CSV format
 */
export function exportMatchesToCsv(matches: MatchResult[]): string {
  const headers = ['Match #', 'Text', 'Index', 'Length', 'Groups', 'Named Groups'];
  const rows = matches.map((match, index) => [
    index + 1,
    escapeCsvField(match.match),
    match.index,
    match.match.length,
    escapeCsvField(match.groups.join('; ')),
    escapeCsvField(Object.entries(match.namedGroups).map(([k, v]) => `${k}=${v}`).join('; '))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Build XML match element
 */
function buildXmlMatch(match: MatchResult, index: number): string {
  let xml = `    <match number="${index + 1}">\n`;
  xml += `      <text><![CDATA[${match.match}]]></text>\n`;
  xml += `      <index>${match.index}</index>\n`;
  xml += `      <length>${match.match.length}</length>\n`;

  if (match.groups.length > 0) {
    xml += '      <groups>\n';
    match.groups.forEach((group, groupIndex) => {
      xml += `        <group number="${groupIndex + 1}"><![CDATA[${group}]]></group>\n`;
    });
    xml += '      </groups>\n';
  }

  if (Object.keys(match.namedGroups).length > 0) {
    xml += '      <named-groups>\n';
    Object.entries(match.namedGroups).forEach(([name, value]) => {
      xml += `        <group name="${name}"><![CDATA[${value}]]></group>\n`;
    });
    xml += '      </named-groups>\n';
  }

  return xml + '    </match>\n';
}

/**
 * Export matches to XML format
 */
export function exportMatchesToXml(matches: MatchResult[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<regex-matches>
  <match-count>${matches.length}</match-count>
  <matches>
${matches.map((match, index) => buildXmlMatch(match, index)).join('')}  </matches>
</regex-matches>`;
}

/**
 * Test case interface
 */
export interface TestCase {
  id: string;
  name: string;
  pattern: string;
  testString: string;
  flags: RegexFlags;
  replaceString?: string;
  expectedMatchCount?: number;
  createdAt: number;
}

/**
 * Storage key for test cases
 */
const TEST_CASES_STORAGE_KEY = 'regex-test-cases';

/**
 * Load test cases from localStorage
 */
export function loadTestCases(): TestCase[] {
  try {
    const stored = localStorage.getItem(TEST_CASES_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TestCase[]) : [];
  } catch {
    return [];
  }
}

/**
 * Save test cases to localStorage
 */
function saveTestCases(testCases: TestCase[]): void {
  localStorage.setItem(TEST_CASES_STORAGE_KEY, JSON.stringify(testCases));
}

/**
 * Save test case to localStorage
 */
export function saveTestCase(testCase: Omit<TestCase, 'id' | 'createdAt'>): string {
  const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullTestCase: TestCase = { ...testCase, id, createdAt: Date.now() };
  const saved = loadTestCases();
  saved.push(fullTestCase);
  saveTestCases(saved);
  return id;
}

/**
 * Delete test case by ID
 */
export function deleteTestCase(id: string): boolean {
  try {
    const testCases = loadTestCases().filter(tc => tc.id !== id);
    saveTestCases(testCases);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update test case
 */
export function updateTestCase(id: string, updates: Partial<Omit<TestCase, 'id' | 'createdAt'>>): boolean {
  try {
    const testCases = loadTestCases();
    const index = testCases.findIndex(tc => tc.id === id);
    if (index === -1) return false;
    testCases[index] = { ...testCases[index], ...updates };
    saveTestCases(testCases);
    return true;
  } catch {
    return false;
  }
}

