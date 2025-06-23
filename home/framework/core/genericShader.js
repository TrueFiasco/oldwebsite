/**
 * GenericShader - Minimal base class for tutorial shaders
 * Provides only truly generic functionality: parameter management, mobile detection, motion consent
 * Each tutorial implements its own specific animation/control logic
 */
class GenericShader {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId;
    this.onTutorialOpen = options.onTutorialOpen || (() => {});
    this.getTutorialState = options.getTutorialState || (() => false);
    
    // Three.js components (initialized by child classes)
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.uniforms = null;
    
    this.isInitialized = false;
    
    // Generic parameter management
    this.parameterMap = new Map(); // Maps parameter IDs to uniform names
    this.parameterValues = new Map(); // Current values
    
    console.log(`🎯 GenericShader created for: ${canvasId}`);
  }

  // ==========================================
  // ELEGANT MOBILE DETECTION
  // ==========================================

  /**
   * Elegant mobile detection with detailed device info
   * @returns {Object} Device information
   */
  static detectDevice() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android.*(?!.*Mobile)/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    
    return {
      isMobile: isMobile && !isTablet,
      isTablet,
      isDesktop: !isMobile,
      isIOS,
      isAndroid,
      hasMotionAPI: 'DeviceOrientationEvent' in window,
      hasPermissionAPI: 'permissions' in navigator,
      userAgent: ua
    };
  }

  /**
   * Get device info for current instance
   */
  get device() {
    return GenericShader.detectDevice();
  }

  /**
   * Simple mobile check
   */
  get isMobile() {
    return this.device.isMobile || this.device.isTablet;
  }

  // ==========================================
  // MOTION CONSENT PERSISTENCE
  // ==========================================

  /**
   * Check if user has previously given motion consent
   * @returns {boolean|null} true=granted, false=denied, null=not asked
   */
  static getMotionConsent() {
    try {
      const consent = localStorage.getItem('tutorial_motion_consent');
      return consent === null ? null : consent === 'true';
    } catch (e) {
      return null;
    }
  }

  /**
   * Save user's motion consent choice
   * @param {boolean} granted - Whether motion was granted
   */
  static setMotionConsent(granted) {
    try {
      localStorage.setItem('tutorial_motion_consent', granted.toString());
      console.log(`📱 Motion consent saved: ${granted}`);
    } catch (e) {
      console.warn('Could not save motion consent');
    }
  }

  /**
   * Clear motion consent (for testing or reset)
   */
  static clearMotionConsent() {
    try {
      localStorage.removeItem('tutorial_motion_consent');
      console.log('📱 Motion consent cleared');
    } catch (e) {
      console.warn('Could not clear motion consent');
    }
  }

  /**
   * Check if we should prompt for motion permission
   * @returns {boolean}
   */
  shouldPromptForMotion() {
    return this.isMobile && 
           this.device.hasMotionAPI && 
           GenericShader.getMotionConsent() === null;
  }

  /**
   * Check if motion is available and consented
   * @returns {boolean}
   */
  canUseMotion() {
    return this.isMobile && 
           this.device.hasMotionAPI && 
           GenericShader.getMotionConsent() === true;
  }

  // ==========================================
  // GENERIC PARAMETER MANAGEMENT
  // ==========================================

  /**
   * Register parameter mapping (called by child class or config)
   * @param {string} parameterId - Parameter ID from control config
   * @param {string} uniformName - Shader uniform name
   * @param {*} defaultValue - Default value
   */
  registerParameter(parameterId, uniformName, defaultValue) {
    this.parameterMap.set(parameterId, uniformName);
    this.parameterValues.set(parameterId, defaultValue);
  }

  /**
   * Set parameter value - STANDARD INTERFACE
   * @param {string} parameterId - Parameter ID
   * @param {*} value - New value
   */
  setParameter(parameterId, value) {
    const uniformName = this.parameterMap.get(parameterId);
    if (!uniformName) return false;

    this.parameterValues.set(parameterId, value);

    if (this.uniforms && this.uniforms[uniformName]) {
      this.uniforms[uniformName].value = value;
      return true;
    }
    return false;
  }

  /**
   * Get current parameter value
   */
  getParameter(parameterId) {
    return this.parameterValues.get(parameterId);
  }

  /**
   * Get all shader parameters - STANDARD INTERFACE
   * Child classes can override to add their specific state
   */
  getShaderParams() {
    const params = {};
    
    this.parameterValues.forEach((value, parameterId) => {
      params[parameterId] = value;
    });
    
    return params;
  }

  /**
   * Set multiple parameters - STANDARD INTERFACE
   * Child classes can override to handle their specific parameters
   */
  setShaderParams(params) {
    Object.keys(params).forEach(key => {
      this.setParameter(key, params[key]);
    });
  }

  // ==========================================
  // LIFECYCLE - Minimal Interface
  // ==========================================

  /**
   * Cleanup - STANDARD INTERFACE
   */
  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.parameterMap.clear();
    this.parameterValues.clear();
    this.isInitialized = false;
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    return document.getElementById(this.canvasId);
  }

  // ==========================================
  // ABSTRACT METHODS - Child classes implement
  // ==========================================

  async init() {
    throw new Error('init() must be implemented by child class');
  }

  getShaderCode() {
    throw new Error('getShaderCode() must be implemented by child class');
  }

  // ==========================================
  // TUTORIAL-SPECIFIC METHODS (to be implemented by child classes)
  // ==========================================

  /**
   * Reset shader to default state - STANDARD INTERFACE
   * Each tutorial implements their own reset logic
   */
  resetAll() {
    throw new Error('resetAll() must be implemented by child class');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GenericShader;
} else if (typeof window !== 'undefined') {
  window.GenericShader = GenericShader;
}

/**
 * USAGE:
 * 
 * // Device detection
 * const device = GenericShader.detectDevice();
 * console.log('Mobile:', device.isMobile);
 * 
 * // Motion consent
 * if (shader.shouldPromptForMotion()) {
 *   // Show permission dialog
 *   GenericShader.setMotionConsent(true); // Save choice
 * }
 * 
 * // In child class
 * class TesseractShader extends GenericShader {
 *   constructor(canvasId, options) {
 *     super(canvasId, options);
 *     
 *     // Tesseract-specific state
 *     this.angles = { rx: 0, ry: 0, rw: 0 };
 *     this.velocityEnabled = { rx: true, ry: true, rw: true };
 *     
 *     // Register parameters from config
 *     this.registerParameter('fov', 'u_fov', 7.0);
 *   }
 *   
 *   // Tesseract-specific methods
 *   resetRotation() { ... }
 *   toggleVelocity(axis) { ... }
 *   
 *   // Implement required abstract methods
 *   resetAll() { this.resetRotation(); }
 * }
 */
