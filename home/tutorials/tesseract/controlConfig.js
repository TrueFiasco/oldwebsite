/**
 * Compatible Tesseract Control Configuration - Desktop Safe + Mobile Enhanced  
 * PRESERVES: Desktop RX, RY, RWY system (mouse XY → RX,RY, wheel → RWY)
 * ADDS: Mobile magic window (device orientation) + separated touch (RWX, RWY)
 */

const TesseractControlConfig = {
  // Panel title
  title: "4D Projection Controls",
  
  // UNCHANGED: Parameter controls (work for both desktop and mobile)
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
  
  // COMPATIBLE: Button controls for both desktop and mobile
  buttons: [
    // Wide reset button (universal)
    {
      id: 'reset-rotation',
      label: 'Reset Rotation',
      action: 'resetRotation',
      wide: true
    },
    
    // DESKTOP-ONLY: Original system (unchanged)
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
    
    // MOBILE-ONLY: Enhanced controls
    // Row 1: Original hypercube controls (compatible with desktop)
    {
      id: 'stop-rx-mobile',
      label: 'Stop RX',
      action: 'toggleVelocity_rx',
      mobileOnly: true,
      tooltip: 'Hypercube X-axis rotation'
    },
    {
      id: 'stop-ry-mobile', 
      label: 'Stop RY',
      action: 'toggleVelocity_ry',
      mobileOnly: true,
      tooltip: 'Hypercube Y-axis rotation'
    },
    {
      id: 'stop-rwy-mobile',
      label: 'Stop RWY', 
      action: 'toggleVelocity_rwy',
      mobileOnly: true,
      tooltip: '4D W-Y plane rotation (vertical touch)'
    },
    
    // Row 2: 4D Hypercube Controls (like desktop)
    {
      id: 'stop-rwx-mobile',
      label: 'Stop RWX',
      action: 'toggleVelocity_rwx',
      mobileOnly: true,
      tooltip: '4D W-X plane rotation (horizontal touch)'
    },
    {
      id: 'stop-rz-mobile',
      label: 'Stop RZ',
      action: 'toggleVelocity_cameraRz', 
      mobileOnly: true,
      tooltip: 'Camera Z rotation (device yaw)'
    },
    {
      id: 'stop-camera-controls',
      label: 'Stop Camera',
      action: 'toggleAllCamera',
      mobileOnly: true,
      tooltip: 'Stop all camera motion'
    },
    
    // Row 3: Input source controls
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
      id: 'invert-x',
      label: 'Invert X',
      action: 'toggleXAxisInvert',
      mobileOnly: true,
      tooltip: 'Invert X-axis orientation'
    }
  ],
  
  // Mobile-specific settings
  mobile: {
    showMotionControl: true,
    showMagicWindow: true,
    additionalControls: ['toggle-magic-window', 'toggle-touch', 'invert-x']
  },
  
  // Info section with accurate descriptions
  info: {
    title: "4D Hypercube Controls",
    desktop: [
      "• Click anywhere to start tutorial",
      "• Move mouse to rotate hypercube (RX, RY)", 
      "• Scroll wheel for 4D rotation (RWY)",
      "• Original 3-axis system"
    ],
    mobile: [
      "• Tap button below to start tutorial",
      "• MAGIC WINDOW: Tilt device for camera perspective",
      "• TOUCH 4D: Horizontal swipe = RWX, Vertical swipe = RWY",
      "• Combined camera + hypercube control"
    ]
  }
};

/**
 * UNCHANGED: Parameter registration mapping
 */
const TesseractParameterMap = {
  'fov': 'u_fov',
  'perspective': 'u_perspective', 
  'cameraZ': 'u_cameraZ'
};

/**
 * FIXED: Button action mapping with proper mobile axis handling
 */
