'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/libs/utils';
import type { XmlTreeNode } from '@/libs/xml-path-finder';
import { parseXmlToTree } from '@/libs/xml-path-finder';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List, useListRef, type RowComponentProps } from 'react-window';

export interface XmlTreeViewProps {
  xmlString: string;
  highlightedPaths?: string[];
  onPathClick?: (path: string) => void;
  onGetExpandedXml?: (getExpandedXml: () => string) => void;
  maxDepth?: number;
  className?: string;
  height?: string;
}

// Flatten tree nodes for virtual scrolling
function flattenTreeNodes(nodes: XmlTreeNode[], expandedPaths: Set<string>): XmlTreeNode[] {
  const flattened: XmlTreeNode[] = [];

  function traverse(nodeList: XmlTreeNode[]) {
    for (const node of nodeList) {
      flattened.push(node);
      if (node.children && node.children.length > 0 && expandedPaths.has(node.xpath)) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return flattened;
}

// Format value for display
function formatValue(value: string | undefined, type: string): string {
  if (!value) return '';
  if (type === 'text' || type === 'cdata') {
    return value.length > 50 ? `${value.substring(0, 50)}...` : value;
  }
  return value;
}

// Get type badge color
function getTypeColor(type: string): string {
  switch (type) {
    case 'element':
      return 'text-blue-600 dark:text-blue-400';
    case 'attribute':
      return 'text-purple-600 dark:text-purple-400';
    case 'text':
      return 'text-green-600 dark:text-green-400';
    case 'comment':
      return 'text-neutral-500 dark:text-neutral-500';
    case 'cdata':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-neutral-600 dark:text-neutral-400';
  }
}

// Get type badge background
function getTypeBg(type: string): string {
  switch (type) {
    case 'element':
      return 'bg-blue-50 dark:bg-blue-950/20';
    case 'attribute':
      return 'bg-purple-50 dark:bg-purple-950/20';
    case 'text':
      return 'bg-green-50 dark:bg-green-950/20';
    case 'comment':
      return 'bg-neutral-50 dark:bg-neutral-800';
    case 'cdata':
      return 'bg-orange-50 dark:bg-orange-950/20';
    default:
      return 'bg-neutral-100 dark:bg-neutral-700';
  }
}

// Get type icon/symbol
function getTypeSymbol(type: string): string {
  switch (type) {
    case 'element':
      return '<>';
    case 'attribute':
      return '@';
    case 'text':
      return 'T';
    case 'comment':
      return '//';
    case 'cdata':
      return '<!>';
    default:
      return '?';
  }
}

interface TreeNodeItemProps {
  node: XmlTreeNode;
  isHighlighted: boolean;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  onCopy: (node: XmlTreeNode) => void;
  searchTerm: string;
  isCopied: boolean;
}

function TreeNodeItem({
  node,
  isHighlighted,
  isExpanded,
  onToggle,
  onCopy,
  searchTerm,
  isCopied,
}: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  // Calculate indent from XPath depth (count path segments, excluding root)
  const pathDepth = node.xpath === '/' ? 0 : node.xpath.split('/').filter(p => p).length - 1;
  const indent = pathDepth * 20;

  // Format display name
  let displayName = node.name;
  if (node.type === 'attribute') {
    displayName = `@${node.name}`;
  } else if (node.type === 'text') {
    displayName = '#text';
  } else if (node.type === 'comment') {
    displayName = '#comment';
  } else if (node.type === 'cdata') {
    displayName = '#cdata';
  }

  // Format display value
  let displayValue = '';
  if (node.type === 'element') {
    if (hasChildren) {
      displayValue = `(${node.children.length} ${node.children.length === 1 ? 'child' : 'children'})`;
    } else if (node.value) {
      displayValue = formatValue(node.value, node.type);
    }
  } else if (node.value) {
    displayValue = formatValue(node.value, node.type);
  }

  // Show attributes for elements
  const attributesDisplay = node.type === 'element' && node.attributes
    ? Object.entries(node.attributes)
        .map(([key, value]) => `${key}="${value.length > 20 ? `${value.substring(0, 20)}...` : value}"`)
        .join(' ')
    : '';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(node);
  };

  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.xpath);
    }
  };

  const isSearchMatch = searchTerm && (
    displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    displayValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.xpath.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attributesDisplay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
        isHighlighted && 'bg-orange-50 dark:bg-orange-950/30 border-l-2 border-orange-600',
        isSearchMatch && !isHighlighted && 'bg-yellow-50 dark:bg-yellow-950/20'
      )}
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      {/* Expand/Collapse Button */}
      <button
        onClick={handleToggle}
        disabled={!hasChildren}
        className={cn(
          'shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
          !hasChildren && 'opacity-0 cursor-default'
        )}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {hasChildren && (
          isExpanded ? (
            <ChevronDownIcon className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronRightIcon className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
          )
        )}
      </button>

      {/* Type Badge */}
      <span
        className={cn(
          'shrink-0 px-1.5 py-0.5 text-xs font-mono rounded',
          getTypeBg(node.type),
          getTypeColor(node.type)
        )}
      >
        {getTypeSymbol(node.type)}
      </span>

      {/* Name */}
      <span className={cn('font-mono text-sm', getTypeColor(node.type))}>
        {displayName}
      </span>

      {/* Attributes (for elements) */}
      {attributesDisplay && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {attributesDisplay}
        </span>
      )}

      {/* Value */}
      {displayValue && (
        <span className={cn('text-sm flex-1', getTypeColor(node.type))}>
          {displayValue}
        </span>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="shrink-0 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy XPath"
      >
        {isCopied ? (
          <CheckIcon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
        ) : (
          <DocumentDuplicateIcon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
        )}
      </button>
    </div>
  );
}

