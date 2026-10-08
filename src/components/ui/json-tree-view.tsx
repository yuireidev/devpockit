'use client';

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { getMonacoTheme } from '@/config/monaco-themes';
import { getShikiHighlighter, getThemeColors, type EditorThemeColors } from '@/libs/shiki-init';
import { cn } from '@/libs/utils';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List, useListRef } from 'react-window';

export interface JsonTreeNode {
  key: string | number;
  value: any;
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  level: number;
  isExpanded?: boolean;
  children?: JsonTreeNode[];
  parent?: JsonTreeNode;
}

export interface JsonTreeViewProps {
  data: any;
  highlightedPaths?: string[];
  onPathClick?: (path: string) => void;
  onGetExpandedJson?: (getExpandedJson: () => string) => void; // Callback to expose function to get expanded JSON
  maxDepth?: number;
  className?: string;
  theme?: CodeEditorTheme; // Active code editor theme for color sync
  // Search props (controlled)
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  // Expand/Collapse props (controlled)
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
}

// Transform JSON data into tree nodes
function transformToTreeNodes(
  data: any,
  key: string | number = 'root',
  path: string = '$',
  level: number = 0,
  maxDepth: number = 3,
  parent?: JsonTreeNode
): JsonTreeNode[] {
  const nodes: JsonTreeNode[] = [];

  if (data === null || data === undefined) {
    nodes.push({
      key,
      value: null,
      path,
      type: 'null',
      level,
      isExpanded: false,
      parent,
    });
    return nodes;
  }

  if (Array.isArray(data)) {
    const node: JsonTreeNode = {
      key,
      value: data,
      path,
      type: 'array',
      level,
      isExpanded: level < maxDepth,
      parent,
      children: [],
    };
    node.children = data.map((item, index) => {
      const childNodes = transformToTreeNodes(item, index, `${path}[${index}]`, level + 1, maxDepth, node);
      return childNodes[0];
    });
    nodes.push(node);
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    const node: JsonTreeNode = {
      key,
      value: data,
      path,
      type: 'object',
      level,
      isExpanded: level < maxDepth,
      parent,
      children: [],
    };
    node.children = keys.map((k) => {
      const childNodes = transformToTreeNodes(data[k], k, `${path}.${k}`, level + 1, maxDepth, node);
      return childNodes[0];
    });
    nodes.push(node);
  } else {
    // Primitive value
    nodes.push({
      key,
      value: data,
      path,
      type: typeof data as 'string' | 'number' | 'boolean',
      level,
      isExpanded: false,
      parent,
    });
  }

  return nodes;
}

