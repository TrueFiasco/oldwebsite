/**
 * Enhanced Control Panel for Tesseract Tutorial
 * Provides advanced parameter controls and mobile overrides
 */
class EnhancedControlPanel {
  constructor(tesseractShader) {
    this.shader = tesseractShader;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Filter state for parameter smoothing
    this.filterState = {
      fov: { current: 7.0, target: 7.0, strength: 0.1 },
      perspective: { current: 2.3, target: 2.3, strength: 0.1 },
      cameraZ: { current: 10.0, target: 10.0, strength: 0.1 }
    };
    
    // Enhanced rotation state
    this.rotationEnabled = {
      rx: true, ry: true, rw: true,
      motion: true, touch: true, invertX: false
    };
    
    this.init();
  }
  
  init() {
    this.setupToggle();
    this.setupParameterControls();
    this.setupRotationControls();
    this.setupMobileControls();
    this.startFilterLoop();
    
    // Initialize motion control button state after brief delay
    if (this.isMobile) {
      setTimeout(() => this.updateMotionControlButton(), 500);
    }
  }
  
  setupToggle() {
    document.getElementById('settings-toggle').addEventListener('click', () => {
      const panel = document.getElementById('controls-panel');
      if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  }
  
  setupParameterControls() {
    // FOV Control with filtering
    document.getElementById('fov-control').addEventListener('input', (e) => {
      this.filterState.fov.target = parseFloat(e.target.value);
    });
    
    // Perspective Control with filtering
    document.getElementById('perspective-control').addEventListener('input', (e) => {
      this.filterState.perspective.target = parseFloat(e.target.value);
    });
    
    // Camera Z Control with filtering
    document.getElementById('cameraz-control').addEventListener('input', (e) => {
      this.filterState.cameraZ.target = parseFloat(e.target.value);
    });
    
    // Filter Strength Control
    document.getElementById('filter-strength').addEventListener('input', (e) => {
      const strength = parseFloat(e.target.value);
      Object.keys(this.filterState).forEach(param => {
        this.filterState[param].strength = strength;
      });
    });
    
    // Motion Control Override Toggle
    this.setupMotionControlOverride();
  }
  
  setupMotionControlOverride() {
    const motionToggle = document.getElementById('motion-control-toggle');
    const motionGroup = document.getElementById('motion-control-group');
    
    if (!motionToggle || !this.isMobile) return;
    
    // Check if motion control is available
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
    if (!hasDeviceOrientation) {
      motionGroup.style.display = 'none';
      return;
    }
    
    // Update button state based on current motion control status
    this.updateMotionControlButton();
    
    motionToggle.addEventListener('click', () => {
      const storedConsent = localStorage.getItem('motionControlConsent');
      
      if (storedConsent === 'granted') {
        // Toggle motion control on/off
        if (window.mobileMotionControl) {
          window.mobileMotionControl.toggleMotionControl();
          setTimeout(() => this.updateMotionControlButton(), 100);
        }
      } else {
        // Re-request permission
        this.requestMotionPermission();
      }
    });
  }
  
  updateMotionControlButton() {
    const motionToggle = document.getElementById('motion-control-toggle');
    if (!motionToggle) return;
    
    const storedConsent = localStorage.getItem('motionControlConsent');
    const isActive = window.mobileMotionControl?.isActive;
    
    if (storedConsent === 'granted') {
      if (isActive) {
        motionToggle.textContent = 'Active';
        motionToggle.style.background = 'rgba(0, 255, 0, 0.3)';
        motionToggle.style.borderColor = 'rgba(0, 255, 0, 0.5)';
        motionToggle.title = 'Motion control is active - click to pause';
      } else {
        motionToggle.textContent = 'Paused';
        motionToggle.style.background = 'rgba(255, 165, 0, 0.3)';
        motionToggle.style.borderColor = 'rgba(255, 165, 0, 0.5)';
        motionToggle.title = 'Motion control is paused - click to resume';
      }
    } else {
      motionToggle.textContent = 'Enable';
      motionToggle.style.background = '';
      motionToggle.style.borderColor = '';
      motionToggle.title = 'Click to enable device motion control';
    }
  }
  
  async requestMotionPermission() {
    console.log('🔄 User clicked Motion Control override - re-requesting permission');
    
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        
        if (response === 'granted') {
          console.log('✅ Motion permission granted via settings panel');
          localStorage.setItem('motionControlConsent', 'granted');
          
          if (window.mobileMotionControl) {
            window.mobileMotionControl.isPermissionGranted = true;
            window.mobileMotionControl.startMotionDetection();
            window.mobileMotionControl.autoEnableMotionControl();
          }
          
          this.updateMotionControlButton();
        } else {
          console.log('❌ Motion permission denied again via settings panel');
          localStorage.setItem('motionControlConsent', 'denied');
          this.updateMotionControlButton();
        }
      } catch (error) {
        console.error('Motion permission request failed:', error);
      }
    } else {
      // Android or older iOS
      localStorage.setItem('motionControlConsent', 'granted');
      
      if (window.mobileMotionControl) {
        window.mobileMotionControl.isPermissionGranted = true;
        window.mobileMotionControl.startMotionDetection();
        window.mobileMotionControl.autoEnableMotionControl();
      }
      
      this.updateMotionControlButton();
    }
  }
  
