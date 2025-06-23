/**
 * Tesseract Tutorial Content Configuration - Updated with Expanded Sections
 * Content-only configuration - hotspots now managed separately in hotspots.js
 */
const TesseractContent = {
  tutorial: {
    id: "tesseract-tutorial",
    title: "TESSERACT Tutorial",
    sections: [
      // Section 1: TESSERACT Overview
      {
        id: 1,
        title: "TESSERACT Overview",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>TESSERACT Overview</h1>
              <p>Welcome to this interactive tutorial on creating a 4D hypercube (tesseract) in TouchDesigner using GLSL shaders. This project demonstrates advanced techniques for 4D rotation, perspective projection, and real-time interaction.</p>
              
              <div class="tip">
                <strong>Pro Tip:</strong> Understanding 4D rotations requires thinking beyond our 3D intuition. We'll break this down step by step!
              </div>
              
              <h3>What We'll Cover:</h3>
              <ul style="margin-left: 2rem; line-height: 1.8;">
                <li><strong>CHOP Networks:</strong> Mouse input processing and rotation control</li>
                <li><strong>4D Mathematics:</strong> Rotation matrices and perspective projection</li>
                <li><strong>GLSL Shaders:</strong> Vertex transformation and SDF rendering</li>
                <li><strong>Interactive Controls:</strong> Real-time parameter manipulation</li>
              </ul>
              
              <a href="https://github.com/TrueFiasco/TouchDesigner-Tutorials/tree/main/Tesseract" target="_blank" class="github-download-btn">
                <svg class="github-logo" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Download Complete Project
              </a>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>Key Resources:</h3>
              <p>This tutorial references concepts from:</p>
              <ul style="margin-left: 2rem; line-height: 1.8;">
                <li><a href="https://en.wikipedia.org/wiki/Tesseract" target="_blank" style="color: #00ffff;">Tesseract mathematics</a></li>
                <li><a href="https://hollasch.github.io/ray4/Four-Space_Visualization_of_4D_Objects.html" target="_blank" style="color: #00ffff;">4D projection techniques</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Rotation_matrix#In_four_dimensions" target="_blank" style="color: #00ffff;">4D rotation matrices</a></li>
                <li><a href="https://en.wikipedia.org/wiki/Rotation_matrix" target="_blank" style="color: #00ffff;">3D rotation matrices</a></li>
                <li><a href="https://iquilezles.org/articles/distfunctions2d/" target="_blank" style="color: #00ffff;">Inigo Quilez's SDF functions</a></li>
                <li><a href="https://docs.derivative.ca/GLSL_TOP" target="_blank" style="color: #00ffff;">Writing GLSL TOPs in TouchDesigner</a></li>
              </ul>
              
              <div style="margin-top: 2rem; padding: 1rem; background: rgba(0, 255, 255, 0.1); border-radius: 8px; border: 1px solid rgba(0, 255, 255, 0.3);">
                <h4 style="color: #00ffff; margin: 0 0 0.5rem 0;">📂 Project Files</h4>
                <p style="font-size: 0.9rem; margin: 0; line-height: 1.4;">All code, shaders, and TouchDesigner project files are available in our GitHub repository. Click individual download buttons throughout the tutorial to view specific files.</p>
              </div>
            `
          }
        },
        background: {
          image: "assets/images/network_overview.png",
          aspectRatio: "3615:1097",
          transition: { type: "slideRight", offset: { x: 1.0, y: 0 } }
        }
      },

      // Section 2: The CHOP Network
      {
        id: 2,
        title: "The CHOP Network",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>The CHOP Network</h1>
              
              <h3>Understanding Our Input Strategy</h3>
              <p>Our CHOP network processes mouse input using a <strong>dual-input approach</strong> that creates natural, responsive interaction:</p>

              <h4>1. Mouse Position as Gentle Force</h4>
              <p>We use the mouse position as a constant, gentle force. Think of it like holding a steering wheel - the further you turn it, the more constant pressure is applied. This creates <strong>acceleration</strong> rather than direct movement. When you hold the mouse in one position, it continuously applies a small rotational force.</p>

              <h4>2. Mouse Velocity for Quick Changes</h4>
              <p>We capture how fast you're moving the mouse using the Slope CHOP. This gives us <strong>immediate responsiveness</strong> when you want to quickly change direction. Velocity input provides the "snap" while position provides the "drift".</p>

              <h4>3. Combining Both Inputs</h4>
              <p>We add velocity + position-based acceleration together. This gives us both immediate response AND continuous gentle movement. Result: Natural physics-like interaction that feels intuitive.</p>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>Why This Approach Works</h3>
              
              <h4>Traditional Direct Mapping Problems:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li>Direct mouse position → rotation angle feels robotic</li>
                <li>No momentum or natural feel</li>
                <li>Difficult to make fine adjustments</li>
              </ul>

              <h4>Our Physics-Based Approach:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li>Feels like you're "pushing" the hypercube through 4D space</li>
                <li>Natural momentum and inertia</li>
                <li>Both quick gestures and precise control possible</li>
              </ul>

              <h3>Input Device Flexibility</h3>
              <p>We didn't have to use the mouse as our input - we could have used any input devices like:</p>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Xbox Controller:</strong> Analog sticks for smooth rotation</li>
                <li><strong>USB Joystick:</strong> Traditional flight stick input</li>
                <li><strong>Kinect:</strong> Body tracking for gesture control</li>
                <li><strong>Leap Motion:</strong> Hand tracking and finger gestures</li>
                <li><strong>MIDI Device:</strong> Knobs and faders for precise control</li>
              </ul>
            `
          }
        },
        background: {
          image: "assets/images/chop_network.png",
          aspectRatio: "1852:571",
          transition: { type: "slideRight", offset: { x: 1.0, y: 0 } }
        }
      },

      // Section 3: Input Data 1: Mouse UV Control
      {
        id: 3,
        title: "Input Data 1: Mouse UV Control",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Input Data 1: Mouse UV Control</h1>
              <p>Using panel CHOP to get mouse UV coordinates, selecting <span class="highlight">rollu</span> and <span class="highlight">rollv</span> or <span class="highlight">tx ty</span> from mousein to control the Y and X axis respectively.</p>

              <h3>Key CHOPs:</h3>
              <ul style="margin-left: 2rem; line-height: 1.8;">
                <li><strong>panel1:</strong> Captures mouse UV coordinates</li>
                <li><strong>mousein1:</strong> Raw mouse input data</li>
                <li><strong>select1:</strong> Filters specific channels</li>
              </ul>

              <h3>The Coordinate Flip Explained</h3>
              <p><strong>Why U controls Y-axis and V controls X-axis:</strong></p>
              
              <p>This might seem backwards at first, but it's actually the standard in computer graphics:</p>

              <div style="background: rgba(0, 255, 255, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>Mouse Movement vs Rotation Mapping:</strong><br>
                Mouse U (horizontal movement) → Y-axis rotation (yaw)<br>
                Mouse V (vertical movement) → X-axis rotation (pitch)
              </div>

              <div class="tip">
                <strong>Remember:</strong> UV coordinates give us normalized 0-1 values, perfect for controlling rotations!
              </div>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>Think Like a Flight Simulator:</h3>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li>Moving mouse <strong>left/right</strong> (U) makes object <strong>yaw</strong> around Y-axis</li>
                <li>Moving mouse <strong>up/down</strong> (V) makes object <strong>pitch</strong> around X-axis</li>
                <li>This matches how we intuitively expect 3D objects to respond to mouse input</li>
              </ul>

              <h3>UV Coordinate System:</h3>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li>U = 0 to 1 (left to right across screen)</li>
                <li>V = 0 to 1 (top to bottom down screen)</li>
                <li>These normalized coordinates are perfect for rotation control</li>
              </ul>

              <h3>Panel vs MouseIn CHOP Choice:</h3>
              <p><strong>Panel CHOP:</strong> Only tracks mouse within specific TouchDesigner panel - gives us contained interaction within our interface.</p>
              <p><strong>MouseIn CHOP:</strong> Tracks mouse across entire desktop/monitor - useful for global control.</p>
              
              <p>For this project, Panel gives us contained interaction within our interface.</p>
            `
          }
        },
        background: {
          image: "assets/images/mouse_uv_control.png",
          aspectRatio: "1852:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 4: Rangeling CHOPs 1: Mouse Velocity
      {
        id: 4,
        title: "Rangeling CHOPs 1: Mouse Velocity",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rangeling CHOPs 1: Mouse Velocity</h1>
              <p>I increase the responsive part of the interaction, which is driven by mouse velocity. We use a <span class="highlight">slope</span> CHOP to get velocity and a <span class="highlight">filter</span> to give this a more natural feel when you stop moving the mouse.</p>

              <h3>The Math→Slope→Filter Chain</h3>

              <h4>1. Math3 CHOP (Pre-amplification):</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Purpose:</strong> Increase the effect of mouse movement before calculating velocity</li>
                <li><strong>Why First:</strong> We want to amplify the position changes, not the velocity itself</li>
                <li><strong>Example:</strong> If we multiply by 3, a small mouse movement becomes a larger position change</li>
                <li><strong>Result:</strong> The Slope CHOP then calculates velocity from these amplified position changes</li>
              </ul>

              <h4>2. Slope1 CHOP (Velocity Calculation):</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Process:</strong> Takes position data and calculates change per frame</li>
                <li><strong>Formula:</strong> velocity = current_position - previous_position</li>
                <li><strong>Frame-Rate Dependent:</strong> Calculated every frame for smooth motion</li>
                <li><strong>Output:</strong> Raw velocity data that can be quite jittery</li>
              </ul>

              <div class="tip">
                <strong>Pro Tip:</strong> Velocity-based interaction feels more intuitive than direct position mapping!
              </div>
            `
          },
          right: {
            type: "html",
            content: `
              <h4>3. Filter1 CHOP (Smoothing):</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Purpose:</strong> Smooth out the jittery velocity data</li>
                <li><strong>Why Necessary:</strong> Raw velocity can have sudden spikes and drops</li>
                <li><strong>Natural Feel:</strong> Creates momentum-like behavior</li>
                <li><strong>When You Stop Moving:</strong> Velocity gradually decreases rather than instantly stopping</li>
              </ul>

              <h3>How Slope CHOP Works</h3>
              <p>The <strong>Slope CHOP</strong> is a powerful tool for converting position data into velocity data:</p>
              
              <h4>Process:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Buffer Last Frame:</strong> Stores the mouse position from the previous frame</li>
                <li><strong>Compare Positions:</strong> Takes current frame position minus last frame position</li>
                <li><strong>Calculate Velocity:</strong> The difference between these two positions becomes our velocity</li>
                <li><strong>Frame Rate Dependent:</strong> Velocity is calculated per frame, giving us smooth motion data</li>
              </ul>
              
              <p>This converts two static positions into dynamic velocity information, essential for responsive interaction.</p>
            `
          }
        },
        background: {
          image: "assets/images/mouse_velocity.png",
          aspectRatio: "1852:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 5: Rangeling CHOPs 2: Centering and Scaling
      {
        id: 5,
        title: "Rangeling CHOPs 2: Centering and Scaling",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rangeling CHOPs 2: Centering and Scaling</h1>
              <p>I use a <span class="highlight">math</span> CHOP to center the pre-normalized mouse UV from 0-1 to -0.5 to 0.5 with -0.5 pre-add, then make it a small value to create gentle interaction using this input as a gentle constant force rather than sudden bursts from mouse velocity.</p>

              <h3>Converting UV to Centered Force</h3>
              
              <h4>Step 1: Centering the UV Coordinates</h4>
              <div style="background: rgba(0, 255, 255, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                Original UV: 0 to 1 (mouse across screen)<br>
                Add -0.5: -0.5 to 0.5 (centered around zero)
              </div>

              <h4>Why Center Around Zero:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Zero Position = No Force:</strong> When mouse is in center, no rotation force applied</li>
                <li><strong>Positive/Negative Forces:</strong> Left/up creates negative force, right/down creates positive</li>
                <li><strong>Intuitive Control:</strong> Push away from center to rotate in that direction</li>
              </ul>

              <h4>Step 2: Scaling Down for Gentle Interaction</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Small Values:</strong> We scale the centered values down (multiply by small number like 0.1)</li>
                <li><strong>Gentle Constant Force:</strong> Creates subtle, continuous pressure rather than aggressive movement</li>
                <li><strong>Fine Control:</strong> Allows for precise adjustments</li>
              </ul>

              <p>Since it's a force, I use <span class="highlight">speed2</span> to convert acceleration into velocity.</p>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>The Critical Speed Limiting Problem</h3>
              
              <h4>Why We MUST Clamp the Speed:</h4>
              
              <p><strong>Without Speed Limiting:</strong></p>
              <div style="background: rgba(255, 100, 100, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-family: monospace;">
                Frame 1: Velocity = 0.1<br>
                Frame 2: Velocity = 0.2 (acceleration added)<br>
                Frame 3: Velocity = 0.3 (acceleration added again)<br>
                Frame 4: Velocity = 0.4 (keeps growing...)<br>
                ...<br>
                Frame 100: Velocity = 10.0 (spinning uncontrollably!)
              </div>

              <p><strong>The Physics Problem:</strong> Constant force creates constant <strong>acceleration</strong>, which means velocity keeps <strong>increasing every frame</strong> - without limits, velocity approaches infinity resulting in an uncontrollable spinning hypercube. <strong>Our Simple Solution:</strong> We use a <strong>Speed CHOP with Maximum</strong> to clamp velocity to a reasonable range rather than implementing complex physics. We chose simplicity over realism - while we could use damping or friction/resistance, simple clamping was sufficient for this project. This approach is easier to understand and debug, provides predictable behavior, requires less computational overhead, and meets our artistic goals perfectly.</p>
            `
          }
        },
        background: {
          image: "assets/images/centering_and_scaling.png",
          aspectRatio: "1852:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 6: Rangeling CHOPs 3: Angular Velocity
      {
        id: 6,
        title: "Rangeling CHOPs 3: Angular Velocity",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rangeling CHOPs 3: Angular Velocity</h1>
              <p>Adding the velocity from mouse movement and position, we get the current total angular velocity which we give to the <span class="highlight">speed3</span> CHOP. This updates every frame to give us the current angular position for our rotation matrix.</p>

              <h3>Combining Our Two Input Sources</h3>
              
              <h4>Math2 CHOP - The Velocity Combiner:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Input 1:</strong> Velocity from mouse movement (immediate response)</li>
                <li><strong>Input 2:</strong> Acceleration from mouse position (gentle constant force)</li>
                <li><strong>Operation:</strong> Simple addition - combines both influences</li>
                <li><strong>Result:</strong> Total angular velocity that has both snap and drift</li>
              </ul>

              <h4>Speed3 CHOP - The Position Integrator:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Purpose:</strong> Convert angular velocity into angular position</li>
                <li><strong>Process:</strong> Accumulates velocity over time to get total rotation</li>
                <li><strong>Integration:</strong> position += velocity * time_delta each frame</li>
                <li><strong>Output:</strong> Actual rotation angles for our 4D rotation matrices</li>
              </ul>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>The Critical 2π Limitation</h3>
              
              <p><strong>Why Limit to 2π (360 degrees):</strong> Rotations are cyclical - 2π radians = 360° = full circle. Without limits, values could grow to thousands of radians. When we reach 2π, we wrap back to 0 for clean cycling.</p>

              <div style="background: rgba(255, 100, 100, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-family: monospace;">
                Without Wrapping: ... 6.1, 6.2, 6.3, 6.4 ... (smooth)<br>
                With Wrapping: ... 6.1, 6.2, 0.1, 0.2 ... (sudden jump!)
              </div>

              <p><strong>Why No Filters After This Point:</strong> When 6.28 wraps to 0, filters see this as a huge negative change and try to "smooth" it by creating intermediate values. This creates zig-zag oscillation instead of clean wrapping. Solution: Accept the clean wrap and don't filter past this point.</p>
            `
          }
        },
        background: {
          image: "assets/images/angular_velocity.png",
          aspectRatio: "1852:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 7: Rangeling CHOPs 4: Mouse Wheel
      {
        id: 7,
        title: "Rangeling CHOPs 4: Mouse Wheel",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rangeling CHOPs 4: Mouse Wheel</h1>
              <p>Selecting mouse wheel from the mousein CHOP, filtering it in a few different ways. No real rhyme or reason - I wanted it to feel like it had weight, so I used one long box filter, wanted it to take longer to stop so used a long left half box filter first, followed by a short Gaussian to smooth anything else, then one final box filter.</p>

              <div class="tip">
                <strong>Pro Tip:</strong> If you ever want to see how a filter is affecting your input, try using a <span class="highlight">trail</span> CHOP to compare the input and output of the filter CHOP.
              </div>

              <p>This creates a weighted, inertial feel for the mouse wheel input that feels natural and responsive.</p>
            `
          },
          right: {
            type: "html",
            content: `
              <img src="assets/images/filter_trail_example.png" alt="Filter Trail Example" class="trail-image" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
            `
          }
        },
        background: {
          image: "assets/images/mouse_wheel.png",
          aspectRatio: "1852:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 8: Rangeling CHOPs 5: Merging and Null
      {
        id: 8,
        title: "Rangeling CHOPs 5: Merging and Null",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rangeling CHOPs 5: Merging and Null</h1>
              <p>Merging everything together and ending it with a null.</p>

              <div class="tip">
                <strong>Golden Rule:</strong> Always end your CHOP network with a null and try to merge as much together as makes sense.
              </div>

              <p>This creates clean, organized networks that are easier to debug and maintain. The null acts as a clean output point and prevents unexpected behavior from downstream connections.</p>

              <h3>Final Output:</h3>
              <p>Our CHOP network now outputs clean rotation values ready for our GLSL shaders!</p>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>Network Organization Benefits</h3>
              <p>Using nulls and proper merging provides several advantages:</p>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Clean Outputs:</strong> Single connection point for downstream operators</li>
                <li><strong>Easier Debugging:</strong> Clear signal flow and isolation points</li>
                <li><strong>Performance:</strong> Reduced connections and cleaner data flow</li>
                <li><strong>Maintainability:</strong> Easier to modify and expand the network</li>
              </ul>
            `
          }
        },
        background: {
          image: "assets/images/merging_and_null.png",
          aspectRatio: "1852:571",
          transition: { type: "slideRight", offset: { x: 0.1, y: 0 } }
        }
      },

      // Section 9: Input Data 2: Saved Data from TSV
      {
        id: 9,
        title: "Input Data 2: Saved Data from TSV",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Input Data 2: Saved Data from TSV</h1>
              <p>In TouchDesigner we can input saved data in loads of ways. Here I've used a TSV file saved from a previous project in 2021 and loaded with a <span class="highlight">table DAT</span>, but equally it could have been saved as a waveform and opened with the <span class="highlight">filein CHOP</span>, or as a texture where tx, ty, tz, tw are stored as RGBA.</p>

              <h3>Understanding Euler Cycles</h3>
              
              <h4>What is an Euler Cycle?</h4>
              <p>An Euler cycle is a path through a graph that visits every <strong>edge</strong> exactly once and returns to the starting point.</p>

              <h4>For Our Hypercube:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>16 vertices</strong> in 4D space</li>
                <li><strong>32 edges</strong> connecting these vertices</li>
                <li><strong>One continuous path</strong> that traces every edge exactly once</li>
                <li><strong>Returns to start</strong> creating a closed loop</li>
              </ul>

              <h3>Why Euler Cycles Are Perfect for Hypercubes</h3>
              
              <h4>Traditional Wireframe Problems:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>32 separate line segments</strong> - inefficient to render</li>
                <li><strong>Complex connectivity</strong> - hard to manage which lines connect where</li>
                <li><strong>GPU Inefficiency</strong> - many separate draw calls</li>
              </ul>

              <div class="tip">
                <strong>Important:</strong> Save as TSV so it will open as a table in TouchDesigner!
              </div>
            `
          },
          right: {
            type: "html",
            content: `
              <h4>Euler Cycle Solution:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Single continuous line</strong> that traces the entire hypercube structure</li>
                <li><strong>One draw call</strong> - much more efficient</li>
                <li><strong>Guaranteed completeness</strong> - every edge of the hypercube gets drawn</li>
                <li><strong>Clean loops</strong> - perfect for continuous animation</li>
              </ul>

              <h3>My Manual Calculation Process</h3>
              
              <h4>The Pen and Paper Method:</h4>
              <ol style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Drew the 16 vertices</strong> of a hypercube with their 4D coordinates</li>
                <li><strong>Mapped all 32 edges</strong> - which vertices connect to which</li>
                <li><strong>Found valid path</strong> that visits each edge exactly once</li>
                <li><strong>Verified the cycle</strong> - checked that it returns to start</li>
                <li><strong>Saved as TSV</strong> - recorded the sequence of vertices</li>
              </ol>

              <h4>Why This Was Challenging:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>4D visualization</strong> is mentally difficult</li>
                <li><strong>32 edges</strong> to track - easy to miss connections</li>
                <li><strong>Must be continuous</strong> - can't have gaps in the path</li>
                <li><strong>Must close</strong> - last vertex must connect back to first</li>
              </ul>

              <h3>Previous Laser Project Context</h3>
              <p><strong>The Original Use Case:</strong> Laser Projectors need continuous paths for efficiency. I created reactive hypercubes with audio-responsive 4D visualizations for real-time performance. The same Euler cycle works for any hypercube visualization - that's why I could reuse this data.</p>

              <h3>Alternative Data Storage Methods</h3>
              <p><strong>TSV File (Our Choice):</strong> Table DAT for easy inspection and debugging, human readable vertex sequence, easy export from any spreadsheet program.</p>
              
              <p><strong>Other Options We Could Use:</strong> Filein CHOP for waveform data, Texture Storage with RGBA channels as 4D coordinates, Direct GLSL with hardcoded vertices, or DAT to CHOP conversion for processing.</p>
            `
          },
          right: {
            type: "widget",
            widget: {
              type: "tsv-table",
              source: "https://raw.githubusercontent.com/TrueFiasco/TouchDesigner-Tutorials/main/Tesseract/euler_cycle.tsv",
              title: "Euler Cycle TSV Data",
              controls: ["fullscreen", "copy", "download"],
              githubPath: "Tesseract/euler_cycle.tsv"
            }
          }
        },
        background: {
          image: "assets/images/euler_in.png",
          aspectRatio: "1456:478",
          transition: { type: "slideRight", offset: { x: 1.0, y: 0 } }
        }
      },

      // Section 10: Rotation Vertex GLSL
      {
        id: 10,
        title: "Rotation Vertex GLSL",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Rotation Vertex GLSL</h1>
              <p>We're using rotations from our CHOP network. In our uniforms we need to assign them at the start of the shader and add them to our vector parameter.</p>

              <h3>Complete GLSL Breakdown</h3>
              
              <h4>UNIFORMS - Data passed from TouchDesigner</h4>
              <div style="background: rgba(0, 255, 255, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-family: monospace;">
                uniform vec3 rotWXYZ;    // 4D rotations: W-X, W-Y, W-Z planes<br>
                uniform vec3 rotXYZ;     // 3D rotations: X, Y, Z axes<br>
                // sTD2DInputs[0] is automatically available - our vertex texture
              </div>

              <h4>Uniform Explanation:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>rotWXYZ:</strong> Three 4D rotation angles for W-X, W-Y, and W-Z planes</li>
                <li><strong>rotXYZ:</strong> Three standard 3D rotation angles for X, Y, and Z axes</li>
                <li><strong>sTD2DInputs[0]:</strong> TouchDesigner automatically provides input textures</li>
                <li><strong>Total of 6 rotations:</strong> 3 for 4D space + 3 for 3D space = full 4D control</li>
              </ul>

              <h3>The Six 4D Rotation Functions</h3>
              <p>We have 6 rotation matrices as helper functions - 3 for 4D rotations and 3 for standard 3D rotations embedded in 4D space.</p>
            `
          },
          right: {
            type: "widget",
            widget: {
              type: "code-viewer",
              source: "https://raw.githubusercontent.com/TrueFiasco/TouchDesigner-Tutorials/main/Tesseract/vert_rotation_pixel.frag",
              title: "Vertex Rotation GLSL",
              language: "glsl",
              controls: ["fullscreen", "copy", "download"],
              githubPath: "Tesseract/vert_rotation_pixel.frag"
            }
          }
        },
        background: {
          image: "assets/images/rotate_vertex_glsl.png",
          aspectRatio: "1920:571",
          transition: { type: "slideRight", offset: { x: 1.0, y: 0 } }
        }
      },

      // Section 11: Perspective GLSL
      {
        id: 11,
        title: "Perspective GLSL",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Perspective GLSL</h1>
              <p>We have a few float uniforms in the perspective GLSL to give control on the 4D perspective and 3D perspective, to flatten it to 2D.</p>

              <h3>Complete Perspective Pipeline</h3>
              
              <h4>UNIFORMS - Perspective Controls</h4>
              <div style="background: rgba(0, 255, 255, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-family: monospace;">
                uniform float fov;          // Field of view in degrees (suggested: 60)<br>
                uniform vec2 resolution;    // Output resolution (suggested: 33x1)<br>
                uniform float uPerspective; // 4D perspective strength (suggested: 2.3)<br>
                uniform float cameraZ;      // Camera Z position (suggested: -30)
              </div>

              <h4>Perspective Control Uniforms:</h4>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>fov:</strong> Field of view angle for 3D perspective projection</li>
                <li><strong>resolution:</strong> Our texture resolution (33 pixels wide for 33 vertices)</li>
                <li><strong>uPerspective:</strong> Controls how strongly 4D depth affects 3D projection</li>
                <li><strong>cameraZ:</strong> Virtual camera position along Z axis</li>
              </ul>

              <h3>The Projection Pipeline Summary</h3>
              <p><strong>Complete 4D → 2D Transformation:</strong></p>
              <ol style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>4D Rotation:</strong> Previous shader rotated our 4D vertices</li>
                <li><strong>4D → 3D:</strong> Multiply XYZ by (W + perspective_strength)</li>
                <li><strong>3D Camera:</strong> Translate relative to virtual camera position</li>
                <li><strong>3D → 2D:</strong> Divide X,Y by Z with focal length scaling</li>
                <li><strong>Screen Mapping:</strong> Normalize to 0-1 range for final display</li>
              </ol>
            `
          },
          right: {
            type: "widget",
            widget: {
              type: "code-viewer",
              source: "https://raw.githubusercontent.com/TrueFiasco/TouchDesigner-Tutorials/main/Tesseract/vert_perspective_pixel.frag",
              title: "Vertex Perspective GLSL",
              language: "glsl",
              controls: ["fullscreen", "copy", "download"],
              githubPath: "Tesseract/vert_perspective_pixel.frag"
            }
          }
        },
        background: {
          image: "assets/images/prespective_glsl.png",
          aspectRatio: "1920:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 12: 2D Points to 2D Lines
      {
        id: 12,
        title: "2D Points to 2D Lines",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>2D Points to 2D Lines</h1>
              <p>Preparing my 2D points position into a lines points position utilizing the Euler cycle. Using RG for the lines first point XY position and GA. I'm sure this could have been done in the perspective shader but it was easier to do this.</p>

              <p>Being familiar with the <span class="highlight">transform TOP</span> and knowing to set it to <span class="highlight">repeat</span> so the first point connects to the last point.</p>

              <h3>Line Generation:</h3>
              <ul style="margin-left: 2rem; line-height: 1.8;">
                <li>Convert point cloud to line segments</li>
                <li>Use Euler cycle for proper connectivity</li>
                <li>Transform TOP with repeat mode</li>
                <li>Closed loop formation</li>
              </ul>

              <h3>Blur Result</h3>
              <p>When we blur from one pixel to the next, we're interpolating linearly between the values using a box filter in the Blur TOP.</p>
              
              <p>This creates smooth transitions between line segments and helps with antialiasing in the final render. The blur operation essentially averages neighboring pixel values, creating smooth gradients that improve visual quality.</p>
            `
          },
          right: {
            type: "html",
            content: `
              <img src="assets/images/blur.png" alt="Blur Result" class="blur-image" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
            `
          }
        },
        background: {
          image: "assets/images/2d_points_to_2d_lines.png",
          aspectRatio: "1920:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 13: SDF Uneven Capsule
      {
        id: 13,
        title: "SDF Uneven Capsule",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>SDF Uneven Capsule</h1>
              <p>Again I was able to reuse a component I made in 2022 which would take in a texture where each pixel represents a capsule with two 2D points to be rendered in the SDF.</p>

              <p>This uses <a href="https://iquilezles.org/articles/distfunctions2d/" target="_blank" style="color: #00ffff;">Inigo Quilez's SDF functions</a> for uneven capsules.</p>

              <h3>Understanding Signed Distance Fields (SDF)</h3>
              <p>A Signed Distance Field tells you the shortest distance from any point in space to the surface of a shape. For our lines: "How far is this pixel from the nearest line?"</p>

              <p><strong>Key Concepts:</strong> <strong>p</strong> = current pixel (test point), <strong>pa/pb</strong> = line endpoints, distance = 0 means "on line", distance > 0 means "away from line".</p>

              <h3>How the SDF Algorithm Works</h3>
              <p><strong>Step 1:</strong> <code>p -= pa; pb -= pa</code> - Move everything so line starts at origin, simplifying all math.</p>
              
              <p><strong>Step 2:</strong> <code>h = dot(pb,pb); q = projections/h</code> - Calculate line length squared and project test point both along and perpendicular to line.</p>
              
              <p><strong>Step 3:</strong> <code>b = ra-rb; c = vec2(sqrt(h-b*b),b)</code> - Determine radius change and capsule geometry.</p>
              
              <p><strong>Step 4:</strong> <code>k = cro(c,q)</code> - Cross product determines which part of capsule we're closest to (start cap, end cap, or main body).</p>
              
              <p><strong>Step 5:</strong> Return distance using optimized formula for each case.</p>

              <h3>TouchDesigner Integration</h3>
              <p><strong>vUV.st</strong> = texture coordinates, <strong>sTD2DInputs[0]</strong> = input texture, <strong>textureSize()</strong> = how many line segments, <strong>texelFetch()</strong> = exact line data, <strong>minDist = min(minDist, d)</strong> = keep shortest distance to any line.</p>

              <p><strong>Why SDF:</strong> Smooth anti-aliasing, GPU efficient parallel calculation, flexible for effects, mathematically precise curves.</p>
            `
          },
          right: {
            type: "widget",
            widget: {
              type: "code-viewer",
              source: "https://raw.githubusercontent.com/TrueFiasco/TouchDesigner-Tutorials/main/Tesseract/line_mindist_pixel.frag",
              title: "SDF Line Min Distance GLSL",
              language: "glsl",
              controls: ["fullscreen", "copy", "download"],
              githubPath: "Tesseract/line_mindist_pixel.frag"
            }
          }
        },
        background: {
          image: "assets/images/sdf_uneven_capsule.png",
          aspectRatio: "1920:571",
          transition: { type: "slideLeft", offset: { x: 0, y: 0 } }
        }
      },

      // Section 14: Post Processing
      {
        id: 14,
        title: "Post Processing",
        layout: "split",
        content: {
          left: {
            type: "html",
            content: `
              <h1>Post Processing</h1>
              <p>Using limits, ramps, threshold and lookups to create an interesting result.</p>

              <h3>Post Effects Chain:</h3>
              <ul style="margin-left: 2rem; line-height: 1.8;">
                <li><strong>Limits:</strong> Clamp value ranges</li>
                <li><strong>Ramps:</strong> Smooth gradients</li>
                <li><strong>Threshold:</strong> Binary decisions</li>
                <li><strong>Lookups:</strong> Color mapping</li>
              </ul>

              <p>These effects transform the raw SDF output into a visually appealing final result with proper contrast and color.</p>
            `
          },
          right: {
            type: "html",
            content: `
              <h3>Effect Purpose</h3>
              <p>Each post-processing step serves a specific purpose in creating the final visual:</p>
              <ul style="margin-left: 1rem; line-height: 1.8;">
                <li><strong>Limits:</strong> Prevent over-bright or under-dark values</li>
                <li><strong>Ramps:</strong> Create smooth color transitions</li>
                <li><strong>Threshold:</strong> Create sharp cutoffs for specific effects</li>
                <li><strong>Lookups:</strong> Apply color palettes and artistic looks</li>
              </ul>
              
              <p>The combination of these effects allows for fine-tuned control over the final appearance of our 4D hypercube visualization.</p>
            `
          }
        },
        background: {
          image: "assets/images/post_processing.png",
          aspectRatio: "1920:571",
          transition: { type: "slideRight", offset: { x: 1.0, y: 0 } }
        }
      }
    ]
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TesseractContent;
} else if (typeof window !== 'undefined') {
  window.TesseractContent = TesseractContent;
}

/**
 * Validate content structure for debugging
 */
function validateContentStructure() {
  console.log('🔍 Validating TesseractContent structure...');
  
  if (!window.TesseractContent) {
    console.error('❌ TesseractContent not loaded');
    return false;
  }
  
  const content = window.TesseractContent;
  
  if (!content.tutorial) {
    console.error('❌ Missing tutorial object');
    return false;
  }
  
  if (!content.tutorial.sections || !Array.isArray(content.tutorial.sections)) {
    console.error('❌ Missing or invalid sections array');
    return false;
  }
  
  const sections = content.tutorial.sections;
  console.log(`✅ Found ${sections.length} sections`);
  
  // Validate each section
  sections.forEach((section, index) => {
    if (!section.id || !section.title || !section.layout || !section.content) {
      console.warn(`⚠️ Section ${index + 1} missing required properties:`, section);
    } else {
      console.log(`✅ Section ${section.id}: ${section.title}`);
    }
  });
  
  console.log('✅ Content structure validation complete');
  console.log('📍 Using GitHub repository URLs for widgets');
  return true;
}

// Make validation function globally available
if (typeof window !== 'undefined') {
  window.validateContentStructure = validateContentStructure;
}