// Flatten tree nodes for virtual scrolling
function flattenTreeNodes(nodes: JsonTreeNode[], expandedPaths: Set<string>): JsonTreeNode[] {
  const flattened: JsonTreeNode[] = [];

  function traverse(nodeList: JsonTreeNode[]) {
    for (const node of nodeList) {
      flattened.push(node);
      if (node.children && node.children.length > 0 && expandedPaths.has(node.path)) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return flattened;
}

// Get expanded value (full JSON subtree)
function getExpandedValue(node: JsonTreeNode): string {
  if (node.type === 'object' || node.type === 'array') {
    return JSON.stringify(node.value, null, 2);
  }
  return JSON.stringify(node.value);
}

// Format value for display
function formatValue(value: any, type: string): string {
  if (type === 'string') {
    return `"${value}"`;
  }
  if (type === 'null') {
    return 'null';
  }
  if (type === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

// Get type badge color
function getTypeColor(type: string): string {
  switch (type) {
    case 'object':
      return 'text-neutral-600 dark:text-neutral-400';
    case 'array':
      return 'text-neutral-500 dark:text-neutral-500';
    case 'string':
      return 'text-green-600 dark:text-green-400';
    case 'number':
      return 'text-blue-600 dark:text-blue-400';
    case 'boolean':
      return 'text-orange-600 dark:text-orange-400';
    case 'null':
      return 'text-neutral-400 dark:text-neutral-600';
    default:
      return 'text-neutral-600 dark:text-neutral-400';
  }
}

// Get type badge background
function getTypeBg(type: string): string {
  switch (type) {
    case 'object':
      return 'bg-neutral-100 dark:bg-neutral-700';
    case 'array':
      return 'bg-neutral-50 dark:bg-neutral-800';
    case 'string':
      return 'bg-green-50 dark:bg-green-950/20';
    case 'number':
      return 'bg-blue-50 dark:bg-blue-950/20';
    case 'boolean':
      return 'bg-orange-50 dark:bg-orange-950/20';
    case 'null':
      return 'bg-neutral-50 dark:bg-neutral-800';
    default:
      return 'bg-neutral-100 dark:bg-neutral-700';
  }
}

interface TreeNodeItemProps {
  node: JsonTreeNode;
  isHighlighted: boolean;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  onCopy: (node: JsonTreeNode) => void;
  searchTerm: string;
  itemHeight: number;
  isCopied: boolean;
  themeColors: EditorThemeColors;
}

function TreeNodeItem({
  node,
  isHighlighted,
  isExpanded,
  onToggle,
  onCopy,
  searchTerm,
  itemHeight,
  isCopied,
  themeColors,
}: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const indent = node.level * 20;
  const isRoot = node.key === 'root' && node.level === 0;
  const displayKey = isRoot
    ? (node.type === 'array' ? '[]' : node.type === 'object' ? '{}' : '')
    : (typeof node.key === 'number' ? `[${node.key}]` : String(node.key));
  const displayValue = node.type === 'object' || node.type === 'array'
    ? `${node.type === 'array' ? 'Array' : 'Object'} (${node.children?.length || 0} ${node.children?.length === 1 ? 'item' : 'items'})`
    : formatValue(node.value, node.type);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(node);
  };

  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.path);
    }
  };

  const isSearchMatch = searchTerm && (
    displayKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    displayValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeBadgeBg = getTypeBg(node.type);
  const typeBadgeColor = getTypeColor(node.type);

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-2 py-1.5 hover:opacity-80 transition-colors',
        isHighlighted && 'border-l-2',
        isSearchMatch && !isHighlighted && ''
      )}
      style={{
        paddingLeft: `${indent + 8}px`,
        backgroundColor: isHighlighted ? themeColors.findMatchBackground : 'transparent',
        color: themeColors.foreground,
      }}
    >
      {/* Expand/Collapse Button */}
      <button
        onClick={handleToggle}
        disabled={!hasChildren}
        className={cn(
          'shrink-0 w-4 h-4 flex items-center justify-center rounded hover:opacity-70 transition-colors',
          !hasChildren && 'opacity-0 cursor-default'
        )}
        style={{ color: themeColors.foreground }}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {hasChildren && (
          isExpanded ? (
            <ChevronDownIcon className="h-3 w-3" style={{ color: themeColors.foreground }} />
          ) : (
            <ChevronRightIcon className="h-3 w-3" style={{ color: themeColors.foreground }} />
          )
        )}
      </button>

      {/* Type Badge */}
      <span
        className={cn(
          'shrink-0 px-1.5 py-0.5 text-xs font-mono rounded',
          typeBadgeBg,
          typeBadgeColor
        )}
      >
        {node.type === 'object' ? '{}' : node.type === 'array' ? '[]' : node.type[0].toUpperCase()}
      </span>

      {/* Key */}
      {!isRoot && (
        <span className="font-mono text-sm" style={{ color: themeColors.foreground }}>
          {displayKey}:
        </span>
      )}

      {/* Value */}
      <span className={cn('text-sm flex-1', typeBadgeColor)}>
        {displayValue}
      </span>

      {/* Path (on hover tooltip would go here) */}
      <span
        className="text-xs font-mono hidden group-hover:inline"
        style={{ color: themeColors.foreground, opacity: 0.7 }}
      >
        {node.path}
      </span>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="shrink-0 p-1 rounded hover:opacity-70 transition-colors opacity-0 group-hover:opacity-100"
        style={{ color: themeColors.foreground }}
        aria-label="Copy JSON path"
      >
        {isCopied ? (
          <CheckIcon className="h-3.5 w-3.5" style={{ color: themeColors.foreground }} />
        ) : (
          <DocumentDuplicateIcon className="h-3.5 w-3.5" style={{ color: themeColors.foreground }} />
        )}
      </button>
    </div>
  );
}

