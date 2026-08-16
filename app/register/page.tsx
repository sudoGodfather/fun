"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) setError("Account created — please sign in.");
    else router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="font-display font-semibold text-lg tracking-tight">
          Hackathon Tracker
        </Link>
        <ThemeToggle />
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-8">
        <GlassCard strong className="max-w-md w-full">
          <h1 className="font-display text-2xl font-semibold mb-6">Create your account</h1>

          <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-ghost">
              Continue with Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="btn-ghost">
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-muted-light/30 dark:bg-muted-dark/30" />
            <span className="text-xs text-muted-light dark:text-muted-dark">or</span>
            <div className="h-px flex-1 bg-muted-light/30 dark:bg-muted-dark/30" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Ada Lovelace" />
            </div>
            <div>
              <label className="label">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="input-field"
                placeholder="ada_codes"
              />
              <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                Teammates will use this to add you directly to a hackathon.
              </p>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 8 characters"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-muted-light dark:text-muted-dark mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
