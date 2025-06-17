/**
 * Mobile Motion Control System for Tesseract Tutorial
 * Handles device orientation input for hypercube rotation
 */
class MobileMotionControl {
  constructor(tesseractShader) {
    this.tesseractShader = tesseractShader;
    this.isActive = false;
    this.isSupported = false;
    this.isPermissionGranted = false;
    this.isCalibrated = false;
    
    this.motionData = {
      alpha: 0,
      beta: 0,
      gamma: 0,
      calibration: { alpha: 0, beta: 0, gamma: 0 }
    };
    
    this.config = {
      sensitivity: 0.008,
      deadzone: 1,
      maxRotation: 2,
      smoothingFactor: 0.15,
      directMapping: true,
      gravityBias: 0.1
    };
    
    this.smoothedRotation = { x: 0, y: 0, w: 0 };
    this.lastRotation = { x: 0, y: 0, w: 0 };
    
    this.indicator = document.getElementById('motionIndicator');
    this.permissionPrompt = document.getElementById('motionPermissionPrompt');
    
    this.init();
  }
  
  async init() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    
    console.log('🎯 Initializing mobile motion control');
    
    this.isSupported = 'DeviceOrientationEvent' in window;
    
    if (!this.isSupported) {
      console.log('❌ Device orientation not supported');
      return;
    }
    
    // Check for stored consent
    const storedConsent = localStorage.getItem('motionControlConsent');
    const hasStoredConsent = storedConsent === 'granted';
    
    if (this.indicator) {
      this.indicator.style.display = 'flex';
      this.indicator.addEventListener('click', this.toggleMotionControl.bind(this));
    }
    
