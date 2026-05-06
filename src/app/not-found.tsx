export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Not found</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        This page could not be opened.
      </h1>
      <p className="max-w-xl text-sm leading-7 text-muted-foreground">
        The list or item may have been removed, you may not have access to it, or the local seed data may not match the current workspace.
      </p>
    </div>
  );
}
