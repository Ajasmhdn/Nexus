import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 border-t border-border/50 text-center">
      <h2 className="text-3xl font-bold text-text-primary">
        Start querying your data today
      </h2>
      <p className="text-text-secondary mt-4 text-base">
        No credit card required. Set up in under 5 minutes.
      </p>
      <Link
        href="/auth"
        className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-medium mt-8 transition-colors text-sm"
      >
        Get Started Free
      </Link>
    </section>
  );
}
