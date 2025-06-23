/**
 * Enhanced Mobile Motion Control System - FIXED: Gravity as Position Control
 * CHANGED: Gravity directly controls hypercube orientation (not velocity)
 * FIXED: X-axis inversion for natural pitch control
 * RESULT: Hypercube feels attached to the glass - tilts with phone orientation
 */
class MobileMotionControl {
  constructor(tesseractShader) {
    this.tesseractShader = tesseractShader;
    this.isActive = false;
    this.isSupported = false;
    this.isPermissionGranted = false;
    this.isCalibrated = false;
    
    // Raw device orientation data
    this.orientationData = {
      alpha: 0,   // Z-axis (compass/yaw) → RZ
      beta: 0,    // X-axis (pitch) → RX  
      gamma: 0,   // Y-axis (roll) → RY
      calibration: { alpha: 0, beta: 0, gamma: 0 }
    };
    
    // FIXED: Configuration for gravity-as-position control
    this.config = {
      // CHANGED: Position-based sensitivity (not velocity)
      sensitivity: {
        pitch: 0.01745,    // Beta → RX sensitivity (INCREASED for direct control)
        roll: 0.01745,     // Gamma → RY sensitivity  
        yaw: 0.01745       // Alpha → RZ sensitivity
      },
      deadzone: 1.5,       // Degrees of deadzone (REDUCED for responsiveness)
      maxRotation: 2.5,    // Maximum rotation in radians (INCREASED range)
      smoothingFactor: 0.25, // INCREASED for smoother glass-attached feel
      
      // FIXED: Coordinate system for natural glass-attached feel
      coordinateSystem: 'right-handed',
      screenOrientation: 'portrait',
      invertAxes: {
        pitch: false,    // FIXED: No inversion for natural pitch
        roll: false,     // Direct gamma mapping
        yaw: false       // Direct alpha mapping
      }
    };
    
    // CHANGED: Target orientation (position-based, not velocity-based)
    this.targetOrientation = { rx: 0, ry: 0, rz: 0 };
    this.currentOrientation = { rx: 0, ry: 0, rz: 0 };
    
    // UI elements (unchanged)
    this.indicator = document.getElementById('motionIndicator');
    this.permissionPrompt = document.getElementById('motionPermissionPrompt');
    
    this.init();
  }
  
  async init() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    console.log('🎯 Initializing FIXED Mobile Motion Control - Gravity as Position Control');
    
    this.isSupported = 'DeviceOrientationEvent' in window;
    
    if (!this.isSupported) {
      console.log('❌ Device orientation not supported');
      return;
    }
    
    // Permission handling (unchanged)
    const storedConsent = localStorage.getItem('motionControlConsent');
    const hasStoredConsent = storedConsent === 'granted';
    
    if (this.indicator) {
      this.indicator.style.display = 'flex';
      this.indicator.addEventListener('click', this.toggleMotionControl.bind(this));
    }
    
