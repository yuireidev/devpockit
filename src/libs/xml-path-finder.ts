/**
 * XML Path Finder Logic
 * Pure functions for XPath query evaluation and path finding
 */

export interface XmlPathResult {
  success: boolean;
  matches: XmlNode[];
  paths: string[];
  count: number;
  error?: string;
}

export interface XmlNode {
  type: 'element' | 'attribute' | 'text' | 'comment' | 'cdata';
  name: string;
  value?: unknown;
  attributes?: Record<string, string>;
  xpath: string;
  xml?: string; // Serialized XML representation
}

export interface XmlPathOptions {
  returnPaths: boolean;
  returnValues: boolean;
  returnXml: boolean;
}

/**
 * Parse XML string to DOM Document
 */
function parseXml(xmlString: string): { doc: Document | null; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'XML parsing error';
      return { doc: null, error: errorText };
    }

    return { doc };
  } catch (error) {
    return {
      doc: null,
      error: error instanceof Error ? error.message : 'Failed to parse XML'
    };
  }
}

/**
 * Evaluate an XPath expression against XML data
 * Supports basic XPath syntax:
 * - / (absolute path)
 * - // (descendant selector)
 * - * (wildcard)
 * - [] (predicates)
 * - @ (attributes)
 * - text() (text nodes)
 * - position predicates [1], [last()]
 */
export function evaluateXPath(xmlString: string, xpath: string): XmlPathResult {
  if (!xpath || !xpath.trim()) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: 'XPath expression cannot be empty'
    };
  }

  try {
    // Parse XML
    const { doc, error: parseError } = parseXml(xmlString);
    if (!doc || parseError) {
      return {
        success: false,
        matches: [],
        paths: [],
        count: 0,
        error: parseError || 'Failed to parse XML'
      };
    }

    const normalizedXPath = xpath.trim();

    // Handle root selector
    if (normalizedXPath === '/' || normalizedXPath === '/.') {
      const rootElement = doc.documentElement;
      if (rootElement) {
        const node = xmlNodeFromElement(rootElement, '/');
        return {
          success: true,
          matches: [node],
          paths: ['/'],
          count: 1
        };
      }
      return {
        success: true,
        matches: [],
        paths: [],
        count: 0
      };
    }

    // Evaluate XPath using native browser API
    const result = evaluateXPathExpression(doc, normalizedXPath);

    return {
      success: true,
      matches: result.nodes,
      paths: result.paths,
      count: result.nodes.length
    };
  } catch (error) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Invalid XPath expression'
    };
  }
}

interface XPathEvaluationResult {
  nodes: XmlNode[];
  paths: string[];
}

/**
 * Evaluate XPath expression using native browser API
 */
function evaluateXPathExpression(doc: Document, xpath: string): XPathEvaluationResult {
  const nodes: XmlNode[] = [];
  const paths: string[] = [];

  try {
    // Use native XPath evaluator
    const result = doc.evaluate(
      xpath,
      doc,
      null, // namespace resolver (null for no namespaces)
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const snapshotLength = result.snapshotLength;

    for (let i = 0; i < snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (node) {
        const xmlNode = xmlNodeFromNode(node);
        const xpathString = getXPathForNode(node, doc);

        nodes.push(xmlNode);
        paths.push(xpathString);
      }
    }
  } catch {
    // If native evaluation fails, try custom evaluation for basic paths
    const customResult = evaluateXPathCustom(doc, xpath);
    return customResult;
  }

  return { nodes, paths };
}

/**
 * Convert DOM Node to XmlNode
 */
function xmlNodeFromNode(node: Node): XmlNode {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return xmlNodeFromElement(node as Element, '');
  } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
    return xmlNodeFromAttribute(node as Attr, '');
  } else if (node.nodeType === Node.TEXT_NODE) {
    return {
      type: 'text',
      name: '#text',
      value: node.textContent || '',
      xpath: '',
      xml: node.textContent || ''
    };
  } else if (node.nodeType === Node.COMMENT_NODE) {
    return {
      type: 'comment',
      name: '#comment',
      value: node.textContent || '',
      xpath: '',
      xml: `<!--${node.textContent}-->`
    };
  } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return {
      type: 'cdata',
      name: '#cdata',
      value: node.textContent || '',
      xpath: '',
      xml: `<![CDATA[${node.textContent}]]>`
    };
  }

  // Default fallback
  return {
    type: 'element',
    name: node.nodeName || '',
    value: node.textContent || '',
    xpath: ''
  };
}

/**
 * Convert DOM Element to XmlNode
 */
