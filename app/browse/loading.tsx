export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-16 bg-muted mb-8" />
        
        {/* Sidebar and content skeleton */}
        <div className="flex gap-8 px-4 md:px-8 py-8">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-48">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-24" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="flex-1">
            <div className="h-10 bg-muted rounded mb-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-64 bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
