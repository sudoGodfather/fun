import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import GlassCard from "@/components/GlassCard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display font-semibold text-lg tracking-tight">Hackathon Tracker</span>
        <ThemeToggle />
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <GlassCard strong className="max-w-xl w-full text-center py-12">
          <h1 className="font-display text-4xl font-semibold tracking-tight mb-4">
            Never miss a submission window again.
          </h1>
          <p className="text-muted-light dark:text-muted-dark mb-8">
            Track every hackathon, pull in your teammates by username, and get an email
            the day before each deadline hits.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary">
              Get started
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
