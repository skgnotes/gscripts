/**
 * Deletes all emails from senders in the Pesky Emails Database
 * Hardcoded list of 8 pesky senders
 * Generates a detailed report of deletions
 */
function deletePeskyDatabaseEmails() {
  try {
    // Hardcoded list of pesky senders from database
    const peskySenders = [
      'andrew@acquire.com',
      'daily@ie.indianexpress.co.in',
      'noreply@e.economist.com',
      'hello@mails.pepperfry.com',
      'no-reply@sampark.gov.in',
      'happiness@moments.fnp.com',
      'offers@thehindu.hindugroup.org.in',
      'tatacliq@mall.tatacliq.com'
    ];

    Logger.log("=== DELETING EMAILS FROM PESKY DATABASE SENDERS ===");
    Logger.log(`Total senders to process: ${peskySenders.length}`);
    Logger.log("\nPesky senders:");
    peskySenders.forEach(sender => Logger.log(`  - ${sender}`));

    const senderStats = {};
    let totalThreadsDeleted = 0;
    let totalEmailsDeleted = 0;

    // Process each sender
    for (let i = 0; i < peskySenders.length; i++) {
      const sender = peskySenders[i];
      Logger.log(`\n[${i + 1}/${peskySenders.length}] Processing: ${sender}`);

      // Search for all emails from this sender
      // Using batch processing to handle large volumes
      let allThreadsFromSender = [];
      let startIndex = 0;
      const batchSize = 100;
      let batchNumber = 1;

      while (true) {
        const searchResults = GmailApp.search(`from:${sender}`, startIndex, batchSize);

        if (searchResults.length === 0) {
          break; // No more results
        }

        allThreadsFromSender = allThreadsFromSender.concat(searchResults);
        Logger.log(`  Batch ${batchNumber}: Found ${searchResults.length} threads`);

        if (searchResults.length < batchSize) {
          break; // Last batch
        }

        startIndex += batchSize;
        batchNumber++;

        // Safety limit: max 500 threads per sender
        if (startIndex >= 500) {
          Logger.log(`  WARNING: Reached safety limit of 500 threads for ${sender}`);
          break;
        }
      }

      Logger.log(`  Total threads found: ${allThreadsFromSender.length}`);

      if (allThreadsFromSender.length > 0) {
        let emailCount = 0;

        // Count total emails in these threads
        for (const thread of allThreadsFromSender) {
          emailCount += thread.getMessageCount();
        }

        // Delete all threads from this sender
        for (let j = 0; j < allThreadsFromSender.length; j++) {
          allThreadsFromSender[j].moveToTrash();

          // Progress update every 50 threads
          if ((j + 1) % 50 === 0) {
            Logger.log(`  Deleted ${j + 1}/${allThreadsFromSender.length} threads...`);
          }
        }

        senderStats[sender] = {
          threads: allThreadsFromSender.length,
          emails: emailCount
        };

        totalThreadsDeleted += allThreadsFromSender.length;
        totalEmailsDeleted += emailCount;

        Logger.log(`  ✓ Deleted ${allThreadsFromSender.length} threads (${emailCount} emails)`);
      } else {
        Logger.log(`  ✓ No emails found from ${sender}`);
        senderStats[sender] = {
          threads: 0,
          emails: 0
        };
      }
    }

    // Generate final report
    Logger.log("\n=== DELETION COMPLETE ===");
    Logger.log(`Total senders processed: ${peskySenders.length}`);
    Logger.log(`Total threads deleted: ${totalThreadsDeleted}`);
    Logger.log(`Total emails deleted: ${totalEmailsDeleted}`);
    Logger.log("\nBreakdown by sender:");

    const sortedSenders = Object.entries(senderStats).sort((a, b) => b[1].emails - a[1].emails);

    for (const [email, data] of sortedSenders) {
      if (data.threads > 0) {
        Logger.log(`  ${email}: ${data.threads} threads, ${data.emails} emails`);
      } else {
        Logger.log(`  ${email}: No emails found`);
      }
    }

    // Generate markdown report
    const reportLines = [];
    reportLines.push("# Pesky Database Emails Deletion Report");
    reportLines.push(`\nGenerated: ${new Date().toLocaleString()}`);
    reportLines.push(`\n## Summary`);
    reportLines.push(`- **Senders processed:** ${peskySenders.length}`);
    reportLines.push(`- **Total threads deleted:** ${totalThreadsDeleted}`);
    reportLines.push(`- **Total emails deleted:** ${totalEmailsDeleted}`);
    reportLines.push(`\n## Senders List`);
    reportLines.push(`\nProcessed all emails from these ${peskySenders.length} senders:`);
    peskySenders.forEach((sender, index) => {
      reportLines.push(`${index + 1}. ${sender}`);
    });
    reportLines.push(`\n## Deletion Results`);
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
      sendersProcessed: peskySenders.length,
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
