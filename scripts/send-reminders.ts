import { sendDueReminders } from "../lib/reminders";

sendDueReminders()
  .then((result) => {
    console.log("Reminder run complete:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Reminder run failed:", err);
    process.exit(1);
  });
