'use client';

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { getMonacoTheme } from '@/config/monaco-themes';
import { DEFAULT_EDITOR_THEME_COLORS, getThemeColors, loadShikiTheme, type EditorThemeColors } from '@/libs/shiki-init';
import { cn } from '@/libs/utils';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List, useListRef, type RowComponentProps } from 'react-window';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface JsonTreeNode {
  key: string | number;
  value: JsonValue;
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  level: number;
  isExpanded?: boolean;
  children?: JsonTreeNode[];
  parent?: JsonTreeNode;
  isLastChild: boolean;
  continuations: boolean[]; // per ancestor slot: true = draw vertical continuation line
}

export interface JsonTreeViewProps {
  data: JsonValue;
  highlightedPaths?: string[];
  onPathClick?: (path: string) => void;
  onGetExpandedJson?: (getExpandedJson: () => string) => void; // Callback to expose function to get expanded JSON
  maxDepth?: number;
  className?: string;
  theme?: CodeEditorTheme; // Active code editor theme for color sync
  // Controlled search term from the parent (parent renders the search input)
  searchTerm?: string;
  // Register expand/collapse-all controls with the parent (parent-owned footer buttons)
  onExpandAll?: (fn: () => void) => void;
  onCollapseAll?: (fn: () => void) => void;
}

