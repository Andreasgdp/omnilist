export default function ListsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-full bg-muted" />
          <div className="h-4 w-64 rounded-full bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-52 rounded-[2rem] border border-border/60 bg-card/60" />
        ))}
      </div>
    </div>
  );
}
