/**
 * HotspotManager - Generic Single Dialog Multi-Parameter System with Enhanced Positioning
 * Framework component - works with any tutorial that provides hotspot data
 * Desktop: Single dialog showing all active hotspots with image-relative positioning
 * Mobile: Simple parameter display at end of sections
 */
class HotspotManager {
  constructor(options = {}) {
    this.options = {
      basePath: options.basePath || 'tutorials/tesseract/',
      containerSelector: options.containerSelector || '#hotspotContainer',
      dialogSelector: options.dialogSelector || '#multiParameterDialog',
      dialogOffset: options.dialogOffset || { x: 20, y: 20 },
      ...options
    };
    
    this.hotspots = new Map(); // Map of section ID to hotspot data
    this.activeHotspots = new Set(); // Currently visible hotspot elements
    this.selectedHotspots = new Set(); // Selected hotspot IDs for dialog
    this.currentSection = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Tutorial-specific data (loaded from external files)
    this.imageDimensions = new Map(); // Map of section ID to {width, height}
    this.hotspotData = null;
    
    this.container = null;
    this.singleDialog = null;
    this.dialogContainer = null;
    this.isInitialized = false;
    
    // Bind methods
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  /**
   * Initialize the hotspot manager
   */
  async init() {
    if (this.isInitialized) return;
    
    console.log('🎯 Initializing Single-Dialog HotspotManager...');
    console.log(`📱 Mobile mode: ${this.isMobile}`);
    
    // Find or create containers
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.warn('⚠️ Hotspot container not found, creating one...');
      this.container = this.createHotspotContainer();
    } else {
      console.log('✅ Hotspot container found');
    }
    
    // Create single dialog container
    this.createSingleDialog();
    console.log('✅ Single dialog created');
    
    // Load hotspot data
    await this.loadHotspotData();
    
    // Setup event listeners
    this.setupEventListeners();
    console.log('✅ Event listeners setup');
    
    this.isInitialized = true;
    console.log('✅ Single-Dialog HotspotManager initialized successfully');
    console.log(`📊 Loaded hotspots for ${this.hotspots.size} sections`);
  }

  /**
   * Load hotspot data from external file
   */
  async loadHotspotData() {
    try {
      // Check if hotspot data is already loaded globally
      if (window.TesseractHotspots) {
        this.processHotspotData(window.TesseractHotspots);
        return;
      }
      
      // Try to load from external file
      const response = await fetch(`${this.options.basePath}hotspots.js`);
      if (response.ok) {
        const hotspotScript = await response.text();
        
        // Safely evaluate the script to get hotspot data
        const scriptElement = document.createElement('script');
        scriptElement.textContent = hotspotScript;
        document.head.appendChild(scriptElement);
        document.head.removeChild(scriptElement);
        
        if (window.TesseractHotspots) {
          this.processHotspotData(window.TesseractHotspots);
        } else {
          throw new Error('Hotspot data not found after loading script');
        }
      } else {
        console.warn('⚠️ External hotspot file not found, using embedded data');
        this.loadEmbeddedHotspotData();
      }
    } catch (error) {
      console.warn('⚠️ Failed to load external hotspot data:', error.message);
      this.loadEmbeddedHotspotData();
    }
  }

  /**
   * Process loaded hotspot data into internal structure
   */
  processHotspotData(hotspotData) {
    if (!hotspotData || !hotspotData.sections) {
      throw new Error('Invalid hotspot data structure');
    }
    
    this.hotspotData = hotspotData;
    
    // Convert array to Map for efficient lookup
    hotspotData.sections.forEach(section => {
      if (section.hotspots && section.hotspots.length > 0) {
        this.hotspots.set(section.sectionId, section.hotspots);
      }
    });
    
    // Load image dimensions if provided
    if (hotspotData.imageDimensions) {
      Object.entries(hotspotData.imageDimensions).forEach(([sectionId, dimensions]) => {
        this.imageDimensions.set(parseInt(sectionId), dimensions);
      });
      console.log(`📐 Loaded image dimensions for ${this.imageDimensions.size} sections`);
    }
    
    console.log(`📍 Loaded hotspots for ${this.hotspots.size} sections`);
  }

