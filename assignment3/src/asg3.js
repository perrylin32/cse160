
var VSHADER_SOURCE =
    `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix *  u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        // gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
    `

// Fragment shader program
var FSHADER_SOURCE =
    `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {

        if (u_whichTexture == 0) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 3){
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1);
        }

    }
    `


// Shader and general global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;

// Camera Control variables
var g_eye = new Vector3([0, 0, -3]);
var g_at = new Vector3([0, 0, -100]);
var g_up = new Vector3([0, 1, 0]);
var fov = 60;
var g_camera = new Camera();
g_camera.eye.set(g_eye);

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMap() {
    var body = new Cube();
    for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 32; y++) {
            if (x == 0 || x == 31 || y == 0 || y == 31) {
                body.color = [1, 0.7, 0.5, 1.0];
                if (x % 3 == 0) {
                    body.textureNumber = 0;
                } else if (x % 3 == 1) {
                    body.textureNumber = 2;
                } else {
                    body.textureNumber = 3;
                }
                body.matrix.setTranslate(0, -0.75, 0);
                body.matrix.scale(0.8, 0.8, 0.8);
                body.matrix.translate(x - 16, 0, y - 16);
                body.render();
            }
        }
    }
}

// function drawMap() {
//     var body = new Cube();
//     for (var i = 0; i < 2; i++) {
//         for (var x = 0; x < 32; x++) {
//             for (var y = 0; y < 32; y++) {
//                 body.color = [0.8, 1.0, 1.0, 1.0];
//                 body.matrix.setTranslate(0, -0.75, 0);
//                 body.matrix.scale(0.4, 0.4, 0.4);
//                 body.matrix.translate(x - 16, 0, y - 16);
//                 body.render();
//             }
//         }
//     }
// }

// Assignment 2: Blocky Animal Variables
let g_globalAngleY = 180;
let g_globalAngleX = 0;
let g_globalAngleZ = 0;

