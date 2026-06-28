import { stats } from "@/lib/mock-data";

export default function SocialProof() {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="flex justify-center gap-16 md:gap-24">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl font-bold text-text-primary">
              {stat.value}
            </div>
            <div className="text-sm text-text-muted mt-1 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
