/**
 * ContentBlockManager - GitHub-Optimized Version
 * Handles GitHub raw URLs for loading and GitHub blob URLs for downloads
 */
class ContentBlockManager {
  constructor(options = {}) {
    this.options = {
      basePath: options.basePath || '',
      enableCache: options.enableCache !== false,
      enableMarkdown: options.enableMarkdown !== false,
      githubUser: options.githubUser || 'TrueFiasco',
      githubRepo: options.githubRepo || 'TouchDesigner-Tutorials',
      githubBranch: options.githubBranch || 'main',
      ...options
    };
    
    this.contentCache = new Map();
    this.isInitialized = false;
    this.activeWidgets = new Map(); // Track active widgets for button actions
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  /**
   * Convert raw GitHub URL to GitHub blob URL for viewing
   */
  _convertToGitHubBlobURL(rawUrl, githubPath = null) {
    if (githubPath) {
      // Use the provided GitHub path
      return `https://github.com/${this.options.githubUser}/${this.options.githubRepo}/blob/${this.options.githubBranch}/${githubPath}`;
    }
    
    // Convert from raw URL pattern
    if (rawUrl.includes('raw.githubusercontent.com')) {
      const match = rawUrl.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
      if (match) {
        const [, user, repo, branch, path] = match;
        return `https://github.com/${user}/${repo}/blob/${branch}/${path}`;
      }
    }
    
    // Fallback to original URL
    return rawUrl;
  }

  /**
   * Get GitHub repository root URL
   */
  _getGitHubRepoURL(subPath = '') {
    const baseUrl = `https://github.com/${this.options.githubUser}/${this.options.githubRepo}`;
    return subPath ? `${baseUrl}/tree/${this.options.githubBranch}/${subPath}` : baseUrl;
  }

  /**
   * Render a complete section into an existing element
   */
  async renderSection(section, targetElement = null) {
    if (!section) {
      throw new Error('Section is required');
    }

    try {
      // Use provided element or create new one
      const sectionElement = targetElement || document.createElement('div');
      
      // Clear existing content if using existing element
      if (targetElement) {
        sectionElement.innerHTML = '';
      }
      
      // Set up element properties
      sectionElement.className = 'tutorial-section';
      sectionElement.dataset.sectionId = section.id;

      if (section.background?.image) {
        sectionElement.classList.add('has-background-image');
      }

      const contentElement = await this._renderSectionContent(section);
      sectionElement.appendChild(contentElement);

      if (section.mobileParameters) {
        const mobileParams = this._renderMobileParameters(section.mobileParameters);
        sectionElement.appendChild(mobileParams);
      }

      return sectionElement;

    } catch (error) {
      return this._renderErrorSection(section, error, targetElement);
    }
  }

  /**
   * Render section content based on layout type
   */
  async _renderSectionContent(section) {
    const { layout, content } = section;

    switch (layout) {
      case 'split':
        return await this._renderSplitLayout(content);
      case 'full':
        return await this._renderFullLayout(content);
      case 'triple':
        return await this._renderTripleLayout(content);
      default:
        throw new Error(`Unknown layout type: ${layout}`);
    }
  }

  /**
   * Render split layout (2 columns)
   */
  async _renderSplitLayout(content) {
    const layoutElement = document.createElement('div');
    layoutElement.className = 'section-layout';

    if (content.left) {
      const leftElement = document.createElement('div');
      leftElement.className = 'section-left';
      const leftContent = await this._renderContentBlock(content.left);
      leftElement.appendChild(leftContent);
      layoutElement.appendChild(leftElement);
    }

    if (content.right) {
      const rightElement = document.createElement('div');
      rightElement.className = 'section-right';
      const rightContent = await this._renderContentBlock(content.right);
      rightElement.appendChild(rightContent);
      layoutElement.appendChild(rightElement);
    }

    return layoutElement;
  }

  /**
   * Render full layout (1 column)
   */
  async _renderFullLayout(content) {
    const layoutElement = document.createElement('div');
    layoutElement.className = 'section-full';

    if (content.full) {
      const fullContent = await this._renderContentBlock(content.full);
      layoutElement.appendChild(fullContent);
    }

    return layoutElement;
  }

  /**
   * Render triple layout (3 columns)
   */
  async _renderTripleLayout(content) {
    const layoutElement = document.createElement('div');
    layoutElement.className = 'section-layout triple';

    const positions = ['left', 'center', 'right'];
    
    for (const position of positions) {
      if (content[position]) {
        const columnElement = document.createElement('div');
        columnElement.className = `section-${position}`;
        const columnContent = await this._renderContentBlock(content[position]);
        columnElement.appendChild(columnContent);
        layoutElement.appendChild(columnElement);
      }
    }

    return layoutElement;
  }

  /**
   * Render individual content block
   */
  async _renderContentBlock(block) {
    if (!block || !block.type) {
      throw new Error('Content block must specify type');
    }

    try {
      switch (block.type) {
        case 'html':
          return await this._renderHTML(block);
        case 'markdown':
          return await this._renderMarkdown(block);
        case 'widget':
          return await this._renderWidget(block);
        case 'image':
          return await this._renderImage(block);
        default:
          throw new Error(`Unknown content type: ${block.type}`);
      }
    } catch (error) {
      return this._renderErrorBlock(error);
    }
  }

  /**
   * Render HTML content - supports both embedded content and external sources
   */
  async _renderHTML(block) {
    const container = document.createElement('div');
    container.className = 'content-block html-content';

    let htmlContent;

    if (block.content) {
      // Embedded HTML content (preferred) - process images with correct basePath
      htmlContent = this._processEmbeddedImages(block.content);
      console.log('📝 Rendering embedded HTML content');
    } else if (block.source) {
      // External source file (fallback)
      htmlContent = await this._loadContent(block.source);
      console.log('📁 Rendering external HTML content from:', block.source);
    } else {
      throw new Error('HTML block must specify either content or source');
    }

    container.innerHTML = htmlContent;
    console.log('✅ HTML content rendered, container children:', container.children.length);
    return container;
  }

  /**
   * Process embedded images to add correct basePath
   */
  _processEmbeddedImages(htmlContent) {
    // Replace relative image paths that start with assets/ with full basePath
    return htmlContent.replace(/src="assets\//g, `src="${this.options.basePath}assets/`);
  }

  /**
   * Render Markdown content
   */
  async _renderMarkdown(block) {
    const container = document.createElement('div');
    container.className = 'content-block markdown-content';

    let markdownContent;

    if (block.content) {
      markdownContent = block.content;
    } else if (block.source) {
      markdownContent = await this._loadContent(block.source);
    } else {
      throw new Error('Markdown block must specify either content or source');
    }

    const htmlContent = this._markdownToHTML(markdownContent);
    container.innerHTML = htmlContent;
    
    return container;
  }

  /**
   * Render widget content
   */
  async _renderWidget(block) {
    if (!block.widget) {
      throw new Error('Widget block must specify widget configuration');
    }

    const { widget } = block;

    switch (widget.type) {
      case 'tsv-table':
        return await this._renderTSVTable(widget);
      case 'code-viewer':
        return await this._renderCodeViewer(widget);
      case 'image-gallery':
        return await this._renderImageGallery(widget);
      default:
        throw new Error(`Unknown widget type: ${widget.type}`);
    }
  }

  /**
   * Render image content
   */
  async _renderImage(block) {
    const container = document.createElement('div');
    container.className = 'content-block image-content';

    const img = document.createElement('img');
    
    if (block.source) {
      // Handle relative paths correctly
      img.src = this._resolvePath(block.source);
    } else {
      throw new Error('Image block must specify source');
    }

    if (block.alt) img.alt = block.alt;
    if (block.caption) img.title = block.caption;
    if (block.className) img.className = block.className;

    img.classList.add('responsive-image');
    container.appendChild(img);

    if (block.caption) {
      const caption = document.createElement('p');
      caption.className = 'image-caption';
      caption.textContent = block.caption;
      container.appendChild(caption);
    }

    return container;
  }

  /**
   * Render TSV table widget with GitHub integration
   */
  async _renderTSVTable(widget) {
    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const container = document.createElement('div');
    container.className = 'widget-container';
    container.dataset.widgetId = widgetId;

    const buttonsContainer = this._createWidgetButtons(widget.controls || [], widgetId);
    container.appendChild(buttonsContainer);

    const contentWidget = document.createElement('div');
    contentWidget.className = 'content-widget';

    const widgetContent = document.createElement('div');
    widgetContent.className = 'widget-content';
    widgetContent.id = `tsvContent-${widgetId}`;

    const table = document.createElement('table');
    table.className = 'tsv-table';
    table.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';

    widgetContent.appendChild(table);
    contentWidget.appendChild(widgetContent);

    const widgetHeader = document.createElement('div');
    widgetHeader.className = 'widget-header';
    
    const widgetTitle = document.createElement('div');
    widgetTitle.className = 'widget-title';
    widgetTitle.textContent = widget.title || 'TSV Data';
    
    widgetHeader.appendChild(widgetTitle);
    contentWidget.appendChild(widgetHeader);

    container.appendChild(contentWidget);

    // Store widget data with GitHub information
    this.activeWidgets.set(widgetId, {
      type: 'tsv-table',
      widget: widget,
      table: table,
      container: container,
      contentElement: widgetContent,
      title: widget.title || 'TSV Data',
      githubPath: widget.githubPath,
      githubURL: widget.githubPath ? this._convertToGitHubBlobURL(widget.source, widget.githubPath) : this._convertToGitHubBlobURL(widget.source)
    });

    if (widget.source) {
      this._loadTSVData(widget.source, table);
    }

    return container;
  }

  /**
   * Render code viewer widget with GitHub integration
   */
  async _renderCodeViewer(widget) {
    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const container = document.createElement('div');
    container.className = 'widget-container';
    container.dataset.widgetId = widgetId;

    const buttonsContainer = this._createWidgetButtons(widget.controls || [], widgetId);
    container.appendChild(buttonsContainer);

    const contentWidget = document.createElement('div');
    contentWidget.className = 'content-widget';

    const widgetContent = document.createElement('div');
    widgetContent.className = 'widget-content';
    widgetContent.id = `codeContent-${widgetId}`;

    const codeElement = document.createElement('div');
    codeElement.className = 'code-content loading';
    codeElement.textContent = 'Loading code...';

    widgetContent.appendChild(codeElement);
    contentWidget.appendChild(widgetContent);

    const widgetHeader = document.createElement('div');
    widgetHeader.className = 'widget-header';
    
    const widgetTitle = document.createElement('div');
    widgetTitle.className = 'widget-title';
    widgetTitle.textContent = widget.title || 'Code';
    
    widgetHeader.appendChild(widgetTitle);
    contentWidget.appendChild(widgetHeader);

    container.appendChild(contentWidget);

    // Store widget data with GitHub information
    this.activeWidgets.set(widgetId, {
      type: 'code-viewer',
      widget: widget,
      codeElement: codeElement,
      container: container,
      contentElement: widgetContent,
      title: widget.title || 'Code',
      language: widget.language || 'txt',
      githubPath: widget.githubPath,
      githubURL: widget.githubPath ? this._convertToGitHubBlobURL(widget.source, widget.githubPath) : this._convertToGitHubBlobURL(widget.source)
    });

    if (widget.source) {
      this._loadCodeData(widget.source, codeElement, widgetId);
    } else if (widget.content) {
      codeElement.textContent = widget.content;
      codeElement.classList.remove('loading');
      // Update stored content
      if (this.activeWidgets.has(widgetId)) {
        this.activeWidgets.get(widgetId).content = widget.content;
      }
    }

    return container;
  }

  /**
   * Create widget control buttons with working functionality
   */
  _createWidgetButtons(controls, widgetId) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'widget-buttons';

    controls.forEach(control => {
      const button = document.createElement('button');
      button.className = `widget-btn widget-btn-${control}`;
      button.title = this._getButtonTitle(control);
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleWidgetAction(control, widgetId);
      });
      buttonsContainer.appendChild(button);
    });

    return buttonsContainer;
  }

  _getButtonTitle(control) {
    const titles = {
      'fullscreen': 'Fullscreen',
      'copy': 'Copy to Clipboard',
      'download': 'View on GitHub'
    };
    return titles[control] || control;
  }

  /**
   * Handle widget button actions - GitHub-optimized
   */
  _handleWidgetAction(action, widgetId) {
    console.log(`🎛️ Widget action: ${action} for widget: ${widgetId}`);
    
    const widgetData = this.activeWidgets.get(widgetId);
    if (!widgetData) {
      console.error('❌ Widget data not found for ID:', widgetId);
      return;
    }

    switch (action) {
      case 'fullscreen':
        this._openFullscreenModal(widgetData);
        break;
      case 'copy':
        this._copyWidgetContent(widgetData);
        break;
      case 'download':
        this._openGitHubFile(widgetData);
        break;
      default:
        console.warn(`⚠️ Unknown widget action: ${action}`);
    }
  }

  /**
   * Open GitHub file in new tab
   */
  _openGitHubFile(widgetData) {
    console.log('🐙 Opening GitHub file:', widgetData.githubURL);
    
    if (widgetData.githubURL) {
      window.open(widgetData.githubURL, '_blank', 'noopener,noreferrer');
    } else if (widgetData.widget.source) {
      // Fallback to converted URL
      const githubUrl = this._convertToGitHubBlobURL(widgetData.widget.source);
      window.open(githubUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('⚠️ No GitHub URL available for widget');
      this._showCopyNotification('No GitHub URL available', true);
    }
  }

  /**
   * Open widget content in fullscreen modal
   */
  _openFullscreenModal(widgetData) {
    console.log('🖥️ Opening fullscreen modal for:', widgetData.title);
    
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'widget-fullscreen active';
    modal.style.display = 'flex';
    
    // Modal header
    const header = document.createElement('div');
    header.className = 'widget-fullscreen-header';
    
    const title = document.createElement('h3');
    title.textContent = widgetData.title;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'widget-fullscreen-buttons';
    
    // Copy button in fullscreen
    const copyBtn = document.createElement('button');
    copyBtn.className = 'nav-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.addEventListener('click', () => this._copyWidgetContent(widgetData));
    
    // GitHub button in fullscreen
    if (widgetData.githubURL) {
      const githubBtn = document.createElement('button');
      githubBtn.className = 'nav-btn';
      githubBtn.innerHTML = '🐙 GitHub';
      githubBtn.addEventListener('click', () => this._openGitHubFile(widgetData));
      buttonContainer.appendChild(githubBtn);
    }
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'nav-btn close-btn';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    buttonContainer.appendChild(copyBtn);
    buttonContainer.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    // Modal content
    const content = document.createElement('div');
    content.className = 'widget-fullscreen-content';
    
    // Clone the widget content
    if (widgetData.type === 'tsv-table') {
      const tableClone = widgetData.table.cloneNode(true);
      content.appendChild(tableClone);
    } else if (widgetData.type === 'code-viewer') {
      const codeClone = widgetData.codeElement.cloneNode(true);
      codeClone.className = 'code-content'; // Remove loading class
      content.appendChild(codeClone);
    }
    
    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on ESC key
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    
    // Close on click outside content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleKeyPress);
      }
    });
  }

  /**
   * Copy widget content to clipboard
   */
  async _copyWidgetContent(widgetData) {
    console.log('📋 Copying content for:', widgetData.title);
    
    let textToCopy = '';
    
    try {
      if (widgetData.type === 'tsv-table') {
        // Convert table to TSV format
        const table = widgetData.table;
        const rows = table.querySelectorAll('tr');
        const tsvRows = Array.from(rows).map(row => {
          const cells = row.querySelectorAll('th, td');
          return Array.from(cells).map(cell => cell.textContent.trim()).join('\t');
        });
        textToCopy = tsvRows.join('\n');
      } else if (widgetData.type === 'code-viewer') {
        // Get code content
        textToCopy = widgetData.content || widgetData.codeElement.textContent;
      }
      
      // Copy to clipboard
      await navigator.clipboard.writeText(textToCopy);
      
      // Show notification
      this._showCopyNotification('Copied to clipboard!');
      
    } catch (error) {
      console.error('❌ Failed to copy content:', error);
      this._showCopyNotification('Failed to copy content', true);
    }
  }

  /**
   * Helper to download file (for local content)
   */
  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Show copy notification
   */
  _showCopyNotification(message, isError = false) {
    // Look for existing notification element
    let notification = document.getElementById('copyNotification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'copyNotification';
      notification.className = 'copy-notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.background = isError ? 'rgba(255, 107, 107, 0.9)' : 'rgba(0, 255, 255, 0.9)';
    notification.style.color = isError ? '#fff' : '#000';
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }

  /**
   * Resolve path - handle both relative and absolute paths correctly
   */
  _resolvePath(path) {
    // If it's already an absolute URL, return as-is
    if (path.startsWith('http')) {
      return path;
    }
    
    // If it already includes the basePath, don't add it again
    if (path.startsWith(this.options.basePath)) {
      return path;
    }
    
    // For relative paths, add basePath
    return `${this.options.basePath}${path}`;
  }

  /**
   * Load content from external source
   */
  async _loadContent(source) {
    if (!source) {
      throw new Error('Source is required');
    }

    if (this.options.enableCache && this.contentCache.has(source)) {
      return this.contentCache.get(source);
    }

    try {
      const content = await this._fetchContent(source);
      
      if (this.options.enableCache) {
        this.contentCache.set(source, content);
      }
      
      return content;
    } catch (error) {
      throw new Error(`Failed to load content from ${source}: ${error.message}`);
    }
  }

  /**
   * Fetch content from URL
   */
  async _fetchContent(url) {
    const resolvedUrl = this._resolvePath(url);
    
    console.log(`🔗 Fetching: ${resolvedUrl}`);
    
    const response = await fetch(resolvedUrl);
    
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  }

  /**
   * Load TSV data into table
   */
  async _loadTSVData(source, table) {
    try {
      const tsvData = await this._loadContent(source);
      const rows = tsvData.trim().split('\n');
      const headers = rows[0].split('\t');
      const dataRows = rows.slice(1);

      const thead = table.querySelector('thead tr');
      thead.innerHTML = '';
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.trim();
        thead.appendChild(th);
      });

      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      dataRows.forEach(row => {
        const cells = row.split('\t');
        const tr = document.createElement('tr');
        cells.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell.trim();
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

    } catch (error) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; color: #ff6b6b;">Failed to load data</td></tr>';
    }
  }

  /**
   * Load code data into code element
   */
  async _loadCodeData(source, codeElement, widgetId) {
    try {
      const codeData = await this._loadContent(source);
      codeElement.textContent = codeData;
      codeElement.classList.remove('loading');
      
      // Store content for copy functionality
      if (this.activeWidgets.has(widgetId)) {
        this.activeWidgets.get(widgetId).content = codeData;
      }
    } catch (error) {
      codeElement.textContent = 'Failed to load code';
      codeElement.classList.remove('loading');
      codeElement.classList.add('error');
    }
  }

  /**
   * Render mobile parameters section
   */
  _renderMobileParameters(parameters) {
    const container = document.createElement('div');
    container.className = 'mobile-parameters';

    const title = document.createElement('h4');
    title.textContent = parameters.title || 'Parameters';
    container.appendChild(title);

    if (parameters.images && Array.isArray(parameters.images)) {
      parameters.images.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = this._resolvePath(imagePath);
        img.alt = 'Parameter Image';
        container.appendChild(img);
      });
    }

    return container;
  }

  /**
   * Simple markdown to HTML converter
   */
  _markdownToHTML(markdown) {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/\n/gim, '<br>');
  }

  /**
   * Render error section
   */
  _renderErrorSection(section, error, targetElement = null) {
    const sectionElement = targetElement || document.createElement('div');
    sectionElement.className = 'tutorial-section error-section';
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'section-layout';
    errorContainer.innerHTML = `
      <div class="section-full">
        <div class="error-content">
          <h2>Error Loading Section ${section.id}</h2>
          <p>${section.title}</p>
          <p class="error-message">${error.message}</p>
          <button onclick="location.reload()" class="retry-button">Retry</button>
        </div>
      </div>
    `;
    
    if (targetElement) {
      sectionElement.innerHTML = '';
    }
    sectionElement.appendChild(errorContainer);
    return sectionElement;
  }

  /**
   * Render error block
   */
  _renderErrorBlock(error) {
    const container = document.createElement('div');
    container.className = 'content-block error-block';
    container.innerHTML = `
      <div class="error-content">
        <p>⚠️ Content Error</p>
        <p class="error-message">${error.message}</p>
      </div>
    `;
    return container;
  }

  /**
   * Clear content cache
   */
  clearCache() {
    this.contentCache.clear();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.clearCache();
    this.activeWidgets.clear();
    this.isInitialized = false;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentBlockManager;
} else if (typeof window !== 'undefined') {
  window.ContentBlockManager = ContentBlockManager;
}
