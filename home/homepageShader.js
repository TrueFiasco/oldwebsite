/**
 * Homepage TesseractShader - Extends framework TesseractShader with custom text rendering
 * Supports custom title and subtitle for homepage experience
 */
class HomepageTesseractShader extends TesseractShader {
  constructor(canvasId, options = {}) {
    super(canvasId, options);
    
    // Store custom text options
    this.customTitle = options.title || 'TRUE FIASCO';
    this.customSubtitle = options.subtitle || 'taking event to the next dimension';
    this.titleFont = options.titleFont || 'Spy Agency';
    this.subtitleFont = options.subtitleFont || 'Orbitron';
    
    console.log('🎯 HomepageTesseractShader with custom text:', this.customTitle);
  }

  /**
   * Override text texture creation to use custom title and subtitle
   */
  async createTesseractTextTexture() {
    await this.waitForFonts();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const baseFontSize = Math.min(window.innerWidth * 0.12, 144);
    const subtitleFontSize = Math.min(window.innerWidth * 0.040, 40); // Slightly larger for homepage
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Render custom title
    ctx.font = `${baseFontSize}px "${this.titleFont}"`;
    const titleY = centerY - 30;
    ctx.fillText(this.customTitle, centerX, titleY);
    
    // Render custom subtitle
    ctx.font = `400 ${subtitleFontSize}px ${this.subtitleFont}`;
    
    // Handle subtitle as string or array
    if (Array.isArray(this.customSubtitle)) {
      // Multi-line subtitle
      const subtitleY = titleY + baseFontSize * 0.8 + 20;
      const lineSpacing = subtitleFontSize * 1.2;
      
      this.customSubtitle.forEach((line, index) => {
        ctx.fillText(line, centerX, subtitleY + (index * lineSpacing));
      });
    } else {
      // Single line subtitle
      const subtitleY = titleY + baseFontSize * 0.8 + 20;
      ctx.fillText(this.customSubtitle, centerX, subtitleY);
    }
    
    console.log(`✅ Custom text texture created: "${this.customTitle}" / "${this.customSubtitle}"`);
    
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Override font waiting to include custom fonts
   */
  async waitForFonts() {
    return new Promise((resolve) => {
      const testCanvas = document.createElement('canvas');
      const testCtx = testCanvas.getContext('2d');
      
      function checkFonts() {
        // Test title font
        testCtx.font = `48px "${this.titleFont}", serif`;
        const customFontWidth = testCtx.measureText(this.customTitle).width;
        testCtx.font = '48px serif';
        const serifWidth = testCtx.measureText(this.customTitle).width;
        
        if (Math.abs(customFontWidth - serifWidth) > 1) {
          resolve();
        } else {
          setTimeout(checkFonts.bind(this), 100);
        }
      }
      
      checkFonts.call(this);
      setTimeout(resolve, 5000); // Fallback timeout
    });
  }

  /**
   * Auto-register homepage parameters
   */
  registerTesseractParameters() {
    if (typeof window !== 'undefined' && window.HomepageControlConfig) {
      const config = window.HomepageControlConfig;
      config.parameters.forEach(param => {
        this.registerParameter(param.id, param.uniformName, param.default);
      });
      console.log('✅ Auto-registered homepage parameters from config');
    } else {
      // Fallback registration
      this.registerParameter('fov', 'u_fov', 7.0);
      this.registerParameter('perspective', 'u_perspective', 2.3);
      this.registerParameter('cameraZ', 'u_cameraZ', 10.0);
      console.log('✅ Fallback parameter registration complete');
    }
  }

  /**
   * Override canvas click behavior for homepage
   */
  onCanvasClick(event) {
    if (!this.getTutorialState() && !this.isMobile) {
      // Check if click is on UI elements
      const settingsToggle = document.getElementById('settings-toggle');
      const controlsPanel = document.getElementById('controls-panel');
      
      if (settingsToggle && settingsToggle.contains(event.target)) return;
      if (controlsPanel && controlsPanel.contains(event.target)) return;
      
      event.preventDefault();
      console.log('Homepage canvas clicked - triggering scroll to tutorials');
      
      // Execute the provided callback (scroll to tutorials)
      if (this.onTutorialOpen && typeof this.onTutorialOpen === 'function') {
        this.onTutorialOpen();
      }
    }
  }

  /**
   * Update text dynamically (for future use)
   */
  updateText(newTitle, newSubtitle) {
    this.customTitle = newTitle;
    this.customSubtitle = newSubtitle;
    
    // Recreate text texture
    this.createTesseractTextTexture().then(newTexture => {
      if (this.uniforms && this.uniforms.u_textTexture) {
        this.uniforms.u_textTexture.value = newTexture;
        console.log(`✅ Text updated to: "${newTitle}" / "${newSubtitle}"`);
      }
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomepageTesseractShader;
} else if (typeof window !== 'undefined') {
  window.HomepageTesseractShader = HomepageTesseractShader;
}

console.log('✅ HomepageTesseractShader ready with custom text support!');
