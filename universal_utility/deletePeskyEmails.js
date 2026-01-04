/**
 * Identifies and deletes emails with the "Pesky" label
 * Generates a report of deleted emails by sender
 */
function deletePeskyEmails() {
  try {
    // Find the "Pesky" label
    const peskyLabel = GmailApp.getUserLabelByName("Pesky");

    if (!peskyLabel) {
      Logger.log("ERROR: Label 'Pesky' not found. Please create the label first.");
      return;
    }

    // Get all threads with the Pesky label
    const threads = peskyLabel.getThreads();
    Logger.log(`Found ${threads.length} threads with the 'Pesky' label`);

    if (threads.length === 0) {
      Logger.log("No emails found with the 'Pesky' label.");
      return;
    }

    // Track sender emails and counts
    const senderStats = {};
    let totalEmailsDeleted = 0;

    // Process each thread
    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const messages = thread.getMessages();

      // Process each message in the thread
      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        const senderEmail = message.getFrom();

        // Extract email address from "Name <email@domain.com>" format
        const emailMatch = senderEmail.match(/<(.+?)>/) || senderEmail.match(/^(.+?)$/);
        const email = emailMatch ? (emailMatch[1] || emailMatch[0]) : senderEmail;

        // Track the sender
        if (!senderStats[email]) {
          senderStats[email] = {
            count: 0,
            displayName: senderEmail
          };
        }
        senderStats[email].count++;
        totalEmailsDeleted++;
      }
    }

    // Log the statistics before deletion
    Logger.log("\n=== PESKY EMAILS REPORT ===");
    Logger.log(`Total emails to be deleted: ${totalEmailsDeleted}`);
    Logger.log(`Unique senders: ${Object.keys(senderStats).length}`);
    Logger.log("\nBreakdown by sender:");

    const sortedSenders = Object.entries(senderStats).sort((a, b) => b[1].count - a[1].count);

    for (const [email, data] of sortedSenders) {
      Logger.log(`  ${email}: ${data.count} email(s)`);
    }

    // Delete all threads with the Pesky label
    Logger.log("\n=== DELETING EMAILS ===");
    for (let i = 0; i < threads.length; i++) {
      threads[i].moveToTrash();
      if ((i + 1) % 10 === 0) {
        Logger.log(`Deleted ${i + 1} of ${threads.length} threads...`);
      }
    }

    Logger.log(`\nSuccessfully deleted all ${threads.length} threads (${totalEmailsDeleted} total emails)`);

    // Generate markdown report
    const reportLines = [];
    reportLines.push("# Pesky Emails Deletion Report");
    reportLines.push(`\nGenerated: ${new Date().toLocaleString()}`);
    reportLines.push(`\n## Summary`);
    reportLines.push(`- **Total emails deleted:** ${totalEmailsDeleted}`);
    reportLines.push(`- **Total threads deleted:** ${threads.length}`);
    reportLines.push(`- **Unique senders:** ${Object.keys(senderStats).length}`);
    reportLines.push(`\n## Emails Deleted by Sender`);
    reportLines.push(`\n| Sender Email | Count |`);
    reportLines.push(`|--------------|-------|`);

    for (const [email, data] of sortedSenders) {
      reportLines.push(`| ${email} | ${data.count} |`);
    }

    const markdownReport = reportLines.join("\n");
    Logger.log("\n=== MARKDOWN REPORT ===");
    Logger.log(markdownReport);

    return {
      success: true,
      totalEmailsDeleted: totalEmailsDeleted,
      totalThreadsDeleted: threads.length,
      uniqueSenders: Object.keys(senderStats).length,
      senderStats: senderStats,
      markdownReport: markdownReport
    };

  } catch (error) {
    Logger.log(`ERROR: ${error.toString()}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}
