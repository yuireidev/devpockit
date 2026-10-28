'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

// Define the structure for tool state
export interface ToolState {
  options?: unknown;
  output?: string;
  error?: string;
  stats?: unknown;
  [key: string]: unknown;
}

// Define the context type
interface ToolStateContextType {
  toolStates: Record<string, ToolState>;
  updateToolState: (toolId: string, instanceId: string, state: Partial<ToolState>) => void;
  getToolState: (toolId: string, instanceId: string) => ToolState | undefined;
  clearToolState: (toolId: string, instanceId: string) => void;
  clearAllToolStates: () => void;
}

// Create the context
const ToolStateContext = createContext<ToolStateContextType | undefined>(undefined);

// Provider component
interface ToolStateProviderProps {
  children: ReactNode;
}

export function ToolStateProvider({ children }: ToolStateProviderProps) {
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});

  const updateToolState = useCallback((toolId: string, instanceId: string, state: Partial<ToolState>) => {
    // Create composite key: toolId:instanceId
    const stateKey = `${toolId}:${instanceId}`;

    setToolStates(prev => {
      const currentState = prev[stateKey] || {};
      const newState = { ...currentState, ...state };

      // Only update if the state actually changed
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        return {
          ...prev,
          [stateKey]: newState
        };
      }
      return prev;
    });
  }, []);

  const getToolState = useCallback((toolId: string, instanceId: string): ToolState | undefined => {
    // Create composite key: toolId:instanceId
    const stateKey = `${toolId}:${instanceId}`;
    return toolStates[stateKey];
  }, [toolStates]);

  const clearToolState = useCallback((toolId: string, instanceId: string) => {
    // Create composite key: toolId:instanceId
    const stateKey = `${toolId}:${instanceId}`;

    setToolStates(prev => {
      const newStates = { ...prev };
      delete newStates[stateKey];
      return newStates;
    });
  }, []);

  const clearAllToolStates = useCallback(() => {
    setToolStates({});
  }, []);

  const value: ToolStateContextType = {
    toolStates,
    updateToolState,
    getToolState,
    clearToolState,
    clearAllToolStates,
  };

  return (
    <ToolStateContext.Provider value={value}>
      {children}
    </ToolStateContext.Provider>
  );
}

// Custom hook to use the tool state context
export function useToolState(toolId: string, instanceId: string) {
  const context = useContext(ToolStateContext);

  if (context === undefined) {
    throw new Error('useToolState must be used within a ToolStateProvider');
  }

  const { getToolState, updateToolState, clearToolState } = context;

  // Memoize wrapper functions to prevent unnecessary re-renders
  const memoizedUpdateToolState = useCallback(
    (state: Partial<ToolState>) => updateToolState(toolId, instanceId, state),
    [toolId, instanceId, updateToolState]
  );

  const memoizedClearToolState = useCallback(
    () => clearToolState(toolId, instanceId),
    [toolId, instanceId, clearToolState]
  );

  const toolState = useMemo(
    () => getToolState(toolId, instanceId),
    [toolId, instanceId, getToolState]
  );

  return {
    toolState,
    updateToolState: memoizedUpdateToolState,
    clearToolState: memoizedClearToolState
  };
}

// Hook to access the full context
export function useToolStateContext() {
  const context = useContext(ToolStateContext);

  if (context === undefined) {
    throw new Error('useToolStateContext must be used within a ToolStateProvider');
  }

  return context;
}
