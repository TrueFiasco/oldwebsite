/**
 * FIXED TesseractShader - Position-Based Device Orientation
 * CHANGED: Device orientation directly controls camera position (not velocity)
 * RESULT: Hypercube feels attached to glass - tilts with phone orientation
 */
class TesseractShader extends GenericShader {
  constructor(canvasId, options = {}) {
    super(canvasId, options);
    
    // Original desktop interaction state (unchanged)
    this.mousePos = { x: 0, y: 0 };
    this.normalizedMouse = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.slowVelocity = { x: 0, y: 0 };
    this.maxSlowVelocity = 0.25;
    
    // ENHANCED: Angles system with clear separation
    this.angles = {
      // Original desktop hypercube rotations (velocity-based)
      rx: 0,   // X-axis hypercube rotation ← mouse Y
      ry: 0,   // Y-axis hypercube rotation ← mouse X
      rwy: 0,  // W-Y plane 4D rotation ← mouse wheel
      
      // NEW: Mobile camera perspective (POSITION-based)
      cameraRx: 0,  // Camera pitch ← device beta (DIRECT position)
      cameraRy: 0,  // Camera roll ← device gamma (DIRECT position)
      cameraRz: 0,  // Camera yaw ← device alpha (DIRECT position)
      
      // Mobile 4D touch rotation (velocity-based)
      rwx: 0   // W-X plane 4D rotation ← horizontal touch
    };
    
    // Original desktop velocity system (unchanged)
    this.wheelVelocity = 0;
    
    // Velocity control for all axes
    this.velocityEnabled = {
      // Original desktop controls
      rx: true, ry: true, rwy: true,
      // New mobile controls  
      cameraRx: true, cameraRy: true, cameraRz: true,
      rwx: true
    };
    
    // Mobile-specific state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.deviceOrientationEnabled = false;
    this.touchGestureEnabled = true;
    
    // CHANGED: Input source tracking with position vs velocity distinction
    this.rotationSource = this.isMobile ? 'combined' : 'mouse';
    
    // CHANGED: Position-based device orientation input (not velocity)
    this.deviceOrientationInput = { rx: 0, ry: 0, rz: 0 };  // POSITION values
    this.touchInput = { rwx: 0, rwy: 0 };  // VELOCITY values
    
    // Mobile control options
    this.xAxisInverted = false;
    
    // Animation state
    this.animationId = null;
    
    // Auto-register parameters
    this.registerTesseractParameters();
    
    console.log('🎯 FIXED TesseractShader - Position-based device orientation');
  }

  // Auto-register parameters (unchanged)
  registerTesseractParameters() {
    if (typeof window !== 'undefined' && window.TesseractControlConfig) {
      const config = window.TesseractControlConfig;
      config.parameters.forEach(param => {
        this.registerParameter(param.id, param.uniformName, param.default);
      });
      console.log('✅ Auto-registered Tesseract parameters from config');
    } else {
      this.registerParameter('fov', 'u_fov', 7.0);
      this.registerParameter('perspective', 'u_perspective', 2.3);
      this.registerParameter('cameraZ', 'u_cameraZ', 10.0);
      console.log('✅ Fallback parameter registration complete');
    }
  }

  // Initialize method (unchanged)
  async init() {
    try {
      await this.initHypercube();
      this.setupEventListeners();
      this.setupHeroControls();
      this.startAnimation();
      this.isInitialized = true;
      console.log('✅ TesseractShader initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TesseractShader:', error);
      throw error;
    }
  }

