// Background script for Source Code Downloader extension
// Monitors web requests and captures external resource URLs

// Storage for captured resources organized by tab and domain
const capturedResources = new Map(); // tabId -> Map(domain -> Set(urls))

// Target domains to monitor (can be dynamically updated)
let targetDomains = [
  'sub.test.com',
  'static.cdn.com',
  'thirdparty.com',
  'assets.squarespace.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'unpkg.com'
];

// Resource types to capture (excluding main_frame and xmlhttprequest)
const RESOURCE_TYPES_TO_CAPTURE = [
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'media',
  'websocket',
  'other',
  'sub_frame'
];

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

/**
 * Check if domain matches any target domain patterns
 */
function isTargetDomain(domain) {
  if (!domain) return false;
  
  return targetDomains.some(targetDomain => {
    // Exact match or subdomain match
    return domain === targetDomain || domain.endsWith('.' + targetDomain);
  });
}

/**
 * Initialize tab storage when a new tab loads
 */
function initializeTabStorage(tabId) {
  if (!capturedResources.has(tabId)) {
    capturedResources.set(tabId, new Map());
  }
}

/**
 * Clean up storage when tab is closed
 */
function cleanupTab(tabId) {
  capturedResources.delete(tabId);
}

/**
 * Add captured resource to storage
 */
function addCapturedResource(tabId, domain, url) {
  initializeTabStorage(tabId);
  
  const tabData = capturedResources.get(tabId);
  if (!tabData.has(domain)) {
    tabData.set(domain, new Set());
  }
  
  tabData.get(domain).add(url);
  
  console.log(`Captured resource: ${domain} -> ${url}`);
}

/**
 * Get captured resources for a specific tab
 */
function getCapturedResourcesForTab(tabId) {
  if (!capturedResources.has(tabId)) {
    return new Map();
  }
  
  const tabData = capturedResources.get(tabId);
  const result = new Map();
  
  // Convert Sets to Arrays for JSON serialization
  for (const [domain, urlSet] of tabData.entries()) {
    result.set(domain, Array.from(urlSet));
  }
  
  return result;
}

/**
 * Web request listener - captures external resources
 */
function onBeforeRequest(details) {
  const { tabId, url, type } = details;
  
  // Skip if not a resource type we want to capture
  if (!RESOURCE_TYPES_TO_CAPTURE.includes(type)) {
    return;
  }
  
  // Skip if it's not a valid tab
  if (tabId < 0) {
    return;
  }
  
  const domain = extractDomain(url);
  
  // Only capture resources from target domains
  if (isTargetDomain(domain)) {
    addCapturedResource(tabId, domain, url);
  }
}

/**
 * Tab navigation listener - reset storage on navigation
 */
function onTabUpdated(tabId, changeInfo, tab) {
  // Reset captured resources when navigating to a new page
  if (changeInfo.status === 'loading' && changeInfo.url) {
    capturedResources.delete(tabId);
    console.log(`Reset captured resources for tab ${tabId}`);
  }
}

/**
 * Tab removal listener - cleanup storage
 */
function onTabRemoved(tabId) {
  cleanupTab(tabId);
  console.log(`Cleaned up resources for tab ${tabId}`);
}

/**
 * Convert URL to local file path
 */
function urlToFilePath(url) {
  try {
    const urlObj = new URL(url);
    let path = urlObj.hostname + urlObj.pathname;
    
    // Remove query parameters and fragments
    path = path.split('?')[0].split('#')[0];
    
    // If path ends with '/', add 'index.html'
    if (path.endsWith('/')) {
      path += 'index.html';
    }
    
    // If no file extension, assume it's HTML
    if (!path.includes('.') && !path.endsWith('/')) {
      path += '.html';
    }
    
    return path;
  } catch (e) {
    console.error('Error converting URL to file path:', e);
    return null;
  }
}

/**
 * Download resources for a specific domain
 */
async function downloadResourcesForDomain(tabId, domain) {
  const tabData = capturedResources.get(tabId);
  if (!tabData || !tabData.has(domain)) {
    console.log(`No resources found for domain: ${domain}`);
    return;
  }
  
  const urls = Array.from(tabData.get(domain));
  console.log(`Starting download of ${urls.length} resources from ${domain}`);
  
  for (const url of urls) {
    try {
      const filePath = urlToFilePath(url);
      if (!filePath) {
        console.error(`Could not generate file path for: ${url}`);
        continue;
      }
      
      // Use Firefox downloads API
      const downloadId = await browser.downloads.download({
        url: url,
        filename: filePath,
        conflictAction: 'uniquify'
      });
      
      console.log(`Download started: ${url} -> ${filePath} (ID: ${downloadId})`);
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
    }
  }
}

/**
 * Message handler for popup communication
 */
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'getCapturedResources':
      browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            const resources = getCapturedResourcesForTab(tabId);
            
            // Convert Map to Object for JSON serialization
            const resourcesObj = {};
            for (const [domain, urls] of resources.entries()) {
              resourcesObj[domain] = urls;
            }
            
            sendResponse({ resources: resourcesObj });
          } else {
            sendResponse({ resources: {} });
          }
        })
        .catch(error => {
          console.error('Error getting captured resources:', error);
          sendResponse({ resources: {} });
        });
      return true; // Keep message channel open for async response
      
    case 'downloadDomain':
      browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            downloadResourcesForDomain(tabId, message.domain)
              .then(() => {
                sendResponse({ success: true });
              })
              .catch(error => {
                console.error('Error downloading domain resources:', error);
                sendResponse({ success: false, error: error.message });
              });
          } else {
            sendResponse({ success: false, error: 'No active tab' });
          }
        })
        .catch(error => {
          console.error('Error getting active tab:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open for async response
      
    case 'updateTargetDomains':
      targetDomains = message.domains;
      console.log('Updated target domains:', targetDomains);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Initialize event listeners
browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

browser.tabs.onUpdated.addListener(onTabUpdated);
browser.tabs.onRemoved.addListener(onTabRemoved);
browser.runtime.onMessage.addListener(handleMessage);

console.log('Source Code Downloader background script initialized');
console.log('Monitoring domains:', targetDomains);