'use client';

import { ToolActivityProvider, useToolActivity } from '@/components/providers/ToolActivityProvider';
import { ToolStateProvider, useToolStateContext } from '@/components/providers/ToolStateProvider';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { getToolComponent } from '@/libs/tool-components';
import { getToolById } from '@/libs/tools-data';
import { generateInstanceId, isValidCategoryUrl, isValidToolUrl, parseToolUrl } from '@/libs/url-utils';
import { cn } from '@/libs/utils';
import { usePathname, useRouter } from 'next/navigation';
import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { AppSidebar } from '../AppSidebar';
import { AboutPage } from '../pages/AboutPage';
import { WelcomePage } from '../pages/WelcomePage';
import { CommandPalette } from './CommandPalette';
import { DesktopRecommendedBanner } from './DesktopRecommendedBanner';
import { MobileTopBar } from './MobileTopBar';
import { TopNavTabs, type ActiveTab } from './TopNavTabs';

const MAX_INSTANCES = 5;
const ABOUT_TOOL_ID = 'about';
const ABOUT_INSTANCE_ID = '1';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Dynamic tool renderer component
function DynamicToolRenderer({ toolId, instanceId }: { toolId: string; instanceId: string }) {
  const [ToolComponent, setToolComponent] = useState<React.ComponentType<{ instanceId: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const tool = getToolById(toolId);
        if (!tool) {
          setError('Tool not found');
          return;
        }
        const component = await getToolComponent(tool.component);
        setToolComponent(() => component as React.ComponentType<{ instanceId: string }>);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load component');
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [toolId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary motion-reduce:animate-none" />
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!ToolComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Component not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <ToolComponent instanceId={instanceId} />
    </div>
  );
}

// Helper to check if pathname is the about page (handles trailing slash)
function isAboutPage(pathname: string): boolean {
  return pathname === '/about' || pathname === '/about/';
}

// Inner component that has access to ToolStateContext
function AppLayoutInner({ children }: AppLayoutProps) {
  const { clearToolState, clearAllToolStates } = useToolStateContext();
  const { recordToolOpen } = useToolActivity();
  const { isMobile } = useSidebar();
  const [activeTabs, setActiveTabs] = useState<ActiveTab[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | undefined>();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>();
  const [previousTool, setPreviousTool] = useState<string | undefined>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ref to track tab operations - prevents useEffect from recreating tabs during close
  const activeTabsRef = useRef<ActiveTab[]>([]);

  // Keep ref in sync with state (must be in effect, not during render)
  useEffect(() => {
    activeTabsRef.current = activeTabs;
  }, [activeTabs]);

  // Helper to clear tool selection
  const clearToolSelection = useCallback(() => {
    startTransition(() => {
      setSelectedTool(undefined);
      setSelectedInstanceId(undefined);
    });
  }, []);

  // Helper to restore previous tool
  const restorePreviousTool = useCallback(() => {
    if (!previousTool) return;
    const tool = getToolById(previousTool);
    if (tool) {
      const existingTab = activeTabs.find(t => t.toolId === previousTool);
      const instanceId = existingTab?.instanceId || '1';
      router.replace(`/tools/${tool.category}/${previousTool}/${instanceId}`);
    }
  }, [previousTool, activeTabs, router]);

  // Sync URL with selected tool and tabs
  useEffect(() => {
    if (isValidToolUrl(pathname)) {
      const parsed = parseToolUrl(pathname);
      if (parsed) {
        // If instanceId is missing, generate one and redirect
        if (!parsed.instanceId) {
          // Get existing instance IDs for this tool (use ref to avoid stale closure)
          const existingInstances = activeTabsRef.current.filter(t => t.toolId === parsed.toolId);
          const existingInstanceIds = existingInstances.map(t => t.instanceId);

          // Generate next available instance ID
          const instanceId = generateInstanceId(existingInstanceIds);
          router.replace(`/tools/${parsed.category}/${parsed.toolId}/${instanceId}`);
          return;
        }

        // Update selectedTool and tabs using startTransition for non-urgent updates
        startTransition(() => {
          setSelectedTool(parsed.toolId);
          setSelectedInstanceId(parsed.instanceId || undefined);
          // Update previousTool to track the last active tool
          setPreviousTool(parsed.toolId);

          // Update tabs to reflect the current tool
          if (!isMobile) {
            const tool = getToolById(parsed.toolId);
            if (tool) {
              setActiveTabs(currentTabs => {
                // Check if this exact instance already exists
                const existingTab = currentTabs.find(
                  tab => tab.toolId === parsed.toolId && tab.instanceId === parsed.instanceId
                );

                if (!existingTab && parsed.instanceId) {
                  // Create new tab for this instance
                  const instanceNum = parseInt(parsed.instanceId, 10);
                  const displayName = (!isNaN(instanceNum) && instanceNum > 1)
                    ? `${tool.name} (${instanceNum})`
                    : tool.name;

                  const newTab: ActiveTab = {
                    toolId: parsed.toolId,
                    instanceId: parsed.instanceId,
                    toolName: tool.name,
                    category: tool.category,
                    isActive: true,
                    displayName,
                  };

                  const updatedTabs = currentTabs.map(tab => ({ ...tab, isActive: false }));
                  return [...updatedTabs, newTab];
                } else if (parsed.instanceId) {
                  // Activate existing tab
                  return currentTabs.map(tab => ({
                    ...tab,
                    isActive: tab.toolId === parsed.toolId && tab.instanceId === parsed.instanceId
                  }));
                }
                return currentTabs;
              });
            }
          }
        });
      }
    } else if (isAboutPage(pathname)) {
      // About page - treat as a special tool tab with only 1 instance
      startTransition(() => {
        setSelectedTool(ABOUT_TOOL_ID);
        setSelectedInstanceId(ABOUT_INSTANCE_ID);
        setPreviousTool(ABOUT_TOOL_ID);

        // Update tabs to reflect the About page
        if (!isMobile) {
          setActiveTabs(currentTabs => {
            const existingAboutTab = currentTabs.find(
              tab => tab.toolId === ABOUT_TOOL_ID && tab.instanceId === ABOUT_INSTANCE_ID
            );

            if (!existingAboutTab) {
              // Create new About tab (only 1 instance allowed)
              const newTab: ActiveTab = {
                toolId: ABOUT_TOOL_ID,
                instanceId: ABOUT_INSTANCE_ID,
                toolName: 'About',
                category: 'utilities',
                isActive: true,
                displayName: 'About',
              };
              return [...currentTabs.map(tab => ({ ...tab, isActive: false })), newTab];
            }
            // Activate existing About tab
            return currentTabs.map(tab => ({
              ...tab,
              isActive: tab.toolId === ABOUT_TOOL_ID && tab.instanceId === ABOUT_INSTANCE_ID
            }));
          });
        }
      });
    } else if (isValidCategoryUrl(pathname) || pathname === '/') {
      // Category page or home page - show welcome page
      clearToolSelection();
    } else {
      // Invalid URL, redirect to home
      router.push('/');
    }
    // Note: activeTabs removed from deps - using ref instead to prevent recreating tabs during close
  }, [pathname, router, isMobile, clearToolSelection]);

  useEffect(() => {
    if (!isValidToolUrl(pathname)) return;
    const parsed = parseToolUrl(pathname);
    if (parsed?.toolId && parsed.toolId !== ABOUT_TOOL_ID) {
      recordToolOpen(parsed.toolId);
    }
  }, [pathname, recordToolOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C for copy (when implemented in tools)
      if (e.ctrlKey && e.key === 'c') {
        // This will be handled by individual tools
        return;
      }

      // Escape key handling - prioritize command palette if open
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          // Command palette will handle its own close via onOpenChange
          return;
        }
        e.preventDefault();
        if (selectedTool && selectedInstanceId) {
          setPreviousTool(selectedTool);
          router.replace('/');
        } else {
          restorePreviousTool();
        }
        return;
      }

      // Ctrl+K or Cmd+K for command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, selectedInstanceId, router, restorePreviousTool, isCommandPaletteOpen]);

  const handleToolSelect = (toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    // Check if we're at max instances (5)
    const existingInstances = activeTabs.filter(t => t.toolId === toolId);
    if (existingInstances.length >= MAX_INSTANCES) {
      // Show alert - max instances reached
      setAlertMessage(`Maximum ${MAX_INSTANCES} instances allowed for "${tool.name}". Please close an existing instance before opening a new one.`);
      setAlertOpen(true);
      // Activate last instance instead
      const lastInstance = existingInstances[existingInstances.length - 1];
      router.push(`/tools/${tool.category}/${toolId}/${lastInstance.instanceId}`);
      return;
    }

    // Get existing instance IDs for this tool
    const existingInstanceIds = existingInstances.map(t => t.instanceId);

    // Generate next available instance ID (1, 2, 3, etc.)
    const instanceId = generateInstanceId(existingInstanceIds);

    // Update previousTool to track the last active tool
    setPreviousTool(toolId);
    // Navigate to new instance URL - the useEffect will handle tab management
    router.push(`/tools/${tool.category}/${toolId}/${instanceId}`);
  };

  const handleTabSelect = (toolId: string, instanceId: string) => {
    // Navigate to the correct URL
    if (toolId === ABOUT_TOOL_ID) {
      if (!isAboutPage(pathname)) {
        router.push('/about');
      }
    } else {
      const tool = getToolById(toolId);
      if (!tool) return;

      const targetUrl = `/tools/${tool.category}/${toolId}/${instanceId}`;
      if (pathname !== targetUrl) {
        router.push(targetUrl);
      }
    }

    // Update active tab state
    setActiveTabs(tabs =>
      tabs.map(tab => ({
        ...tab,
        isActive: tab.toolId === toolId && tab.instanceId === instanceId
      }))
    );
  };

  const handleTabClose = (toolId: string, instanceId: string) => {
    // Clear the tool state for this specific instance (skip for About page)
    if (toolId !== ABOUT_TOOL_ID) {
      clearToolState(toolId, instanceId);
    }

    const updatedTabs = activeTabs.filter(
      tab => !(tab.toolId === toolId && tab.instanceId === instanceId)
    );
    setActiveTabs(updatedTabs);

    // If closing active tab, navigate to another tab or home
    if (selectedTool === toolId && selectedInstanceId === instanceId) {
      if (updatedTabs.length > 0) {
        const lastTab = updatedTabs[updatedTabs.length - 1];
        if (lastTab.toolId === ABOUT_TOOL_ID) {
          router.push('/about');
        } else {
          const tool = getToolById(lastTab.toolId);
          if (tool) {
            router.push(`/tools/${tool.category}/${lastTab.toolId}/${lastTab.instanceId}`);
          }
        }
      } else {
        clearToolSelection();
        router.push('/');
      }
    }
  };

  // Clear all state and navigate home (used by Close All and Logo click)
  const handleClearAllAndGoHome = useCallback(() => {
    setActiveTabs([]);
    setSelectedTool(undefined);
    setSelectedInstanceId(undefined);
    setPreviousTool(undefined);
    clearAllToolStates();
    router.push('/');
  }, [clearAllToolStates, router]);

  const handleHomeClick = () => {
    // Match ESC key behavior: toggle between current tool and welcome page
    if (selectedTool && selectedInstanceId) {
      setPreviousTool(selectedTool);
      router.replace('/');
    } else {
      restorePreviousTool();
    }

    if (!isMobile) {
      setActiveTabs(tabs => tabs.map(tab => ({ ...tab, isActive: false })));
    }
  };

  const handleAboutClick = () => {
    // Navigate to About page - the useEffect will handle tab creation/activation
    router.push('/about');
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-background">
        {/* Mobile Top Bar */}
        {isMobile && (
          <MobileTopBar
            onToolSelect={handleToolSelect}
            onHomeClick={handleHomeClick}
          />
        )}
        <div className="flex-1 flex overflow-hidden">
          <AppSidebar
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            onHomeClick={handleHomeClick}
            onLogoClick={handleClearAllAndGoHome}
            onAboutClick={handleAboutClick}
            onSearchClick={() => setIsCommandPaletteOpen(true)}
            onClearAllAndGoHome={handleClearAllAndGoHome}
          />
          <SidebarInset>
            <div className={cn(
              "flex flex-1 flex-col gap-4 pb-4 min-h-0 overflow-hidden",
              isMobile && "pt-14"
            )}>
              {(selectedTool && selectedInstanceId) || isAboutPage(pathname) ? (
                <>
                  {/* Tool Header with Tabs (Desktop only) */}
                  {!isMobile && activeTabs.length > 0 && (
                    <TopNavTabs
                      tabs={activeTabs}
                      activeTab={selectedTool || ABOUT_TOOL_ID}
                      onTabSelect={handleTabSelect}
                      onTabClose={handleTabClose}
                      onCloseAll={handleClearAllAndGoHome}
                      onTabsReorder={setActiveTabs}
                    />
                  )}
                  {isAboutPage(pathname) || selectedTool === ABOUT_TOOL_ID ? (
                    // Render About page component
                    <div className="flex-1 overflow-auto min-h-0">
                      <AboutPage />
                    </div>
                  ) : selectedTool && selectedInstanceId ? (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      {(() => {
                        const activeTool = getToolById(selectedTool);
                        return activeTool?.desktopRecommended && isMobile ? (
                          <DesktopRecommendedBanner
                            key={activeTool.id}
                            toolId={activeTool.id}
                            toolName={activeTool.name}
                          />
                        ) : null;
                      })()}
                      <DynamicToolRenderer
                        key={`${selectedTool}:${selectedInstanceId}`}
                        toolId={selectedTool}
                        instanceId={selectedInstanceId}
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <WelcomePage
                  onToolSelect={handleToolSelect}
                  activeToolIds={activeTabs.map(tab => tab.toolId)}
                />
              )}
            </div>
          </SidebarInset>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Maximum Instances Reached"
        message={alertMessage}
        confirmText="OK"
      />

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onToolSelect={handleToolSelect}
      />
    </>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ToolActivityProvider>
      <ToolStateProvider>
        <SidebarProvider>
          <AppLayoutInner>{children}</AppLayoutInner>
        </SidebarProvider>
      </ToolStateProvider>
    </ToolActivityProvider>
  );
}
