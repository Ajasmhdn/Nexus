"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Database, ArrowLeft, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "forced-reset" | "forgot-password" | "verify-otp" | "reset-confirm">("signin");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign In States
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forced Reset States (First Login)
  const [forcedNewPassword, setForcedNewPassword] = useState("");
  const [forcedConfirmPassword, setForcedConfirmPassword] = useState("");

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Token Reset Confirm States
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmConfirmPassword, setConfirmConfirmPassword] = useState("");

  // Clear messages on any mode transitions (ensuring clean state when Forgot Password loads)
  useEffect(() => {
    setError("");
    setSuccessMessage("");
  }, [mode]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Login failed");
      }

      if (data.requiresReset) {
        setMode("forced-reset");
      } else {
        // Redirect based on role
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/workspace");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForcedResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (forcedNewPassword !== forcedConfirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword: password, // Using password entered at login
          newPassword: forcedNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = typeof data.error === "string"
          ? data.error
          : (data.error?.message || "Forced password reset failed");
        throw new Error(errMsg);
      }

      setSuccessMessage("Temporary password reset successfully. Please sign in now.");
      setMode("signin");
      // Clean inputs
      setUserId("");
      setEmail("");
      setPassword("");
      setForcedNewPassword("");
      setForcedConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to send password reset OTP");
      }

      setMode("verify-otp");
      setSuccessMessage("A 6-digit OTP code has been sent to your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "OTP verification failed");
      }

      setMode("reset-confirm");
      setOtp("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (confirmPassword !== confirmConfirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = typeof data.error === "string"
          ? data.error
          : (data.error?.message || "Password reset failed");
        throw new Error(errMsg);
      }

      setSuccessMessage("Password reset completed successfully. Please sign in.");
      setMode("signin");
      setConfirmPassword("");
      setConfirmConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            OpenInsights
          </span>
          <p className="text-sm text-text-muted mt-1.5 text-center">
            {mode === "signin" && "Sign in with your credentials"}
            {mode === "forced-reset" && "Update temporary password to proceed"}
            {mode === "forgot-password" && "Request an email password reset OTP"}
            {mode === "verify-otp" && "Enter the 6-digit code sent to your email"}
            {mode === "reset-confirm" && "Enter your new account password"}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-error-muted/40 border border-error/20 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-error font-medium mb-5 animate-fade-in">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="bg-success-muted border border-success/20 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-success font-medium mb-5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === "signin" && (
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
                disabled={loading}
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
                disabled={loading}
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
                    setMode("forgot-password");
                    setError("");
                    setSuccessMessage("");
                  }}
                  disabled={loading}
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
        )}

        {mode === "forced-reset" && (
          /* FORCED RESET PASSWORD FORM (First login) */
          <form onSubmit={handleForcedResetSubmit} className="space-y-5 animate-fade-in">
            <div className="text-xs text-text-muted bg-surface border border-border rounded-lg p-3">
              🔓 <strong>First Login Security Measure:</strong> You must replace the temporary default password set by the administrator.
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                value={forcedNewPassword}
                onChange={(e) => setForcedNewPassword(e.target.value)}
                placeholder="Enter strong password"
                required
                disabled={loading}
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
                value={forcedConfirmPassword}
                onChange={(e) => setForcedConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
              <span className="text-[11px] text-text-muted mt-1.5 block">
                Password must be at least 8 characters long, containing uppercase, lowercase, and a number.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Set New Password
            </button>
          </form>
        )}

        {mode === "forgot-password" && (
          /* FORGOT PASSWORD REQUEST FORM */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 animate-fade-in">
            {/* Email Address */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={loading}
                className="flex-1 bg-surface hover:bg-surface-alt text-text-secondary py-3 rounded-lg font-medium transition-all text-sm border border-border cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {mode === "verify-otp" && (
          /* OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-fade-in">
            <div className="text-xs text-text-muted bg-surface border border-border rounded-lg p-3">
              📩 <strong>OTP sent to {forgotEmail}</strong>. Please enter the 6-digit code to verify your identity.
            </div>

            {/* OTP Code */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Verification Code <span className="text-error">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all tracking-[0.5em] text-center font-mono text-lg font-bold"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify Code
              </button>
              <button
                type="button"
                onClick={handleForgotPasswordSubmit}
                disabled={loading}
                className="flex-1 bg-surface hover:bg-surface-alt text-text-secondary py-3 rounded-lg font-medium transition-all text-sm border border-border cursor-pointer flex items-center justify-center gap-2"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {mode === "reset-confirm" && (
          /* TOKEN RESET PASSWORD CONFIRM FORM */
          <form onSubmit={handleConfirmResetSubmit} className="space-y-5 animate-fade-in">
            <div className="text-xs text-text-muted bg-surface border border-border rounded-lg p-3">
              🔑 <strong>Set a new secure password for your account.</strong>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter strong password"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Confirm New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                value={confirmConfirmPassword}
                onChange={(e) => setConfirmConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                disabled={loading}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
              <span className="text-[11px] text-text-muted mt-1.5 block">
                Password must be at least 8 characters long, containing uppercase, lowercase, and a number.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white py-3 rounded-lg font-medium transition-all text-sm shadow-sm shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Set New Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