// Transform JSON data into tree nodes
function transformToTreeNodes(
  data: JsonValue,
  key: string | number = 'root',
  path: string = '$',
  level: number = 0,
  maxDepth: number = 3,
  parent?: JsonTreeNode,
  isLastChild: boolean = true,
  continuations: boolean[] = []
): JsonTreeNode[] {
  const nodes: JsonTreeNode[] = [];

  // Continuations to pass down to children of this node:
  // - root (level 0) children get [] (no ancestor slots needed yet)
  // - deeper children get [...parent.continuations, !parent.isLastChild]
  const childContinuations = level === 0 ? [] : [...continuations, !isLastChild];

  if (data === null || data === undefined) {
    nodes.push({
      key,
      value: null,
      path,
      type: 'null',
      level,
      isExpanded: false,
      parent,
      isLastChild,
      continuations,
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
      isLastChild,
      continuations,
    };
    node.children = data.map((item, index) => {
      const childIsLast = index === data.length - 1;
      const childNodes = transformToTreeNodes(item, index, `${path}[${index}]`, level + 1, maxDepth, node, childIsLast, childContinuations);
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
      isLastChild,
      continuations,
    };
    node.children = keys.map((k, index) => {
      const childIsLast = index === keys.length - 1;
      const childNodes = transformToTreeNodes(data[k], k, `${path}.${k}`, level + 1, maxDepth, node, childIsLast, childContinuations);
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
      isLastChild,
      continuations,
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

// Format value for display
function formatValue(value: JsonValue, type: string): string {
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
  isCopied,
  themeColors,
}: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = node.key === 'root' && node.level === 0;
  const displayKey = isRoot
    ? (node.type === 'array' ? '[]' : node.type === 'object' ? '{}' : '')
    : (typeof node.key === 'number' ? `[${node.key}]` : String(node.key));
  const displayValue = node.type === 'object' || node.type === 'array'
    ? node.type === 'array' ? `[${node.children?.length || 0}]` : `{${node.children?.length || 0}}`
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
        'flex items-center gap-2 pr-2 h-full hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
        isHighlighted && 'bg-orange-50 dark:bg-orange-950/30 border-l-2 border-orange-600',
        isSearchMatch && !isHighlighted && 'bg-yellow-50 dark:bg-yellow-950/20'
      )}
      style={isHighlighted ? { backgroundColor: themeColors.findMatchBackground, color: themeColors.foreground } : { color: themeColors.foreground }}
    >
      {/* Tree Lines */}
      {node.level === 0 ? (
        <div className="w-2 shrink-0" />
      ) : (
        <div className="flex self-stretch shrink-0">
          {/* Ancestor continuation slots */}
          {node.continuations.map((hasContinuation, i) => (
            <div key={i} className="w-5 relative">
              {hasContinuation && (
                <div className="absolute top-0 bottom-0 left-[9px] w-px bg-neutral-300 dark:bg-neutral-600" />
              )}
            </div>
          ))}
          {/* Current-level connector (├ or └ shape) */}
          <div className="w-5 relative">
            {/* Vertical segment: full height if not last child, half if last */}
            <div className={cn(
              'absolute left-[9px] w-px bg-neutral-300 dark:bg-neutral-600',
              node.isLastChild ? 'top-0 bottom-1/2' : 'top-0 bottom-0'
            )} />
            {/* Horizontal segment */}
            <div className="absolute left-[9px] right-0 top-1/2 h-px bg-neutral-300 dark:bg-neutral-600" />
          </div>
        </div>
      )}

      {/* Copy Button (left of expand, shows path as tooltip on hover) */}
      <div className="relative shrink-0 opacity-0 group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors peer"
          aria-label="Copy JSON path"
        >
          {isCopied ? (
            <CheckIcon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
          ) : (
            <DocumentDuplicateIcon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>
        {/* Path tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 px-2 py-1 rounded bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 text-xs font-mono whitespace-nowrap pointer-events-none z-50 hidden peer-hover:block">
          {node.path}
        </div>
      </div>

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
    </div>
  );
}

export const JsonTreeView = memo(function JsonTreeView({
  data,
  highlightedPaths = [],
  onGetExpandedJson,
  maxDepth = 3,
  className,
  theme = 'basicDark',
  searchTerm = '',
  onExpandAll,
  onCollapseAll,
}: JsonTreeViewProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [themeColors, setThemeColors] = useState<EditorThemeColors | null>(null);
  const listRef = useListRef(null);
  const highlightedPathSet = useMemo(() => new Set(highlightedPaths), [highlightedPaths]);
  const lastSearchTermRef = useRef<string>('');

  // Fetch theme colors from Shiki when theme changes
  useEffect(() => {
    let cancelled = false;
    const applyThemeColors = async () => {
      const shikiThemeName = getMonacoTheme(theme);
      try {
        // Await highlighter + theme readiness so colors resolve on first mount too
        await loadShikiTheme(shikiThemeName);
      } catch {
        // Theme may be unavailable; fall back to defaults below
      }
      if (cancelled) return;
      const colors = getThemeColors(shikiThemeName);
      if (colors) setThemeColors(colors);
    };
    applyThemeColors();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  // Fallback colors for initial render / SSR
  const colors = useMemo<EditorThemeColors>(() => {
    return themeColors || DEFAULT_EDITOR_THEME_COLORS;
  }, [themeColors]);

  // Transform data to tree nodes
  const rootNodes = useMemo(() => {
    return transformToTreeNodes(data, 'root', '$', 0, maxDepth);
  }, [data, maxDepth]);

  const initialExpandedPaths = useMemo(() => {
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
    return initialExpanded;
  }, [rootNodes]);
  const [expandedPaths, setExpandedPaths] = useState(initialExpandedPaths);
  const [previousRootNodes, setPreviousRootNodes] = useState(rootNodes);
  if (rootNodes !== previousRootNodes) {
    setPreviousRootNodes(rootNodes);
    setExpandedPaths(initialExpandedPaths);
  }

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

  // Expose expand/collapse-all controls to the parent's footer buttons
  useEffect(() => {
    onExpandAll?.(handleExpandAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleExpandAll]);

  useEffect(() => {
    onCollapseAll?.(handleCollapseAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCollapseAll]);

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

  // Function to get JSON content of all expanded nodes only
  const getExpandedJson = useCallback((): string => {
    // Reconstruct JSON from expanded nodes only - collapsed nodes are completely removed
    function buildFromNode(node: JsonTreeNode): JsonValue | undefined {
      if (node.type === 'object') {
        if (expandedPaths.has(node.path) && node.children) {
          // Node is expanded, include only its expanded children
          const obj: Record<string, JsonValue> = {};
          node.children.forEach((child) => {
            if (child.type === 'object' || child.type === 'array') {
              if (expandedPaths.has(child.path)) {
                // Child is also expanded, recurse to get its expanded structure
                const childValue = buildFromNode(child);
                if (childValue !== undefined) {
                  obj[child.key] = childValue;
                }
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
          const result: JsonValue[] = [];
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
  const RowComponent = useCallback(({ index, style, ariaAttributes }: RowComponentProps) => {
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
          isCopied={copiedPath === node.path}
          themeColors={colors}
        />
      </div>
    );
  }, [filteredNodes, highlightedPathSet, expandedPaths, handleToggle, handleCopy, searchTerm, copiedPath, colors]);

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
});

