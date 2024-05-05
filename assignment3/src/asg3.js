
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
      gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
    `

// Fragment shader program
var FSHADER_SOURCE =
    `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
      gl_FragColor = u_FragColor;
    }
    `

let canvas;
let gl;
let a_Position;
let u_FragColor;

let g_globalAngleY = 180;
let g_globalAngleX = 0;
let g_globalAngleZ = 0;

let g_headAngle = 0;
let g_beakAngle = 0;
let g_bodyAngle = 0;
let g_bodyBob = 0;
let g_tailSegAngle = 0;
let g_tailAngle = 0;
let g_leftLegAngle = 0;
let g_rightLegAngle = 0;

let g_headStartAngle = 0;

let g_headAnimation = false;
let g_beakAnimation = false;
let g_bodyAnimation = false;
let g_tailAnimation = false;
let g_tailSegAnimation = false;
let g_leftLegAnimation = false;
let g_rightLegAnimation = false;

let u_ModelMatrix;
let u_GlobalRotateMatrix;

let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragCurrentX = 0, dragCurrentY = 0;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('canvas');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders --> Compile and install shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function addActionFromHTMLUI() {
    
    document.getElementById('angleSliderY').addEventListener('input', function () { g_globalAngleY = this.value; renderAllShapes(); });
    document.getElementById('angleSliderX').addEventListener('input', function () { g_globalAngleX = this.value; renderAllShapes(); });
    document.getElementById('angleSliderZ').addEventListener('input', function () { g_globalAngleZ = this.value; renderAllShapes(); });

    document.getElementById('headSlider').addEventListener('input', function () { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById('beakSlider').addEventListener('input', function () { g_beakAngle = this.value; renderAllShapes(); });
    document.getElementById('bodySlider').addEventListener('input', function () { g_bodyAngle = this.value; renderAllShapes(); });
    document.getElementById('buttSlider').addEventListener('input', function () { g_tailSegAngle = this.value; renderAllShapes(); });
    document.getElementById('tailSlider').addEventListener('input', function () { g_tailAngle = this.value; renderAllShapes(); });
    document.getElementById('leftLegSlider').addEventListener('input', function () { g_leftLegAngle = this.value; renderAllShapes(); });
    document.getElementById('rightLegSlider').addEventListener('input', function () { g_rightLegAngle = this.value; renderAllShapes(); });

    document.getElementById('headAnimationOn').onclick = function () {
        if (!g_headAnimation) {
            g_headAnimation = true;

        }
    };
    document.getElementById('headAnimationOff').onclick = function () {
        if (g_headAnimation) {
            g_headAnimation = false;
        }
    };

    document.getElementById('bodyAnimationOn').onclick = function () {
        if (!g_bodyAnimation) {
            g_bodyAnimation = true;

        }
    };
    document.getElementById('bodyAnimationOff').onclick = function () {
        if (g_bodyAnimation) {
            g_bodyAnimation = false;
        }
    };

    document.getElementById('beakAnimationOn').onclick = function () {
        if (!g_beakAnimation) {
            g_beakAnimation = true;

        }
    };
    document.getElementById('beakAnimationOff').onclick = function () {
        if (g_beakAnimation) {
            g_beakAnimation = false;
        }
    };

    document.getElementById('buttAnimationOn').onclick = function () {
        if (!g_tailSegAnimation) {
            g_tailSegAnimation = true;

        }
    };
    document.getElementById('buttAnimationOff').onclick = function () {
        if (g_tailSegAnimation) {
            g_tailSegAnimation = false;
        }
    };

    document.getElementById('tailAnimationOn').onclick = function () {
        if (!g_tailAnimation) {
            g_tailAnimation = true;

        }
    };
    document.getElementById('tailAnimationOff').onclick = function () {
        if (g_tailAnimation) {
            g_tailAnimation = false;
        }
    };
    
    document.getElementById('leftLegAnimationOn').onclick = function () {
        if (!g_leftLegAnimation) {
            g_leftLegAnimation = true;

        }
    };
    document.getElementById('leftLegAnimationOff').onclick = function () {
        if (g_leftLegAnimation) {
            g_leftLegAnimation = false;
        }
    };

    document.getElementById('rightLegAnimationOn').onclick = function () {
        if (!g_rightLegAnimation) {
            g_rightLegAnimation = true;

        }
    };
    document.getElementById('rightLegAnimationOff').onclick = function () {
        if (g_rightLegAnimation) {
            g_rightLegAnimation = false;
        }
    };
}

function initEventHandlers(canvas) {
    // Initialize the initial drag position
    canvas.onmousedown = function(event) {
        // Store the initial position to calculate dragging movement later
        const x = event.clientX;
        const y = event.clientY;
        const rect = event.target.getBoundingClientRect();

        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            isDragging = true;
            dragStartX = x;
            dragStartY = y;

            // Check for shift key during the mousedown event
            if (event.shiftKey) {
                // Toggle the animation state of the tail and feet
                g_tailAnimation = !g_tailAnimation;
                g_leftLegAnimation = !g_leftLegAnimation;
                g_rightLegAnimation = !g_rightLegAnimation;

                // Immediately render all shapes to reflect the change
                renderAllShapes();
            }
        }
    };

    canvas.onmouseup = function(event) {
        isDragging = false;
        renderAllShapes();
    };

    canvas.onmousemove = function(event) {
        if (isDragging && !event.shiftKey) {
            let factor = 0.5; // Sensitivity factor
            let dx = factor * (event.clientX - dragStartX);
            let dy = factor * (event.clientY - dragStartY);

            // Update the global rotation angles
            g_globalAngleY = (g_globalAngleY + dx) % 360;
            g_globalAngleX = (g_globalAngleX + dy) % 360;

            // Update the initial drag coordinates for continuous rotation
            dragStartX = event.clientX;
            dragStartY = event.clientY;

            renderAllShapes();
        }
    };
}

function click(ev) {
    let x, y;
    [x, y] = convertCoordinatesEventToGL(ev);

    // Check if the shift key is held down during the mouse click
    if (ev.shiftKey) {
        // Toggle the animation state of the tail and feet
        g_tailAnimation = !g_tailAnimation;
        g_leftLegAnimation = !g_leftLegAnimation;
        g_rightLegAnimation = !g_rightLegAnimation;

        // Render all shapes to reflect the change
        renderAllShapes();
        return;
    }
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionFromHTMLUI();
    initEventHandlers(canvas);
    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    // canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngle();
    // console.log(g_seconds);
    renderAllShapes();
    requestAnimationFrame(tick);
}

function updateAnimationAngle() {
    if (g_headAnimation) {
        g_headAngle = 5 * Math.sin(g_seconds * 2 * Math.PI);;
    }
    if (g_beakAnimation) {
        g_beakAngle = 10 * Math.sin(2 * g_seconds);
    }
    if (g_bodyAnimation) {
        g_bodyAngle = 10 * Math.sin(3 * g_seconds);
        g_bodyBob = 5 * Math.sin(6 * g_seconds);
    }
    if (g_tailAnimation) {
        g_tailAngle = (20 * Math.sin(3 * g_seconds));
    }
    if (g_tailSegAnimation) {
        g_tailSegAngle = (5 * Math.sin(2 * g_seconds));
    }
    if (g_leftLegAnimation) {
        g_leftLegAngle = 20 * Math.sin(2 * g_seconds);  
    }
    if (g_rightLegAnimation) {
        g_rightLegAngle = 20 * Math.sin(2 * g_seconds + Math.PI); 
    }
}

function renderAllShapes() {
    // Clear <canvas>
    var startTime = performance.now();

    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0); 
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0); 
    globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the body cube
    var body = new Cube();
    body.color = [0.984, 0.816, 0.324, 1.0];
    body.matrix.translate(-0.25, -0.25, 0.0);
    
    body.matrix.rotate(g_bodyAngle, 0, 0, 1);
    // body.matrix.rotate(g_bodyBob, 1, 0, 0);
    body.matrix.rotate(-2, 1, 0, 0);
    var neckCoords = new Matrix4(body.matrix);
    var tail1 = new Matrix4(body.matrix);
    var leftLegCoord = new Matrix4(body.matrix);
    var rightLegCoord = new Matrix4(body.matrix);
    body.matrix.scale(0.5, 0.5, 0.5);
    body.render();

    var neck = new Cube();
    neck.color = [0.984, 0.816, 0.34, 1.0];
    neck.matrix = neckCoords;
    neck.matrix.rotate(g_headAngle, 0, 0, 1);
    var headCoords = new Matrix4(neck.matrix);
    neck.matrix.scale(0.2, 0.2, 0.2);
    neck.matrix.translate(0.7, 2, 0.001);
    
    neck.render();

    var head = new Cube();
    head.color = [0.984, 0.816, 0.35, 1.0];
    head.matrix = headCoords;
    var beakCoords = new Matrix4(neck.matrix);
    head.matrix.scale(0.35, 0.35, 0.35);
    head.matrix.translate(0.2, 1.6, 0.1);
    head.render();

    var beak = new Cube();
    beak.color = [0.926, 0.904, 0.739, 1.0];
    beak.matrix = beakCoords;
    beak.matrix.scale(1.4, 0.3, 0.8);
    beak.matrix.translate(-0.1, 4.5, 0.8);
    beak.matrix.rotate(-45, 1, 0, 0);
    beak.matrix.rotate(g_beakAngle, 1, 0, 0);
    beak.render();


    var tail = new Cube();
    tail.color = [0.984, 0.82, 0.35, 1.0];
    // tail.color = [1, 0, 0, 1];
    tail.matrix = tail1;
    tail.matrix.scale(0.45, 0.45, 0.45);
    tail.matrix.translate(0.05, 0.03, -0.4);
    tail.matrix.rotate(-2, 75, 0, 1);
    tail.matrix.rotate(g_tailSegAngle, 0.5, 0, 0);
    tail.render();

    var tailTip = new Pyramid(2.0, 1.0, 36);
    tailTip.color = [0.984, 0.816, 0.35, 1.0];
    // tailTip.color = [0.5, 0.5, 0.5, 1.0];
    tailTip.matrix = tail.matrix;
    tailTip.matrix.scale(0.8, 0.8, 0.8);
    tailTip.matrix.rotate(-90, 1, 0.02, 0);
    tailTip.matrix.translate(0.6, 1.0, 0.6);
    tailTip.matrix.rotate(g_tailAngle, 1, 0, 0);
    tailTip.render();

    var leftLeg = new Cube();
    leftLeg.color = [0.8, 0.8, 0.8, 1];
    leftLeg.matrix = leftLegCoord;
    leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0);
    var leftFeetCoord = new Matrix4(leftLeg.matrix);
    leftLeg.matrix.scale(0.1, 0.3, 0.1);
    leftLeg.matrix.translate(0.1, -0.5, -2);
    leftLeg.render();

    var leftFeet = new Cube();
    leftFeet.color = [0.926, 0.904, 0.739, 1.0];
    leftFeet.matrix = leftFeetCoord;
    leftFeet.matrix.scale(0.2, 0.03, 0.3);
    leftFeet.matrix.translate(-0.2, -5.01, -0.01);
    leftFeet.render();

    var rightLeg = new Cube();
    rightLeg.color = [0.8, 0.8, 0.8, 1];
    rightLeg.matrix = rightLegCoord;
    rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0);
    var rightFeetCoord = new Matrix4(rightLeg.matrix);
    rightLeg.matrix.scale(0.1, 0.3, 0.1);
    rightLeg.matrix.translate(3.8, -0.5, -2);
    rightLeg.render();

    var rightFeet = new Cube();
    rightFeet.color = [0.926, 0.904, 0.739, 1.0];
    rightFeet.matrix = rightFeetCoord;
    rightFeet.matrix.scale(0.2, 0.03, 0.3);
    rightFeet.matrix.translate(1.7, -5.01, -0.01);
    rightFeet.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'performance');
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}