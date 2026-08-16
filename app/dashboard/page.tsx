"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";
import DeadlineChip from "@/components/DeadlineChip";

type Hackathon = {
  id: string;
  name: string;
  url: string | null;
  startDate: string;
  deadline: string;
  owner: { id: string; name: string | null; username: string | null };
  team: { id: string; name: string | null; user: { id: string; name: string | null; username: string | null; image: string | null } | null }[];
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/hackathons")
      .then((r) => r.json())
      .then((data) => setHackathons(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display font-semibold text-lg tracking-tight">Hackathon Tracker</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-muted-light dark:text-muted-dark hidden sm:inline">
            {session?.user?.name}
          </span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost text-sm px-4 py-2">
            Sign out
          </button>
        </div>
      </header>

      <section className="px-8 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-semibold">Your hackathons</h1>
          <Link href="/hackathons/new" className="btn-primary">
            + New hackathon
          </Link>
        </div>

        {loading && <p className="text-muted-light dark:text-muted-dark">Loading…</p>}

        {!loading && hackathons.length === 0 && (
          <GlassCard className="text-center py-16">
            <p className="text-muted-light dark:text-muted-dark mb-6">
              No hackathons yet. Add one and we'll email you a reminder a day before the deadline.
            </p>
            <Link href="/hackathons/new" className="btn-primary">
              Add your first hackathon
            </Link>
          </GlassCard>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {hackathons.map((h) => (
            <Link key={h.id} href={`/hackathons/${h.id}`}>
              <div className="neu p-6 h-full flex flex-col gap-4 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold leading-snug">{h.name}</h2>
                  <DeadlineChip deadline={h.deadline} />
                </div>
                <p className="text-sm text-muted-light dark:text-muted-dark font-mono">
                  Due {new Date(h.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <div className="flex -space-x-2 mt-auto">
                  {[{ user: h.owner }, ...h.team].slice(0, 5).map((m: any, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full glass-strong flex items-center justify-center text-xs font-medium border-2 border-surface-light dark:border-surface-dark"
                      title={m.user?.name || m.name || "Teammate"}
                    >
                      {(m.user?.name || m.name || "?").slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
