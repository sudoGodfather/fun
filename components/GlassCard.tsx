import { clsx } from "clsx";

export default function GlassCard({
  children,
  className,
  strong = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return <div className={clsx(strong ? "glass-strong" : "glass", "p-6", className)}>{children}</div>;
}