function xmlNodeFromElement(element: Element, basePath: string): XmlNode {
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }

  // Get text content (direct text children only, not nested)
  const textContent = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent)
    .join('')
    .trim();

  // Serialize element to XML string
  const xml = element.outerHTML || element.toString();

  return {
    type: 'element',
    name: element.tagName,
    value: textContent || undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    xpath: basePath,
    xml
  };
}

/**
 * Convert DOM Attribute to XmlNode
 */
function xmlNodeFromAttribute(attr: Attr, basePath: string): XmlNode {
  return {
    type: 'attribute',
    name: attr.name,
    value: attr.value,
    xpath: basePath,
    xml: `${attr.name}="${attr.value}"`
  };
}

/**
 * Get XPath string for a given node
 */
function getXPathForNode(node: Node, doc: Document): string {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return '/';
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    return getXPathForElement(node as Element, doc);
  }

  if (node.nodeType === Node.ATTRIBUTE_NODE) {
    const attr = node as Attr;
    const elementPath = getXPathForElement(attr.ownerElement!, doc);
    return `${elementPath}/@${attr.name}`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const element = node.parentElement;
    if (element) {
      const elementPath = getXPathForElement(element, doc);
      // Check if this is the only text node
      const textNodes = Array.from(element.childNodes).filter(
        (n): n is Text => n.nodeType === Node.TEXT_NODE && !!(n as Text).textContent?.trim()
      );
      if (textNodes.length === 1) {
        return `${elementPath}/text()`;
      }
      // Multiple text nodes - need index
      const index = textNodes.indexOf(node as Text);
      return `${elementPath}/text()[${index + 1}]`;
    }
  }

  return '';
}

/**
 * Get XPath string for an element
 */
function getXPathForElement(element: Element, doc: Document): string {
  if (element === doc.documentElement) {
    return `/${element.tagName}`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== doc.documentElement) {
    const tagName = current.tagName;
    const parent: Element | null = current.parentElement;

    if (!parent) {
      parts.unshift(`/${tagName}`);
      break;
    }

    // Count siblings with same tag name
    const siblings = Array.from(parent.children).filter(
      (child: Element) => child.tagName === tagName
    );
    const index = siblings.indexOf(current);

    if (siblings.length === 1) {
      parts.unshift(tagName);
    } else {
      parts.unshift(`${tagName}[${index + 1}]`);
    }

    current = parent;
  }

  // Add root
  if (doc.documentElement) {
    parts.unshift(`/${doc.documentElement.tagName}`);
  }

  return parts.join('/');
}

/**
 * Custom XPath evaluation for basic paths (fallback)
 * Handles simple cases when native API might fail
 */
function evaluateXPathCustom(doc: Document, xpath: string): XPathEvaluationResult {
  const nodes: XmlNode[] = [];
  const paths: string[] = [];

  // Handle simple absolute paths like /root/child
  if (xpath.startsWith('/') && !xpath.startsWith('//')) {
    const parts = xpath.split('/').filter(p => p && p !== '.');
    let current: Element | null = doc.documentElement as Element | null;

    for (const part of parts) {
      if (!current) break;

      // Handle predicates like [1] or [@attr='value']
      const predicateMatch = part.match(/^([^\[]+)(\[.*\])?$/);
      if (predicateMatch) {
        const tagName = predicateMatch[1];
        const predicate = predicateMatch[2];

        if (tagName === '*') {
          // Wildcard - get first child
          current = (current.children[0] as Element) || null;
        } else {
          const children = Array.from(current.children).filter(
            (child: Element) => child.tagName === tagName
          ) as Element[];

          if (predicate) {
            // Handle predicate
            if (/^\[\d+\]$/.test(predicate)) {
              // Index predicate [1]
              const index = parseInt(predicate.slice(1, -1), 10) - 1;
              current = children[index] || null;
            } else if (predicate.startsWith('[@')) {
              // Attribute predicate [@attr='value']
              const attrMatch = predicate.match(/\[@([^=]+)=['"]([^'"]+)['"]\]/);
              if (attrMatch) {
                const attrName = attrMatch[1];
                const attrValue = attrMatch[2];
                current =
                  children.find(
                    (child: Element) => child.getAttribute(attrName) === attrValue
                  ) || null;
              }
            } else {
              current = children[0] || null;
            }
          } else {
            current = children[0] || null;
          }
        }
      } else {
        // No predicate
        if (part === '*') {
          current = (current.children[0] as Element) || null;
        } else {
          const child = Array.from(current.children).find(
            (c: Element) => c.tagName === part
          ) as Element | undefined;
          current = child || null;
        }
      }
    }

    if (current) {
      const node = xmlNodeFromElement(current, '');
      const xpathString = getXPathForElement(current, doc);
      nodes.push(node);
      paths.push(xpathString);
    }
  } else if (xpath.startsWith('//')) {
    // Descendant selector - find all matching elements
    const tagName = xpath.substring(2).split('/')[0].split('[')[0];
    const allElements = doc.getElementsByTagName(tagName);

    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const node = xmlNodeFromElement(element, '');
      const xpathString = getXPathForElement(element, doc);
      nodes.push(node);
      paths.push(xpathString);
    }
  }

  return { nodes, paths };
}