const TesseractActionMap = {
  'resetRotation': 'resetRotation',
  
  // DESKTOP: Original velocity toggles (unchanged)
  'toggleVelocity_rx': 'rx',      // Hypercube X-axis rotation
  'toggleVelocity_ry': 'ry',      // Hypercube Y-axis rotation  
  'toggleVelocity_rwy': 'rwy',    // 4D W-Y plane rotation
  
  // MOBILE: NEW velocity toggles (fixed axis names)
  'toggleVelocity_rwx': 'rwx',            // 4D W-X plane rotation
  'toggleVelocity_cameraRx': 'cameraRx',  // Camera pitch
  'toggleVelocity_cameraRy': 'cameraRy',  // Camera roll
  'toggleVelocity_cameraRz': 'cameraRz',  // Camera yaw
  
  // MOBILE: Input source controls (fixed method names)
  'toggleMotionControl': 'toggleDeviceOrientationControl',
  'toggleTouchControl': 'toggleTouchGestureControl',
  'toggleXAxisInvert': 'toggleXAxisInvert',
  'toggleAllCamera': 'toggleAllCameraControls'
};

/**
 * COMPATIBLE: Default values preserving desktop system
 */
const TesseractDefaults = {
  fov: 7.0,
  perspective: 2.3,
  cameraZ: 10.0,
  lineWidth: 0.02,
  
  // DESKTOP: Original rotation defaults
  rotation: {
    rx: 0,   // Hypercube X-axis
    ry: 0,   // Hypercube Y-axis  
    rwy: 0,  // 4D W-Y plane (wheel)
    
    // MOBILE: Camera perspective defaults
    cameraRx: 0, cameraRy: 0, cameraRz: 0,
    rwx: 0   // 4D W-X plane (horizontal touch)
  },
  
  // Velocity defaults for all axes
  velocityEnabled: {
    // Desktop original
    rx: true, ry: true, rwy: true,
    // Mobile additions
    cameraRx: true, cameraRy: true, cameraRz: true,
    rwx: true
  },
  
  // Input source defaults
  inputSources: {
    deviceOrientationEnabled: false,
    touchGestureEnabled: true,
    xAxisInverted: false
  }
};

/**
 * COMPATIBLE: Button layout reflecting desktop vs mobile systems
 */
const TesseractButtonLayout = {
  desktop: {
    rows: [
      ['stop-rx-desktop', 'stop-ry-desktop', 'stop-rwy-desktop']
    ]
  },
  mobile: {
    rows: [
      // Original hypercube controls (desktop-compatible)
      ['stop-rx-mobile', 'stop-ry-mobile', 'stop-rwy-mobile'],
      // NEW camera + 4D controls
      ['stop-camera-rx', 'stop-camera-ry', 'stop-rwx'],
      // Input source toggles
      ['toggle-magic-window', 'toggle-touch', 'invert-x']
    ]
  }
};

/**
 * Advanced configuration (unchanged)
 */
const TesseractSmoothingConfig = {
  default: 0.1,
  parameters: {
    'fov': 0.05,
    'perspective': 0.1,
    'cameraZ': 0.15
  },
  // Axis-specific smoothing
  motionAxes: {
    // Desktop original (preserve feel)
    'rx': 0.10, 'ry': 0.10, 'rwy': 0.10,
    // Mobile camera (smooth magic window)
    'cameraRx': 0.12, 'cameraRy': 0.12, 'cameraRz': 0.10,
    // Mobile 4D (responsive touch)
    'rwx': 0.08
  }
};

/**
 * Validation rules (unchanged)
 */
const TesseractValidation = {
  fov: {
    min: 2, max: 120, step: 1,
    warningThreshold: { min: 5, max: 90 },
    errorMessage: "FOV must be between 2 and 120 degrees"
  },
  perspective: {
    min: 0.1, max: 10, step: 0.1,
    warningThreshold: { min: 0.5, max: 5 },
    errorMessage: "4D Scale must be between 0.1 and 10"
  },
  cameraZ: {
    min: -100, max: 50, step: 1,
    warningThreshold: { min: -20, max: 20 },
    errorMessage: "Camera Z must be between -100 and 50"
  }
};

/**
 * Helper functions
 */
function registerTesseractParameters(shader) {
  TesseractControlConfig.parameters.forEach(param => {
    shader.registerParameter(param.id, param.uniformName, param.default);
  });
  
  console.log('✅ Compatible Tesseract parameters registered');
}

