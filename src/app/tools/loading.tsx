export default function ToolsLoading() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="border-primary h-10 w-10 animate-spin rounded-full border-b-2"></div>
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium">Loading tools...</p>
          <p className="text-muted-foreground text-sm">Please wait</p>
        </div>
      </div>
    </div>
  )
}
