export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-muted-foreground text-sm">Please wait while we load the page</p>
        </div>
      </div>
    </div>
  )
}
