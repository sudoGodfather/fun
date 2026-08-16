"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";
import DeadlineChip from "@/components/DeadlineChip";

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  user: { id: string; name: string | null; username: string | null; image: string | null } | null;
};

type Hackathon = {
  id: string;
  name: string;
  url: string | null;
  startDate: string;
  deadline: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string | null; username: string | null };
  team: Member[];
};

type UserResult = { id: string; username: string | null; name: string | null; image: string | null };

export default function HackathonDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  const [usernameQuery, setUsernameQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [addError, setAddError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/hackathons/${params.id}`)
      .then((r) => r.json())
      .then((data) => setHackathon(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  useEffect(() => {
    if (usernameQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(usernameQuery)}`)
        .then((r) => r.json())
        .then(setResults);
    }, 250);
    return () => clearTimeout(t);
  }, [usernameQuery]);

  async function addByUsername(username: string) {
    setAddError("");
    const res = await fetch(`/api/hackathons/${params.id}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error || "Couldn't add that teammate");
      return;
    }
    setUsernameQuery("");
    setResults([]);
    load();
  }

  async function removeMember(memberId: string) {
    await fetch(`/api/hackathons/${params.id}/team`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    load();
  }

  if (status !== "authenticated" || loading) return null;
  if (!hackathon) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-light dark:text-muted-dark">Hackathon not found.</p>
      </main>
    );
  }

  const isOwner = hackathon.ownerId === (session?.user as any)?.id;

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/dashboard" className="font-display font-semibold text-lg tracking-tight">
          Hackathon Tracker
        </Link>
        <ThemeToggle />
      </header>

      <section className="px-6 pb-16 max-w-2xl mx-auto flex flex-col gap-6">
        <GlassCard strong>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="font-display text-2xl font-semibold">{hackathon.name}</h1>
            <DeadlineChip deadline={hackathon.deadline} />
          </div>
          {hackathon.url && (
            <a href={hackathon.url} target="_blank" rel="noreferrer" className="text-accent text-sm break-all">
              {hackathon.url}
            </a>
          )}
          <div className="grid grid-cols-2 gap-4 mt-5 font-mono text-sm">
            <div className="neu-inset p-3 rounded-2xl">
              <p className="text-xs text-muted-light dark:text-muted-dark mb-1 uppercase tracking-wide">Starts</p>
              <p>{new Date(hackathon.startDate).toLocaleString()}</p>
            </div>
            <div className="neu-inset p-3 rounded-2xl">
              <p className="text-xs text-muted-light dark:text-muted-dark mb-1 uppercase tracking-wide">Deadline</p>
              <p>{new Date(hackathon.deadline).toLocaleString()}</p>
            </div>
          </div>
          {hackathon.description && (
            <p className="text-sm text-muted-light dark:text-muted-dark mt-4">{hackathon.description}</p>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-lg font-semibold mb-4">Team</h2>

          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-3 neu p-3">
              <div className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-xs font-medium">
                {(hackathon.owner.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{hackathon.owner.name}</p>
                <p className="text-xs text-muted-light dark:text-muted-dark">@{hackathon.owner.username} · Owner</p>
              </div>
            </div>

            {hackathon.team.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 neu p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full glass-strong flex items-center justify-center text-xs font-medium">
                    {(m.user?.name || m.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.user?.name || m.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">
                      {m.user?.username ? `@${m.user.username}` : m.email || "Not registered"}
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => removeMember(m.id)} className="text-xs text-red-500">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {isOwner && (
            <div className="relative">
              <label className="label">Add teammate by username</label>
              <input
                value={usernameQuery}
                onChange={(e) => setUsernameQuery(e.target.value)}
                className="input-field"
                placeholder="Search a registered username…"
              />
              {addError && <p className="text-sm text-red-500 mt-2">{addError}</p>}

              {results.length > 0 && (
                <div className="glass-strong mt-2 p-2 flex flex-col gap-1 max-h-56 overflow-auto">
                  {results.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => addByUsername(u.username!)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 text-left"
                    >
                      <div className="h-7 w-7 rounded-full neu flex items-center justify-center text-xs">
                        {(u.name || u.username || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-light dark:text-muted-dark">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </section>
    </main>
  );
}