    if (hasStoredConsent) {
      console.log('✅ Found stored motion consent - enabling glass-attached mode');
      this.isPermissionGranted = true;
      this.startGlassAttachedDetection();
      this.autoEnableMotionControl();
      return;
    }
    
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      console.log('📱 iOS device detected - showing permission prompt');
      this.showPermissionPrompt();
    } else {
      console.log('📱 Android device - enabling glass-attached mode with stored consent');
      this.isPermissionGranted = true;
      this.startGlassAttachedDetection();
      this.autoEnableMotionControl();
      localStorage.setItem('motionControlConsent', 'granted');
    }
  }
  
  autoEnableMotionControl() {
    console.log('🎯 Starting auto-enable motion control process...');
    
    this.isActive = true;
    
    // Enable device orientation in enhanced shader
    if (this.tesseractShader && typeof this.tesseractShader.enableDeviceOrientation === 'function') {
      const result = this.tesseractShader.enableDeviceOrientation();
      console.log(`🪟 Glass-Attached mode auto-enabled via enhanced shader: ${result}`);
    } else if (this.tesseractShader && typeof this.tesseractShader.enableMotionControl === 'function') {
      // Fallback for compatibility
      const result = this.tesseractShader.enableMotionControl();
      console.log(`🪟 Glass-Attached mode auto-enabled via fallback method: ${result}`);
    }
    
    // Set global variables for motion control logic
    if (typeof window !== 'undefined') {
      window.currentSection = window.currentSection || 0;
      window.tutorialOpen = window.tutorialOpen || false;
      console.log(`🌍 Global state set - Section: ${window.currentSection}, Tutorial: ${window.tutorialOpen}`);
    }
    
    // Auto-calibrate after brief delay
    setTimeout(() => {
      this.calibrateOrientation();
      console.log('🪟 Auto-calibration complete - glass-attached mode ready');
    }, 1500);
    
    console.log('🎯 Glass-Attached motion control auto-enabled and ready');
  }
  
  // Permission methods (unchanged)
  showPermissionPrompt() {
    if (!this.permissionPrompt) return;
    
    const storedConsent = localStorage.getItem('motionControlConsent');
    if (storedConsent) return;
    
    setTimeout(() => {
      const currentSection = window.currentSection || 0;
      if (currentSection === 0 && !this.isActive) {
        this.permissionPrompt.classList.add('show');
      }
    }, 2000);
    
    const enableBtn = document.getElementById('enableMotionBtn');
    const declineBtn = document.getElementById('declineMotionBtn');
    
    if (enableBtn) {
      enableBtn.addEventListener('click', this.requestPermission.bind(this));
    }
    
    if (declineBtn) {
      declineBtn.addEventListener('click', this.declinePermission.bind(this));
    }
  }
  
  async requestPermission() {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      
      if (response === 'granted') {
        console.log('✅ Motion permission granted - enabling glass-attached mode');
        this.isPermissionGranted = true;
        
        localStorage.setItem('motionControlConsent', 'granted');
        
        this.startGlassAttachedDetection();
        this.hidePermissionPrompt();
        this.autoEnableMotionControl();
      } else {
        console.log('❌ Motion permission denied');
        localStorage.setItem('motionControlConsent', 'denied');
        this.handlePermissionDenied();
      }
    } catch (error) {
      console.error('Motion permission request failed:', error);
      this.handlePermissionDenied();
    }
  }
  
  declinePermission() {
    console.log('👤 User declined motion control');
    localStorage.setItem('motionControlConsent', 'declined');
    this.hidePermissionPrompt();
  }
  
  hidePermissionPrompt() {
    if (this.permissionPrompt) {
      this.permissionPrompt.classList.remove('show');
    }
  }
  
  handlePermissionDenied() {
    this.hidePermissionPrompt();
    console.log('📱 Using touch controls as fallback');
  }
  
  // CHANGED: Glass-Attached Detection System
  startGlassAttachedDetection() {
    if (!this.isPermissionGranted) return;
    
    console.log('🪟 Starting Glass-Attached detection system (position-based)');
    window.addEventListener('deviceorientation', this.handleGlassAttachedOrientation.bind(this));
    
    if (this.indicator) {
      this.indicator.style.opacity = '0.7';
    }
  }
  
  // Glass-Attached Calibration
  calibrateOrientation() {
    this.orientationData.calibration = {
      alpha: this.orientationData.alpha,
      beta: this.orientationData.beta,
      gamma: this.orientationData.gamma
    };
    
    this.isCalibrated = true;
    
    if (this.indicator) {
      this.indicator.classList.remove('calibrating');
      this.indicator.classList.add('active');
      this.indicator.title = 'Glass-Attached mode active - tap to toggle';
      
      // Visual feedback
      this.indicator.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.indicator.style.transform = 'scale(1)';
      }, 400);
    }
    
    // Update control panel button when calibration completes
    if (window.enhancedControlPanel && typeof window.enhancedControlPanel.updateMotionControlButton === 'function') {
      setTimeout(() => {
        const motionButton = document.getElementById('motion-control-toggle');
        if (motionButton) {
          window.enhancedControlPanel.updateMotionControlButton(motionButton);
        }
      }, 100);
    }
    
    console.log('🪟 Glass-Attached mode calibrated and ready');
  }
  
  toggleMotionControl() {
    // Permission checking logic (unchanged)
    const storedConsent = localStorage.getItem('motionControlConsent');
    if (!storedConsent || storedConsent === 'denied') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        this.showPermissionPrompt();
      }
      return;
    }
    
    if (!this.isSupported || !this.isPermissionGranted) return;
    
    this.isActive = !this.isActive;
    
    // Toggle enhanced shader orientation control
    if (this.tesseractShader) {
      if (typeof this.tesseractShader.toggleDeviceOrientationControl === 'function') {
        if (this.isActive) {
          this.tesseractShader.enableDeviceOrientation();
          console.log('🪟 Glass-Attached motion control ENABLED');
        } else {
          this.tesseractShader.disableDeviceOrientation();
          console.log('🪟 Glass-Attached motion control DISABLED');
        }
      } else if (typeof this.tesseractShader.toggleMotionControl === 'function') {
        // Fallback compatibility
        this.tesseractShader.toggleMotionControl();
      }
    }
    
    // Update UI
    if (this.indicator) {
      if (this.isActive) {
        this.indicator.classList.add('active');
        this.indicator.title = 'Glass-Attached mode active - tap to pause';
      } else {
        this.indicator.classList.remove('active');
        this.indicator.title = 'Glass-Attached mode paused - tap to resume';
      }
    }
    
    // Update control panel button
    if (window.enhancedControlPanel && typeof window.enhancedControlPanel.updateMotionControlButton === 'function') {
      setTimeout(() => window.enhancedControlPanel.updateMotionControlButton(), 100);
    }
    
    this.updateControlPanelButton();
  }
  
  /**
   * Helper method to update control panel button state
   */
  updateControlPanelButton() {
    setTimeout(() => {
      const motionButton = document.getElementById('motion-control-toggle');
      if (motionButton && window.controlPanelRenderer) {
        window.controlPanelRenderer.updateMotionControlButton(motionButton);
        console.log('🎛️ Forced motion control button update');
      }
    }, 500);
  }
  
  // FIXED: GLASS-ATTACHED ORIENTATION HANDLER (Position-based, not velocity-based)
  handleGlassAttachedOrientation(event) {
    const currentSection = window.currentSection || 0;
    if (currentSection !== 0 || !this.isActive || !this.isCalibrated) {
      return;
    }
    
    // Get raw orientation data
    this.orientationData.alpha = event.alpha || 0;  // Compass (Z-axis)
    this.orientationData.beta = event.beta || 0;    // Pitch (X-axis)
    this.orientationData.gamma = event.gamma || 0;   // Roll (Y-axis)
    
    // Calculate deltas from calibration point
    const deltaAlpha = this.normalizeAngle(this.orientationData.alpha - this.orientationData.calibration.alpha);
    const deltaBeta = this.orientationData.beta - this.orientationData.calibration.beta;
    const deltaGamma = this.orientationData.gamma - this.orientationData.calibration.gamma;
    
    // Apply deadzone filtering
    const processedAlpha = Math.abs(deltaAlpha) > this.config.deadzone ? deltaAlpha : 0;
    const processedBeta = Math.abs(deltaBeta) > this.config.deadzone ? deltaBeta : 0;
    const processedGamma = Math.abs(deltaGamma) > this.config.deadzone ? deltaGamma : 0;
    
    // FIXED: Calculate TARGET orientation (position-based, not velocity-based)
    this.targetOrientation = this.calculateGlassAttachedRotation(
      processedAlpha, processedBeta, processedGamma
    );
    
    // CHANGED: Smooth towards target orientation (position interpolation)
    this.currentOrientation.rx = this.lerp(
      this.currentOrientation.rx, 
      this.targetOrientation.rx, 
      this.config.smoothingFactor
    );
    this.currentOrientation.ry = this.lerp(
      this.currentOrientation.ry, 
      this.targetOrientation.ry, 
      this.config.smoothingFactor
    );
    this.currentOrientation.rz = this.lerp(
      this.currentOrientation.rz, 
      this.targetOrientation.rz, 
      this.config.smoothingFactor
    );
    
    this.applyGlassAttachedToShader();
  }
  
  // FIXED: Glass-Attached Rotation Calculation (Position-based)
  calculateGlassAttachedRotation(alpha, beta, gamma) {
    // CHANGED: Convert device orientation to TARGET rotation positions
    
    let rx = beta * this.config.sensitivity.pitch;   // Pitch: beta → RX
    let ry = gamma * this.config.sensitivity.roll;   // Roll: gamma → RY
    let rz = alpha * this.config.sensitivity.yaw;    // Yaw: alpha → RZ
    
    // FIXED: Apply axis inversions for natural glass-attached movement
    if (this.config.invertAxes.pitch) rx = -rx;   // FIXED: pitch inversion now false
    if (this.config.invertAxes.roll) ry = -ry;
    if (this.config.invertAxes.yaw) rz = -rz;
    
    // Clamp to maximum rotation range
    rx = this.clamp(rx, -this.config.maxRotation, this.config.maxRotation);
    ry = this.clamp(ry, -this.config.maxRotation, this.config.maxRotation);
    rz = this.clamp(rz, -this.config.maxRotation, this.config.maxRotation);
    
    return { rx, ry, rz };
  }
  
  // CHANGED: Apply glass-attached transformation (position-based, not velocity)
  applyGlassAttachedToShader() {
    if (!this.tesseractShader) return;
    
    // CHANGED: Pass CURRENT orientation as position, not velocity
    if (typeof this.tesseractShader.updateDeviceOrientationInput === 'function') {
      this.tesseractShader.updateDeviceOrientationInput({
        rx: this.currentOrientation.rx,  // Direct position control
        ry: this.currentOrientation.ry,  // Direct position control
        rz: this.currentOrientation.rz   // Direct position control
      });
    } else if (typeof this.tesseractShader.updateMotionInput === 'function') {
      // Fallback for compatibility
      console.warn('Using fallback motion control - enhanced shader not detected');
      this.tesseractShader.updateMotionInput({
        x: this.currentOrientation.rx,
        y: this.currentOrientation.ry,
        w: this.currentOrientation.rz
      });
    }
  }
  
  // Utility methods (unchanged)
  normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }
  
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  // State management methods (unchanged)
  disable() {
    this.isActive = false;
    
    if (this.tesseractShader && typeof this.tesseractShader.disableDeviceOrientation === 'function') {
      this.tesseractShader.disableDeviceOrientation();
    } else if (this.tesseractShader && typeof this.tesseractShader.disableMotionControl === 'function') {
      this.tesseractShader.disableMotionControl();
    }
    
    if (this.indicator) {
      this.indicator.classList.remove('active');
      this.indicator.style.opacity = '0.4';
    }
  }
  
  enable() {
    if (this.isSupported && this.isPermissionGranted) {
      const currentSection = window.currentSection || 0;
      if (currentSection === 0 && this.indicator) {
        this.indicator.style.opacity = '0.7';
      }
    }
  }
  
  destroy() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    window.removeEventListener('deviceorientation', this.handleGlassAttachedOrientation);
    
    if (this.indicator) {
      this.indicator.removeEventListener('click', this.toggleMotionControl);
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileMotionControl;
} else if (typeof window !== 'undefined') {
  window.MobileMotionControl = MobileMotionControl;
}

/**
 * 🪟 GLASS-ATTACHED IMPLEMENTATION COMPLETE - FIXED!
 * 
 * Key Changes:
 * 1. ✅ FIXED: Gravity as POSITION control (not velocity)
 *    - targetOrientation = gravity * sensitivity
 *    - currentOrientation smoothly moves towards target
 *    - No more continuous rolling!
 * 
 * 2. ✅ FIXED: X-axis inversion 
 *    - invertAxes.pitch = false (was true)
 *    - Natural pitch control restored
 * 
 * 3. ✅ ENHANCED: Glass-attached feel
 *    - Increased sensitivity for direct control
 *    - Reduced deadzone for responsiveness  
 *    - Increased smoothing for stable feel
 *    - Hypercube orientation matches phone orientation
 * 
 * Result: Hypercube feels physically attached to the glass!
 */