  // Shader code and initialization methods (unchanged)
  getShaderCode() {
    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform sampler2D u_vertices;
      uniform sampler2D u_textTexture;
      
      // Original uniform for desktop compatibility
      uniform vec3 u_rotation;        // RX, RY, RWY (original system)
      
      // Mobile-only uniforms
      uniform vec3 u_cameraRotation;  // Camera RX, RY, RZ (magic window)
      uniform float u_rwxRotation;    // RWX 4D rotation (horizontal touch)
      uniform bool u_isMobile;        // Platform detection
      
      uniform float u_lineWidth;
      uniform float u_fov;
      uniform float u_perspective;
      uniform float u_cameraZ;
      
      // 3D rotation matrices
      mat4 rotateX(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
      }
      
      mat4 rotateY(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
      }
      
      mat4 rotateZ(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
      }
      
      // 4D rotation matrices
      mat4 rotateWY(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
      }
      
      mat4 rotateWX(float angle) {
        float c = cos(angle); float s = sin(angle);
        return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
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
        
        mat4 finalRotation;
        
        if (u_isMobile) {
          // MOBILE: Enhanced system with camera + hypercube separation
          
          // 1. Apply 4D rotations to hypercube
          mat4 hypercube4D = rotateWX(u_rwxRotation) *           // RWX ← horizontal touch
                            rotateWY(u_rotation.z) *            // RWY ← vertical touch/wheel
                            rotateY(u_rotation.y) *             // RY ← (mobile: touch legacy)
                            rotateX(u_rotation.x);              // RX ← (mobile: touch legacy)
          
          // 2. Apply 3D camera rotation (magic window)
          mat4 camera3D = rotateZ(u_cameraRotation.z) *         // Camera yaw ← alpha
                         rotateY(u_cameraRotation.y) *         // Camera roll ← gamma
                         rotateX(u_cameraRotation.x);          // Camera pitch ← beta
          
          // 3. Combine: camera perspective + hypercube
          finalRotation = camera3D * hypercube4D;
          
        } else {
          // DESKTOP: Original system unchanged
          finalRotation = rotateWY(u_rotation.z) *              // RWY ← mouse wheel
                         rotateY(u_rotation.y) *               // RY ← mouse X
                         rotateX(u_rotation.x);                // RX ← mouse Y
        }
        
        float minDist = 1000.0;
        
        for (int i = 0; i < 32; i++) {
          vec4 vertex1 = texture2D(u_vertices, vec2((float(i) + 0.5) / 33.0, 0.5));
          vec4 vertex2 = texture2D(u_vertices, vec2((float(i + 1) + 0.5) / 33.0, 0.5));
          
          vertex1 = finalRotation * vertex1;
          vertex2 = finalRotation * vertex2;
          
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

  // Initialize hypercube with proper uniforms (unchanged)
  async initHypercube() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      throw new Error(`Canvas with ID "${this.canvasId}" not found`);
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: false 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    const vertexData = this.createVertexData();
    const vertexTexture = new THREE.DataTexture(
      vertexData, 33, 1, THREE.RGBAFormat, THREE.FloatType
    );
    vertexTexture.needsUpdate = true;
    
    const textTexture = await this.createTesseractTextTexture();
    
    const { vertexShader, fragmentShader } = this.getShaderCode();
    
    this.uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_vertices: { value: vertexTexture },
      u_textTexture: { value: textTexture },
      
      // Original uniform (desktop compatibility)
      u_rotation: { value: new THREE.Vector3(0, 0, 0) },  // RX, RY, RWY
      
      // Mobile-only uniforms
      u_cameraRotation: { value: new THREE.Vector3(0, 0, 0) },  // Camera RX, RY, RZ
      u_rwxRotation: { value: 0.0 },                            // RWX 4D rotation
      u_isMobile: { value: this.isMobile },                     // Platform detection
      
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
  }

  // ==========================================
  // FIXED: MOBILE DEVICE ORIENTATION METHODS
  // ==========================================

  enableDeviceOrientation() {
    if (!this.isMobile || !this.canUseMotion()) {
      console.log('📱 Device orientation not available');
      return false;
    }
    
    this.deviceOrientationEnabled = true;
    this.rotationSource = 'combined';
    console.log('🪟 FIXED: Position-based device orientation enabled');
    return true;
  }

  disableDeviceOrientation() {
    this.deviceOrientationEnabled = false;
    this.rotationSource = this.isMobile ? 'touch' : 'mouse';
    this.deviceOrientationInput = { rx: 0, ry: 0, rz: 0 };
    
    // CHANGED: Reset camera angles when disabled (position-based)
    this.angles.cameraRx = 0;
    this.angles.cameraRy = 0;
    this.angles.cameraRz = 0;
    
    console.log('🪟 FIXED: Position-based device orientation disabled');
  }

  // CHANGED: Update device orientation as POSITION (not velocity)
  updateDeviceOrientationInput(input) {
    if (!this.deviceOrientationEnabled) return;
    
    // CHANGED: Store as position values (not velocity)
    this.deviceOrientationInput.rx = input.rx || 0;
    this.deviceOrientationInput.ry = input.ry || 0;
    this.deviceOrientationInput.rz = input.rz || 0;
    
    console.log('🪟 Device orientation input (POSITION):', this.deviceOrientationInput);
  }

  // Touch gesture input (velocity-based, unchanged)
  updateTouchGestureInput(input) {
    if (!this.touchGestureEnabled) return;
    
    this.touchInput.rwx = input.rwx || 0;
    this.touchInput.rwy = input.rwy || 0;
  }

  // ==========================================
  // FIXED: ANIMATION LOOP WITH POSITION-BASED DEVICE ORIENTATION
  // ==========================================

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (!this.uniforms) return;
    
    this.uniforms.u_time.value += 0.016;
    
    if (this.isMobile) {
      this.applyMobileControls();
    } else {
      this.applyDesktopControls();
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  // FIXED: Apply mobile controls with position-based device orientation
  applyMobileControls() {
    // CHANGED: Device orientation sets camera position DIRECTLY (not velocity)
    if (this.deviceOrientationEnabled) {
      if (this.isVelocityEnabled('cameraRx')) {
        // CHANGED: Direct position assignment (not accumulation)
        const rxInput = this.xAxisInverted ? -this.deviceOrientationInput.rx : this.deviceOrientationInput.rx;
        this.angles.cameraRx = rxInput;  // DIRECT position control
      }
      if (this.isVelocityEnabled('cameraRy')) {
        this.angles.cameraRy = this.deviceOrientationInput.ry;  // DIRECT position control
      }
      if (this.isVelocityEnabled('cameraRz')) {
        this.angles.cameraRz = this.deviceOrientationInput.rz;  // DIRECT position control
      }
      
      // NO DAMPING for device orientation - it's position-based
    }
    
    // Apply touch gestures to 4D hypercube (velocity-based, unchanged)
    if (this.touchGestureEnabled) {
      if (this.isVelocityEnabled('rwx')) {
        this.angles.rwx += this.touchInput.rwx;
      }
      if (this.isVelocityEnabled('rwy')) {
        this.angles.rwy += this.touchInput.rwy;
      }
      
      // Damping for touch input (velocity-based)
      this.touchInput.rwx *= 0.90;
      this.touchInput.rwy *= 0.90;
    }
    
    // Apply desktop-style controls when available (legacy support)
    if (this.isVelocityEnabled('rx')) {
      this.angles.rx += this.velocity.x;
    }
    if (this.isVelocityEnabled('ry')) {
      this.angles.ry += this.velocity.y;
    }
    if (this.isVelocityEnabled('rwy')) {
      this.angles.rwy += this.wheelVelocity;
    }
    
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
    this.wheelVelocity *= 0.96;
    
    // Update mobile uniforms
    this.uniforms.u_rotation.value.x = this.angles.rx;
    this.uniforms.u_rotation.value.y = this.angles.ry;
    this.uniforms.u_rotation.value.z = this.angles.rwy;
    
    // CHANGED: Direct camera position assignment
    this.uniforms.u_cameraRotation.value.x = this.angles.cameraRx;
    this.uniforms.u_cameraRotation.value.y = this.angles.cameraRy;
    this.uniforms.u_cameraRotation.value.z = this.angles.cameraRz;
    
    this.uniforms.u_rwxRotation.value = this.angles.rwx;
  }

  // Desktop control application (unchanged)
  applyDesktopControls() {
    if (this.isVelocityEnabled('rx')) {
      this.angles.rx += this.velocity.x;
    }
    if (this.isVelocityEnabled('ry')) {
      this.angles.ry += this.velocity.y;
    }
    if (this.isVelocityEnabled('rwy')) {
      this.angles.rwy += this.wheelVelocity;
    }
    
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
    this.wheelVelocity *= 0.96;
    
    const targetSlowVelX = this.isVelocityEnabled('rx') ? this.normalizedMouse.y * 0.0125 : 0;
    const targetSlowVelY = this.isVelocityEnabled('ry') ? this.normalizedMouse.x * 0.0125 : 0;
    
    this.slowVelocity.x += (targetSlowVelX - this.slowVelocity.x) * 0.1;
    this.slowVelocity.y += (targetSlowVelY - this.slowVelocity.y) * 0.1;
    
    const slowSpeed = Math.sqrt(this.slowVelocity.x * this.slowVelocity.x + this.slowVelocity.y * this.slowVelocity.y);
    if (slowSpeed > this.maxSlowVelocity) {
      this.slowVelocity.x = (this.slowVelocity.x / slowSpeed) * this.maxSlowVelocity;
      this.slowVelocity.y = (this.slowVelocity.y / slowSpeed) * this.maxSlowVelocity;
    }
    
    this.angles.rx += this.slowVelocity.x;
    this.angles.ry += this.slowVelocity.y;
    
    this.uniforms.u_rotation.value.x = this.angles.rx;
    this.uniforms.u_rotation.value.y = this.angles.ry;
    this.uniforms.u_rotation.value.z = this.angles.rwy;
  }

  // ==========================================
  // REMAINING METHODS (unchanged from previous implementation)
  // ==========================================

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
    const subtitleLine2 = 'Interactive 4D Hypercube Visualization';
    const subtitleY = titleY + baseFontSize * 0.8 + 20;
    const lineSpacing = subtitleFontSize * 1.2;
    
    ctx.fillText(subtitleLine1, centerX, subtitleY);
    ctx.fillText(subtitleLine2, centerX, subtitleY + lineSpacing);
    
    return new THREE.CanvasTexture(canvas);
  }

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
      setTimeout(resolve, 5000);
    });
  }

  // Control methods (unchanged)
  toggleVelocity(axis) {
    if (!this.velocityEnabled) {
      this.velocityEnabled = {};
    }
    
    if (this.velocityEnabled[axis] === undefined) {
      this.velocityEnabled[axis] = true;
    }
    
    this.velocityEnabled[axis] = !this.velocityEnabled[axis];
    
    if (!this.velocityEnabled[axis]) {
      switch(axis) {
        case 'rx': 
          this.velocity.x = 0;
          break;
        case 'ry': 
          this.velocity.y = 0;
          break;
        case 'rwy': 
          this.wheelVelocity = 0;
          this.touchInput.rwy = 0;
          break;
        case 'cameraRx': 
          this.angles.cameraRx = 0; 
          this.deviceOrientationInput.rx = 0; 
          break;
        case 'cameraRy': 
          this.angles.cameraRy = 0; 
          this.deviceOrientationInput.ry = 0; 
          break;
        case 'cameraRz': 
          this.angles.cameraRz = 0; 
          this.deviceOrientationInput.rz = 0; 
          break;
        case 'rwx': 
          this.touchInput.rwx = 0; 
          break;
      }
    }
    
    console.log(`🎛️ ${axis.toUpperCase()} velocity ${this.velocityEnabled[axis] ? 'enabled' : 'disabled'}`);
    return this.velocityEnabled[axis];
  }

  resetRotation() {
    // Reset original desktop angles
    this.angles.rx = 0;
    this.angles.ry = 0;
    this.angles.rwy = 0;
    
    // CHANGED: Reset mobile camera angles (position-based)
    this.angles.cameraRx = 0;
    this.angles.cameraRy = 0;
    this.angles.cameraRz = 0;
    this.angles.rwx = 0;
    
    // Reset all input sources
    this.velocity.x = 0; this.velocity.y = 0;
    this.slowVelocity.x = 0; this.slowVelocity.y = 0;
    this.wheelVelocity = 0;
    this.deviceOrientationInput = { rx: 0, ry: 0, rz: 0 };
    this.touchInput = { rwx: 0, rwy: 0 };
    
    console.log('🔄 All rotations reset to zero');
  }

  resetAll() {
    this.resetRotation();
    
    this.setParameter('fov', 7.0);
    this.setParameter('perspective', 2.3);
    this.setParameter('cameraZ', 10.0);
    
    this.velocityEnabled = {
      rx: true, ry: true, rwy: true,
      cameraRx: true, cameraRy: true, cameraRz: true,
      rwx: true
    };
    
    this.xAxisInverted = false;
    
    console.log('🔄 All parameters reset');
  }

  // Event handlers and other methods (unchanged)
  setupEventListeners() {
    const canvas = document.getElementById(this.canvasId);
    
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('wheel', (e) => this.onWheel(e));
    
    if (!this.isMobile) {
      canvas.addEventListener('click', (e) => this.onCanvasClick(e));
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
      canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
      canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
      canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupHeroControls() {
    console.log('✅ Using main controls panel for hero section');
  }

  startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animate();
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Touch event handlers for horizontal/vertical separation
  onTouchStart(event) {
    if (this.isTouchOnButton(event)) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    console.log('Touch start for separated 4D gestures');
  }

  onTouchMove(event) {
    if (this.isTouchOnButton(event)) return;
    if (!this.touchGestureEnabled) return;
    
    event.preventDefault();
    if (!this.getTutorialState()) {
      const touch = event.touches[0];
      
      const deltaX = (touch.clientX - this.touchStartX) / window.innerWidth;
      const deltaY = (touch.clientY - this.touchStartY) / window.innerHeight;
      
      const adjustedDeltaX = this.xAxisInverted ? -deltaX : deltaX;
      this.touchInput.rwx += adjustedDeltaX * 0.15;  // Horizontal → RWX
      this.touchInput.rwy += deltaY * 0.15;          // Vertical → RWY
      
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
  }

  onTouchEnd(event) {
    if (this.isTouchOnButton(event)) return;
    event.preventDefault();
    console.log('Touch end for separated 4D gestures');
  }

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

  onCanvasClick(event) {
    if (!this.getTutorialState() && !this.isMobile) {
      const settingsToggle = document.getElementById('settings-toggle');
      const controlsPanel = document.getElementById('controls-panel');
      const closeButton = document.querySelector('.close-btn');
      
      if (settingsToggle && settingsToggle.contains(event.target)) return;
      if (controlsPanel && controlsPanel.contains(event.target)) return;
      if (closeButton && closeButton.contains(event.target)) return;
      
      event.preventDefault();
      console.log('Canvas clicked - opening tutorial');
      this.onTutorialOpen();
    }
  }

  onWheel(event) {
    if (this.getTutorialState()) return;
    
    const wheelDelta = event.deltaY > 0 ? -0.1963 : 0.1963;
    this.wheelVelocity += wheelDelta * 0.07;
  }

  onWindowResize() {
    if (this.camera && this.renderer && this.uniforms) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.uniforms.u_resolution.value.x = window.innerWidth;
      this.uniforms.u_resolution.value.y = window.innerHeight;
    }
  }

  isTouchOnButton(event) {
    if (!this.isMobile) return false;
    
    const buttonContainer = document.getElementById('mobileTutorialBtn');
    if (!buttonContainer) return false;
    
    const rect = buttonContainer.getBoundingClientRect();
    const touch = event.touches && event.touches[0] ? event.touches[0] : event.changedTouches && event.changedTouches[0];
    
    if (!touch) return false;
    
    const padding = 50;
    const isInButtonArea = (
      touch.clientX >= rect.left - padding &&
      touch.clientX <= rect.right + padding &&
      touch.clientY >= rect.top - padding &&
      touch.clientY <= rect.bottom + padding
    );
    
    return isInButtonArea;
  }

  isVelocityEnabled(axis) {
    if (!this.velocityEnabled) return true;
    return this.velocityEnabled[axis] !== false;
  }

  // Compatibility methods
  enableMotionControl() {
    return this.enableDeviceOrientation();
  }

  disableMotionControl() {
    this.disableDeviceOrientation();
  }

  toggleMotionControl() {
    if (this.deviceOrientationEnabled) {
      this.disableDeviceOrientation();
      return false;
    } else {
      return this.enableDeviceOrientation();
    }
  }

  toggleTouchControl() {
    this.touchGestureEnabled = !this.touchGestureEnabled;
    
    if (!this.touchGestureEnabled) {
      this.touchInput = { rwx: 0, rwy: 0 };
    }
    
    console.log(`🎯 Touch gesture control: ${this.touchGestureEnabled ? 'enabled' : 'disabled'}`);
    return this.touchGestureEnabled;
  }

  toggleAllCameraControls() {
    const allCameraEnabled = this.isVelocityEnabled('cameraRx') && 
                            this.isVelocityEnabled('cameraRy') && 
                            this.isVelocityEnabled('cameraRz');
    
    const newState = !allCameraEnabled;
    this.velocityEnabled.cameraRx = newState;
    this.velocityEnabled.cameraRy = newState;
    this.velocityEnabled.cameraRz = newState;
    
    if (!newState) {
      this.deviceOrientationInput = { rx: 0, ry: 0, rz: 0 };
      this.angles.cameraRx = 0;
      this.angles.cameraRy = 0;
      this.angles.cameraRz = 0;
    }
    
    console.log(`🎯 All camera controls: ${newState ? 'enabled' : 'disabled'}`);
    return newState;
  }

  toggleDeviceOrientationControl() {
    if (this.deviceOrientationEnabled) {
      this.disableDeviceOrientation();
      return false;
    } else {
      return this.enableDeviceOrientation();
    }
  }

  toggleTouchGestureControl() {
    return this.toggleTouchControl();
  }

  toggleXAxisInvert() {
    this.xAxisInverted = !this.xAxisInverted;
    console.log(`🎯 X-axis inversion: ${this.xAxisInverted ? 'enabled' : 'disabled'}`);
    return this.xAxisInverted;
  }

  updateMotionInput(input) {
    this.updateDeviceOrientationInput({
      rx: input.x || 0,
      ry: input.y || 0,
      rz: input.w || 0
    });
  }

  isMotionControlActive() {
    return this.deviceOrientationEnabled;
  }

  destroy() {
    this.stopAnimation();
    super.destroy();
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onWindowResize);
    
    const canvas = document.getElementById(this.canvasId);
    if (canvas) {
      if (!this.isMobile) {
        canvas.removeEventListener('click', this.onCanvasClick);
      } else {
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
      }
    }
    
    console.log('🧹 TesseractShader destroyed');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TesseractShader;
} else if (typeof window !== 'undefined') {
  window.TesseractShader = TesseractShader;
}

console.log('✅ FIXED TesseractShader ready - Position-based device orientation!');

/**
 * 🪟 GLASS-ATTACHED EFFECT COMPLETE - BOTH ISSUES FIXED!
 * 
 * ✅ ISSUE 1 FIXED: Gravity as POSITION control (not velocity)
 * - Device orientation → TARGET camera angles
 * - Camera angles = orientation input (direct assignment)
 * - No more continuous rolling - hypercube orientation matches phone orientation!
 * 
 * ✅ ISSUE 2 FIXED: X-axis inversion corrected
 * - invertAxes.pitch = false (was true)
 * - Natural pitch control - tilt phone down → hypercube tilts down
 * 
 * 🎯 Result: Hypercube feels physically attached to the glass window!
 */
