import { prisma } from "./prisma";
import { sendDeadlineReminderEmail } from "./email";

/**
 * Finds every hackathon whose deadline is within the next ~24 hours (and more
 * than ~23 hours away, so this only fires once per hackathon even if the job
 * runs hourly), emails the owner and every team member who has an email on
 * file, then marks the hackathon so it isn't emailed again.
 */
export async function sendDueReminders() {
  const now = new Date();
  const lookahead = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const dueHackathons = await prisma.hackathon.findMany({
    where: {
      deadline: { gte: now, lte: lookahead };
      reminderSentAt: null,
    },
    include: {
      owner: true,
      team: { include: { user: true } },
    },
  });

  let sentCount = 0;

  for (const hackathon of dueHackathons) {
    const recipients = new Map<string, string | null>(); // email -> name

    if (hackathon.owner.email) {
      recipients.set(hackathon.owner.email, hackathon.owner.name);
    }
    for (const member of hackathon.team) {
      const email = member.user?.email || member.email;
      const name = member.user?.name || member.name || null;
      if (email) recipients.set(email, name);
    }

    for (const [email, name] of recipients) {
      try {
        await sendDeadlineReminderEmail(email, {
          hackathonName: hackathon.name,
          hackathonUrl: hackathon.url,
          deadline: hackathon.deadline,
          recipientName: name,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder to ${email} for ${hackathon.name}:`, err);
      }
    }

    await prisma.hackathon.update({
      where: { id: hackathon.id },
      data: { reminderSentAt: now },
    });
  }

  return { hackathonsProcessed: dueHackathons.length, emailsSent: sentCount };
}
