/**
 * TesseractShader - 4D Hypercube WebGL Visualization
 * Handles all Three.js/WebGL rendering for the hero section
 */
class TesseractShader {
  constructor(canvasId, options = {}) {
    // Configuration
    this.canvasId = canvasId;
    this.onTutorialOpen = options.onTutorialOpen || (() => {});
    this.getTutorialState = options.getTutorialState || (() => false);
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.uniforms = null;
    
    // Interaction state
    this.mousePos = { x: 0, y: 0 };
    this.normalizedMouse = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.slowVelocity = { x: 0, y: 0 };
    this.angles = { rx: 0, ry: 0, rw: 0 };
    this.wheelVelocity = 0;
    this.maxSlowVelocity = 0.25;
    
    // Mobile touch state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Animation state
    this.animationId = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Three.js scene and start rendering
   */
  async init() {
    try {
      await this.initHypercube();
      this.setupEventListeners();
      this.setupHeroControls();
      this.startAnimation();
      this.isInitialized = true;
      console.log('TesseractShader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TesseractShader:', error);
    }
  }

  /**
   * Initialize Three.js scene, camera, renderer and shaders
   */
  async initHypercube() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      throw new Error(`Canvas with ID "${this.canvasId}" not found`);
    }

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: false 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create vertex data for tesseract
    const vertexData = this.createVertexData();
    const vertexTexture = new THREE.DataTexture(
      vertexData, 33, 1, THREE.RGBAFormat, THREE.FloatType
    );
    vertexTexture.needsUpdate = true;
    
    // Create text texture
    const textTexture = await this.createTesseractTextTexture();
    
    // Setup shaders and materials
    const { vertexShader, fragmentShader } = this.getShaderCode();
    
    this.uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_vertices: { value: vertexTexture },
      u_textTexture: { value: textTexture },
      u_rotation: { value: new THREE.Vector3(0, 0, 0) },
      u_lineWidth: { value: 0.02 },
      u_fov: { value: 7.0 },
      u_perspective: { value: 2.3 },
      u_cameraZ: { value: 10.0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(plane, material);
    this.scene.add(mesh);
    
    // FIXED: Set cursor style based on device type
    if (!this.isMobile) {
      canvas.style.cursor = 'pointer';
    }
  }

  /**
   * Create vertex data for the tesseract
   */
  createVertexData() {
    const vertexData = new Float32Array(33 * 4);
    const vertices = [
      [0,0,0,0], [0,0,0,1], [1,0,0,1], [1,1,0,1], [0,1,0,1], [0,0,0,1], [0,0,1,1], [0,1,1,1],
      [0,1,0,1], [0,1,0,0], [0,1,1,0], [0,1,1,1], [1,1,1,1], [1,1,1,0], [1,1,0,0], [1,1,0,1],
      [1,1,1,1], [1,0,1,1], [1,0,1,0], [1,0,0,0], [1,0,0,1], [1,0,1,1], [0,0,1,1], [0,0,1,0],
      [1,0,1,0], [1,1,1,0], [0,1,1,0], [0,0,1,0], [0,0,0,0], [1,0,0,0], [1,1,0,0], [0,1,0,0],
      [0,0,0,0]
    ];
    
    vertices.forEach((vertex, i) => {
      vertexData[i * 4] = (vertex[0] - 0.5) * 2;
      vertexData[i * 4 + 1] = (vertex[1] - 0.5) * 2;
      vertexData[i * 4 + 2] = (vertex[2] - 0.5) * 2;
      vertexData[i * 4 + 3] = (vertex[3] - 0.5) * 2;
    });
    
    return vertexData;
  }

