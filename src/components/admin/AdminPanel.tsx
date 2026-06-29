"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database, Plus, Pencil, Trash2, RefreshCw, Search, X, ChevronDown, Users, Shield, User, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { JOB_TITLES } from "../../lib/constants";
import { UserDTO } from "../../types";

const userTypes = ["user", "admin"] as const;

export default function AdminPanel() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/auth";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Form state
  const [formUserId, setFormUserId] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formUserType, setFormUserType] = useState<UserDTO["role"]>("user");

  // Fetch users
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users?limit=100");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch users");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormUserId("");
    setFormEmail("");
    setFormFullName("");
    setFormJobTitle("");
    setFormPassword("");
    setFormUserType("user");
    setEditingUser(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormPassword("TempPass@123"); // Provide default password
    setShowForm(true);
  };

  const openEditForm = (user: UserDTO) => {
    setEditingUser(user);
    setFormUserId(user.userId);
    setFormEmail(user.email);
    setFormFullName(user.fullName || "");
    setFormJobTitle(user.jobTitle || "");
    setFormPassword("");
    setFormUserType(user.role);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId || !formEmail || !formFullName || !formJobTitle) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        // Update User
        const res = await fetch(`/api/admin/users/${editingUser.userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formFullName,
            jobTitle: formJobTitle,
            role: formUserType,
            email: formEmail
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || "Failed to update user");
        }
        setSuccess("User updated successfully");
      } else {
        // Create User
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: formUserId,
            email: formEmail,
            fullName: formFullName,
            jobTitle: formJobTitle,
            password: formPassword,
            role: formUserType
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || "Failed to create user");
        }
        setSuccess("User created successfully");
      }
      resetForm();
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to toggle user status");
      }
      setSuccess("User status toggled successfully");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!formPassword) {
      setError("Please enter a new password to reset");
      return;
    }
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: formPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to reset user password");
      }
      setSuccess("Password reset successfully. User will be forced to change it on next login.");
      setFormPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Database className="w-4 h-4 text-accent" />
            </div>
            <span className="text-text-primary font-semibold text-lg tracking-tight">
              Nexus-Admin
            </span>
            <span className="text-xs text-text-muted bg-accent-light text-accent px-2 py-0.5 rounded-full font-medium ml-1">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Shield className="w-4 h-4 text-accent" />
              Administrator
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer outline-none p-0"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            Admin Panel
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage enterprise users, assign default credentials, and configure access levels.
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-error-muted border border-error/20 text-error rounded-xl p-4 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-error hover:text-error-hover">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="max-w-xl mx-auto mb-6 bg-success-muted border border-success/20 text-success rounded-xl p-4 text-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-success hover:text-success-hover">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CRUD Form Card — Centered */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Database className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {editingUser ? "Update User" : "Create User"}
                  </h2>
                  <p className="text-xs text-text-muted">CRUD Management</p>
                </div>
              </div>
              {(showForm || editingUser) && (
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Accent divider */}
            <div className="h-0.5 bg-gradient-to-r from-accent via-accent/50 to-transparent rounded-full mb-6" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: User ID */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  User ID <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  placeholder="e.g. USR_4821"
                  required
                  disabled={!!editingUser}
                  className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-mono disabled:bg-surface disabled:text-text-muted"
                />
              </div>

              {/* Field 2: Full Name */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Enter user's full name"
                  required
                  className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>

              {/* Field 3: Email */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Enter user email address"
                  required
                  className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>

              {/* Field 4: Job Title select dropdown */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Job Title <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary appearance-none focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Job Title</option>
                    {JOB_TITLES.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 5: Password (Admin Reset or Default) */}
              {editingUser ? (
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Reset Password
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Enter new password to reset"
                        className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      />
                      <Key className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleResetPassword(editingUser.userId)}
                      className="bg-accent hover:bg-accent-hover disabled:bg-accent/55 text-white px-5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">
                    Updates password immediately and forces user to change it at their next login.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Password <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Enter default password"
                      required
                      className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                    <Key className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">
                    Assigned default password. The user will be requested to update this at sign-in.
                  </p>
                </div>
              )}

              {/* Field 6: Select User-Type */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Select User-Type <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formUserType}
                    onChange={(e) => setFormUserType(e.target.value as UserDTO["role"])}
                    required
                    className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-text-primary appearance-none focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
                  >
                    {userTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "admin" ? "Admin" : "User"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-accent hover:bg-accent-hover disabled:bg-accent/55 text-white py-3 rounded-lg font-medium transition-all text-sm cursor-pointer shadow-sm shadow-accent/20 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUser ? "Update" : "Insert"}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-surface hover:bg-surface-alt text-text-secondary py-3 rounded-lg font-medium transition-all text-sm border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                {!editingUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormUserId("");
                      setFormEmail("");
                      setFormFullName("");
                      setFormJobTitle("");
                      setFormPassword("TempPass@123");
                      setFormUserType("user");
                    }}
                    className="flex-1 bg-surface hover:bg-surface-alt text-text-secondary py-3 rounded-lg font-medium transition-all text-sm border border-border cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">
              Users ({filteredUsers.length})
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all w-56"
                />
              </div>
              <button
                onClick={openCreateForm}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-6 py-12 text-center flex flex-col items-center justify-center gap-3 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-sm">Loading users from database...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-t border-border hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <code className="text-sm font-mono font-medium text-text-primary">
                            {user.userId}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-text-primary">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-text-secondary">
                        {user.jobTitle}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            user.role === "admin"
                              ? "bg-accent-light text-accent"
                              : "bg-surface text-text-secondary"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(user.userId)}
                          disabled={actionLoading}
                          className="cursor-pointer font-medium disabled:opacity-50"
                        >
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              user.isActive
                                ? "bg-success-muted text-success"
                                : "bg-error-muted text-error"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-text-muted">
                        {user.createdAt ? user.createdAt.split("T")[0] : ""}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(user)}
                            className="w-8 h-8 rounded-lg hover:bg-accent-light flex items-center justify-center text-text-muted hover:text-accent transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.userId)}
                            disabled={actionLoading}
                            className="w-8 h-8 rounded-lg hover:bg-error-muted flex items-center justify-center text-text-muted hover:text-error transition-colors cursor-pointer disabled:opacity-50"
                            title="Toggle Status (Soft Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-sm text-text-muted">No users found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
