"use client";

import { clsx } from "clsx";

function daysLeft(deadline: string | Date) {
  const ms = new Date(deadline).getTime() - Date.now();
  return ms / (1000 * 60 * 60 * 24);
}

export default function DeadlineChip({ deadline }: { deadline: string | Date }) {
  const d = daysLeft(deadline);
  const urgent = d <= 1.5;
  const past = d < 0;

  let label: string;
  if (past) label = "Deadline passed";
  else if (d < 1) label = `${Math.max(1, Math.round(d * 24))}h left`;
  else label = `${Math.ceil(d)}d left`;

  return (
    <span className={clsx("deadline-chip", urgent && !past && "urgent", past && "opacity-60")}>
      <span className={clsx("h-2 w-2 rounded-full", past ? "bg-muted-light" : urgent ? "bg-accent animate-pulse" : "bg-accent-teal")} />
      {label}
    </span>
  );
}
