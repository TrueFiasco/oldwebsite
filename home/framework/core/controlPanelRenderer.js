/**
 * ControlPanelRenderer - FIXED V2 - No Flickering, No Desktop Backdrop
 * FIXED: Removed aggressive event protection, desktop backdrop, touch conflicts
 * Generates control panel HTML from configuration, handles all event management
 */
class ControlPanelRenderer {
  constructor(shader, config, options = {}) {
    this.shader = shader;
    this.config = config;
    this.containerId = options.containerId || 'controls-panel';
    this.settingsButtonId = options.settingsButtonId || 'settings-toggle';
    this.device = shader.device;
    
    // Panel state management - FIXED: Simplified state tracking
    this.panelOpen = false;
    this.settingsButton = null;
    this.controlsPanel = null;
    this.backdrop = null;
    this.clickCooldown = false;
    
    // Parameter smoothing system
    this.filterStrength = 0.1;
    this.parameterTargets = {};
    this.smoothingActive = false;
    
    console.log('🎨 ControlPanelRenderer V2 - FIXED flickering and backdrop issues');
  }

  // ==========================================
  // MAIN FRAMEWORK ENTRY POINTS
  // ==========================================

  /**
   * Render control panel and setup settings button management
   */
  renderWithSettingsButton() {
    this.render();
    this.setupSettingsButtonManagement();
    console.log('✅ Control panel V2 rendered - no flickering, proper mobile/desktop behavior');
  }

  /**
   * Generate complete control panel HTML and bind events
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`❌ Container ${this.containerId} not found`);
      return;
    }

    container.innerHTML = this.generateHTML();
    this.bindEvents();
    console.log('✅ Control panel content rendered and bound');
  }

  // ==========================================
  // FIXED SETTINGS BUTTON MANAGEMENT
  // ==========================================

  /**
   * FIXED: Setup settings button with proper desktop/mobile behavior
   */
  setupSettingsButtonManagement() {
    this.settingsButton = document.getElementById(this.settingsButtonId);
    this.controlsPanel = document.getElementById(this.containerId);
    
    if (!this.settingsButton || !this.controlsPanel) {
      console.error(`❌ Settings button or panel not found`);
      return;
    }
    
    // Clean up any existing listeners
    const newButton = this.settingsButton.cloneNode(true);
    this.settingsButton.parentNode.replaceChild(newButton, this.settingsButton);
    this.settingsButton = newButton;
    
    // FIXED: Force correct positioning immediately
    this.forceCorrectPositioning();
    
    // FIXED: Simplified click handler
    this.settingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (this.clickCooldown) return;
      
      this.clickCooldown = true;
      setTimeout(() => { this.clickCooldown = false; }, 200);
      
      console.log('⚙️ Settings clicked, panel open:', this.panelOpen);
      
      if (this.panelOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    });
    
    // Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panelOpen) {
        this.closePanel();
      }
    });
    
    console.log('🎛️ FIXED settings button management - no flickering');
  }

  /**
   * FIXED: Force correct positioning for both mobile and desktop
   */
  forceCorrectPositioning() {
    if (!this.settingsButton) return;
    
    // FIXED: Universal positioning - top-left for ALL devices
    this.settingsButton.style.position = 'fixed';
    this.settingsButton.style.top = this.device.isMobile ? '1rem' : '2rem';
    this.settingsButton.style.left = this.device.isMobile ? '1rem' : '2rem';
    this.settingsButton.style.right = 'auto';
    this.settingsButton.style.zIndex = '99999';
    this.settingsButton.style.pointerEvents = 'auto';
    this.settingsButton.style.transform = 'none';
    
    if (this.device.isMobile) {
      this.settingsButton.style.width = '56px';
      this.settingsButton.style.height = '56px';
    }
    
    console.log(`🔧 Forced positioning: ${this.device.isMobile ? 'mobile' : 'desktop'} top-left`);
  }

  /**
   * FIXED: Open panel with proper desktop/mobile behavior
   */
  openPanel() {
    console.log('✅ Opening panel V2');
    
    // Show panel
    this.controlsPanel.style.display = 'block';
    this.controlsPanel.style.opacity = '1';
    this.controlsPanel.style.visibility = 'visible';
    this.controlsPanel.style.pointerEvents = 'auto';
    this.controlsPanel.style.zIndex = '2000';
    this.controlsPanel.style.position = 'fixed';
    
    // Position panel correctly
    if (this.device.isMobile) {
      this.controlsPanel.style.top = '80px';
      this.controlsPanel.style.left = '1rem';
      this.controlsPanel.style.right = '1rem';
    } else {
      this.controlsPanel.style.top = '2rem';
      this.controlsPanel.style.left = '2rem';
      this.controlsPanel.style.right = 'auto';
    }
    
    // Keep button positioned correctly
    this.forceCorrectPositioning();
    
    this.panelOpen = true;
    
    // FIXED: Only add backdrop on MOBILE, never on desktop
    if (this.device.isMobile) {
      this.addMobileBackdrop();
    }
    
    // FIXED: Minimal event protection - only prevent bubbling to document
    this.setupMinimalEventProtection();
    
    console.log('✅ Panel opened - backdrop only on mobile');
  }

  /**
   * FIXED: Close panel cleanly
   */
  closePanel() {
    console.log('✅ Closing panel V2');
    
    this.controlsPanel.style.display = 'none';
    this.controlsPanel.style.opacity = '0';
    this.controlsPanel.style.visibility = 'hidden';
    this.controlsPanel.style.pointerEvents = 'none';
    
    this.panelOpen = false;
    this.removeBackdrop();
    this.forceCorrectPositioning();
    
    console.log('✅ Panel closed cleanly');
  }

  /**
   * FIXED: Minimal event protection - no aggressive blocking
   */
  setupMinimalEventProtection() {
    // FIXED: Only prevent clicks from bubbling to document level
    // Don't block normal interactions within the panel
    this.controlsPanel.addEventListener('click', (e) => {
      e.stopPropagation(); // Only stop bubbling to document
      // Don't stop immediate propagation - allow normal interactions
    });
    
    console.log('🛡️ Minimal event protection setup - allows normal interactions');
  }

  /**
   * SIMPLE: Mobile backdrop - visual only, no click detection
   */
  addMobileBackdrop() {
    if (!this.device.isMobile) return;
    
    this.removeBackdrop();
    
    this.backdrop = document.createElement('div');
    this.backdrop.id = 'mobile-backdrop';
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1999;
      pointer-events: none;
    `;
    
    // NO EVENT LISTENERS - backdrop is purely visual
    // Panel can only be closed by tapping settings button
    
    document.body.appendChild(this.backdrop);
    this.forceCorrectPositioning();
    
    console.log('📱 Mobile backdrop - visual only, no click detection');
  }
        
  removeBackdrop() {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    
    // Remove any leftover controls blocker
    const controlsBlocker = document.getElementById('controls-blocker');
    if (controlsBlocker) {
      controlsBlocker.remove();
    }
  }

  /**
   * Check if panel is currently open
   */
  isPanelOpen() {
    return this.panelOpen;
  }

  // ==========================================
  // HTML GENERATION SYSTEM (unchanged)
  // ==========================================

  generateHTML() {
    return `
      ${this.generateTitle()}
      ${this.generateParameters()}
      ${this.generateFilterControl()}
      ${this.generateMotionControl()}
      ${this.generateButtons()}
      ${this.generateInfoSection()}
    `;
  }

  generateTitle() {
    const title = this.config.title || 'Control Panel';
    return `<h4>${title}</h4>`;
  }

  generateParameters() {
    if (!this.config.parameters) return '';
    
    return this.config.parameters.map(param => {
      switch (param.type) {
        case 'number':
          return this.generateNumberControl(param);
        case 'range':
          return this.generateRangeControl(param);
        case 'boolean':
          return this.generateBooleanControl(param);
        case 'select':
          return this.generateSelectControl(param);
        default:
          console.warn(`Unknown parameter type: ${param.type}`);
          return '';
      }
    }).join('');
  }

  generateNumberControl(param) {
    const { id, label, min, max, step, default: defaultValue } = param;
    
    return `
      <div class="control-group">
        <label for="${id}-control">${label}:</label>
        <input type="number" 
               id="${id}-control" 
               value="${defaultValue}" 
               ${min !== undefined ? `min="${min}"` : ''}
               ${max !== undefined ? `max="${max}"` : ''}
               ${step !== undefined ? `step="${step}"` : ''}
               data-param-id="${id}">
      </div>
    `;
  }

  generateRangeControl(param) {
    const { id, label, min, max, step, default: defaultValue } = param;
    
    return `
      <div class="control-group">
        <label for="${id}-control">${label}:</label>
        <input type="range" 
               id="${id}-control" 
               value="${defaultValue}" 
               min="${min || 0}" 
               max="${max || 100}" 
               ${step !== undefined ? `step="${step}"` : ''}
               data-param-id="${id}"
               style="width: 80px;">
      </div>
    `;
  }

  generateBooleanControl(param) {
    const { id, label, default: defaultValue } = param;
    
    return `
      <div class="control-group">
        <label for="${id}-control">${label}:</label>
        <button class="control-button" 
                id="${id}-control" 
                data-param-id="${id}"
                data-value="${defaultValue}"
                style="width: 80px; padding: 0.2rem 0.5rem; font-size: 0.75rem;">
          ${defaultValue ? 'ON' : 'OFF'}
        </button>
      </div>
    `;
  }

  generateSelectControl(param) {
    const { id, label, options, default: defaultValue } = param;
    
    const optionsHTML = options.map(option => {
      const value = typeof option === 'object' ? option.value : option;
      const text = typeof option === 'object' ? option.label : option;
      const selected = value === defaultValue ? 'selected' : '';
      return `<option value="${value}" ${selected}>${text}</option>`;
    }).join('');
    
    return `
      <div class="control-group">
        <label for="${id}-control">${label}:</label>
        <select id="${id}-control" data-param-id="${id}" style="width: 80px;">
          ${optionsHTML}
        </select>
      </div>
    `;
  }

  generateFilterControl() {
    return `
      <div class="control-group">
        <label for="filter-strength">Filter:</label>
        <input type="range" 
               id="filter-strength" 
               value="0.1" 
               min="0.01" 
               max="1" 
               step="0.01" 
               style="width: 80px;" 
               title="Parameter change smoothing">
      </div>
    `;
  }

  generateMotionControl() {
    if (!this.device.isMobile || !this.config.mobile?.showMotionControl) {
      return '';
    }
    
    return `
      <div class="control-group mobile-only" id="motion-control-group">
        <label for="motion-control-toggle">Motion Control:</label>
        <button class="control-button" 
                id="motion-control-toggle" 
                style="width: 80px; padding: 0.2rem 0.5rem; font-size: 0.75rem;">
          Enable
        </button>
      </div>
    `;
  }

  generateButtons() {
    if (!this.config.buttons) return '';
    
    const buttons = this.config.buttons;
    const desktopButtons = buttons.filter(btn => !btn.mobileOnly);
    const mobileButtons = buttons.filter(btn => btn.mobileOnly);
    
    let html = '<div class="button-group">';
    
    // Wide buttons (like reset)
    const wideButtons = desktopButtons.filter(btn => btn.wide);
    wideButtons.forEach(btn => {
      html += `
        <button class="control-button wide" 
                id="${btn.id}" 
                data-action="${btn.action}">
          ${btn.label}
        </button>
      `;
    });
    
    // Desktop button rows
    const normalButtons = desktopButtons.filter(btn => !btn.wide);
    if (normalButtons.length > 0) {
      html += '<div class="desktop-only">';
      html += this.generateButtonRow(normalButtons);
      html += '</div>';
    }
    
    // Mobile button rows
    if (mobileButtons.length > 0) {
      html += '<div class="mobile-only">';
      const mobileRows = this.groupButtonsIntoRows(mobileButtons, 3);
      mobileRows.forEach(row => {
        html += this.generateButtonRow(row);
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  generateButtonRow(buttons) {
    const buttonHTML = buttons.map(btn => `
      <button class="control-button" 
              id="${btn.id}" 
              data-action="${btn.action}">
        ${btn.label}
      </button>
    `).join('');
    
    return `<div class="button-row">${buttonHTML}</div>`;
  }

  groupButtonsIntoRows(buttons, buttonsPerRow) {
    const rows = [];
    for (let i = 0; i < buttons.length; i += buttonsPerRow) {
      rows.push(buttons.slice(i, i + buttonsPerRow));
    }
    return rows;
  }

  generateInfoSection() {
    if (!this.config.info) return '';
    
    let html = `
      <div class="info-section">
        <h4>${this.config.info.title || 'Controls'}</h4>
    `;
    
    if (this.config.info.desktop) {
      this.config.info.desktop.forEach(text => {
        html += `<p class="desktop-only">${text}</p>`;
      });
    }
    
    if (this.config.info.mobile) {
      this.config.info.mobile.forEach(text => {
        html += `<p class="mobile-only">${text}</p>`;
      });
    }
    
    html += '</div>';
    return html;
  }

  // ==========================================
  // FIXED EVENT BINDING SYSTEM
  // ==========================================

  /**
   * FIXED: Bind events with proper mobile/desktop handling
   */
  bindEvents() {
    this.bindParameterEvents();
    this.bindFilterEvents();
    this.bindMotionEvents();
    this.bindButtonEvents();
    
    console.log('🔗 All events bound with mobile/desktop fixes');
  }

  /**
   * FIXED: Parameter event binding with mobile touch support
   */
  bindParameterEvents() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    container.querySelectorAll('[data-param-id]').forEach(input => {
      const paramId = input.dataset.paramId;
      
      if (input.type === 'range' || input.type === 'number') {
        // FIXED: Prevent event bubbling but allow normal input handling
        input.addEventListener('input', (e) => {
          e.stopPropagation(); // Prevent closing panel
          const value = parseFloat(e.target.value);
          console.log(`🎛️ Parameter ${paramId} changed to ${value}`);
          
          const success = this.shader.setParameter(paramId, value);
          if (success) {
            console.log(`✅ Parameter update successful for ${paramId}`);
          } else {
            this.smoothParameterChange(paramId, value);
          }
        });
        
        // FIXED: Also handle change event
        input.addEventListener('change', (e) => {
          e.stopPropagation();
          const value = parseFloat(e.target.value);
          this.shader.setParameter(paramId, value);
        });
        
        // MOBILE: Add touch event handling
        if (this.device.isMobile) {
          input.addEventListener('touchstart', (e) => {
            e.stopPropagation();
          });
          
          input.addEventListener('touchend', (e) => {
            e.stopPropagation();
          });
        }
        
      } else if (input.tagName === 'SELECT') {
        input.addEventListener('change', (e) => {
          e.stopPropagation();
          console.log(`🎛️ Select parameter ${paramId} changed to ${e.target.value}`);
          this.shader.setParameter(paramId, e.target.value);
        });
        
      } else if (input.tagName === 'BUTTON') {
        // Boolean toggle button
        input.addEventListener('click', (e) => {
          e.stopPropagation(); // CRITICAL: Prevent closing panel
          
          const currentValue = e.target.dataset.value === 'true';
          const newValue = !currentValue;
          
          console.log(`🎛️ Boolean parameter ${paramId} toggled to ${newValue}`);
          
          e.target.dataset.value = newValue;
          e.target.textContent = newValue ? 'ON' : 'OFF';
          
          this.shader.setParameter(paramId, newValue);
        });
      }
    });
    
    console.log('🔗 Parameter events bound with mobile touch support');
  }

  bindFilterEvents() {
    const filterControl = document.getElementById('filter-strength');
    if (filterControl) {
      filterControl.addEventListener('input', (e) => {
        e.stopPropagation();
        this.filterStrength = parseFloat(e.target.value);
        console.log('🎛️ Filter strength:', this.filterStrength);
      });
    }
  }

  bindMotionEvents() {
    const motionToggle = document.getElementById('motion-control-toggle');
    if (motionToggle && this.device.isMobile) {
      motionToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleMotionControlToggle(motionToggle);
      });
      
      this.updateMotionControlButton(motionToggle);
    }
  }

  handleMotionControlToggle(button) {
    const hasConsent = this.shader.canUseMotion();
    const isActive = this.shader.isMotionControlActive && this.shader.isMotionControlActive();
    
    if (!hasConsent) {
      this.requestMotionPermission(button);
    } else if (isActive) {
      this.shader.disableMotionControl();
      this.updateMotionControlButton(button);
      console.log('📱 Motion control disabled via control panel');
    } else {
      this.shader.enableMotionControl();
      this.updateMotionControlButton(button);
      console.log('📱 Motion control enabled via control panel');
    }
  }

  requestMotionPermission(button) {
    if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          const granted = response === 'granted';
          GenericShader.setMotionConsent(granted);
          
          if (granted) {
            this.shader.enableMotionControl();
            console.log('📱 Motion permission granted');
          } else {
            console.log('📱 Motion permission denied');
          }
          
          this.updateMotionControlButton(button);
        })
        .catch(error => {
          console.error('Motion permission request failed:', error);
          GenericShader.setMotionConsent(false);
          this.updateMotionControlButton(button);
        });
    } else {
      GenericShader.setMotionConsent(true);
      this.shader.enableMotionControl();
      this.updateMotionControlButton(button);
      console.log('📱 Motion permission auto-granted');
    }
  }

  updateMotionControlButton(button) {
    const hasConsent = this.shader.canUseMotion();
    const isActive = this.shader.isMotionControlActive && this.shader.isMotionControlActive();
    
    if (!hasConsent) {
      button.textContent = 'Enable';
      button.classList.remove('disabled');
      button.style.background = '';
      button.style.borderColor = '';
    } else if (isActive) {
      button.textContent = 'Disable';
      button.classList.remove('disabled');
      button.style.background = 'rgba(0, 255, 127, 0.3)';
      button.style.borderColor = 'rgba(0, 255, 127, 0.6)';
    } else {
      button.textContent = 'Enable';
      button.classList.add('disabled');
      button.style.background = 'rgba(255, 100, 100, 0.3)';
      button.style.borderColor = 'rgba(255, 100, 100, 0.5)';
    }
  }

  /**
   * FIXED: Button event binding with proper action handling
   */
  bindButtonEvents() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    container.querySelectorAll('[data-action]').forEach(button => {
      const action = button.dataset.action;
      
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing panel
        this.handleButtonAction(action, button);
      });
    });
  }

  // ==========================================
  // BUTTON ACTION SYSTEM (unchanged from previous fix)
  // ==========================================

  handleButtonAction(action, button) {
    console.log(`🎛️ FIXED Button action: ${action}`);
    
    const actionMap = window.TesseractActionMap || {};
    
    switch (action) {
      case 'resetAll':
        if (typeof this.shader.resetAll === 'function') {
          this.shader.resetAll();
          this.showButtonFeedback(button, 'Reset ✓');
        }
        break;
        
      case 'resetRotation':
        if (typeof this.shader.resetRotation === 'function') {
          this.shader.resetRotation();
          this.showButtonFeedback(button, 'Reset ✓');
        }
        break;
        
      case 'toggleVelocity_rx':
      case 'toggleVelocity_ry':
      case 'toggleVelocity_rw':
        if (typeof this.shader.toggleVelocity === 'function') {
          const axis = actionMap[action];
          console.log(`🎛️ FIXED: Toggling velocity for axis: ${axis}`);
          
          if (axis) {
            const enabled = this.shader.toggleVelocity(axis);
            
            if (enabled) {
              button.textContent = button.textContent.replace('Enable', 'Stop');
              button.classList.remove('disabled');
              button.style.background = '';
              button.style.borderColor = '';
            } else {
              button.textContent = button.textContent.replace('Stop', 'Enable');
              button.classList.add('disabled');
              button.style.background = 'rgba(255, 100, 100, 0.3)';
              button.style.borderColor = 'rgba(255, 100, 100, 0.5)';
            }
            
            console.log(`✅ FIXED: ${axis.toUpperCase()} velocity ${enabled ? 'enabled' : 'disabled'}`);
          }
        }
        break;
        
      case 'toggleMotionControl':
        if (typeof this.shader.toggleMotionControl === 'function') {
          const enabled = this.shader.toggleMotionControl();
          this.updateButtonToggleState(button, enabled, 'Motion');
        }
        break;
        
      case 'toggleTouchControl':
        if (typeof this.shader.toggleTouchControl === 'function') {
          const enabled = this.shader.toggleTouchControl();
          this.updateButtonToggleState(button, enabled, 'Touch');
        }
        break;
        
      case 'toggleXAxisInvert':
        if (typeof this.shader.toggleXAxisInvert === 'function') {
          const enabled = this.shader.toggleXAxisInvert();
          this.updateButtonToggleState(button, enabled, 'X-Axis', 'Fix X-Axis', 'Unfix X-Axis');
        }
        break;
        
      default:
        const methodName = actionMap[action] || action;
        if (typeof this.shader[methodName] === 'function') {
          const result = this.shader[methodName]();
          
          if (typeof result === 'boolean') {
            this.updateButtonToggleState(button, result);
          }
        } else {
          console.warn(`⚠️ Unknown action: ${action} (mapped to: ${methodName})`);
        }
        break;
    }
  }

  updateButtonToggleState(button, enabled, actionType = '', enabledText = '', disabledText = '') {
    if (enabled) {
      button.textContent = disabledText || button.textContent.replace('Enable', 'Stop').replace('Start', 'Stop');
      button.classList.remove('disabled');
      button.style.background = '';
      button.style.borderColor = '';
    } else {
      button.textContent = enabledText || button.textContent.replace('Stop', 'Enable').replace('Disable', 'Enable');
      button.classList.add('disabled');
      button.style.background = 'rgba(255, 100, 100, 0.3)';
      button.style.borderColor = 'rgba(255, 100, 100, 0.5)';
    }
    
    if (actionType) {
      console.log(`🎛️ ${actionType} is now: ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  showButtonFeedback(button, text) {
    const originalText = button.textContent;
    const originalBg = button.style.background;
    
    button.textContent = text;
    button.style.background = 'rgba(0, 255, 0, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = originalBg;
    }, 1000);
  }

  // ==========================================
  // PARAMETER SMOOTHING SYSTEM (unchanged)
  // ==========================================

  smoothParameterChange(paramId, targetValue) {
    this.parameterTargets[paramId] = targetValue;
    
    if (!this.smoothingActive) {
      this.smoothingActive = true;
      this.smoothParameterLoop();
    }
  }

  smoothParameterLoop() {
    if (!this.parameterTargets || Object.keys(this.parameterTargets).length === 0) {
      this.smoothingActive = false;
      return;
    }
    
    let hasActiveChanges = false;
    
    Object.keys(this.parameterTargets).forEach(paramId => {
      const target = this.parameterTargets[paramId];
      const current = this.shader.getParameter(paramId) || 0;
      const diff = target - current;
      
      if (Math.abs(diff) > 0.01) {
        const newValue = current + (diff * this.filterStrength);
        this.shader.setParameter(paramId, newValue);
        hasActiveChanges = true;
      } else {
        this.shader.setParameter(paramId, target);
        delete this.parameterTargets[paramId];
      }
    });
    
    if (hasActiveChanges) {
      requestAnimationFrame(() => this.smoothParameterLoop());
    } else {
      this.smoothingActive = false;
    }
  }

  updateFromShader() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const params = this.shader.getShaderParams();
    
    container.querySelectorAll('[data-param-id]').forEach(input => {
      const paramId = input.dataset.paramId;
      const value = params[paramId];
      
      if (value !== undefined) {
        if (input.type === 'range' || input.type === 'number') {
          input.value = value;
        } else if (input.tagName === 'SELECT') {
          input.value = value;
        } else if (input.tagName === 'BUTTON' && input.dataset.value !== undefined) {
          input.dataset.value = value;
          input.textContent = value ? 'ON' : 'OFF';
        }
      }
    });
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  destroy() {
    if (this.panelOpen) {
      this.closePanel();
    }
    
    this.removeBackdrop();
    this.smoothingActive = false;
    this.parameterTargets = {};
    
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
    
    this.panelOpen = false;
    this.settingsButton = null;
    this.controlsPanel = null;
    
    console.log('🧹 ControlPanelRenderer V2 destroyed');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ControlPanelRenderer;
} else if (typeof window !== 'undefined') {
  window.ControlPanelRenderer = ControlPanelRenderer;
}