    if (hasStoredConsent) {
      console.log('✅ Found stored motion consent - auto-enabling');
      this.isPermissionGranted = true;
      this.startMotionDetection();
      this.autoEnableMotionControl();
      return;
    }
    
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      console.log('📱 iOS device detected - showing permission prompt');
      this.showPermissionPrompt();
    } else {
      console.log('📱 Android/older iOS - auto-enabling with stored consent');
      this.isPermissionGranted = true;
      this.startMotionDetection();
      this.autoEnableMotionControl();
      localStorage.setItem('motionControlConsent', 'granted');
    }
  }
  
  autoEnableMotionControl() {
    this.isActive = true;
    if (this.tesseractShader && typeof this.tesseractShader.enableMotionControl === 'function') {
      this.tesseractShader.enableMotionControl();
    }
    
    // Auto-calibrate after brief delay
    setTimeout(() => {
      this.calibrateMotion();
    }, 1500);
    
    console.log('🎯 Motion control auto-enabled from stored consent');
  }
  
  showPermissionPrompt() {
    if (!this.permissionPrompt) return;
    
    // Only show prompt for new users
    const storedConsent = localStorage.getItem('motionControlConsent');
    if (storedConsent) return;
    
    // Show prompt after brief delay
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
        console.log('✅ Motion permission granted - storing consent');
        this.isPermissionGranted = true;
        
        localStorage.setItem('motionControlConsent', 'granted');
        
        this.startMotionDetection();
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
  
  startMotionDetection() {
    if (!this.isPermissionGranted) return;
    
    console.log('🎯 Starting motion detection');
    window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    
    if (this.indicator) {
      this.indicator.style.opacity = '0.7';
    }
  }
  
  calibrateMotion() {
    this.motionData.calibration = {
      alpha: this.motionData.alpha,
      beta: this.motionData.beta,
      gamma: this.motionData.gamma
    };
    
    this.isCalibrated = true;
    
    if (this.indicator) {
      this.indicator.classList.remove('calibrating');
      this.indicator.classList.add('active');
      this.indicator.title = 'Motion control active - tap to toggle';
      
      // Brief visual feedback
      this.indicator.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.indicator.style.transform = 'scale(1)';
      }, 400);
    }
    
    console.log('🎯 Motion control calibrated and ready');
  }
  
  toggleMotionControl() {
    // If no stored consent, show permission prompt
    const storedConsent = localStorage.getItem('motionControlConsent');
    if (!storedConsent || storedConsent === 'denied') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        this.showPermissionPrompt();
      }
      return;
    }
    
    // Toggle if we have permission
    if (!this.isSupported || !this.isPermissionGranted) return;
    
    this.isActive = !this.isActive;
    
    if (this.tesseractShader) {
      if (typeof this.tesseractShader.enableMotionControl === 'function') {
        if (this.isActive) {
          this.tesseractShader.enableMotionControl();
          console.log('🎯 Motion control manually ENABLED');
        } else {
          this.tesseractShader.disableMotionControl();
          console.log('🎯 Motion control manually DISABLED');
        }
      }
    }
    
    if (this.indicator) {
      if (this.isActive) {
        this.indicator.classList.add('active');
        this.indicator.title = 'Motion control active - tap to pause';
      } else {
        this.indicator.classList.remove('active');
        this.indicator.title = 'Motion control paused - tap to resume';
      }
    }
    
    // Update control panel button if it exists
    if (window.enhancedControlPanel && typeof window.enhancedControlPanel.updateMotionControlButton === 'function') {
      setTimeout(() => window.enhancedControlPanel.updateMotionControlButton(), 100);
    }
  }
  
  handleDeviceOrientation(event) {
    const currentSection = window.currentSection || 0;
    if (currentSection !== 0 || !this.isActive || !this.isCalibrated) {
      return;
    }
    
    this.motionData.alpha = event.alpha || 0;
    this.motionData.beta = event.beta || 0;
    this.motionData.gamma = event.gamma || 0;
    
    const deltaAlpha = this.normalizeAngle(this.motionData.alpha - this.motionData.calibration.alpha);
    const deltaBeta = this.motionData.beta - this.motionData.calibration.beta;
    const deltaGamma = this.motionData.gamma - this.motionData.calibration.gamma;
    
    const processedAlpha = Math.abs(deltaAlpha) > this.config.deadzone ? deltaAlpha : 0;
    const processedBeta = Math.abs(deltaBeta) > this.config.deadzone ? deltaBeta : 0;
    const processedGamma = Math.abs(deltaGamma) > this.config.deadzone ? deltaGamma : 0;
    
    if (this.config.directMapping) {
      const targetRotation = {
        x: -processedBeta * this.config.sensitivity * 2,
        y: processedGamma * this.config.sensitivity * 2,
        w: -processedAlpha * this.config.sensitivity * 1.5
      };
      
      targetRotation.x = this.clamp(targetRotation.x, -this.config.maxRotation, this.config.maxRotation);
      targetRotation.y = this.clamp(targetRotation.y, -this.config.maxRotation, this.config.maxRotation);
      targetRotation.w = this.clamp(targetRotation.w, -this.config.maxRotation, this.config.maxRotation);
      
      this.smoothedRotation.x = this.lerp(this.smoothedRotation.x, targetRotation.x, 1 - this.config.smoothingFactor);
      this.smoothedRotation.y = this.lerp(this.smoothedRotation.y, targetRotation.y, 1 - this.config.smoothingFactor);
      this.smoothedRotation.w = this.lerp(this.smoothedRotation.w, targetRotation.w, 1 - this.config.smoothingFactor);
      
    } else {
      const targetRotation = {
        x: processedBeta * this.config.sensitivity,
        y: processedGamma * this.config.sensitivity,
        w: processedAlpha * this.config.sensitivity
      };
      
      targetRotation.x = this.clamp(targetRotation.x, -this.config.maxRotation, this.config.maxRotation);
      targetRotation.y = this.clamp(targetRotation.y, -this.config.maxRotation, this.config.maxRotation);
      targetRotation.w = this.clamp(targetRotation.w, -this.config.maxRotation, this.config.maxRotation);
      
      this.smoothedRotation.x = this.lerp(this.smoothedRotation.x, targetRotation.x, 1 - this.config.smoothingFactor);
      this.smoothedRotation.y = this.lerp(this.smoothedRotation.y, targetRotation.y, 1 - this.config.smoothingFactor);
      this.smoothedRotation.w = this.lerp(this.smoothedRotation.w, targetRotation.w, 1 - this.config.smoothingFactor);
    }
    
    const gravityInfluence = Math.sin(deltaBeta * Math.PI / 180) * this.config.gravityBias;
    this.smoothedRotation.x += gravityInfluence * 0.005;
    
    this.applyMotionToShader();
  }
  
  applyMotionToShader() {
    if (!this.tesseractShader) return;
    
    if (typeof this.tesseractShader.updateMotionInput === 'function') {
      this.tesseractShader.updateMotionInput({
        x: this.smoothedRotation.x * 0.015,
        y: this.smoothedRotation.y * 0.015,
        w: this.smoothedRotation.w * 0.01
      });
    } else {
      console.warn('Using fallback motion control - enhanced shader not detected');
      
      if (this.tesseractShader.slowVelocity) {
        this.tesseractShader.slowVelocity.x = this.smoothedRotation.x * 0.3;
        this.tesseractShader.slowVelocity.y = this.smoothedRotation.y * 0.3;
      }
      
      if (this.tesseractShader.wheelVelocity !== undefined) {
        this.tesseractShader.wheelVelocity += this.smoothedRotation.w * 0.15;
      }
    }
  }
  
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
  
  disable() {
    this.isActive = false;
    
    if (this.tesseractShader && typeof this.tesseractShader.disableMotionControl === 'function') {
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
    
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    
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
