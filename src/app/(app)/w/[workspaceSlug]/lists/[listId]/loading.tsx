export default function ListLoading() {
  return (
    <div className="space-y-6 motion-fade-up">
      <div className="h-36 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
      <div className="h-28 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-96 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
        <div className="space-y-6">
          <div className="h-44 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
          <div className="h-72 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
