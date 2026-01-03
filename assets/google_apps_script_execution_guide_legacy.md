# Guide: Executing Google Apps Script via Browser Automation

This guide provides a standardized workflow for agents to set up, execute, and verify Google Apps Scripts (GAS) using browser tools.

## 1. Preparation Phase
- **Confirm Access**: Check if `script.google.com` is accessible and if the user is logged in.
- **Identify Target**: Determine if this is a standalone script or container-bound (attached to a Sheet/Doc).
- **Script Validation**: Ensure the JavaScript code is complete and references the correct IDs (Sheet IDs, Labels, etc.).

## 2. Editor Interaction Strategy
> [!IMPORTANT]
> The GAS editor uses the Monaco editor. Standard `browser_press_key` with "Control+A" or long strings can be unreliable.

### Recommended Method: Direct JavaScript Injection
Use `execute_browser_javascript` to set the editor content directly. This bypasses keyboard delay and formatting issues.
```javascript
// Target the Monaco editor model directly
(() => {
  const models = monaco.editor.getModels();
  if (models && models.length > 0) {
    models[0].setValue(`INSERT_YOUR_SCRIPT_HERE`);
    return "Editor content set successfully";
  }
  return "Monaco model not found";
})()
```

## 3. Deployment Workflow
1.  **Direct Navigation**: Use `script.new` or `scripts.new` in the browser address bar to instantly create and open a new project.
2.  **Setup Code**: Use the [injection method](#recommended-method-direct-javascript-injection) above to populate `Code.gs`.
3.  **Rename**: Click the **Project Title** (initially "Untitled project") in the top-left corner to rename it.
4.  **Save**: Use the **Save** icon (disk) or `Cmd+S`.
    > [!IMPORTANT]
    > The **Run** button is disabled until the project has been saved at least once.
5.  **Function Selection**: Select the correct function from the toolbar dropdown.
6.  **Run**: Click **Run** to begin execution.

## 4. Visual Interface Guide

Use this visual reference to identify key elements in the Google Apps Script editor.

````carousel
![Full Editor View](assets/uploaded_image_1767421414965.png)
<!-- slide -->
![Authorization Popup](assets/authorization_popup_review_permissions_1767422162541.png)
````

### Key UI Elements
| Element | Location | Description |
| :--- | :--- | :--- |
| **Project Title** | Top-left corner | Click "Untitled project" or the current name to rename. |
| **Save Icon** | Toolbar (Disk) | Must be clicked after every code change. |
| **Run Button** | Toolbar (Triangle) | Executes the selected function. Disabled if unsaved. |
| **Function Selector** | Toolbar (Dropdown) | Choose which function `Run` will execute. |
| **Execution Log** | Toolbar (Button) | Adjacent to the right of the Function Selector. Toggles the log panel in the bottom half of the screen. |

## 5. Authorization & Security
Automation must handle the Google Authorization flow:
1. **Review Permissions**: Click the blue button in the popup (see [Visual Guide](#visual-interface-guide)).
2. **Account Selection**: Select the active user account in the popup.
3. **Advanced Bypass**: If "Google hasn't verified this app" appears, click **Advanced** -> **Go to [Project Name] (unsafe)**.
4. **Allow Access**: Scroll down and click **Allow**.

## 6. Execution & Verification
> [!IMPORTANT]
> **Smart Verification**: Never rely solely on "Execution completed" logs. Always perform end-to-end testing in the target application.

- **Check Logs First**: Ensure the "Execution log" panel confirms the expected number of items processed (e.g., "Found 4 threads").
- **Target App Verification**:
    - **Gmail**: Navigate to the inbox. Verify the new label exists, and check that the specific emails are no longer in the inbox and are correctly labeled.
    - **Sheets**: Open the spreadsheet. Verify that rows were added/updated/formatted as expected.
    - **Drive**: Verify files were created/moved/renamed in the correct folders.
- **Fail-Safe**: If the logs say success but the target app shows no change, re-check search queries or permissions.
## 8. Post-Execution Documentation
To ensure long-term reliability and easy recovery, always save the script details to a local markdown file after execution (e.g., in the `assets/` folder of this repository).

**Example Reference**:
- [Gmail Hindu Organizer Details](assets/gmail_organizer_script.md)

**Include**:
- **Title**: Descriptive name of the script.
- **Project URL**: Link to the Google Apps Script editor.
- **Final Code**: The complete, working JavaScript code.
- **Specific IDs**: Any Sheet IDs or labels used in the script.

## 7. Common Troubleshooting
- **Wait Button Grayed Out**: The script is modified but unsaved. Click Save.
- **Monaco Focus**: If injection fails, click once anywhere in the code area.
- **Wait Times**: Allow ~2 seconds for the server to sync after saving before clicking Run.

## 8. Suggested Improvements for Future

To further optimize the speed, reliability, and ease of script execution, consider implementing the following enhancements:

### 1. Optimize Wait Times via JS Polling
Instead of blind `wait` timers or screenshot-based checks, use `execute_browser_javascript` to poll for specific UI states.
- **Why:** This is "internal polling" that talks directly to the browser's brain. It's much faster than me taking and analyzing a screenshot.
- **Example:** Poll until `document.querySelector('div[aria-label="Save status"]')` shows "cloud_done" before clicking Run. This ensures execution starts the exact millisecond the save completes.

> [!CAUTION]
> **Consent Friction**: Using `execute_browser_javascript` for polling or interaction often triggers multiple "Consent/Authorization" prompts for the user in the agentic interface. For a smoother, less interrupted user experience, standard `wait` and `click_browser_pixel` may be preferable despite being slower.

### 2. Selector-First Interaction (JS Clicks)
Prioritize `execute_browser_javascript` for UI actions over pixel-based clicking (`click_browser_pixel`).
- **Why:** Pixel clicking is like me moving a mouse on a "picture" of your screen. JavaScript interaction is me telling the page directly to trigger a button. It's instantaneous and resilient to window resizing.
- **Example:** `document.querySelector('button[aria-label="Run"]').click();`

> [!CAUTION]
> Like polling, selector-based JS interaction triggers additional user consent actions. Use only when high speed or absolute structural reliability is required.

### 3. Persistent "Utility" Project (OAuth Bypass)
Repeatedly creating new projects forces the "Advanced > Go to [Project Name] (unsafe)" authorization flow every time.

**Solution:** Use the **Universal Script Utility** project. This project has been pre-authorized with broad permissions, allowing you to run most standard automation scripts (Gmail, Drive, Sheets, Docs, Calendar) instantly without re-authentication.

- **Project Name:** Universal Script Utility
- **Project ID:** `1lH3AKqFaGJf61VpC6sd2MfrQZ47mppDtWFP...` *(Check browser URL for full ID)*
- **Pre-Authorized Scopes:**
  - `https://www.googleapis.com/auth/gmail.modify`
  - `https://www.googleapis.com/auth/drive`
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/documents`
  - `https://www.googleapis.com/auth/calendar`

**Workflow:**
1.  Clone this project: `clasp clone "PROJECT_ID"`
2.  Overwrite `Code.js` with your new script.
3.  Push: `clasp push -f`
4.  Run immediately.

> [!TIP]
> **Check Local Documentation First**: Before using browser tools to search for project IDs, always check the `assets/` folder in this repository. Previous runs often save project details in markdown files, allowing for instant ID retrieval without opening the browser.


### 4. In-Editor Verification
Avoid the overhead of navigating to target apps (like Gmail or Sheets) for initial verification.
- **Improved Workflow:** Design scripts to return structured verification data in the `Logger`. The agent can then scrape the Execution Log UI directly to confirm success without leaving the editor.

### 5. Clasp / CLI Integration
For high-frequency use, use **clasp** (Command Line Apps Script Projects).
- **Benefits:** Enables `clasp push` and `clasp run` directly from the local terminal, bypassing the browser entirely and reducing total execution time significantly.