  /**
   * Fallback: Load embedded hotspot data from content.js
   */
  loadEmbeddedHotspotData() {
    if (window.TesseractContent && window.TesseractContent.tutorial.sections) {
      window.TesseractContent.tutorial.sections.forEach(section => {
        if (section.hotspots && section.hotspots.length > 0) {
          this.hotspots.set(section.id, section.hotspots);
        }
      });
      console.log('📍 Using embedded hotspot data from content.js');
    }
  }

  /**
   * Create hotspot container if it doesn't exist
   */
  createHotspotContainer() {
    const container = document.createElement('div');
    container.id = 'hotspotContainer';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    `;
    
    // Try to add to static image container
    const staticImageContainer = document.getElementById('staticImageContainer');
    if (staticImageContainer) {
      staticImageContainer.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    
    return container;
  }

  /**
   * Create single dialog for all parameters with enhanced animations
   */
  createSingleDialog() {
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'singleDialogContainer';
    this.dialogContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    this.singleDialog = document.createElement('div');
    this.singleDialog.id = 'multiParameterDialog';
    this.singleDialog.className = 'single-parameter-dialog';
    this.singleDialog.style.cssText = `
      position: fixed;
      top: 80px;
      right: 0px;
      background: #1a1a2e;
      border: 3px solid #444;
      border-radius: 8px 0 0 8px;
      border-right: none;
      padding: 3px;
      max-width: 500px;
      min-width: 8px;
      width: 8px;
      max-height: calc(100vh - 100px);
      overflow: hidden;
      box-shadow: -5px 0 20px rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
      opacity: 0;
      pointer-events: auto;
      display: none;
      z-index: 9999;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
      padding-bottom: 3px;
      border-bottom: 1px solid #333;
      opacity: 0;
      transition: opacity 0.3s ease 0.2s;
    `;
    
    const title = document.createElement('h4');
    title.textContent = 'Parameters';
    title.style.cssText = `
      color: #00ffff;
      margin: 0;
      font-size: 0.9rem;
      font-weight: bold;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: #ff4757;
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
      flex-shrink: 0;
    `;
    closeBtn.addEventListener('click', () => {
      console.log('🎯 Close button clicked');
      this.closeAllParameters();
    });
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#ff6b7a';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = '#ff4757';
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    this.singleDialog.appendChild(header);
    
    // Create content container
    const content = document.createElement('div');
    content.id = 'dialogParameterContent';
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0px;
      opacity: 0;
      transition: opacity 0.3s ease 0.3s;
    `;
    this.singleDialog.appendChild(content);
    
    this.dialogContainer.appendChild(this.singleDialog);
    document.body.appendChild(this.dialogContainer);
    
    console.log('✅ Single dialog created and added to DOM');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    window.addEventListener('resize', this.handleWindowResize);
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeyPress);
  }

  /**
   * Update hotspots for a specific section
   * UPDATED: Always closes dialog when changing sections
   */
  updateHotspots(sectionId) {
    // Close dialog immediately when changing sections
    if (this.currentSection !== sectionId) {
      console.log(`🎯 Section changing from ${this.currentSection} to ${sectionId} - closing dialog`);
      this.resetDialogToInitialState();
      this.selectedHotspots.clear();
    }
    
    this.currentSection = sectionId;
    this.clearHotspots();
    
    const sectionHotspots = this.hotspots.get(sectionId);
    if (!sectionHotspots || sectionHotspots.length === 0) {
      console.log(`ℹ️ No hotspots found for section ${sectionId}`);
      return;
    }
    
    const windowWidth = window.innerWidth;
    const isMobileView = windowWidth <= 768;
    const isNarrowDesktopView = windowWidth > 768 && windowWidth <= 1024;
    const isWideDesktopView = windowWidth > 1024;
    
    console.log(`📏 Window width: ${windowWidth}px`);
    console.log(`📱 Mobile: ${isMobileView}, Narrow: ${isNarrowDesktopView}, Wide: ${isWideDesktopView}`);
    
    if (isMobileView || isNarrowDesktopView) {
      // Mobile OR narrow desktop: Add parameter images to section content
      console.log(`📋 Adding parameter images to section content`);
      this.addMobileParameterContent(sectionId, sectionHotspots);
      return;
    }
    
    if (isWideDesktopView) {
      console.log(`🎯 Creating interactive hotspots for section ${sectionId}: ${sectionHotspots.length} hotspots`);
      
      // Wait for image to load before positioning hotspots
      setTimeout(() => {
        sectionHotspots.forEach((hotspotConfig, index) => {
          this.createHotspot(hotspotConfig, index);
        });
        
        console.log(`✅ Created ${this.activeHotspots.size} hotspots`);
      }, 100);
    }
  }

  /**
   * Check if we're in narrow desktop view (when columns stack)
   */
  isNarrowDesktop() {
    const width = window.innerWidth;
    const isNarrow = width > 768 && width <= 1024;
    console.log(`📏 isNarrowDesktop check: ${width}px = ${isNarrow}`);
    return isNarrow;
  }

  /**
   * Create individual hotspot element with image-relative positioning
   */
  createHotspot(config, index) {
    const clickArea = document.createElement('div');
    clickArea.className = 'hotspot-click-area';
    clickArea.dataset.hotspotId = config.id;
    clickArea.dataset.index = index;
    
    // Get the current background image and its dimensions
    const imageContainer = document.getElementById('staticImageContainer');
    const currentImage = imageContainer.querySelector('.tutorial-image');
    
    if (!currentImage) {
      console.warn('No background image found for hotspot positioning');
      return;
    }
    
    // Calculate image-relative position
    const position = this.calculateImageRelativePosition(config.position, currentImage, imageContainer);
    
    clickArea.style.cssText = `
      position: absolute;
      top: ${position.y}px;
      left: ${position.x}px;
      width: 45px;
      height: 45px;
      cursor: pointer;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      z-index: 6000;
      border-radius: 50%;
      background: rgba(255, 0, 0, 0.1);
    `;
    
    // Create visual hotspot
    const hotspot = document.createElement('div');
    hotspot.className = 'hotspot';
    hotspot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 15px;
      height: 15px;
      background: #00ffff;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
      animation: pulse-small 2s infinite;
      border: 2px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;
    
    clickArea.appendChild(hotspot);
    
    console.log(`🎯 Creating hotspot ${config.id} at image-relative position (${position.x}px, ${position.y}px)`);
    
    // Event listeners
    clickArea.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 Hotspot ${config.id} clicked`);
      this.toggleParameter(config, clickArea, hotspot);
    });
    
    clickArea.addEventListener('mouseenter', () => {
      console.log(`🎯 Hotspot ${config.id} hover enter`);
      hotspot.style.transform = 'translate(-50%, -50%) scale(1.5)';
      hotspot.style.background = '#ff00ff';
      hotspot.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)';
      hotspot.style.animation = 'none';
    });
    
    clickArea.addEventListener('mouseleave', () => {
      console.log(`🎯 Hotspot ${config.id} hover leave`);
      if (!this.selectedHotspots.has(config.id)) {
        hotspot.style.transform = 'translate(-50%, -50%) scale(1)';
        hotspot.style.background = '#00ffff';
        hotspot.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.7)';
        hotspot.style.animation = 'pulse-small 2s infinite';
      }
    });
    
    if (!this.container) {
      console.error('❌ Hotspot container not found!');
      return;
    }
    
    this.container.appendChild(clickArea);
    this.activeHotspots.add(clickArea);
    
    console.log(`✅ Hotspot ${config.id} created and added to container`);
    console.log(`📊 Container children count: ${this.container.children.length}`);
    console.log(`📊 Active hotspots count: ${this.activeHotspots.size}`);
  }

  /**
   * Calculate hotspot position relative to actual image bounds
   */
  calculateImageRelativePosition(relativePos, imageElement, containerElement) {
    const containerRect = containerElement.getBoundingClientRect();
    
    // Try to get dimensions from loaded tutorial data first
    const sectionDimensions = this.imageDimensions.get(this.currentSection);
    let naturalWidth, naturalHeight;
    
    if (sectionDimensions) {
      naturalWidth = sectionDimensions.width;
      naturalHeight = sectionDimensions.height;
      console.log(`📐 Using provided dimensions for section ${this.currentSection}: ${naturalWidth}x${naturalHeight}`);
    } else {
      // Fallback to image natural dimensions
      naturalWidth = imageElement.naturalWidth || 1920;
      naturalHeight = imageElement.naturalHeight || 571;
      console.log(`📐 Using fallback dimensions: ${naturalWidth}x${naturalHeight}`);
    }
    
    const imageAspectRatio = naturalWidth / naturalHeight;
    
    // Get container dimensions
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let imageDisplayWidth, imageDisplayHeight;
    let imageOffsetX, imageOffsetY;
    
    // Calculate actual displayed image size (object-fit: contain logic)
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - fit to width
      imageDisplayWidth = containerWidth;
      imageDisplayHeight = containerWidth / imageAspectRatio;
      imageOffsetX = 0;
      imageOffsetY = (containerHeight - imageDisplayHeight) / 2;
    } else {
      // Image is taller - fit to height
      imageDisplayWidth = containerHeight * imageAspectRatio;
      imageDisplayHeight = containerHeight;
      imageOffsetX = (containerWidth - imageDisplayWidth) / 2;
      imageOffsetY = 0;
    }
    
    // Convert relative position (0-1) to absolute position within the image
    const hotspotX = imageOffsetX + (relativePos.x * imageDisplayWidth);
    const hotspotY = imageOffsetY + (relativePos.y * imageDisplayHeight);
    
    console.log(`📐 Image positioning:`, {
      container: { width: containerWidth, height: containerHeight },
      imageDisplay: { width: imageDisplayWidth, height: imageDisplayHeight },
      imageOffset: { x: imageOffsetX, y: imageOffsetY },
      hotspotRelative: relativePos,
      hotspotAbsolute: { x: hotspotX, y: hotspotY }
    });
    
    return { x: hotspotX, y: hotspotY };
  }

  /**
   * Update hotspots when window resizes
   */
  repositionHotspots() {
    if (this.activeHotspots.size === 0) return;
    
    const imageContainer = document.getElementById('staticImageContainer');
    const currentImage = imageContainer.querySelector('.tutorial-image');
    
    if (!currentImage) return;
    
    // Get current section hotspots
    const sectionHotspots = this.hotspots.get(this.currentSection);
    if (!sectionHotspots) return;
    
    // Reposition each hotspot
    this.activeHotspots.forEach(clickArea => {
      const hotspotId = clickArea.dataset.hotspotId;
      const config = sectionHotspots.find(h => h.id === hotspotId);
      
      if (config) {
        const position = this.calculateImageRelativePosition(config.position, currentImage, imageContainer);
        clickArea.style.top = `${position.y}px`;
        clickArea.style.left = `${position.x}px`;
      }
    });
  }

  /**
   * Toggle parameter in single dialog
   */
  toggleParameter(config, clickArea, visualHotspot) {
    console.log(`🎯 Toggling parameter ${config.id}`);
    
    if (this.selectedHotspots.has(config.id)) {
      // Remove parameter
      this.selectedHotspots.delete(config.id);
      clickArea.classList.remove('selected');
      
      // Reset visual styling
      visualHotspot.style.transform = 'translate(-50%, -50%) scale(1)';
      visualHotspot.style.background = '#00ffff';
      visualHotspot.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.7)';
      visualHotspot.style.animation = 'pulse-small 2s infinite';
      
      console.log(`➖ Removed parameter ${config.id}`);
    } else {
      // Add parameter
      this.selectedHotspots.add(config.id);
      clickArea.classList.add('selected');
      
      // Set selected styling
      visualHotspot.style.transform = 'translate(-50%, -50%) scale(1.8)';
      visualHotspot.style.background = '#ffff00';
      visualHotspot.style.boxShadow = '0 0 25px rgba(255, 255, 0, 0.8)';
      visualHotspot.style.animation = 'none';
      
      console.log(`➕ Added parameter ${config.id}`);
    }
    
    this.updateSingleDialog();
  }

  /**
   * Update the single dialog with selected parameters and enhanced animations
   * FIXED: Animation resets properly for each section
   */
  updateSingleDialog() {
    const content = document.getElementById('dialogParameterContent');
    const header = this.singleDialog.querySelector('div'); // Header element
    
    if (!content) {
      console.error('❌ Dialog content container not found');
      return;
    }
    
    if (this.selectedHotspots.size === 0) {
      console.log('🎯 No hotspots selected, hiding dialog');
      this.closeAllParameters();
      return;
    }
    
    console.log(`🎯 Showing dialog with ${this.selectedHotspots.size} parameters`);
    
    // Check if this is a fresh opening (dialog is completely hidden)
    const isDialogHidden = this.singleDialog.style.display === 'none' || 
                          this.singleDialog.style.visibility === 'hidden' ||
                          this.singleDialog.style.opacity === '0';
    
    if (isDialogHidden) {
      console.log('🎯 Fresh dialog opening - starting clean animation');
      
      // Clear any existing content first
      content.innerHTML = '';
      content.style.opacity = '0';
      if (header) header.style.opacity = '0';
      
      // Reset dialog to collapsed state
      this.singleDialog.style.width = '8px';
      this.singleDialog.style.minWidth = '8px';
      this.singleDialog.style.overflow = 'hidden';
      
      // Show dialog container
      this.singleDialog.style.display = 'block';
      this.singleDialog.style.visibility = 'visible';
      this.singleDialog.style.zIndex = '9999';
      this.singleDialog.style.opacity = '1';
      
      // Add all new parameters immediately (but hidden)
      const currentSectionHotspots = this.hotspots.get(this.currentSection) || [];
      Array.from(this.selectedHotspots).forEach((hotspotId, index) => {
        const config = currentSectionHotspots.find(h => h.id === hotspotId);
        if (config) {
          console.log(`📸 Adding parameter ${hotspotId} to fresh dialog`);
          this.addParameterToDialog(config, content, index);
        }
      });
      
      // Start the slide-out animation after content is added
      setTimeout(() => {
        this.singleDialog.style.width = '640px';
        this.singleDialog.style.minWidth = '640px';
        this.singleDialog.style.overflow = 'visible';
        
        // Show header and content after width animation
        setTimeout(() => {
          if (header) header.style.opacity = '1';
          content.style.opacity = '1';
        }, 200);
      }, 50);
      
    } else {
      // Dialog is already open - handle parameter changes normally
      console.log('🎯 Dialog already open - updating parameters');
      
      // Get current parameters to determine what's new
      const currentParameterIds = Array.from(content.children).map(child => child.dataset.parameterId);
      const selectedParameterIds = Array.from(this.selectedHotspots);
      
      // Remove parameters that are no longer selected
      currentParameterIds.forEach(paramId => {
        if (!selectedParameterIds.includes(paramId)) {
          const paramElement = content.querySelector(`[data-parameter-id="${paramId}"]`);
          if (paramElement) {
            paramElement.style.transform = 'translateX(100%) scale(0.8)';
            paramElement.style.opacity = '0';
            setTimeout(() => {
              if (paramElement.parentNode) {
                paramElement.parentNode.removeChild(paramElement);
              }
            }, 300);
          }
        }
      });
      
      // Add new parameters with slide-down animation
      const currentSectionHotspots = this.hotspots.get(this.currentSection) || [];
      selectedParameterIds.forEach((hotspotId, index) => {
        const config = currentSectionHotspots.find(h => h.id === hotspotId);
        if (config && !currentParameterIds.includes(hotspotId)) {
          console.log(`📸 Adding parameter ${hotspotId} to existing dialog`);
          this.addParameterToDialog(config, content, index);
        }
      });
    }
    
    console.log(`📊 Dialog updated with ${this.selectedHotspots.size} parameters`);
  }

  /**
   * Add parameter image to dialog with slide-down stacking animation
   */
  addParameterToDialog(config, container, index = 0) {
    const paramContainer = document.createElement('div');
    paramContainer.dataset.parameterId = config.id;
    paramContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 0px;
      padding: 0px;
      background: transparent;
      border-radius: 3px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transform: translateY(-100%) scale(0.9);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      overflow: hidden;
    `;
    
    // Parameter image only (no title since it's in the image)
    if (config.content.type === 'image' && config.content.source) {
      const img = document.createElement('img');
      let imagePath = config.content.source;
      if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
        imagePath = `${this.options.basePath}${imagePath}`;
      }
      
      img.src = imagePath;
      img.alt = config.content.title || config.id;
      img.style.cssText = `
        width: 100%;
        max-width: 100%;
        height: auto;
        border-radius: 0px;
        border: none;
        display: block;
        margin: 0;
        padding: 0;
      `;
      
      img.onload = () => {
        console.log(`✅ Parameter image loaded: ${imagePath}`);
        // Trigger slide-down animation after image loads
        setTimeout(() => {
          paramContainer.style.transform = 'translateY(0) scale(1)';
          paramContainer.style.opacity = '1';
        }, index * 100); // Stagger animation based on index
      };
      
      img.onerror = () => {
        console.error(`❌ Failed to load parameter image: ${imagePath}`);
        paramContainer.innerHTML = `
          <p style="color: #ff6b6b; text-align: center; padding: 0.5rem; font-size: 0.8rem; margin: 0;">
            Failed to load: ${config.content.source}
          </p>
        `;
        // Still animate even on error
        setTimeout(() => {
          paramContainer.style.transform = 'translateY(0) scale(1)';
          paramContainer.style.opacity = '1';
        }, index * 100);
      };
      
      paramContainer.appendChild(img);
    }
    
    container.appendChild(paramContainer);
  }

  /**
   * Reset dialog to initial state completely
   * NEW: Ensures dialog starts fresh for each section
   */
  resetDialogToInitialState() {
    console.log('🎯 Resetting dialog to initial state');
    
    // Clear all content immediately
    const content = document.getElementById('dialogParameterContent');
    const header = this.singleDialog.querySelector('div'); // Header element
    
    if (content) {
      content.innerHTML = '';
      content.style.opacity = '0';
    }
    
    if (header) {
      header.style.opacity = '0';
    }
    
    // Reset dialog to collapsed state immediately
    this.singleDialog.style.display = 'none';
    this.singleDialog.style.visibility = 'hidden';
    this.singleDialog.style.opacity = '0';
    this.singleDialog.style.width = '8px';
    this.singleDialog.style.minWidth = '8px';
    this.singleDialog.style.overflow = 'hidden';
    this.singleDialog.style.transform = 'scale(1)';
  }

  /**
   * Close all parameters and hide dialog
   * UPDATED: Uses reset method for clean state
   */
  closeAllParameters() {
    console.log('🎯 Closing all parameters');
    
    // Clear all selections
    this.selectedHotspots.clear();
    
    // Reset all hotspot styling
    this.activeHotspots.forEach(clickArea => {
      clickArea.classList.remove('selected');
      const visualHotspot = clickArea.querySelector('.hotspot');
      if (visualHotspot) {
        visualHotspot.style.transform = 'translate(-50%, -50%) scale(1)';
        visualHotspot.style.background = '#00ffff';
        visualHotspot.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.7)';
        visualHotspot.style.animation = 'pulse-small 2s infinite';
      }
    });
    
    // Reset dialog to initial state completely
    this.resetDialogToInitialState();
  }

  /**
   * Add parameter images to section content on mobile
   */
  addMobileParameterContent(sectionId, hotspots) {
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!sectionElement) {
      console.warn(`⚠️ Section element not found for section ${sectionId}`);
      return;
    }
    
    // Remove any existing mobile parameters
    const existingParams = sectionElement.querySelector('.mobile-parameters');
    if (existingParams) {
      existingParams.remove();
    }
    
    // Create mobile parameters container
    const mobileParams = document.createElement('div');
    mobileParams.className = 'mobile-parameters';
    mobileParams.style.cssText = `
      display: block !important;
      margin: 0.5rem 0 2.5rem 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      box-sizing: border-box;
    `;
    
    // Add each parameter image (no titles since they're in the images)
    hotspots.forEach((hotspot, index) => {
      if (hotspot.content && hotspot.content.type === 'image' && hotspot.content.source) {
        // Individual parameter container
        const paramContainer = document.createElement('div');
        paramContainer.style.cssText = `
          margin-bottom: ${index === hotspots.length - 1 ? '0' : '1rem'};
          text-align: center;
        `;
        
        // Parameter image only (no title)
        const img = document.createElement('img');
        img.src = `${this.options.basePath}${hotspot.content.source}`;
        img.alt = hotspot.content.title || hotspot.id;
        img.style.cssText = `
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        img.onerror = () => {
          paramContainer.innerHTML = `
            <p style="color: #ff6b6b; font-style: italic; text-align: center; padding: 0.5rem; font-size: 0.8rem;">
              Failed to load: ${hotspot.content.source}
            </p>
          `;
        };
        
        paramContainer.appendChild(img);
        mobileParams.appendChild(paramContainer);
      }
    });
    
    // Add to end of section
    sectionElement.appendChild(mobileParams);
    
    console.log(`📱 Added ${hotspots.length} parameter images to mobile section ${sectionId}`);
  }

  /**
   * Clear all hotspots and mobile content
   * UPDATED: Always closes dialog when changing sections
   */
  clearHotspots() {
    console.log('🎯 Clearing hotspots and closing dialog (section change)');
    
    // Clear selections and reset dialog to initial state
    this.selectedHotspots.clear();
    this.resetDialogToInitialState();
    
    // Clear desktop hotspots
    this.activeHotspots.forEach(clickArea => {
      if (clickArea.parentNode) {
        clickArea.parentNode.removeChild(clickArea);
      }
    });
    this.activeHotspots.clear();
    
    // Clear mobile parameter content
    const mobileParams = document.querySelectorAll('.mobile-parameters');
    mobileParams.forEach(param => {
      if (param.parentNode) {
        param.parentNode.removeChild(param);
      }
    });
    
    console.log('🎯 All hotspots cleared and dialog closed due to section change');
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Re-evaluate display mode when window resizes
    if (this.currentSection > 0) {
      const wasNarrow = this.isNarrowDesktop();
      // Small delay to let resize complete
      setTimeout(() => {
        const isNarrowNow = this.isNarrowDesktop();
        if (wasNarrow !== isNarrowNow) {
          // Display mode changed, update hotspots
          this.updateHotspots(this.currentSection);
        } else {
          // Just reposition existing hotspots
          this.repositionHotspots();
        }
      }, 100);
    }
  }

  /**
   * Handle document click
   * UPDATED: No auto-close on page clicks - dialog only closes on section change, deactivate last hotspot, close button, or ESC key
   */
  handleDocumentClick(event) {
    // Only prevent event bubbling, don't auto-close dialog
    // Dialog will only close when:
    // 1. Going to another section (handled in updateHotspots/clearHotspots)
    // 2. Deactivating the last hotspot (handled in updateSingleDialog)
    // 3. Clicking the close button (handled in button event)
    // 4. ESC key (handled in handleKeyPress)
    
    // No auto-close behavior - user can click anywhere on page without closing dialog
  }

  /**
   * Handle keyboard events
   */
  handleKeyPress(event) {
    if (event.key === 'Escape') {
      this.closeAllParameters();
    }
  }

  /**
   * Get hotspot data for a section
   */
  getHotspotsForSection(sectionId) {
    return this.hotspots.get(sectionId) || [];
  }

  /**
   * Check if mobile mode
   */
  isMobileMode() {
    return this.isMobile;
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.clearHotspots();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleWindowResize);
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeyPress);
    
    // Remove dialog container
    if (this.dialogContainer && this.dialogContainer.parentNode) {
      this.dialogContainer.parentNode.removeChild(this.dialogContainer);
    }
    
    this.isInitialized = false;
    console.log('🎯 Single-Dialog HotspotManager destroyed');
  }

  /**
   * Static method for quick initialization
   */
  static async create(options = {}) {
    const manager = new HotspotManager(options);
    await manager.init();
    
    // Make debug functions globally accessible
    window.debugHotspots = () => manager.debugDialog();
    window.createTestHotspot = () => manager.createTestHotspot();
    
    console.log('🛠️ Debug functions available:');
    console.log('  - debugHotspots() - Shows detailed debug info');
    console.log('  - createTestHotspot() - Creates a test hotspot for debugging');
    
    return manager;
  }

  /**
   * Debug dialog visibility
   */
  debugDialog() {
    console.log('🔍 Dialog Debug Info:');
    console.log('- Dialog element:', this.singleDialog);
    console.log('- Dialog display:', this.singleDialog?.style.display);
    console.log('- Dialog opacity:', this.singleDialog?.style.opacity);
    console.log('- Dialog z-index:', this.singleDialog?.style.zIndex);
    console.log('- Selected hotspots:', this.selectedHotspots.size);
    console.log('- Current section:', this.currentSection);
    console.log('- Window width:', window.innerWidth);
    console.log('- Is mobile:', this.isMobile);
    console.log('- Is narrow desktop:', this.isNarrowDesktop());
    
    // Check if dialog is in DOM
    const dialogInDOM = this.singleDialog ? document.contains(this.singleDialog) : false;
    console.log('- Dialog in DOM:', dialogInDOM);
    
    // Check computed styles
    if (dialogInDOM && this.singleDialog) {
      const computed = window.getComputedStyle(this.singleDialog);
      console.log('- Computed display:', computed.display);
      console.log('- Computed visibility:', computed.visibility);
      console.log('- Computed z-index:', computed.zIndex);
    }
    
    // Check hotspots
    console.log('- Active hotspots count:', this.activeHotspots.size);
    console.log('- Container element:', this.container);
    console.log('- Container children:', this.container?.children.length);
    
    // Check section hotspots data
    const sectionHotspots = this.hotspots.get(this.currentSection);
    console.log('- Section hotspot data:', sectionHotspots);
    
    // List all active hotspots
    this.activeHotspots.forEach((hotspot, index) => {
      console.log(`  Hotspot ${index}:`, {
        id: hotspot.dataset.hotspotId,
        position: hotspot.style.top + ', ' + hotspot.style.left,
        display: hotspot.style.display,
        visibility: window.getComputedStyle(hotspot).visibility
      });
    });
  }

  /**
   * Force create a test hotspot for debugging
   */
  createTestHotspot() {
    console.log('🧪 Creating test hotspot for debugging...');
    
    const testConfig = {
      id: 'test-hotspot',
      position: { x: 0.5, y: 0.5 },
      content: {
        type: 'image',
        source: 'assets/parameters/select1.png',
        title: 'Test Hotspot'
      }
    };
    
    this.createHotspot(testConfig, 999);
    console.log('✅ Test hotspot created');
  }

  // Legacy compatibility methods
  hideAllDialogs() { this.closeAllParameters(); }
  hideDialog() { this.closeAllParameters(); }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotspotManager;
} else if (typeof window !== 'undefined') {
  window.HotspotManager = HotspotManager;
}

// Add CSS for single dialog system
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Single dialog styling */
    .single-parameter-dialog {
      z-index: 9999 !important;
    }
    
    .single-parameter-dialog.active {
      opacity: 1 !important;
      transform: scale(1) !important;
    }
    
    /* Hotspot styling - always on top */
    .hotspot-click-area {
      z-index: 6000 !important;
      pointer-events: auto !important;
    }
    
    .hotspot-click-area.selected .hotspot {
      transform: translate(-50%, -50%) scale(1.8) !important;
      background: #ffff00 !important;
      box-shadow: 0 0 25px rgba(255, 255, 0, 0.8) !important;
      animation: none !important;
    }
    
    /* Mobile parameters - force display */
    @media (max-width: 768px) {
      .mobile-parameters {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0.5rem 0 2.5rem 0 !important;
        padding: 1rem !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 8px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .mobile-parameters h4 {
        color: #00ffff !important;
        margin: 0 0 1rem 0 !important;
        font-size: 1rem !important;
        font-weight: bold !important;
        text-align: center !important;
      }
      
      .mobile-parameters img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        border-radius: 4px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      /* Hide desktop hotspots on mobile */
      .hotspot-click-area {
        display: none !important;
      }
    }
    
    /* Desktop - hide mobile parameters */
    @media (min-width: 769px) {
      .mobile-parameters {
        display: none !important;
      }
    }
    
    /* Small hotspot animations */
    @keyframes pulse-small {
      0%, 100% { 
        transform: translate(-50%, -50%) scale(1); 
        opacity: 1; 
      }
      50% { 
        transform: translate(-50%, -50%) scale(1.3); 
        opacity: 0.7; 
      }
    }
    
    /* Dialog scrollbar styling */
    .single-parameter-dialog::-webkit-scrollbar {
      width: 8px;
    }
    
    .single-parameter-dialog::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .single-parameter-dialog::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    .single-parameter-dialog::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `;
  document.head.appendChild(style);
}
