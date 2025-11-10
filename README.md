# Source Code Downloader - Firefox Extension

A Firefox browser extension that captures and downloads static resources (CSS, JavaScript, images, etc.) loaded from external domains while browsing websites.

## Features

- **Real-time Resource Monitoring**: Monitors all network requests using Firefox's webRequest API
- **Domain-based Filtering**: Captures resources only from specified target domains
- **Smart File Path Generation**: Converts URLs to proper local file paths, preserving directory structure
- **Batch Downloads**: Download all resources from a domain with a single click
- **Dynamic Domain Management**: Add/remove target domains through the settings panel
- **Clean Interface**: User-friendly popup showing captured domains and resource counts

## Installation

### Method 1: Temporary Installation (Development)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`
5. The extension will be loaded temporarily (until Firefox is restarted)

### Method 2: Permanent Installation (Signed Extension)

For permanent installation, the extension needs to be signed by Mozilla:

1. Create a developer account at [addons.mozilla.org](https://addons.mozilla.org/developers/)
2. Submit the extension for review and signing
3. Once approved, install the signed .xpi file

## Usage

### Basic Usage

1. **Browse a Website**: Navigate to any website that loads external resources
2. **Click Extension Icon**: Click the Source Code Downloader icon in the toolbar
3. **View Captured Resources**: See a list of domains that have served resources
4. **Download Resources**: Click "Download" next to any domain to download all its resources

### Managing Target Domains

1. **Open Settings**: Click the gear (⚙️) icon in the popup
2. **Edit Domains**: Add or remove domains in the text area (one per line)
3. **Save Changes**: Click "Save" to update the target domain list
4. **Reset to Default**: Use "Reset to Default" to restore the original domain list

### Default Target Domains

The extension comes pre-configured to monitor these domains:
- `sub.test.com`
- `static.cdn.com`
- `thirdparty.com`
- `assets.squarespace.com`
- `cdn.jsdelivr.net`
- `cdnjs.cloudflare.com`
- `unpkg.com`

## File Structure

When resources are downloaded, they maintain their original URL structure:

- `https://assets.squarespace.com/universal/scripts/script.js` → `assets.squarespace.com/universal/scripts/script.js`
- `http://static.cdn.com/css/main.css?v=123` → `static.cdn.com/css/main.css` (query parameters are stripped)

## Technical Details

### Manifest Version
- Uses Manifest V2 for maximum compatibility
- Requires permissions: `<all_urls>`, `webRequest`, `webRequestBlocking`, `tabs`, `downloads`, `storage`

### Resource Types Captured
- Stylesheets (CSS)
- Scripts (JavaScript)
- Images (PNG, JPG, SVG, etc.)
- Fonts (WOFF, TTF, etc.)
- Media files
- Other static resources

### Browser Compatibility
- Firefox 57.0 or higher
- Uses Firefox WebExtensions API

## Privacy & Security

- **No Data Collection**: The extension does not collect or transmit any personal data
- **Local Storage Only**: All captured URLs are stored locally in the browser
- **Permission Transparency**: Requires `<all_urls>` permission only to monitor network requests
- **No External Connections**: Does not make any external API calls

## Development

### Project Structure
```
jsext/
├── manifest.json       # Extension configuration
├── background.js       # Background script (webRequest monitoring)
├── popup.html         # Popup interface
├── popup.js           # Popup functionality
├── popup.css          # Popup styling
└── icons/             # Extension icons
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

### Key Components

1. **Background Script**: Monitors webRequest events and maintains captured URL storage
2. **Popup Interface**: Displays captured resources and handles user interactions
3. **Download Manager**: Converts URLs to file paths and triggers downloads

### API Usage

The extension uses the following Firefox WebExtension APIs:
- `browser.webRequest` - Monitor network requests
- `browser.downloads` - Trigger file downloads
- `browser.tabs` - Get active tab information
- `browser.runtime` - Message passing between components

## Troubleshooting

### Common Issues

1. **No Resources Captured**
   - Ensure the website loads resources from the configured target domains
   - Check that the extension has proper permissions
   - Verify target domains are correctly configured

2. **Downloads Not Starting**
   - Check Firefox's download permissions
   - Ensure the Downloads folder is accessible
   - Verify popup blockers are not interfering

3. **Extension Not Loading**
   - Confirm manifest.json syntax is valid
   - Check browser console for error messages
   - Ensure all required files are present

### Debug Mode

Enable debug mode by opening the browser console (F12) while using the extension. Look for console messages starting with "Source Code Downloader".

## License

This extension is provided as-is for educational and development purposes. Please ensure compliance with website terms of service when downloading resources.

## Contributing

To contribute to this project:
1. Fork the repository
2. Make your changes
3. Test thoroughly with different websites
4. Submit a pull request with a clear description of changes

## Version History

- **v1.0.0**: Initial release with core functionality
  - Resource monitoring and capture
  - Domain-based filtering
  - Batch download functionality
  - Settings management
  - Clean popup interface