# Guide: Google Apps Script Execution (Standardized)

> **Note:** This guide replaces the [Legacy Manual Workflow (Archived)](assets/google_apps_script_execution_guide_legacy.md).

This guide defines the **Standard Operating Procedure (SOP)** for executing Google Apps Scripts. 
**The Core Philosophy:** Always reuse the **Universal Script Utility** project via **Clasp CLI** to maximize speed and bypass repetitive authorization.

## 1. The Central Pillar: Universal Script Utility
Unless specifically required (e.g., container-bound scripts for Sheets), **NEVER create a new project**. Always use:

- **Project Name:** Universal Script Utility
- **Project ID:** `1lH3AKqFaGJf61VpC6sd2MfrQZ47mppDtWFP...` *(Check `assets/` or browser URL for full ID)*
- **Pre-Authorized Permissions:**
  - `gmail.modify` (Read/Write Emails)
  - `drive` (Manage Files)
  - `spreadsheets` (Edit Sheets)
  - `documents` (Edit Docs)
  - `calendar` (Manage Events)

## 2. Setup & Preparation
Ensure `clasp` is installed and the utility project is cloned locally.

```bash
npm install -g @google/clasp
clasp login
mkdir universal_utility && cd universal_utility
clasp clone "PROJECT_ID"
```

## 3. Execution Workflow

### Step 1: Update Code via CLI
1.  **Pull Latest:** `clasp pull` (Ensure you don't overwrite others' work).
2.  **Create File:** Create a new file named after your task (e.g., `delete_promo_emails.js`).
    > [!TIP]
    > Do not overwrite `Code.js` unless necessary. Keeping task-specific files allows for a history of utility scripts within the project.
3.  **Push:** `clasp push -f`
    > [!NOTE]
    > `-f` (force) is typically required if we are managing files locally that don't exist remotely yet.

### Step 2: Browser Execution (Optimized)
1.  **Navigate:** Open the project URL.
2.  **Select Function:** Choose your new function from the toolbar.
3.  **Run (Selector-First):** Use `execute_browser_javascript` to click "Run".
    ```javascript
    document.querySelector('button[aria-label="Run the selected function"]').click();
    ```
    > [!CAUTION]
    > **Consent Friction**: JS interaction often triggers "Allow" prompts in agent interfaces. Use standard pixel clicks if this becomes annoying.

4.  **Monitor (JS Polling):** Use `execute_browser_javascript` to watch the log.
    ```javascript
    // Poll for completion
    (async () => {
      while (!document.querySelector('.execution-log-container').textContent.includes('Execution completed')) {
        await new Promise(r => setTimeout(r, 500));
      }
      return document.querySelector('.execution-log-container').textContent;
    })()
    ```

## 4. Verification
### Automated (Logs)
The "Execution Log" is your first source of truth. Ensure your script logs key metrics:
- `Logger.log('Found ' + threads.length + ' emails');`
- `Logger.log('Successfully processed ' + count + ' items');`

### Manual Verification
Always verify the *actual* result in the target application.
- **Gmail:** Search query (e.g., `from:sender`) to confirm zero results.
- **Drive:** Check folder existence or file counts.

## 5. Post-Execution Documentation
**Goal:** Maintain a lightweight index. Do NOT duplicate code into markdown files.

1.  **Commit Scripts to GitHub:**
    Ensure you are in the root of this repository.
    ```bash
    git add .
    git commit -m "Add script: delete_emails_task"
    git push origin master
    ```

2.  **Update Central Index:**
    Maintain a single file: `EXECUTION_INDEX.md` in the repo root.
    **Add a new row for every run:**

    | Date | Task Name | Status | Code Link |
    | :--- | :--- | :--- | :--- |
    | 2024-01-03 | Delete Promo Emails | ✅ Success | [delete_promo.js](https://github.com/skgnotes/gscripts/blob/master/delete_promo.js) |

## 6. Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **"Run" Button Grayed Out** | The script is modified but unsaved. Press `Cmd+S` or click the disk icon. |
| **"Authorization Required" Loop** | You likely created a *new* project instead of using the Utility. Switch to the Utility project. |
| **Clasp Push fails** | Check your `appsscript.json`. If you enabled new advanced services in the browser, you must `clasp pull` first. |
| **Monaco Editor Focus** | The editor is an iframe. Ensure you click *inside* the code area before typing. |

## Appendix: Manual Method (Legacy)
*Use this ONLY if Clasp fails or for one-off, isolated environments.*

1.  Go to `script.new`.
2.  Paste code manually.
3.  Authorize (Standard OAuth flow: Advanced -> Go to Project -> Allow).
4.  Run and Verify.
