function deleteEmailsFromSender() {
    var query = 'from:joe@posthog.com';
    var threads = GmailApp.search(query);
    Logger.log('Found ' + threads.length + ' threads matching query: ' + query);

    var count = 0;
    for (var i = 0; i < threads.length; i++) {
        threads[i].moveToTrash();
        count++;
    }

    Logger.log('Successfully processed ' + count + ' items');
}