  /**
   * Get vertex and fragment shader code
   */
  getShaderCode() {
    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform sampler2D u_vertices;
      uniform sampler2D u_textTexture;
      uniform vec3 u_rotation;
      uniform float u_lineWidth;
      uniform float u_fov;
      uniform float u_perspective;
      uniform float u_cameraZ;
      
      mat4 rotateX(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
      }
      
      mat4 rotateY(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
      }
      
      mat4 rotateWY(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
      }
      
      float distanceToLineSegment(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a; vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }
      
      vec2 project4DTo2D(vec4 point4D) {
        vec3 pos3D = point4D.xyz * (point4D.w + u_perspective);
        vec3 camPos = vec3(0.0, 0.0, u_cameraZ);
        vec3 relPos = pos3D - camPos;
        float f = 1.0 / tan(radians(u_fov) * 0.5);
        vec2 projected = vec2(f * relPos.x / relPos.z, f * relPos.y / relPos.z);
        return projected * 0.1;
      }
      
      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 screenSt = st;
        st = (st - 0.5) * 2.0;
        st.x *= u_resolution.x / u_resolution.y;
        
        vec4 textSample = texture2D(u_textTexture, screenSt);
        float textMask = textSample.r;
        
        mat4 rotation = rotateWY(u_rotation.z) * rotateY(u_rotation.y) * rotateX(u_rotation.x);
        
        float minDist = 1000.0;
        
        for (int i = 0; i < 32; i++) {
          vec4 vertex1 = texture2D(u_vertices, vec2((float(i) + 0.5) / 33.0, 0.5));
          vec4 vertex2 = texture2D(u_vertices, vec2((float(i + 1) + 0.5) / 33.0, 0.5));
          
          vertex1 = rotation * vertex1;
          vertex2 = rotation * vertex2;
          
          vec2 p1 = project4DTo2D(vertex1);
          vec2 p2 = project4DTo2D(vertex2);
          
          float dist = distanceToLineSegment(st, p1, p2);
          minDist = min(minDist, dist);
        }
        
        float intensity = smoothstep(0.0, u_lineWidth, minDist);
        
        vec3 lineColor = vec3(0.2, 0.8, 1.0);
        vec3 glowColor = vec3(0.6, 0.3, 1.0);
        vec3 bgColor = vec3(0.05, 0.05, 0.15);
        
        vec3 color = mix(lineColor, bgColor, intensity);
        float glow = exp(-minDist * 30.0) * 0.5;
        color += glow * glowColor;
        
        if (textMask > 0.1) {
          float textGlow = exp(-minDist * 20.0) * 2.0;
          vec3 textGlowColor = vec3(1.0, 0.8, 0.2);
          color += textGlow * textGlowColor * textMask;
          
          if (minDist < u_lineWidth * 2.0) {
            vec3 textLineColor = vec3(1.0, 0.9, 0.3);
            float textInfluence = (1.0 - minDist / (u_lineWidth * 2.0)) * textMask;
            color = mix(color, textLineColor, textInfluence * 0.7);
          }
          
          float sparkleFreq = 15.0;
          float sparkle = sin(st.x * sparkleFreq + u_time * 3.0) * sin(st.y * sparkleFreq + u_time * 2.5);
          sparkle = pow(max(sparkle, 0.0), 3.0);
          color += sparkle * 0.3 * textMask * vec3(1.0, 0.8, 0.4);
        }
        
        float pulse = sin(u_time * 2.0) * 0.5 + 0.5;
        if (minDist < u_lineWidth * 0.5) {
          float pulseMult = textMask > 0.1 ? 0.6 : 0.3;
          color = mix(color, vec3(1.0), pulse * pulseMult);
        }
        
        float sparkle = sin(st.x * 20.0 + u_time) * sin(st.y * 20.0 + u_time * 1.1);
        color += sparkle * 0.05 * (1.0 - intensity) * (1.0 - textMask);
        
        gl_FragColor = vec4(color, 0.8);
      }
    `;

    return { vertexShader, fragmentShader };
  }

  /**
   * Create text texture for TESSERACT title
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
    const subtitleFontSize = Math.min(window.innerWidth * 0.036, 36);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.font = `${baseFontSize}px "Spy Agency"`;
    const titleY = centerY - 30;
    ctx.fillText('TESSERACT', centerX, titleY);
    
    ctx.font = `400 ${subtitleFontSize}px Orbitron`;
    const subtitleLine1 = 'TouchDesigner Tutorial using GLSL';
    const subtitleLine2 = 'click to start';
    const subtitleY = titleY + baseFontSize * 0.8 + 20;
    const lineSpacing = subtitleFontSize * 1.2;
    
    ctx.fillText(subtitleLine1, centerX, subtitleY);
    ctx.fillText(subtitleLine2, centerX, subtitleY + lineSpacing);
    
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Wait for custom fonts to load
   */
  async waitForFonts() {
    return new Promise((resolve) => {
      const testCanvas = document.createElement('canvas');
      const testCtx = testCanvas.getContext('2d');
      
      function checkFonts() {
        testCtx.font = '48px "Spy Agency", serif';
        const spyAgencyWidth = testCtx.measureText('TESSERACT').width;
        testCtx.font = '48px serif';
        const serifWidth = testCtx.measureText('TESSERACT').width;
        
        if (Math.abs(spyAgencyWidth - serifWidth) > 1) {
          resolve();
        } else {
          setTimeout(checkFonts, 100);
        }
      }
      checkFonts();
      setTimeout(resolve, 5000); // Fallback timeout
    });
  }

  /**
   * Setup event listeners for interaction
   */
  setupEventListeners() {
    const canvas = document.getElementById(this.canvasId);
    
    // Mouse events
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('wheel', (e) => this.onWheel(e));
    
    // FIXED: Restore canvas click events for desktop
    if (!this.isMobile) {
      canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    }
    
    // Canvas touch events (only for mobile gestures, not tutorial trigger)
    if (this.isMobile) {
      canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
      canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
      canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup hero controls panel
   */
  setupHeroControls() {
    const toggle = document.getElementById('heroSettingsToggle');
    const panel = document.getElementById('heroControlsPanel');
    
    if (!toggle || !panel) {
      console.warn('Hero settings controls not found');
      return;
    }
    
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });

    // Prevent tutorial opening when clicking on panel
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Control inputs
    const fovControl = document.getElementById('hero-fov-control');
    const perspectiveControl = document.getElementById('hero-perspective-control');
    const cameraZControl = document.getElementById('hero-cameraz-control');

    if (fovControl) {
      fovControl.addEventListener('input', (e) => {
        if (this.uniforms) this.uniforms.u_fov.value = parseFloat(e.target.value);
      });
    }

    if (perspectiveControl) {
      perspectiveControl.addEventListener('input', (e) => {
        if (this.uniforms) this.uniforms.u_perspective.value = parseFloat(e.target.value);
      });
    }

    if (cameraZControl) {
      cameraZControl.addEventListener('input', (e) => {
        if (this.uniforms) this.uniforms.u_cameraZ.value = parseFloat(e.target.value);
      });
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !panel.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (!this.uniforms) return;
    
    this.uniforms.u_time.value += 0.016;
    
    this.uniforms.u_rotation.value.x = this.angles.rx;
    this.uniforms.u_rotation.value.y = this.angles.ry;
    this.uniforms.u_rotation.value.z = this.angles.rw;
    
    this.angles.rx += this.velocity.x + this.slowVelocity.x;
    this.angles.ry += this.velocity.y + this.slowVelocity.y;
    this.angles.rw += this.wheelVelocity;
    
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
    this.wheelVelocity *= 0.96;
    
    const targetSlowVelX = this.normalizedMouse.y * 0.0125;
    const targetSlowVelY = this.normalizedMouse.x * 0.0125;
    
    this.slowVelocity.x += (targetSlowVelX - this.slowVelocity.x) * 0.1;
    this.slowVelocity.y += (targetSlowVelY - this.slowVelocity.y) * 0.1;
    
    const slowSpeed = Math.sqrt(this.slowVelocity.x * this.slowVelocity.x + this.slowVelocity.y * this.slowVelocity.y);
    if (slowSpeed > this.maxSlowVelocity) {
      this.slowVelocity.x = (this.slowVelocity.x / slowSpeed) * this.maxSlowVelocity;
      this.slowVelocity.y = (this.slowVelocity.y / slowSpeed) * this.maxSlowVelocity;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animate();
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Event Handlers

  onMouseMove(event) {
    if (this.getTutorialState()) return;
    
    const newMousePos = {
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight
    };
    
    const deltaX = (newMousePos.x - this.mousePos.x) * 2.0;
    const deltaY = (newMousePos.y - this.mousePos.y) * 2.0;
    
    this.velocity.x += deltaY * 0.15;
    this.velocity.y += deltaX * 0.15;
    
    this.mousePos = newMousePos;
    
    this.normalizedMouse.x = (this.mousePos.x - 0.5) * 2;
    this.normalizedMouse.y = (this.mousePos.y - 0.5) * 2;
  }

  onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchMove(event) {
    event.preventDefault();
    if (!this.getTutorialState()) {
      const touch = event.touches[0];
      const deltaX = (touch.clientX - this.touchStartX) / window.innerWidth;
      const deltaY = (touch.clientY - this.touchStartY) / window.innerHeight;
      
      this.velocity.x += deltaY * 0.1;
      this.velocity.y += deltaX * 0.1;
    }
  }

  onTouchEnd(event) {
    event.preventDefault();
    // Touch events now only handle hypercube rotation gestures
    // Tutorial opening is handled by the button
  }

  onWheel(event) {
    // Only handle wheel events when on hero page (not in tutorial)
    if (this.getTutorialState()) return;
    
    const wheelDelta = event.deltaY > 0 ? 0.5 : -0.5;
    this.wheelVelocity += wheelDelta * 0.07;
  }

  // FIXED: Restored canvas click functionality for desktop
  onCanvasClick(event) {
    // Only open tutorial if not already in tutorial and not clicking on controls
    if (this.getTutorialState()) return;
    
    // Check if clicking on settings toggle or panel
    const settingsToggle = document.getElementById('heroSettingsToggle');
    const settingsPanel = document.getElementById('heroControlsPanel');
    
    if (settingsToggle && settingsToggle.contains(event.target)) return;
    if (settingsPanel && settingsPanel.contains(event.target)) return;
    
    // Open tutorial
    if (this.onTutorialOpen) {
      this.onTutorialOpen();
    }
  }

  onWindowResize() {
    if (this.camera && this.renderer && this.uniforms) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.uniforms.u_resolution.value.x = window.innerWidth;
      this.uniforms.u_resolution.value.y = window.innerHeight;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAnimation();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onWindowResize);
    
    const canvas = document.getElementById(this.canvasId);
    if (canvas) {
      // FIXED: Remove click event listener for desktop
      if (!this.isMobile) {
        canvas.removeEventListener('click', this.onCanvasClick);
      }
      canvas.removeEventListener('touchstart', this.onTouchStart);
      canvas.removeEventListener('touchmove', this.onTouchMove);
      canvas.removeEventListener('touchend', this.onTouchEnd);
    }
    
    this.isInitialized = false;
  }

  /**
   * Get current shader parameters (useful for debugging/external control)
   */
  getShaderParams() {
    if (!this.uniforms) return null;
    
    return {
      fov: this.uniforms.u_fov.value,
      perspective: this.uniforms.u_perspective.value,
      cameraZ: this.uniforms.u_cameraZ.value,
      rotation: {
        x: this.angles.rx,
        y: this.angles.ry,
        w: this.angles.rw
      }
    };
  }

  /**
   * Set shader parameters (useful for external control)
   */
  setShaderParams(params) {
    if (!this.uniforms) return;
    
    if (params.fov !== undefined) this.uniforms.u_fov.value = params.fov;
    if (params.perspective !== undefined) this.uniforms.u_perspective.value = params.perspective;
    if (params.cameraZ !== undefined) this.uniforms.u_cameraZ.value = params.cameraZ;
    
    if (params.rotation) {
      if (params.rotation.x !== undefined) this.angles.rx = params.rotation.x;
      if (params.rotation.y !== undefined) this.angles.ry = params.rotation.y;
      if (params.rotation.w !== undefined) this.angles.rw = params.rotation.w;
    }
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TesseractShader;
} else if (typeof window !== 'undefined') {
  window.TesseractShader = TesseractShader;
}
