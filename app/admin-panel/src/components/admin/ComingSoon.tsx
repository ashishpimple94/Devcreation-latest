/** Placeholder for admin sections that are planned but not yet built. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(184,148,63,.1)] text-gold-dk">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </span>
      <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-3">{description}</p>
      <span className="mt-5 rounded-full bg-[rgba(184,148,63,.12)] px-3 py-1 font-util text-[0.55rem] uppercase tracking-[0.14em] text-gold-dk">
        Coming soon
      </span>
    </div>
  );
}
