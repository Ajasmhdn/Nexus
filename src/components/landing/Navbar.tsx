'use client';

import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full h-16 flex items-center border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent-light flex items-center justify-center">
            <Database className="w-4 h-4 text-accent" />
          </div>
          <span className="text-text-primary font-semibold text-lg tracking-tight">
            AgentOps
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#docs"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Docs
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
