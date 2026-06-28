import { Database } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Documentation"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent-muted flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-text-primary font-semibold tracking-tight">
              AgentOps
            </span>
          </Link>
          <p className="text-xs text-text-muted mt-3 max-w-[220px]">
            AI-powered database analytics for operations teams.
          </p>
        </div>

        {/* Link Columns */}
        <div className="flex gap-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border/30 text-xs text-text-muted">
        © 2025 AgentOps. All rights reserved.
      </div>
    </footer>
  );
}