let g_headAngle = 0;
let g_beakAngle = 0;
let g_bodyAngle = 0;
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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log("Failed to get the storage location of a_UV");
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

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }


    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function addActionFromHTMLUI() {

    // Camera Control
    document.getElementById('angleSliderY').addEventListener('input', function () { g_globalAngleY = this.value; renderAllShapes(); });
    document.getElementById('angleSliderX').addEventListener('input', function () { g_globalAngleX = this.value; renderAllShapes(); });
    document.getElementById('angleSliderZ').addEventListener('input', function () { g_globalAngleZ = this.value; renderAllShapes(); });

    // Body Sliders
    document.getElementById('headSlider').addEventListener('input', function () { g_headAngle = this.value; renderAllShapes(); });
    document.getElementById('beakSlider').addEventListener('input', function () { g_beakAngle = this.value; renderAllShapes(); });
    document.getElementById('bodySlider').addEventListener('input', function () { g_bodyAngle = this.value; renderAllShapes(); });
    document.getElementById('buttSlider').addEventListener('input', function () { g_tailSegAngle = this.value; renderAllShapes(); });
    document.getElementById('tailSlider').addEventListener('input', function () { g_tailAngle = this.value; renderAllShapes(); });
    document.getElementById('leftLegSlider').addEventListener('input', function () { g_leftLegAngle = this.value; renderAllShapes(); });
    document.getElementById('rightLegSlider').addEventListener('input', function () { g_rightLegAngle = this.value; renderAllShapes(); });

    // Animations
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
    canvas.onmousedown = function (event) {
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

    canvas.onmouseup = function (event) {
        isDragging = false;
        renderAllShapes();
    };

    canvas.onmousemove = function (event) {
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

// Keyboard controls
function keydown(ev) {
    if (ev.keyCode == 81) {
        // Q: Camera turns left
        g_camera.panLeft(10);
    } else if (ev.keyCode == 69) {
        // E: Camera turns right
        g_camera.panRight(10);
    } else if (ev.keyCode == 87) {
        // W: Move up
        g_camera.moveForward(1);
    } else if (ev.keyCode == 65) {
        // A: Move left
        g_camera.moveLeft(1);
    } else if (ev.keyCode == 83) {
        // S: Move back
        g_camera.moveBack(1);
    } else if (ev.keyCode == 68) {
        // D: Move right
        g_camera.moveRight(1);
    }

    renderAllShapes();
    console.log(ev.keyCode);
}

// Texture code
function initTextures() {
    var image0 = new Image();  // Create the image object for the first texture
    image0.onload = function () { sendImageToTexture0(image0); };
    image0.src = '../resources/flower-1.jpg'; // Set source for the first texture

    var image1 = new Image();  // Create the image object for the second texture
    image1.onload = function () { sendImageToTexture1(image1); };
    // image1.src = '../resources/uv_grid_opengl.jpg'; 
    image1.src = '../resources/psyduck.jpg'; 
}

function sendImageToTexture0(image) {
    var texture = gl.createTexture();  // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object for texture 0');
        return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
    console.log('Finished loading texture 0');
}

function sendImageToTexture1(image) {
    var texture = gl.createTexture();  // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object for texture 1');
        return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, 1);
    console.log('Finished loading texture 1');
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

// Draw blocky animal duck
function drawDuck() {

    var body = new Cube();
    body.color = [0.984, 0.816, 0.324, 1.0];
    body.textureNumber = 3;
    body.matrix.translate(-0.25, -0.25, 0.0);
    body.matrix.rotate(g_bodyAngle, 0, 0, 1);
    body.matrix.rotate(-2, 1, 0, 0);
    var neckCoords = new Matrix4(body.matrix);
    var tail1 = new Matrix4(body.matrix);
    var leftLegCoord = new Matrix4(body.matrix);
    var rightLegCoord = new Matrix4(body.matrix);
    body.matrix.scale(0.5, 0.5, 0.5);
    body.render();

    // var neck = new Cube();
    // neck.color = [0.984, 0.816, 0.34, 1.0];
    // neck.textureNumber = 0;
    // neck.matrix = neckCoords;
    // neck.matrix.rotate(g_headAngle, 0, 0, 1);
    // var headCoords = new Matrix4(neck.matrix);
    // neck.matrix.scale(0.2, 0.2, 0.2);
    // neck.matrix.translate(0.7, 2, 0.001);
    // neck.render();

    // var head = new Cube();
    // head.textureNumber = 0;
    // head.color = [0.984, 0.816, 0.35, 1.0];
    // head.matrix = headCoords;
    // var beakCoords = new Matrix4(neck.matrix);
    // head.matrix.scale(0.35, 0.35, 0.35);
    // head.matrix.translate(0.2, 1.6, 0.1);
    // head.render();

    // var beak = new Cube();
    // beak.textureNumber = 0;
    // beak.color = [0.926, 0.904, 0.739, 1.0];
    // beak.matrix = beakCoords;
    // beak.matrix.scale(1.4, 0.3, 0.8);
    // beak.matrix.translate(-0.1, 4.5, 0.8);
    // beak.matrix.rotate(-45, 1, 0, 0);
    // beak.matrix.rotate(g_beakAngle, 1, 0, 0);
    // beak.render();

    // var tail = new Cube();
    // tail.textureNumber = 0;
    // tail.color = [0.984, 0.82, 0.35, 1.0];
    // tail.matrix = tail1;
    // tail.matrix.scale(0.45, 0.45, 0.45);
    // tail.matrix.translate(0.05, 0.03, -0.4);
    // tail.matrix.rotate(-2, 75, 0, 1);
    // tail.matrix.rotate(g_tailSegAngle, 0.5, 0, 0);
    // tail.render();

    // var tailTip = new Pyramid(2.0, 1.0, 36);
    // tailTip.textureNumber = 0;
    // tailTip.color = [0.984, 0.816, 0.35, 1.0];
    // tailTip.matrix = tail.matrix;
    // tailTip.matrix.scale(0.8, 0.8, 0.8);
    // tailTip.matrix.rotate(-90, 1, 0.02, 0);
    // tailTip.matrix.translate(0.6, 1.0, 0.6);
    // tailTip.matrix.rotate(g_tailAngle, 1, 0, 0);
    // tailTip.render();

    // var leftLeg = new Cube();

    // leftLeg.color = [0.8, 0.8, 0.8, 1];
    // leftLeg.matrix = leftLegCoord;
    // leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0);
    // var leftFeetCoord = new Matrix4(leftLeg.matrix);
    // leftLeg.matrix.scale(0.1, 0.3, 0.1);
    // leftLeg.matrix.translate(0.1, -0.5, -2);
    // leftLeg.render();

    // var leftFeet = new Cube();
    // leftFeet.color = [0.926, 0.904, 0.739, 1.0];
    // leftFeet.matrix = leftFeetCoord;
    // leftFeet.matrix.scale(0.2, 0.03, 0.3);
    // leftFeet.matrix.translate(-0.2, -5.01, -0.01);
    // leftFeet.render();

    // var rightLeg = new Cube();
    // rightLeg.color = [0.8, 0.8, 0.8, 1];
    // rightLeg.matrix = rightLegCoord;
    // rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0);
    // var rightFeetCoord = new Matrix4(rightLeg.matrix);
    // rightLeg.matrix.scale(0.1, 0.3, 0.1);
    // rightLeg.matrix.translate(3.8, -0.5, -2);
    // rightLeg.render();

    // var rightFeet = new Cube();
    // rightFeet.color = [0.926, 0.904, 0.739, 1.0];
    // rightFeet.matrix = rightFeetCoord;
    // rightFeet.matrix.scale(0.2, 0.03, 0.3);
    // rightFeet.matrix.translate(1.7, -5.01, -0.01);
    // rightFeet.render();
}

function renderAllShapes() {
    // Clear <canvas>
    var startTime = performance.now();

    // var projMat = new Matrix4();
    // projMat.setPerspective(fov, 1 * canvas.width / canvas.height, 1, 100);
    // gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMat.elements);

    // var viewMat = new Matrix4();
    // // setLookAt(eye, at, up)
    // viewMat.setLookAt(
    //     g_eye.elements[0], g_eye.elements[1], g_eye.elements[2],
    //     g_at.elements[0], g_at.elements[1], g_at.elements[2],
    //     g_up.elements[0], g_up.elements[1], g_up.elements[2]
    // );

    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var floor = new Cube();
    floor.color = [0.5, 0.5, 0.5, 1.0];
    floor.textureNumber = 3;
    floor.matrix.translate(0.0, -0.45, 10.0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    var sky = new Cube();
    sky.color = [0.68, 0.85, 0.9, 1.0];
    sky.textureNumber = 0;
    sky.matrix.scale(100, 100, 100);
    sky.matrix.translate(-0.5, -0.5, 0.5);
    sky.render();

    drawMap();

    drawDuck();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), 'performance');
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionFromHTMLUI();
    initEventHandlers(canvas);

    g_camera.viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
    );
    g_camera.projMat.setPerspective(g_camera.fov, 1 * canvas.width / canvas.height, 0.1, 1000);

    document.onkeydown = keydown;

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    // canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    // renderAllShapes();
    requestAnimationFrame(tick);
}