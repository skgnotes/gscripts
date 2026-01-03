/**
 * Delete all emails from joe@posthog.com
 * Execution Date: 2026-01-04
 */
function deleteJoePosthogEmails() {
  const searchQuery = 'from:joe@posthog.com';
  let totalDeleted = 0;
  let batchCount = 0;

  Logger.log('Starting email deletion for: ' + searchQuery);

  // Process in batches of 100 threads (Gmail API limit)
  while (true) {
    const threads = GmailApp.search(searchQuery, 0, 100);

    if (threads.length === 0) {
      Logger.log('No more threads found');
      break;
    }

    batchCount++;
    Logger.log('Batch ' + batchCount + ': Found ' + threads.length + ' threads to delete');

    // Move threads to trash
    GmailApp.moveThreadsToTrash(threads);
    totalDeleted += threads.length;

    Logger.log('Batch ' + batchCount + ': Deleted ' + threads.length + ' threads');

    // Small delay to avoid rate limits
    Utilities.sleep(500);
  }

  Logger.log('=== COMPLETED ===');
  Logger.log('Total threads deleted: ' + totalDeleted);
  Logger.log('Total batches processed: ' + batchCount);
}