function applyTesseractDefaults(shader) {
  // Apply parameter defaults
  Object.keys(TesseractDefaults).forEach(key => {
    if (key !== 'rotation' && key !== 'velocityEnabled' && key !== 'inputSources' && shader.setParameter) {
      shader.setParameter(key, TesseractDefaults[key]);
    }
  });
  
  // Apply rotation defaults if enhanced shader
  if (shader.angles && TesseractDefaults.rotation) {
    Object.assign(shader.angles, TesseractDefaults.rotation);
  }
  
  if (shader.velocityEnabled && TesseractDefaults.velocityEnabled) {
    Object.assign(shader.velocityEnabled, TesseractDefaults.velocityEnabled);
  }
  
  console.log('✅ Compatible Tesseract defaults applied');
}

function detectMobileCapabilities() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
  const hasDeviceMotion = 'DeviceMotionEvent' in window;
  const hasPermissionAPI = 'permissions' in navigator;
  
  return {
    isMobile,
    hasDeviceOrientation,
    hasDeviceMotion,
    hasPermissionAPI,
    supportsMagicWindow: isMobile && hasDeviceOrientation
  };
}

function getButtonLayoutForDevice() {
  const capabilities = detectMobileCapabilities();
  
  if (capabilities.supportsMagicWindow) {
    return TesseractButtonLayout.mobile;
  } else {
    return TesseractButtonLayout.desktop;
  }
}

// ==========================================
// EXPORT SYSTEM
// ==========================================

if (typeof exports !== 'undefined') {
  exports.TesseractControlConfig = TesseractControlConfig;
  exports.TesseractParameterMap = TesseractParameterMap;
  exports.TesseractActionMap = TesseractActionMap;
  exports.TesseractDefaults = TesseractDefaults;
  exports.TesseractButtonLayout = TesseractButtonLayout;
  exports.TesseractSmoothingConfig = TesseractSmoothingConfig;
  exports.TesseractValidation = TesseractValidation;
  exports.registerTesseractParameters = registerTesseractParameters;
  exports.applyTesseractDefaults = applyTesseractDefaults;
  exports.detectMobileCapabilities = detectMobileCapabilities;
  exports.getButtonLayoutForDevice = getButtonLayoutForDevice;
}

if (typeof window !== 'undefined') {
  window.TesseractControlConfig = TesseractControlConfig;
  window.TesseractParameterMap = TesseractParameterMap;
  window.TesseractActionMap = TesseractActionMap;
  window.TesseractDefaults = TesseractDefaults;
  window.TesseractButtonLayout = TesseractButtonLayout;
  window.TesseractSmoothingConfig = TesseractSmoothingConfig;
  window.TesseractValidation = TesseractValidation;
  window.registerTesseractParameters = registerTesseractParameters;
  window.applyTesseractDefaults = applyTesseractDefaults;
  window.detectMobileCapabilities = detectMobileCapabilities;
  window.getButtonLayoutForDevice = getButtonLayoutForDevice;
  
  console.log('✅ Compatible TesseractControlConfig available globally');
}

/**
 * Default export object
 */
const TesseractConfigDefault = {
  config: TesseractControlConfig,
  parameterMap: TesseractParameterMap,
  actionMap: TesseractActionMap,
  defaults: TesseractDefaults,
  buttonLayout: TesseractButtonLayout,
  smoothing: TesseractSmoothingConfig,
  validation: TesseractValidation,
  registerParameters: registerTesseractParameters,
  applyDefaults: applyTesseractDefaults,
  detectMobileCapabilities: detectMobileCapabilities,
  getButtonLayoutForDevice: getButtonLayoutForDevice
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TesseractConfigDefault;
  module.exports.TesseractControlConfig = TesseractControlConfig;
}

if (typeof window !== 'undefined') {
  window.TesseractConfigDefault = TesseractConfigDefault;
}

/**
 * 🎮 COMPATIBLE CONTROL SYSTEM COMPLETE!
 * 
 * ✅ DESKTOP (unchanged):
 * - Mouse XY → RX, RY (hypercube rotations)
 * - Mouse wheel → RWY (4D W-Y plane rotation) 
 * - Original 3-button control panel
 * 
 * ✅ MOBILE (enhanced):
 * - Device orientation → Camera RX, RY, RZ (magic window)
 * - Touch horizontal → RWX (NEW 4D W-X plane rotation)  
 * - Touch vertical → RWY (same 4D rotation as desktop wheel)
 * - 9-button mobile control panel
 * 
 * ✅ COMPATIBILITY:
 * - Platform detection automatically chooses system
 * - Shared reset and parameter controls
 * - No desktop behavior changes
 */