export function XmlTreeView({
  xmlString,
  highlightedPaths = [],
  onPathClick,
  onGetExpandedXml,
  maxDepth = 3,
  className,
  height = '500px',
}: XmlTreeViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const listRef = useListRef(null);
  const highlightedPathSet = useMemo(() => new Set(highlightedPaths), [highlightedPaths]);
  const lastSearchTermRef = useRef<string>('');

  // Parse XML to tree
  const { root, error: parseError } = useMemo(() => {
    if (!xmlString.trim()) {
      return { root: null, error: 'Empty XML string' };
    }
    return parseXmlToTree(xmlString);
  }, [xmlString]);

  const rootNodes = useMemo(() => {
    if (!root) return [];
    return [root];
  }, [root]);

  const initialExpandedPaths = useMemo(() => {
    const initialExpanded = new Set<string>();
    function markExpanded(node: XmlTreeNode, depth: number) {
      if (depth < maxDepth && node.children && node.children.length > 0) {
        initialExpanded.add(node.xpath);
        node.children.forEach(child => {
          markExpanded(child, depth + 1);
        });
      }
    }
    if (root) markExpanded(root, 0);
    return initialExpanded;
  }, [root, maxDepth]);
  const [expandedPaths, setExpandedPaths] = useState(initialExpandedPaths);
  const [previousRoot, setPreviousRoot] = useState(root);
  const [previousMaxDepth, setPreviousMaxDepth] = useState(maxDepth);
  if (root !== previousRoot || maxDepth !== previousMaxDepth) {
    setPreviousRoot(root);
    setPreviousMaxDepth(maxDepth);
    setExpandedPaths(initialExpandedPaths);
  }

  // Flatten tree for virtual scrolling
  const flattenedNodes = useMemo(() => {
    if (!root) return [];
    return flattenTreeNodes(rootNodes, expandedPaths);
  }, [rootNodes, expandedPaths, root]);

  // Filter nodes by search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return flattenedNodes;
    return flattenedNodes.filter((node) => {
      const name = node.name || '';
      const value = node.value || '';
      const attributes = node.attributes
        ? Object.entries(node.attributes).map(([k, v]) => `${k}="${v}"`).join(' ')
        : '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.xpath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attributes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [flattenedNodes, searchTerm]);

  // Auto-expand paths that match search
  useEffect(() => {
    if (searchTerm && searchTerm !== lastSearchTermRef.current) {
      lastSearchTermRef.current = searchTerm;
      setExpandedPaths((prev) => {
        const newExpanded = new Set(prev);
        let hasChanges = false;
        filteredNodes.forEach((node) => {
          if (node.children && node.children.length > 0 && !newExpanded.has(node.xpath)) {
            newExpanded.add(node.xpath);
            hasChanges = true;
          }
        });
        return hasChanges ? newExpanded : prev;
      });
    } else if (!searchTerm) {
      lastSearchTermRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!root) return;
    const allPaths = new Set<string>();
    function collectPaths(node: XmlTreeNode) {
      if (node.children && node.children.length > 0) {
        allPaths.add(node.xpath);
        node.children.forEach(collectPaths);
      }
    }
    collectPaths(root);
    setExpandedPaths(allPaths);
  }, [root]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleCopy = useCallback(async (node: XmlTreeNode) => {
    try {
      await navigator.clipboard.writeText(node.xpath);
      setCopiedPath(node.xpath);
      setTimeout(() => setCopiedPath(null), 2000);
      onPathClick?.(node.xpath);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [onPathClick]);

  // Function to get XML content of all expanded nodes only with proper indentation
  const getExpandedXml = useCallback((): string => {
    if (!root) return '';

    // Extract XML declaration if present
    const declarationMatch = xmlString.match(/<\?xml[^>]*\?>/);
    const declaration = declarationMatch ? declarationMatch[0] : '';

    const indentSize = 2; // 2 spaces per indentation level
    const indent = (depth: number) => ' '.repeat(depth * indentSize);

    function buildXmlFromNode(node: XmlTreeNode, depth: number = 0): string {
      if (node.type === 'element') {
        const attrs = node.attributes
          ? ' ' + Object.entries(node.attributes)
              .map(([key, value]) => `${key}="${value}"`)
              .join(' ')
          : '';

        if (node.children && node.children.length > 0) {
          if (expandedPaths.has(node.xpath)) {
            // Node is expanded, include its expanded children
            const childrenXml = node.children
              .map(child => buildXmlFromNode(child, depth + 1))
              .filter(xml => xml !== '')
              .join('\n');

            if (childrenXml) {
              return `${indent(depth)}<${node.name}${attrs}>\n${childrenXml}\n${indent(depth)}</${node.name}>`;
            } else if (node.value) {
              // Element with text content only
              return `${indent(depth)}<${node.name}${attrs}>${node.value}</${node.name}>`;
            } else {
              // Empty element
              return `${indent(depth)}<${node.name}${attrs}></${node.name}>`;
            }
          } else {
            // Node is collapsed, return self-closing
            return `${indent(depth)}<${node.name}${attrs}/>`;
          }
        } else if (node.value) {
          // Element with text content, no children
          return `${indent(depth)}<${node.name}${attrs}>${node.value}</${node.name}>`;
        } else {
          // Self-closing element
          return `${indent(depth)}<${node.name}${attrs}/>`;
        }
      } else if (node.type === 'text') {
        // Text node - indent and return value
        const text = (node.value || '').trim();
        return text ? `${indent(depth)}${text}` : '';
      } else if (node.type === 'cdata') {
        return `${indent(depth)}<![CDATA[${node.value || ''}]]>`;
      } else if (node.type === 'comment') {
        return `${indent(depth)}<!--${node.value || ''}-->`;
      }
      return '';
    }

    let xmlContent: string;

    if (!expandedPaths.has(root.xpath) && root.type === 'element') {
      const attrs = root.attributes
        ? ' ' + Object.entries(root.attributes)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ')
        : '';
      xmlContent = `<${root.name}${attrs}/>`;
    } else {
      xmlContent = buildXmlFromNode(root, 0);
    }

    // Add XML declaration if it existed in the original
    return declaration ? `${declaration}\n${xmlContent}` : xmlContent;
  }, [root, expandedPaths, xmlString]);

  // Expose getExpandedXml function to parent
  useEffect(() => {
    onGetExpandedXml?.(getExpandedXml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getExpandedXml]);

  // Scroll to highlighted node
  useEffect(() => {
    if (highlightedPaths.length > 0 && listRef.current) {
      const index = filteredNodes.findIndex((node) => highlightedPathSet.has(node.xpath));
      if (index >= 0) {
        listRef.current.scrollToRow({ index, align: 'center' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedPaths, filteredNodes, highlightedPathSet]);

  const itemHeight = 36;
  const containerHeight = typeof height === 'string'
    ? parseInt(height.replace('px', '')) || 500
    : typeof height === 'number'
    ? height
    : 500;
  const listHeight = Math.max(containerHeight - 60, 100);

  // Row component for react-window v2
  const RowComponent = useCallback(({ index, style, ariaAttributes }: RowComponentProps) => {
    const node = filteredNodes[index];
    if (!node) {
      return <div style={style} />;
    }

    return (
      <div style={style} className="group" {...ariaAttributes}>
        <TreeNodeItem
          node={node}
          isHighlighted={highlightedPathSet.has(node.xpath)}
          isExpanded={expandedPaths.has(node.xpath)}
          onToggle={handleToggle}
          onCopy={handleCopy}
          searchTerm={searchTerm}
          isCopied={copiedPath === node.xpath}
        />
      </div>
    );
  }, [filteredNodes, highlightedPathSet, expandedPaths, handleToggle, handleCopy, searchTerm, copiedPath]);

  if (parseError) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400">
          <p className="text-sm">Error parsing XML: {parseError}</p>
        </div>
      </div>
    );
  }

  if (!root) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
          <p className="text-sm">No XML data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full relative', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-neutral-200 dark:border-neutral-700">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search elements, attributes, or paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Expand/Collapse All */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpandAll}
          className="h-8 px-2 text-xs"
        >
          <ArrowsPointingOutIcon className="h-3 w-3 mr-1" />
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCollapseAll}
          className="h-8 px-2 text-xs"
        >
          <ArrowsPointingInIcon className="h-3 w-3 mr-1" />
          Collapse All
        </Button>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-hidden relative">
        {filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
            No nodes to display
          </div>
        ) : (
          <List<Record<string, never>>
            listRef={listRef}
            style={{ height: `${listHeight}px`, width: '100%' }}
            rowCount={filteredNodes.length}
            rowHeight={itemHeight}
            rowComponent={RowComponent}
            rowProps={{} as Record<string, never>}
            className="scrollbar-thin"
          />
        )}
      </div>
    </div>
  );
}

