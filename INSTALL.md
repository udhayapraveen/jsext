# Quick Installation Guide

## Firefox Extension: Source Code Downloader

### Step 1: Enable Developer Mode
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" in the sidebar

### Step 2: Load the Extension
1. Click "Load Temporary Add-on..."
2. Navigate to this folder: `/Users/upraveens/Downloads/jsext`
3. Select the `manifest.json` file
4. Click "Open"

### Step 3: Verify Installation
1. Look for the extension icon in the Firefox toolbar
2. The extension should show as "Source Code Downloader"
3. Click the icon to open the popup interface

### Step 4: Test the Extension
1. Open the included `test-page.html` in Firefox
2. Wait for the page to fully load
3. Click the extension icon
4. You should see captured domains like:
   - `cdnjs.cloudflare.com`
   - `cdn.jsdelivr.net`
5. Click "Download" to test the download functionality

### Step 5: Configure Target Domains (Optional)
1. Click the settings (⚙️) icon in the popup
2. Add or modify domains (one per line)
3. Click "Save" to apply changes

### Troubleshooting
- If no resources are captured, check that the target domains match the ones being used by the website
- Ensure Firefox has permission to download files
- Check the browser console (F12) for any error messages

### Note
This is a temporary installation. The extension will be removed when Firefox is restarted. For permanent installation, the extension would need to be signed by Mozilla.