import { Skeleton } from "../ui/skeleton";

export default function AppSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skeleton Header */}
      <div className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Skeleton className="h-6 w-6 md:hidden" />
            <div className="hidden items-center space-x-2 md:flex">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-4 w-24 hidden sm:inline-flex" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Skeleton Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
          <div className="w-full h-full py-6 px-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>

        {/* Skeleton Content */}
        <main className="container flex w-full flex-col overflow-hidden py-6 max-w-6xl">
           <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
              </div>
              
              <Skeleton className="h-64 w-full rounded-lg" />
           </div>
        </main>
      </div>
    </div>
  );
}