  setupRotationControls() {
    // Reset Rotation
    document.getElementById('reset-rotation').addEventListener('click', () => {
      if (this.shader && typeof this.shader.resetRotation === 'function') {
        this.shader.resetRotation();
        console.log('🔄 Rotation reset to center position');
        
        // Visual feedback
        const button = document.getElementById('reset-rotation');
        const originalText = button.textContent;
        button.textContent = 'Reset ✓';
        button.style.background = 'rgba(0, 255, 0, 0.3)';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
        }, 1000);
      }
    });
    
    // Desktop Controls
    ['rx', 'ry', 'rw'].forEach(axis => {
      const button = document.getElementById(`stop-${axis}`);
      if (button) {
        button.addEventListener('click', () => {
          if (this.shader && typeof this.shader.toggleVelocity === 'function') {
            const enabled = this.shader.toggleVelocity(axis);
            this.updateButtonState(button, enabled, axis.toUpperCase());
            
            const axisNames = { rx: 'X-axis', ry: 'Y-axis', rw: '4D-axis' };
            console.log(`🎮 ${axisNames[axis]} rotation ${enabled ? 'ENABLED' : 'STOPPED'}`);
          }
        });
      }
    });
  }
  
  setupMobileControls() {
    if (!this.isMobile) return;
    
    // Mobile RX, RY, RW controls
    ['rx-mobile', 'ry-mobile', 'rw-mobile'].forEach(axisId => {
      const button = document.getElementById(`stop-${axisId}`);
      if (button) {
        button.addEventListener('click', () => {
          const axis = axisId.replace('-mobile', '');
          if (this.shader && typeof this.shader.toggleVelocity === 'function') {
            const enabled = this.shader.toggleVelocity(axis);
            this.updateButtonState(button, enabled, axis.toUpperCase());
            
            const axisNames = { rx: 'X-axis', ry: 'Y-axis', rw: '4D-axis' };
            console.log(`📱 ${axisNames[axis]} rotation ${enabled ? 'ENABLED' : 'STOPPED'}`);
          }
        });
      }
    });
    
    // Motion Control Toggle
    const motionButton = document.getElementById('stop-motion');
    if (motionButton) {
      motionButton.addEventListener('click', () => {
        this.rotationEnabled.motion = !this.rotationEnabled.motion;
        
        if (this.shader) {
          if (this.rotationEnabled.motion) {
            if (typeof this.shader.enableMotionControl === 'function') {
              this.shader.enableMotionControl();
              console.log('📱 Device motion control ENABLED');
            }
          } else {
            if (typeof this.shader.disableMotionControl === 'function') {
              this.shader.disableMotionControl();
              console.log('📱 Device motion control STOPPED');
            }
          }
        }
        
        this.updateButtonState(motionButton, this.rotationEnabled.motion, 'Motion');
      });
    }
    
    // Touch Control Toggle
    const touchButton = document.getElementById('stop-touch');
    if (touchButton) {
      touchButton.addEventListener('click', () => {
        this.rotationEnabled.touch = !this.rotationEnabled.touch;
        this.updateButtonState(touchButton, this.rotationEnabled.touch, 'Touch');
        
        console.log(`📱 Touch control ${this.rotationEnabled.touch ? 'ENABLED' : 'STOPPED'}`);
      });
    }
    
    // X-Axis Inversion Fix
    const invertButton = document.getElementById('invert-x');
    if (invertButton) {
      invertButton.addEventListener('click', () => {
        this.rotationEnabled.invertX = !this.rotationEnabled.invertX;
        
        if (this.rotationEnabled.invertX) {
          invertButton.textContent = 'X-Axis Fixed ✓';
          invertButton.classList.add('disabled');
          console.log('📱 X-axis rotation INVERTED');
        } else {
          invertButton.textContent = 'Fix X-Axis';
          invertButton.classList.remove('disabled');
          console.log('📱 X-axis rotation NORMAL');
        }
      });
    }
  }
  
  updateButtonState(button, enabled, axisName) {
    if (enabled) {
      button.textContent = `Stop ${axisName}`;
      button.classList.remove('disabled');
    } else {
      button.textContent = `Enable ${axisName}`;
      button.classList.add('disabled');
    }
  }
  
  startFilterLoop() {
    const updateFilters = () => {
      let paramsChanged = false;
      
      Object.keys(this.filterState).forEach(param => {
        const state = this.filterState[param];
        const diff = state.target - state.current;
        
        if (Math.abs(diff) > 0.01) {
          state.current += diff * state.strength;
          paramsChanged = true;
        }
      });
      
      if (paramsChanged && this.shader && typeof this.shader.setShaderParams === 'function') {
        this.shader.setShaderParams({
          fov: this.filterState.fov.current,
          perspective: this.filterState.perspective.current,
          cameraZ: this.filterState.cameraZ.current
        });
      }
      
      requestAnimationFrame(updateFilters);
    };
    
    updateFilters();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedControlPanel;
} else if (typeof window !== 'undefined') {
  window.EnhancedControlPanel = EnhancedControlPanel;
}
