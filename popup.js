// Popup script for Source Code Downloader extension
// Handles UI interactions and communication with background script

class SourceCodeDownloaderPopup {
    constructor() {
        this.capturedResources = {};
        this.init();
    }

    /**
     * Initialize the popup
     */
    init() {
        this.setupEventListeners();
        this.loadCapturedResources();
    }

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadCapturedResources();
        });

        // Settings toggle
        document.getElementById('settings-toggle').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Close settings
        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideSettings();
        });

        // Save domains
        document.getElementById('save-domains').addEventListener('click', () => {
            this.saveDomains();
        });

        // Reset domains
        document.getElementById('reset-domains').addEventListener('click', () => {
            this.resetDomains();
        });
    }

    /**
     * Load captured resources from background script
     */
    async loadCapturedResources() {
        this.showLoading();
        
        try {
            const response = await this.sendMessageToBackground({
                action: 'getCapturedResources'
            });
            
            this.capturedResources = response.resources || {};
            this.renderResources();
        } catch (error) {
            console.error('Error loading captured resources:', error);
            this.showError('Failed to load captured resources');
        }
    }

    /**
     * Send message to background script
     */
    sendMessageToBackground(message) {
        return new Promise((resolve, reject) => {
            browser.runtime.sendMessage(message, response => {
                if (browser.runtime.lastError) {
                    reject(new Error(browser.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('no-resources').style.display = 'none';
        document.getElementById('resources-list').style.display = 'none';
    }

    /**
     * Show error message
     */
    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('no-resources').style.display = 'block';
        document.getElementById('resources-list').style.display = 'none';
        
        const messageEl = document.querySelector('#no-resources .message');
        messageEl.textContent = message;
    }

    /**
     * Render the captured resources list
     */
    renderResources() {
        const domainCount = Object.keys(this.capturedResources).length;
        const totalResources = Object.values(this.capturedResources)
            .reduce((total, urls) => total + urls.length, 0);

        // Update stats
        document.getElementById('domain-count').textContent = domainCount;
        document.getElementById('resource-count').textContent = totalResources;

        // Hide loading
        document.getElementById('loading').style.display = 'none';

        if (domainCount === 0) {
            // Show no resources message
            document.getElementById('no-resources').style.display = 'block';
            document.getElementById('resources-list').style.display = 'none';
        } else {
            // Show resources list
            document.getElementById('no-resources').style.display = 'none';
            document.getElementById('resources-list').style.display = 'block';
            
            this.renderResourcesList();
        }
    }

    /**
     * Render the actual resources list
     */
    renderResourcesList() {
        const resourcesList = document.getElementById('resources-list');
        resourcesList.innerHTML = '';

        // Sort domains alphabetically
        const sortedDomains = Object.keys(this.capturedResources).sort();

        sortedDomains.forEach(domain => {
            const urls = this.capturedResources[domain];
            const domainItem = this.createDomainItem(domain, urls);
            resourcesList.appendChild(domainItem);
        });
    }

    /**
     * Create a domain item element
     */
    createDomainItem(domain, urls) {
        const domainItem = document.createElement('div');
        domainItem.className = 'domain-item';

        const header = document.createElement('div');
        header.className = 'domain-header';

        const info = document.createElement('div');
        info.className = 'domain-info';

        const name = document.createElement('div');
        name.className = 'domain-name';
        name.textContent = domain;

        const count = document.createElement('div');
        count.className = 'resource-count';
        count.textContent = `${urls.length} resource${urls.length !== 1 ? 's' : ''}`;

        info.appendChild(name);
        info.appendChild(count);

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => this.downloadDomain(domain);

        header.appendChild(info);
        header.appendChild(downloadBtn);

        const urlsList = document.createElement('div');
        urlsList.className = 'urls-list collapsed';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.innerHTML = '▶ Show URLs';
        toggleBtn.onclick = () => this.toggleUrlsList(urlsList, toggleBtn);

        // Create URL items
        urls.forEach(url => {
            const urlItem = document.createElement('div');
            urlItem.className = 'url-item';
            
            const urlText = document.createElement('span');
            urlText.className = 'url-text';
            urlText.textContent = url;
            urlText.title = url;
            
            urlItem.appendChild(urlText);
            urlsList.appendChild(urlItem);
        });

        domainItem.appendChild(header);
        domainItem.appendChild(toggleBtn);
        domainItem.appendChild(urlsList);

        return domainItem;
    }

    /**
     * Toggle URLs list visibility
     */
    toggleUrlsList(urlsList, toggleBtn) {
        const isCollapsed = urlsList.classList.contains('collapsed');
        
        if (isCollapsed) {
            urlsList.classList.remove('collapsed');
            toggleBtn.innerHTML = '▼ Hide URLs';
        } else {
            urlsList.classList.add('collapsed');
            toggleBtn.innerHTML = '▶ Show URLs';
        }
    }

    /**
     * Download resources for a specific domain
     */
    async downloadDomain(domain) {
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        
        // Show loading state
        downloadBtn.textContent = 'Downloading...';
        downloadBtn.disabled = true;

        try {
            const response = await this.sendMessageToBackground({
                action: 'downloadDomain',
                domain: domain
            });

            if (response.success) {
                // Show success state
                downloadBtn.textContent = '✓ Downloaded';
                downloadBtn.classList.add('success');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    downloadBtn.textContent = originalText;
                    downloadBtn.disabled = false;
                    downloadBtn.classList.remove('success');
                }, 2000);
            } else {
                throw new Error(response.error || 'Download failed');
            }
        } catch (error) {
            console.error('Error downloading domain resources:', error);
            
            // Show error state
            downloadBtn.textContent = '✗ Error';
            downloadBtn.classList.add('error');
            
            // Reset after 2 seconds
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('error');
            }, 2000);
        }
    }

    /**
     * Toggle settings panel
     */
    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        const isVisible = settingsPanel.style.display !== 'none';
        
        if (isVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    /**
     * Show settings panel
     */
    async showSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        const textarea = document.getElementById('domains-textarea');
        
        // Load current domains (this would require additional background script functionality)
        // For now, show placeholder text
        textarea.value = 'sub.test.com\nstatic.cdn.com\nthirdparty.com\nassets.squarespace.com\ncdn.jsdelivr.net\ncdnjs.cloudflare.com\nunpkg.com';
        
        settingsPanel.style.display = 'block';
    }

    /**
     * Hide settings panel
     */
    hideSettings() {
        document.getElementById('settings-panel').style.display = 'none';
    }

    /**
     * Save domains configuration
     */
    async saveDomains() {
        const textarea = document.getElementById('domains-textarea');
        const domainsText = textarea.value.trim();
        
        if (!domainsText) {
            alert('Please enter at least one domain');
            return;
        }
        
        const domains = domainsText.split('\n')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0);
        
        try {
            const response = await this.sendMessageToBackground({
                action: 'updateTargetDomains',
                domains: domains
            });
            
            if (response.success) {
                this.hideSettings();
                
                // Show success message
                const saveBtn = document.getElementById('save-domains');
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '✓ Saved';
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                }, 1500);
                
                // Refresh resources
                this.loadCapturedResources();
            } else {
                throw new Error('Failed to save domains');
            }
        } catch (error) {
            console.error('Error saving domains:', error);
            alert('Failed to save domains configuration');
        }
    }

    /**
     * Reset domains to default
     */
    resetDomains() {
        const defaultDomains = [
            'sub.test.com',
            'static.cdn.com',
            'thirdparty.com',
            'assets.squarespace.com',
            'cdn.jsdelivr.net',
            'cdnjs.cloudflare.com',
            'unpkg.com'
        ];
        
        document.getElementById('domains-textarea').value = defaultDomains.join('\n');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SourceCodeDownloaderPopup();
});