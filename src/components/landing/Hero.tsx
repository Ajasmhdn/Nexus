import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-24 md:py-32 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-text-muted mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Trusted by 500+ operations teams
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary max-w-4xl mx-auto leading-[1.08]">
        Query Operational Data Using{" "}
        <span className="text-accent">Natural Language</span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg text-text-secondary max-w-2xl mx-auto mt-6 leading-relaxed">
        Allow operations teams to explore maintenance logs, production metrics,
        downtime events, inventory records, and technician performance using AI.
      </p>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <Link
          href="/auth"
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm shadow-sm shadow-accent/20"
        >
          Get Started
        </Link>
        <Link
          href="/workspace"
          className="border border-border text-text-secondary hover:text-text-primary hover:border-text-muted px-6 py-3 rounded-lg text-sm transition-colors"
        >
          View Demo
        </Link>
      </div>

      {/* Workspace Preview Mockup */}
      <div className="mt-20 max-w-5xl mx-auto">
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xl shadow-black/8">
          {/* Title bar */}
          <div className="h-10 bg-surface border-b border-border flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-error/40" />
            <div className="w-3 h-3 rounded-full bg-warning/40" />
            <div className="w-3 h-3 rounded-full bg-success/40" />
            <div className="ml-4 h-4 w-48 bg-border rounded" />
          </div>
          {/* Three panels */}
          <div className="flex h-[340px]">
            {/* Left sidebar mock */}
            <div className="w-56 border-r border-border p-4 space-y-3 hidden sm:block bg-surface">
              <div className="h-8 bg-accent/15 rounded-md" />
              <div className="h-6 bg-border/50 rounded" />
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-border/60 rounded w-full" />
                <div className="h-3 bg-border/30 rounded w-3/4" />
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-border/40 rounded w-5/6" />
                <div className="h-3 bg-border/30 rounded w-2/3" />
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-border/40 rounded w-4/5" />
                <div className="h-3 bg-border/20 rounded w-1/2" />
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-border/30 rounded w-5/6" />
                <div className="h-3 bg-border/20 rounded w-3/5" />
              </div>
            </div>
            {/* Center conversation mock */}
            <div className="flex-1 p-6 space-y-4 flex flex-col">
              <div className="flex justify-end">
                <div className="h-10 bg-surface-alt rounded-2xl rounded-br-sm w-2/3" />
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-md bg-accent/15 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/40 rounded w-full" />
                  <div className="h-4 bg-border/40 rounded w-5/6" />
                  <div className="h-16 bg-accent/5 border border-accent/15 rounded-md mt-2" />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="h-12 bg-surface-alt rounded" />
                    <div className="h-12 bg-surface-alt rounded" />
                    <div className="h-12 bg-surface-alt rounded" />
                    <div className="h-12 bg-surface-alt rounded" />
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="h-12 bg-white border border-border rounded-xl" />
              </div>
            </div>
            {/* Right analysis mock */}
            <div className="w-64 border-l border-border p-4 hidden md:block bg-surface">
              <div className="flex gap-3 mb-4">
                <div className="h-3 bg-accent/30 rounded w-12" />
                <div className="h-3 bg-border/40 rounded w-8" />
                <div className="h-3 bg-border/40 rounded w-12" />
              </div>
              <div className="space-y-1">
                <div className="h-6 bg-surface-alt rounded flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 border-r border-border/50 last:border-0" />
                  ))}
                </div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`h-5 rounded flex ${i % 2 === 0 ? "bg-surface-alt/50" : ""}`}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="flex-1 border-r border-border/20 last:border-0" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
