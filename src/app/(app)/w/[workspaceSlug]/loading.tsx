export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 motion-fade-up">
      <div className="h-80 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-64 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
        <div className="h-64 rounded-[2rem] border border-border/60 bg-card/60 animate-pulse" />
      </div>
    </div>
  );
}
