import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative px-6 py-12">
      {/* Subtle purple gradient at top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(150,3,255,0.06),transparent_50%)]" />

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="relative z-10 w-full">
        <AuthCard />
      </div>
    </div>
  );
}
