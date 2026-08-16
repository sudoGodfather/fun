"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";

type Mode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("email");

  // email/password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone otp
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Incorrect email or password");
    else router.push("/dashboard");
  }

  async function handleSendOtp() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/phone/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setLoading(false);
    if (res.ok) setOtpSent(true);
    else setError("Could not send code. Check the number and try again.");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid or expired code");
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
          <h1 className="font-display text-2xl font-semibold mb-6">Welcome back</h1>

          <div className="flex flex-col gap-3 mb-6">
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-ghost flex items-center justify-center gap-2">
              Continue with Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="btn-ghost flex items-center justify-center gap-2">
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-muted-light/30 dark:bg-muted-dark/30" />
            <span className="text-xs text-muted-light dark:text-muted-dark">or</span>
            <div className="h-px flex-1 bg-muted-light/30 dark:bg-muted-dark/30" />
          </div>

          <div className="flex gap-2 mb-5 neu-inset p-1 rounded-2xl">
            <button
              onClick={() => setMode("email")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${mode === "email" ? "glass-strong" : ""}`}
            >
              Email
            </button>
            <button
              onClick={() => setMode("phone")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${mode === "phone" ? "glass-strong" : ""}`}
            >
              Phone
            </button>
          </div>

          {mode === "email" && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div>
                <label className="label">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary mt-2">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {mode === "phone" && !otpSent && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+1 555 123 4567" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button onClick={handleSendOtp} disabled={loading || !phone} className="btn-primary mt-2">
                {loading ? "Sending…" : "Send code"}
              </button>
            </div>
          )}

          {mode === "phone" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <label className="label">6-digit code sent to {phone}</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} className="input-field tracking-[0.3em] font-mono" maxLength={6} placeholder="000000" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary mt-2">
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
            </form>
          )}

          <p className="text-sm text-muted-light dark:text-muted-dark mt-6 text-center">
            No account yet?{" "}
            <Link href="/register" className="text-accent font-medium">
              Register
            </Link>
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
