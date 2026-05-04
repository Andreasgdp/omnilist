export default function ListLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-[2rem] border border-border/60 bg-card/60" />
      <div className="h-28 rounded-[2rem] border border-border/60 bg-card/60" />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-96 rounded-[2rem] border border-border/60 bg-card/60" />
        <div className="space-y-6">
          <div className="h-44 rounded-[2rem] border border-border/60 bg-card/60" />
          <div className="h-72 rounded-[2rem] border border-border/60 bg-card/60" />
        </div>
      </div>
    </div>
  );
}
