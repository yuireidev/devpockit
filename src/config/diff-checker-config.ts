/**
 * Diff Checker Configuration
 * Options and settings for text diff comparison tool
 */

export const DIFF_CHECKER_OPTIONS = {
  languages: [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'sql', label: 'SQL' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'shell', label: 'Shell' },
  ],
} as const

export const DEFAULT_DIFF_OPTIONS = {
  ignoreWhitespace: false,
  language: 'plaintext',
  wordWrap: false,
  syncScroll: true,
}

export const DIFF_EXAMPLES = {
  javascript: {
    original: `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const message = "Welcome";
greet(message);`,
    modified: `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true, name };
}

const message = "Welcome to DevPockit";
const result = greet(message);
console.log(result);`,
  },
  python: {
    original: `def greet(name):
    print(f"Hello, {name}")
    return True

message = "Welcome"
greet(message)`,
    modified: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")
    return {"success": True, "name": name}

message = "Welcome to DevPockit"
result = greet(message)
print(result)`,
  },
}
