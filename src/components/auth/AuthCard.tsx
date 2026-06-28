"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AuthCard() {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const router = useRouter();

  // Sign In States
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password Reset States
  const [resetUserId, setResetUserId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetDefaultPassword, setResetDefaultPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmNewPassword, setResetConfirmNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !email || !password) return;

    // Check if user is an admin — redirect to admin panel
    if (userId.trim().toLowerCase() === "admin") {
      router.push("/admin");
    } else {
      router.push("/workspace");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (
      !resetUserId ||
      !resetEmail ||
      !resetDefaultPassword ||
      !resetNewPassword ||
      !resetConfirmNewPassword
    ) {
      setResetError("All fields are mandatory.");
      return;
    }

    if (resetNewPassword !== resetConfirmNewPassword) {
      setResetError("New passwords do not match.");
      return;
    }

    // Success simulation
    setResetSuccess(true);
    // Clear reset states
    setResetUserId("");
    setResetEmail("");
    setResetDefaultPassword("");
    setResetNewPassword("");
    setResetConfirmNewPassword("");
  };

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/5 p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center mb-3">
            <Database className="w-6 h-6 text-accent" />
          </div>
          <span className="text-text-primary font-bold text-2xl tracking-tight">
            AgentOps
          </span>
          <p className="text-sm text-text-muted mt-1.5 text-center">
            {mode === "signin"
              ? "Sign in with your credentials"
              : "Reset the default password issued by your administrator"}
          </p>
        </div>

        {mode === "signin" ? (
          /* SIGN IN FORM */
          <form onSubmit={handleSignInSubmit} className="space-y-5">
            {/* User ID */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                User ID <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. USR-4821"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-primary block">
                  Password <span className="text-error">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setResetSuccess(false);
                    setResetError("");
                  }}
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
                >
                  Forgot Default Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/30 cursor-pointer mt-2"
            >
              Sign In
            </button>
          </form>
        ) : (
          /* RESET PASSWORD FORM */
          <div className="space-y-6">
            {resetSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-success-muted text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Password Reset Successful
                  </h3>
                  <p className="text-sm text-text-muted mt-1 px-4">
                    Your password has been successfully updated. You can now log in using your new credentials.
                  </p>
                </div>
                <button
                  onClick={() => setMode("signin")}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {resetError && (
                  <div className="bg-error-muted/40 border border-error/20 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-error font-medium">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {/* User ID */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    User ID <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={resetUserId}
                    onChange={(e) => setResetUserId(e.target.value)}
                    placeholder="e.g. USR-4821"
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-mono"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>

                {/* Default Password */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Default Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={resetDefaultPassword}
                    onChange={(e) => setResetDefaultPassword(e.target.value)}
                    placeholder="Enter default password given by Admin"
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    New Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Confirm New Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={resetConfirmNewPassword}
                    onChange={(e) => setResetConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 cursor-pointer"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="flex-1 bg-surface hover:bg-surface-alt text-text-secondary py-3 rounded-lg font-medium transition-all text-sm border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
