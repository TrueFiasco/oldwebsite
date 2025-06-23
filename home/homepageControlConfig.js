/**
 * Homepage Control Configuration - Simplified Framework Config
 * Focuses on essential controls for homepage experience
 */

const HomepageControlConfig = {
  title: "4D Projection Controls",
  
  parameters: [
    {
      id: 'fov',
      label: 'FOV',
      type: 'number',
      default: 7,
      min: 2,
      max: 120,
      step: 1,
      uniformName: 'u_fov'
    },
    {
      id: 'perspective',
      label: '4D Scale',
      type: 'number',
      default: 2.3,
      min: 0.1,
      max: 10,
      step: 0.1,
      uniformName: 'u_perspective'
    },
    {
      id: 'cameraZ',
      label: 'Camera Z',
      type: 'number',
      default: 10,
      min: -100,
      max: 50,
      step: 1,
      uniformName: 'u_cameraZ'
    }
  ],
  
  buttons: [
    // Universal reset
    {
      id: 'reset-rotation',
      label: 'Reset Rotation',
      action: 'resetRotation',
      wide: true
    },
    
    // Desktop controls (simplified)
    {
      id: 'stop-rx-desktop',
      label: 'Stop RX',
      action: 'toggleVelocity_rx',
      desktopOnly: true,
      tooltip: 'Hypercube X-axis rotation (mouse Y)'
    },
    {
      id: 'stop-ry-desktop',
      label: 'Stop RY',
      action: 'toggleVelocity_ry',
      desktopOnly: true,
      tooltip: 'Hypercube Y-axis rotation (mouse X)'
    },
    {
      id: 'stop-rwy-desktop',
      label: 'Stop RWY',
      action: 'toggleVelocity_rwy',
      desktopOnly: true,
      tooltip: '4D W-Y plane rotation (mouse wheel)'
    },
    
    // Mobile controls (enhanced experience)
    {
      id: 'toggle-magic-window',
      label: 'Magic Window',
      action: 'toggleMotionControl',
      mobileOnly: true,
      tooltip: 'Device orientation → camera perspective'
    },
    {
      id: 'toggle-touch',
      label: 'Touch 4D',
      action: 'toggleTouchControl',
      mobileOnly: true,
      tooltip: 'Touch gestures → 4D hypercube'
    },
    {
      id: 'stop-rwx-mobile',
      label: 'Stop RWX',
      action: 'toggleVelocity_rwx',
      mobileOnly: true,
      tooltip: '4D W-X plane rotation (horizontal touch)'
    }
  ],
  
  mobile: {
    showMotionControl: true,
    showMagicWindow: true,
    additionalControls: ['toggle-magic-window', 'toggle-touch']
  },
  
  info: {
    title: "4D Hypercube Controls",
    desktop: [
      "• Click anywhere to scroll to tutorials",
      "• Move mouse to rotate hypercube",
      "• Scroll wheel for 4D rotation",
      "• Enhanced desktop experience"
    ],
    mobile: [
      "• Tilt device for magic window view",
      "• Touch gestures for 4D rotation", 
      "• Experience immersive hypercube",
      "• Glass-attached perspective"
    ]
  }
};

/**
 * Action mapping for homepage controls
 */
const HomepageActionMap = {
  'resetRotation': 'resetRotation',
  'toggleVelocity_rx': 'rx',
  'toggleVelocity_ry': 'ry',
  'toggleVelocity_rwy': 'rwy',
  'toggleVelocity_rwx': 'rwx',
  'toggleMotionControl': 'toggleDeviceOrientationControl',
  'toggleTouchControl': 'toggleTouchGestureControl'
};

/**
 * Homepage defaults
 */
const HomepageDefaults = {
  fov: 7.0,
  perspective: 2.3,
  cameraZ: 10.0,
  
  // Rotation defaults
  rotation: {
    rx: 0, ry: 0, rwy: 0,
    cameraRx: 0, cameraRy: 0, cameraRz: 0,
    rwx: 0
  },
  
  // Velocity defaults
  velocityEnabled: {
    rx: true, ry: true, rwy: true,
    cameraRx: true, cameraRy: true, cameraRz: true,
    rwx: true
  },
  
  // Input sources
  inputSources: {
    deviceOrientationEnabled: false,
    touchGestureEnabled: true,
    xAxisInverted: false
  }
};

/**
 * Export for browser usage
 */
if (typeof window !== 'undefined') {
  window.HomepageControlConfig = HomepageControlConfig;
  window.HomepageActionMap = HomepageActionMap;
  window.HomepageDefaults = HomepageDefaults;
  
  console.log('✅ Homepage control configuration loaded');
}

/**
 * Export for Node.js usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HomepageControlConfig,
    HomepageActionMap,
    HomepageDefaults
  };
}

/**
 * Helper functions for homepage
 */
function registerHomepageParameters(shader) {
  HomepageControlConfig.parameters.forEach(param => {
    shader.registerParameter(param.id, param.uniformName, param.default);
  });
  
  console.log('✅ Homepage parameters registered');
}

function applyHomepageDefaults(shader) {
  // Apply parameter defaults
  Object.keys(HomepageDefaults).forEach(key => {
    if (key !== 'rotation' && key !== 'velocityEnabled' && key !== 'inputSources') {
      if (shader.setParameter) {
        shader.setParameter(key, HomepageDefaults[key]);
      }
    }
  });
  
  // Apply enhanced state if available
  if (shader.angles && HomepageDefaults.rotation) {
    Object.assign(shader.angles, HomepageDefaults.rotation);
  }
  
  if (shader.velocityEnabled && HomepageDefaults.velocityEnabled) {
    Object.assign(shader.velocityEnabled, HomepageDefaults.velocityEnabled);
  }
  
  console.log('✅ Homepage defaults applied');
}

// Make helper functions available globally
if (typeof window !== 'undefined') {
  window.registerHomepageParameters = registerHomepageParameters;
  window.applyHomepageDefaults = applyHomepageDefaults;
}
