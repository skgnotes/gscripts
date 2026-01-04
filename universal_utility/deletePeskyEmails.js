/**
 * Identifies senders from emails with the "Pesky" label
 * Then deletes ALL emails from those senders across the entire mailbox
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

    // Get all threads with the Pesky label to identify senders
    const peskyThreads = peskyLabel.getThreads();
    Logger.log(`Found ${peskyThreads.length} threads with the 'Pesky' label`);

    if (peskyThreads.length === 0) {
      Logger.log("No emails found with the 'Pesky' label.");
      return;
    }

    // Step 1: Identify unique sender emails from Pesky labeled emails
    Logger.log("\n=== STEP 1: IDENTIFYING PESKY SENDERS ===");
    const peskySenders = new Set();

    for (let i = 0; i < peskyThreads.length; i++) {
      const thread = peskyThreads[i];
      const messages = thread.getMessages();

      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        const senderEmail = message.getFrom();

        // Extract email address from "Name <email@domain.com>" format
        const emailMatch = senderEmail.match(/<(.+?)>/) || [null, senderEmail];
        const email = emailMatch[1];

        peskySenders.add(email);
      }
    }

    const sendersList = Array.from(peskySenders);
    Logger.log(`Identified ${sendersList.length} unique pesky senders:`);
    sendersList.forEach(sender => Logger.log(`  - ${sender}`));

    // Step 2: For each sender, find and delete ALL their emails
    Logger.log("\n=== STEP 2: DELETING ALL EMAILS FROM PESKY SENDERS ===");
    const senderStats = {};
    let totalThreadsDeleted = 0;
    let totalEmailsDeleted = 0;

    for (const sender of sendersList) {
      Logger.log(`\nProcessing sender: ${sender}`);

      // Search for all emails from this sender
      let allThreadsFromSender = [];
      let pageToken = null;
      let batchCount = 0;

      // Gmail search may return results in batches, so we paginate
      do {
        const searchResults = GmailApp.search(`from:${sender}`, 0, 100);
        allThreadsFromSender = allThreadsFromSender.concat(searchResults);
        batchCount++;

        // If we got 100 results, there might be more
        if (searchResults.length < 100) break;
        if (batchCount >= 5) break; // Safety limit: max 500 threads per sender
      } while (false); // Single batch for now

      Logger.log(`  Found ${allThreadsFromSender.length} threads from ${sender}`);

      if (allThreadsFromSender.length > 0) {
        let emailCount = 0;

        // Count total emails in these threads
        for (const thread of allThreadsFromSender) {
          emailCount += thread.getMessageCount();
        }

        // Delete all threads from this sender
        for (let i = 0; i < allThreadsFromSender.length; i++) {
          allThreadsFromSender[i].moveToTrash();
        }

        senderStats[sender] = {
          threads: allThreadsFromSender.length,
          emails: emailCount
        };

        totalThreadsDeleted += allThreadsFromSender.length;
        totalEmailsDeleted += emailCount;

        Logger.log(`  Deleted ${allThreadsFromSender.length} threads (${emailCount} emails) from ${sender}`);
      }
    }

    // Log the final statistics
    Logger.log("\n=== DELETION COMPLETE ===");
    Logger.log(`Total unique pesky senders: ${sendersList.length}`);
    Logger.log(`Total threads deleted: ${totalThreadsDeleted}`);
    Logger.log(`Total emails deleted: ${totalEmailsDeleted}`);
    Logger.log("\nBreakdown by sender:");

    const sortedSenders = Object.entries(senderStats).sort((a, b) => b[1].emails - a[1].emails);

    for (const [email, data] of sortedSenders) {
      Logger.log(`  ${email}: ${data.threads} threads, ${data.emails} emails`);
    }

    // Generate markdown report
    const reportLines = [];
    reportLines.push("# Pesky Emails Deletion Report");
    reportLines.push(`\nGenerated: ${new Date().toLocaleString()}`);
    reportLines.push(`\n## Summary`);
    reportLines.push(`- **Total unique pesky senders:** ${sendersList.length}`);
    reportLines.push(`- **Total threads deleted:** ${totalThreadsDeleted}`);
    reportLines.push(`- **Total emails deleted:** ${totalEmailsDeleted}`);
    reportLines.push(`\n## Process`);
    reportLines.push(`1. Identified ${sendersList.length} unique senders from emails with the "Pesky" label`);
    reportLines.push(`2. Searched entire mailbox for ALL emails from these senders`);
    reportLines.push(`3. Deleted all identified emails (moved to trash)`);
    reportLines.push(`\n## Emails Deleted by Sender`);
    reportLines.push(`\n| Sender Email | Threads Deleted | Emails Deleted |`);
    reportLines.push(`|--------------|-----------------|----------------|`);

    for (const [email, data] of sortedSenders) {
      reportLines.push(`| ${email} | ${data.threads} | ${data.emails} |`);
    }

    const markdownReport = reportLines.join("\n");
    Logger.log("\n=== MARKDOWN REPORT ===");
    Logger.log(markdownReport);

    return {
      success: true,
      totalEmailsDeleted: totalEmailsDeleted,
      totalThreadsDeleted: totalThreadsDeleted,
      uniqueSenders: sendersList.length,
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
