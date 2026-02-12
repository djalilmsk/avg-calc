function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-2 border-muted-foreground/60 border-t-foreground" />
    </div>
  );
}

export { Spinner };