/**
 * Format XPath results for display
 */
export function formatXPathResults(result: XmlPathResult): string {
  if (!result.success) {
    return result.error || 'Query failed';
  }

  if (result.count === 0) {
    return 'No matches found';
  }

  const output = {
    count: result.count,
    matches: result.matches.map((match, index) => ({
      path: result.paths[index] || `[${index}]`,
      type: match.type,
      name: match.name,
      value: match.value,
      attributes: match.attributes,
      xml: match.xml
    }))
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Validate XPath expression syntax (basic validation)
 */
export function validateXPath(xpath: string): { isValid: boolean; error?: string } {
  if (!xpath || !xpath.trim()) {
    return { isValid: false, error: 'XPath cannot be empty' };
  }

  const trimmed = xpath.trim();

  // Basic syntax checks
  // Check for balanced brackets
  let bracketCount = 0;
  let parenCount = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const prevChar = i > 0 ? trimmed[i - 1] : '';

    // Track string literals
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    if (!inString) {
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;

      if (bracketCount < 0) {
        return { isValid: false, error: 'Unmatched closing bracket' };
      }
      if (parenCount < 0) {
        return { isValid: false, error: 'Unmatched closing parenthesis' };
      }
    }
  }

  if (bracketCount !== 0) {
    return { isValid: false, error: 'Unmatched opening bracket' };
  }
  if (parenCount !== 0) {
    return { isValid: false, error: 'Unmatched opening parenthesis' };
  }

  // Check for invalid characters at start (basic check)
  if (trimmed.length > 0 && !trimmed.match(/^[\/@\w*]/)) {
    return {
      isValid: false,
      error: 'XPath must start with /, //, @, *, or a valid identifier'
    };
  }

  return { isValid: true };
}

/**
 * Parse XML to a tree structure for visualization
 */
export function parseXmlToTree(xmlString: string): {
  root: XmlTreeNode | null;
  error?: string;
} {
  const { doc, error } = parseXml(xmlString);
  if (!doc || error) {
    return { root: null, error };
  }

  const rootElement = doc.documentElement;
  if (!rootElement) {
    return { root: null, error: 'No root element found' };
  }

  const root = xmlTreeNodeFromElement(rootElement);
  return { root };
}

export interface XmlTreeNode {
  type: 'element' | 'attribute' | 'text' | 'comment' | 'cdata';
  name: string;
  value?: string;
  attributes?: Record<string, string>;
  xpath: string;
  children: XmlTreeNode[];
}

function xmlTreeNodeFromElement(element: Element): XmlTreeNode {
  const xpath = getXPathForElement(element, element.ownerDocument);

  // Get attributes
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }

  // Get children
  const children: XmlTreeNode[] = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];

    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(xmlTreeNodeFromElement(child as Element));
    } else if (child.nodeType === Node.TEXT_NODE && (child as Text).textContent?.trim()) {
      const textNode = child as Text;
      children.push({
        type: 'text',
        name: '#text',
        value: textNode.textContent.trim(),
        xpath: `${xpath}/text()`,
        children: []
      });
    } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
      const cdataNode = child as CDATASection;
      children.push({
        type: 'cdata',
        name: '#cdata',
        value: cdataNode.textContent || '',
        xpath: `${xpath}/#cdata`,
        children: []
      });
    } else if (child.nodeType === Node.COMMENT_NODE) {
      const commentNode = child as Comment;
      children.push({
        type: 'comment',
        name: '#comment',
        value: commentNode.textContent || '',
        xpath: `${xpath}/#comment`,
        children: []
      });
    }
  }

  // Get text content if no element children
  const hasElementChildren = children.some(c => c.type === 'element');
  const textContent = !hasElementChildren
    ? element.textContent?.trim()
    : undefined;

  return {
    type: 'element',
    name: element.tagName,
    value: textContent,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    xpath,
    children
  };
}