export function JsonTreeView({
  data,
  highlightedPaths = [],
  onPathClick,
  onGetExpandedJson,
  maxDepth = 3,
  className,
  theme = 'basicDark',
  searchTerm = '',
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}: JsonTreeViewProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState<EditorThemeColors | null>(null);
  const listRef = useListRef(null);
  const highlightedPathSet = useMemo(() => new Set(highlightedPaths), [highlightedPaths]);
  const lastSearchTermRef = useRef<string>('');

  // Fetch theme colors from Shiki when theme changes
  useEffect(() => {
    const highlighter = getShikiHighlighter();
    if (!highlighter) return;

    const shikiThemeName = getMonacoTheme(theme);
    highlighter.loadTheme(shikiThemeName as any)
      .then(() => {
        const colors = getThemeColors(shikiThemeName);
        if (colors) setThemeColors(colors);
      })
      .catch(() => {
        // Theme may already be loaded; try fetching directly
        const colors = getThemeColors(shikiThemeName);
        if (colors) setThemeColors(colors);
      });
  }, [theme]);

  // Fallback colors for initial render / SSR
  const colors = useMemo<EditorThemeColors>(() => {
    return themeColors || {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      lineNumber: '#858585',
      findMatchBackground: '#ffd700',
      findMatchHighlightBackground: '#ffff00',
      selectionBackground: '#264f78',
    };
  }, [themeColors]);

  // Transform data to tree nodes
  const rootNodes = useMemo(() => {
    return transformToTreeNodes(data, 'root', '$', 0, maxDepth);
  }, [data, maxDepth]);

  // Initialize expanded paths based on maxDepth
  useEffect(() => {
    const initialExpanded = new Set<string>();
    function markExpanded(nodes: JsonTreeNode[]) {
      for (const node of nodes) {
        if (node.isExpanded && node.children && node.children.length > 0) {
          initialExpanded.add(node.path);
          if (node.children) {
            markExpanded(node.children);
          }
        }
      }
    }
    markExpanded(rootNodes);
    setExpandedPaths(initialExpanded);
  }, [rootNodes]);

  // Flatten tree for virtual scrolling
  const flattenedNodes = useMemo(() => {
    return flattenTreeNodes(rootNodes, expandedPaths);
  }, [rootNodes, expandedPaths]);

  // Filter nodes by search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return flattenedNodes;
    return flattenedNodes.filter((node) => {
      const key = String(node.key === 'root' ? '' : node.key);
      const value = node.type === 'object' || node.type === 'array'
        ? `${node.type}`
        : formatValue(node.value, node.type);
      return (
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [flattenedNodes, searchTerm]);

  // Auto-expand paths that match search (only when search term changes)
  useEffect(() => {
    if (searchTerm && searchTerm !== lastSearchTermRef.current) {
      lastSearchTermRef.current = searchTerm;
      setExpandedPaths((prev) => {
        const newExpanded = new Set(prev);
        let hasChanges = false;
        // Use filteredNodes from the current render
        filteredNodes.forEach((node) => {
          if (node.children && node.children.length > 0 && !newExpanded.has(node.path)) {
            newExpanded.add(node.path);
            hasChanges = true;
          }
        });
        // Only update if there are actual changes to prevent infinite loops
        return hasChanges ? newExpanded : prev;
      });
    } else if (!searchTerm) {
      lastSearchTermRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Only depend on searchTerm to prevent infinite loops

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
    const allPaths = new Set<string>();
    function collectPaths(nodes: JsonTreeNode[]) {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          allPaths.add(node.path);
          collectPaths(node.children);
        }
      }
    }
    collectPaths(rootNodes);
    setExpandedPaths(allPaths);
  }, [rootNodes]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleCopy = useCallback(async (node: JsonTreeNode) => {
    try {
      // Copy the JSON path expression instead of the value
      await navigator.clipboard.writeText(node.path);
      setCopiedPath(node.path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleNodeClick = useCallback((path: string) => {
    onPathClick?.(path);
  }, [onPathClick]);

  // Function to get JSON content of all expanded nodes only
  const getExpandedJson = useCallback((): string => {
    // Reconstruct JSON from expanded nodes only - collapsed nodes are completely removed
    function buildFromNode(node: JsonTreeNode): any {
      if (node.type === 'object') {
        if (expandedPaths.has(node.path) && node.children) {
          // Node is expanded, include only its expanded children
          const obj: any = {};
          node.children.forEach((child) => {
            if (child.type === 'object' || child.type === 'array') {
              if (expandedPaths.has(child.path)) {
                // Child is also expanded, recurse to get its expanded structure
                obj[child.key] = buildFromNode(child);
              }
              // If child is collapsed, skip it entirely (don't include in result)
            } else {
              // Primitive value - always include
              obj[child.key] = child.value;
            }
          });
          return obj;
        } else {
          // Node is collapsed, return undefined to exclude it
          return undefined;
        }
      } else if (node.type === 'array') {
        if (expandedPaths.has(node.path) && node.children) {
          // Node is expanded, include only its expanded children
          const result: any[] = [];
          node.children.forEach((child) => {
            if (child.type === 'object' || child.type === 'array') {
              if (expandedPaths.has(child.path)) {
                // Child is also expanded, recurse to get its expanded structure
                const childValue = buildFromNode(child);
                if (childValue !== undefined) {
                  result.push(childValue);
                }
              }
              // If child is collapsed, skip it entirely
            } else {
              // Primitive value - always include
              result.push(child.value);
            }
          });
          return result;
        } else {
          // Node is collapsed, return undefined to exclude it
          return undefined;
        }
      } else {
        // Primitive value
        return node.value;
      }
    }

    if (rootNodes.length === 0) {
      return '';
    }

    const rootNode = rootNodes[0];
    // Root node is always visible, so we need to check if it's expanded
    // If root is not expanded, return empty structure
    if (!expandedPaths.has(rootNode.path) && (rootNode.type === 'object' || rootNode.type === 'array')) {
      return JSON.stringify(rootNode.type === 'array' ? [] : {}, null, 2);
    }

    const expandedJson = buildFromNode(rootNode);
    return JSON.stringify(expandedJson, null, 2);
  }, [rootNodes, expandedPaths]);

  // Expose getExpandedJson function to parent
  useEffect(() => {
    onGetExpandedJson?.(getExpandedJson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getExpandedJson]);

  // Scroll to highlighted node
  useEffect(() => {
    if (highlightedPaths.length > 0 && listRef.current) {
      const index = filteredNodes.findIndex((node) => highlightedPathSet.has(node.path));
      if (index >= 0) {
        listRef.current.scrollToRow({ index, align: 'center' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedPaths, filteredNodes, highlightedPathSet]);

  const itemHeight = 36;

  // Row component for react-window v2
  const RowComponent = useCallback(({ index, style, ariaAttributes }: { index: number; style: React.CSSProperties; ariaAttributes: any }) => {
    const node = filteredNodes[index];
    if (!node) {
      return <div style={style} />;
    }

    return (
      <div style={{ ...style, backgroundColor: colors.background }} className="group" {...ariaAttributes}>
        <TreeNodeItem
          node={node}
          isHighlighted={highlightedPathSet.has(node.path)}
          isExpanded={expandedPaths.has(node.path)}
          onToggle={handleToggle}
          onCopy={handleCopy}
          searchTerm={searchTerm}
          itemHeight={itemHeight}
          isCopied={copiedPath === node.path}
          themeColors={colors}
        />
      </div>
    );
  }, [filteredNodes, highlightedPathSet, expandedPaths, handleToggle, handleCopy, searchTerm, copiedPath, itemHeight, colors]);

return (
    <div className={cn('flex flex-col h-full relative rounded-[10px]', className)} style={{ backgroundColor: colors.background, color: colors.foreground }}>
      {/* Tree View */}
      <div className="flex-1 overflow-hidden relative rounded-[10px]" style={{ backgroundColor: colors.background }}>
        {filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ color: colors.foreground }}>
            No nodes to display
          </div>
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: colors.background }}>
            <List<Record<string, never>>
              listRef={listRef}
              style={{ height: '100%', width: '100%', backgroundColor: colors.background }}
              rowCount={filteredNodes.length}
              rowHeight={itemHeight}
              rowComponent={RowComponent}
              rowProps={{} as Record<string, never>}
              className="scrollbar-thin"
            />
          </div>
        )}
      </div>
    </div>
  );
}

