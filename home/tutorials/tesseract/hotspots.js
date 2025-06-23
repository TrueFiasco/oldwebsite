/**
 * Tesseract Tutorial Hotspot Configuration
 * Complete hotspot data including positions, content, and image dimensions
 */
const TesseractHotspots = {
  // Image dimensions for accurate hotspot positioning
  imageDimensions: {
    1: { width: 3615, height: 1097 },
    2: { width: 1852, height: 571 },
    3: { width: 1852, height: 571 },
    4: { width: 1852, height: 571 },
    5: { width: 1852, height: 571 },
    6: { width: 1852, height: 571 },
    7: { width: 1852, height: 571 },
    8: { width: 1852, height: 571 },
    9: { width: 1456, height: 478 },
    10: { width: 1920, height: 571 },
    11: { width: 1920, height: 571 },
    12: { width: 1920, height: 571 },
    13: { width: 1920, height: 571 },
    14: { width: 1920, height: 571 }
  },

  // Hotspot data by section
  sections: [
    // Section 3: Input Data 1: Mouse UV Control
    {
      sectionId: 3,
      title: "Input Data 1: Mouse UV Control",
      hotspots: [
        {
          id: "select1-detailed",
          position: { x: 0.17, y: 0.35 },
          content: {
            type: "image",
            source: "assets/parameters/select1.png",
            title: "Select1 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 4: Rangeling CHOPs 1: Mouse Velocity
    {
      sectionId: 4,
      title: "Rangeling CHOPs 1: Mouse Velocity",
      hotspots: [
        {
          id: "math3-params",
          position: { x: 0.29, y: 0.04 },
          content: {
            type: "image",
            source: "assets/parameters/math3.png",
            title: "Math3 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "filter1-params",
          position: { x: 0.52, y: 0.04 },
          content: {
            type: "image",
            source: "assets/parameters/filter1.png",
            title: "Filter1 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 5: Rangeling CHOPs 2: Centering and Scaling
    {
      sectionId: 5,
      title: "Rangeling CHOPs 2: Centering and Scaling",
      hotspots: [
        {
          id: "math1-params",
          position: { x: 0.29, y: 0.35 },
          content: {
            type: "image",
            source: "assets/parameters/math1.png",
            title: "Math1 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "speed2-params",
          position: { x: 0.41, y: 0.35 },
          content: {
            type: "image",
            source: "assets/parameters/speed2.png",
            title: "Speed2 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 6: Rangeling CHOPs 3: Angular Velocity
    {
      sectionId: 6,
      title: "Rangeling CHOPs 3: Angular Velocity",
      hotspots: [
        {
          id: "math2-params",
          position: { x: 0.65, y: 0.30 },
          content: {
            type: "image",
            source: "assets/parameters/math2.png",
            title: "Math2 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "speed3-params",
          position: { x: 0.76, y: 0.28 },
          content: {
            type: "image",
            source: "assets/parameters/speed3.png",
            title: "Speed3 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 7: Rangeling CHOPs 4: Mouse Wheel
    {
      sectionId: 7,
      title: "Rangeling CHOPs 4: Mouse Wheel",
      hotspots: [
        {
          id: "mousein1-wheel",
          position: { x: 0.03, y: 0.67 },
          content: {
            type: "image",
            source: "assets/parameters/mousein1.png",
            title: "MouseIn1 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "select2-params",
          position: { x: 0.15, y: 0.67 },
          content: {
            type: "image",
            source: "assets/parameters/select2.png",
            title: "Select2 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "filter4-params",
          position: { x: 0.29, y: 0.67 },
          content: {
            type: "image",
            source: "assets/parameters/filter4.png",
            title: "Filter4 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "filter3-params",
          position: { x: 0.41, y: 0.67 },
          content: {
            type: "image",
            source: "assets/parameters/filter3.png",
            title: "Filter3 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "filter2-params",
          position: { x: 0.53, y: 0.67 },
          content: {
            type: "image",
            source: "assets/parameters/filter2.png",
            title: "Filter2 CHOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 10: Rotation Vertex GLSL
    {
      sectionId: 10,
      title: "Rotation Vertex GLSL",
      hotspots: [
        {
          id: "vert_rotation",
          position: { x: 0.40, y: 0.35 },
          content: {
            type: "image",
            source: "assets/parameters/vert_rotation.png",
            title: "Vertex Rotation GLSL Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 11: Perspective GLSL
    {
      sectionId: 11,
      title: "Perspective GLSL",
      hotspots: [
        {
          id: "vert_perspective",
          position: { x: 0.50, y: 0.40 },
          content: {
            type: "image",
            source: "assets/parameters/vert_perspective.png",
            title: "Vertex Perspective GLSL Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 12: 2D Points to 2D Lines
    {
      sectionId: 12,
      title: "2D Points to 2D Lines",
      hotspots: [
        {
          id: "transform1",
          position: { x: 0.35, y: 0.45 },
          content: {
            type: "image",
            source: "assets/parameters/transform1.png",
            title: "Transform1 TOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        },
        {
          id: "reorder1",
          position: { x: 0.65, y: 0.45 },
          content: {
            type: "image",
            source: "assets/parameters/reorder1.png",
            title: "Reorder1 TOP Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    },

    // Section 13: SDF Uneven Capsule
    {
      sectionId: 13,
      title: "SDF Uneven Capsule",
      hotspots: [
        {
          id: "line_mindist",
          position: { x: 0.50, y: 0.50 },
          content: {
            type: "image",
            source: "assets/parameters/line_mindist.png",
            title: "Line Min Distance Parameters"
          },
          behavior: { trigger: "hover", sticky: true, mobileHidden: true }
        }
      ]
    }
  ],

  // Global hotspot configuration for this tutorial
  config: {
    enableCollisionAvoidance: true,
    enableMultiDialog: true,
    dialogOffset: { x: 10, y: 0 },
    maxDialogs: 5,
    mobileHidden: true,
    defaultBehavior: {
      trigger: "hover",
      sticky: true,
      mobileHidden: true
    },
    // Tutorial-specific styling
    styling: {
      hotspotColor: "#00ffff",
      hotspotHoverColor: "#ff00ff",
      hotspotSelectedColor: "#ffff00",
      dialogBackground: "#1a1a2e",
      dialogBorder: "#444",
      dialogAccentColor: "#00ffff"
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TesseractHotspots;
} else if (typeof window !== 'undefined') {
  window.TesseractHotspots = TesseractHotspots;
}
