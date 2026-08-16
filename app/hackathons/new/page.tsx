"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewHackathonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, startDate, deadline, description }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(`/hackathons/${data.id}`);
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/dashboard" className="font-display font-semibold text-lg tracking-tight">
          Hackathon Tracker
        </Link>
        <ThemeToggle />
      </header>

      <section className="px-6 pb-16 max-w-lg mx-auto">
        <GlassCard strong>
          <h1 className="font-display text-2xl font-semibold mb-6">New hackathon</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Hackathon name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="ETHGlobal Delhi" />
            </div>
            <div>
              <label className="label">Hackathon URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-field" placeholder="https://ethglobal.com/events/delhi" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start date</label>
                <input type="datetime-local" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Submission deadline</label>
                <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[90px]" placeholder="Theme, tracks, prizes…" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Saving…" : "Save hackathon"}
            </button>
          </form>
        </GlassCard>
      </section>
    </main>
  );
}
