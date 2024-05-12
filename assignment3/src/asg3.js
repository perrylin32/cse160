
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
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main() {

        if (u_whichTexture == 0) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
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
let u_Sampler2;

// Maze starts at -1 or g_map[19][24] facing g_map[19][23]
// All integers > 0 are walls and represent the height of the wall
// -2 is vault ducks
// -3 are lost maze ducks
var g_map = [
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    [5, -3, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, -3, 5],
    [5, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 3, 3, 4, -3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, -3, 5],
    [5, 0, 3, 2, 2, 3, 4, 4, 3, 4, 2, 1, -3, 0, 0, -3, 4, 4, 3, 3, 4, 3, 4, 4, 3, 4, 4, 4, 4, 4, 3, 3, 4, 3, 4, 3, 3, 3, 0, 5],
    [5, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 3, -3, 0, 0, 0, 3, -3, 0, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 4, 0, -3, 0, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 2, 1, 2, 1, 3, 0, 0, 1, 0, 0, 3, 0, 0, 0, 3, 1, 2, 3, 3, 2, 1, 0, 0, 3, -3, 0, 0, 0, 1, 0, 0, 4, 2, 4, 3, 3, 4, 5],
    [5, 0, 3, -3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, -3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 1, 1, 2, 0, 0, 1, -3, 2, -3, 0, -3, 5],
    [5, 0, 3, -3, 0, 0, 0, 0, 0, 0, 0, -3, 4, 0, 0, 0, 3, 0, 2, 2, 3, 2, 3, 3, 4, 4, 0, 1, 0, 0, 3, 0, 0, 2, 0, 4, 2, 2, 0, 5],
    [5, 0, 4, 4, 3, 2, 2, 3, 4, 2, 3, 4, 2, 4, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 3, 4, 2, 3, 0, 3, -3, 3, 0, 5],
    [5, 0, 2, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 3, 0, 3, 0, 0, 1, 1, 2, 1, 3, 4, 4, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 5],
    [5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, -3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 1, 2, 3, 1, 0, 3, 0, 1, 1, 5],
    [5, 0, 3, 0, 0, 4, 2, 3, 3, 2, 2, 0, 2, 0, 2, 0, 3, -3, 0, 0, 0, 0, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 0, 1, -3, 5],
    [5, 0, 2, 0, 0, 4, 0, 0, 0, 0, -3, 0, 2, 0, 2, 0, 2, 2, 1, 3, 2, 0, 2, 0, 4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, -3, 5],
    [5, 0, 2, 0, 0, 2, 0, 4, -3, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, -3, 4, 0, 0, 1, 2, 1, 3, 3, 0, 0, 2, 0, 1, 0, 5],
    [5, 0, 0, 0, 0, 3, 0, 3, 2, 3, 3, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 3, 0, 2, 0, 0, 0, -3, 3, 0, 0, 3, 0, 1, 0, 5],
    [5, 0, 0, 0, 0, 3, 0, 4, 0, -3, 2, 0, 0, 0, 0, 0, 0, 2, -3, 0, 0, 0, 0, 0, 0, 4, 0, 3, 0, 4, 2, 3, 4, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 1, 1, 0, 2, 0, 0, 0, 2, 3, 2, 4, 2, 3, 3, 2, 2, 2, 2, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 2, -3, 0, 2, 1, 1, 1, 3, -3, 2, 0, 0, 0, 2, 0, 0, -3, 2, 2, 2, 2, 0, 2, 0, 1, 0, 1, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 5],
    [5, 0, 3, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 4, 0, 0, 0, 0, -1, 0, 0, 0, 1, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 3, 0, 1, 0, 0, 3, 0, 2, 0, 2, 0, 2, 0, 0, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 4, 0, 0, 4, 0, 2, 0, 1, 0, 1, 2, 1, 1, 2, 1, 2, 0, 2, 2, 2, 2, 0, 2, 1, 2, 2, 1, 2, 0, 3, 0, 0, -2, 0, -2, 0, 0, 5],
    [5, 0, 2, -3, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 3, 3, 0, 0, -2, 0, -2, -2, -2, 5],
    [5, 0, 3, 1, 0, 4, 0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 2, 0, 0, 2, 0, 2, 0, 1, 0, 0, 0, 0, 3, 0, 0, -2, 0, -2, -2, 0, 5],
    [5, 0, 4, -3, 0, 3, 0, 3, 0, 0, 2, 0, 0, 3, 1, 2, 2, 3, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 3, 3, 0, 3, 0, 0, -2, 0, -2, -2, 0, 5],
    [5, 0, 3, 0, 0, 2, 0, 2, 3, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 2, 2, 2, 2, 2, 0, 3, -3, 0, 0, 3, 0, 0, -2, 0, -2, -2, 0, 5],
    [5, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 3, -3, 0, 0, 3, 0, 0, -2, 0, -2, -2, -2, 5],
    [5, 0, 3, 1, 2, 3, 2, 1, 3, 4, 2, 1, 1, 2, 1, 3, 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 3, 3, 2, 3, 0, 0, -2, 0, -2, 0, 0, 5],
    [5, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, -3, 3, 0, 0, -2, 0, -2, 0, 0, 5],
    [5, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 5],
    [5, 0, 3, 4, 0, 3, 0, 2, 0, 3, 0, 0, 3, 4, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 3, -3, 5],
    [5, 0, 0, 4, 0, 4, 0, 1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 3, 0, 3, 0, 5],
    [5, 3, 0, 3, 0, 3, 0, 2, 0, 0, 3, 2, 3, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 3, 0, 0, 0, 5],
    [5, 0, 0, 4, 3, 4, 3, 3, 2, 2, 4, 0, 0, 0, 0, 2, 2, 3, 3, 2, 3, 0, 0, 3, 3, 4, 2, 0, 0, 4, 0, 0, 0, 4, 0, 3, 0, 3, 3, 5],
    [5, 3, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 4, 0, 0, 3, 3, 0, 3, 0, 0, 0, 5],
    [5, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 2, 0, 3, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, -3, 0, 3, -3, 3, -3, 5],
    [5, 0, 3, 4, 0, 0, 3, 0, 0, 2, 0, 3, 0, 3, 0, 0, 0, 0, 3, 2, 1, 0, 0, 1, 3, 3, 2, 0, 0, 2, 0, 0, 2, 0, 0, 3, 3, 3, 3, 5],
    [5, 0, 3, 3, 0, 0, 4, 0, 0, 0, 0, 3, 0, 3, 3, 2, 3, 0, 2, -3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 3, 2, 0, 3, 0, 0, -3, 5],
    [5, -3, 3, 2, 0, -3, 3, 0, 0, 0, 0, 4, 0, 3, -3, 0, 0, -3, 1, 0, 0, 0, 0, 0, 0, -3, 3, 0, 0, 3, 0, -3, 2, 0, 0, 0, 0, 4, -3, 5],
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
];

// Draws maze
function drawMap() {
    var body = new Cube();
    for (var x = 0; x < g_map.length; x++) {
        for (var y = 0; y < g_map[x].length; y++) {
            var stackHeight = g_map[x][y];
            for (var z = 0; z < stackHeight; z++) {
                if (stackHeight > 0) {
                    body.color = [0.0, 1.0, 1.0, 1.0];

                    if (stackHeight == 5) {
                        body.textureNumber = 2;
                    } else if (stackHeight == 1 || stackHeight == 2) {
                        body.textureNumber = 3;
                    } else {
                        body.textureNumber = 4;
                    }


                    body.matrix.setTranslate(0, -0.75, 0);
                    body.matrix.scale(0.8, 0.8, 0.8);
                    body.matrix.translate(x - (g_map.length / 2), z * 0.8 + z / 5, y - (g_map[x].length / 2));
                    body.render();
                }
            }
            if (stackHeight === -2) {
                var duckMatrix = new Matrix4();
                duckMatrix.setTranslate(x - (g_map.length / 2), 0.08, y - (g_map[x].length / 2) - 4.45);
                drawDuck(duckMatrix, [0, 180, 0]);
            } else if (stackHeight === -3) {
                var duckMatrix = new Matrix4();
                duckMatrix.setTranslate((x - (g_map.length / 2)) * 0.8 + 0.25, 0.08, (y - (g_map[x].length / 2)) * 0.8);
                drawDuck(duckMatrix);
            }
        }
    }
}

// Camera Control variables
var g_eye = new Vector3([0.5, 0, -3]);
var g_at = new Vector3([0, 0, 100]);
var g_up = new Vector3([0, 1, 0]);
var fov = 60;
var g_camera = new Camera(g_map);
g_camera.eye.set(g_eye);
g_camera.at.set(g_at);
g_camera.up.set(g_up);

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

let g_headAnimation = true;
let g_beakAnimation = false;
let g_bodyAnimation = false;
let g_tailAnimation = true;
let g_tailSegAnimation = true;
let g_leftLegAnimation = true;
let g_rightLegAnimation = true;

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

    // Get the storage location of a_Position
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

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
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

}

function initEventHandlers(canvas) {
    canvas.onmousedown = function (event) {
        const x = event.clientX;
        const y = event.clientY;
        const rect = event.target.getBoundingClientRect();

        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            isDragging = true;
            dragStartX = x;
            dragStartY = y;

            if (event.shiftKey) {
                g_tailAnimation = !g_tailAnimation;
                g_leftLegAnimation = !g_leftLegAnimation;
                g_rightLegAnimation = !g_rightLegAnimation;

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

    let blockFront = getBlockInFront();
    // console.log(blockFront);

    if (ev.keyCode == 81) {
        // Q: Camera turns left
        g_camera.panLeft(5);
        panningAngle = (panningAngle - 5 + 360) % 360;
    } else if (ev.keyCode == 69) {
        // E: Camera turns right
        g_camera.panRight(5);
        panningAngle = (panningAngle + 5) % 360;
    } else if (ev.keyCode == 87) {
        // W: Move up
        g_camera.moveForward(1);
        moveFB++;
    } else if (ev.keyCode == 65) {
        // A: Move left
        g_camera.moveLeft(1);
        moveLR--;
    } else if (ev.keyCode == 83) {
        // S: Move back
        g_camera.moveBack(1);
        moveFB--;
    } else if (ev.keyCode == 68) {
        // D: Move right
        g_camera.moveRight(1);
        moveLR++;
    } else if (blockFront && (ev.key === 'f' || ev.key === 'F')) { // 'f' key to add block
        addBlock(blockFront.x, blockFront.z);
    } else if (blockFront && (ev.key === 'r' || ev.key === 'R')) { // 'r' key to remove block
        removeBlock(blockFront.x, blockFront.z);
    }


    renderAllShapes();
    console.log("Key Code pressed: " + ev.keyCode);
}


//--------------------------------------------------------------------------------------------------------------//
// Functions and variables that add/delete blocks
var moveLR = 0; 
var moveFB = 0;  
var panningAngle = 180;

function getBlockInFront() {
    let startX = 19;
    let startZ = 24;

    let currentX = startX + moveLR;
    let currentZ = startZ - moveFB;

    let radians = panningAngle * Math.PI / 180;

    let forwardX = Math.sin(radians);
    let forwardZ = Math.cos(radians);

    let mag = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);
    forwardX /= mag;
    forwardZ /= mag;

    let stepSize = 0.8;
    let blockX = Math.round(currentX + forwardX * stepSize);
    let blockZ = Math.round(currentZ + forwardZ * stepSize);

    if (blockX >= 0 && blockX < g_map.length && blockZ >= 0 && blockZ < g_map[blockX].length) {
        return { x: blockX, z: blockZ };
    }
}

function addBlock(x, z) {
    if (x >= 0 && x < g_map.length && z >= 0 && z < g_map[x].length && g_map[x][z] < 5) {
        g_map[x][z] += 1; // Assume you can add blocks freely
        renderAllShapes();
    }
}

function removeBlock(x, z) {
    if (x >= 0 && x < g_map.length && z >= 0 && z < g_map[x].length && g_map[x][z] > 0) {
        g_map[x][z] -= 1;
        renderAllShapes();
    }
}

//
//--------------------------------------------------------------------------------------------------------------//

// Texture code
function initTextures() {
    var image0 = new Image();  // Create the image object for the first texture
    image0.onload = function () { sendImageToTexture0(image0); };
    image0.src = '../resources/psyduckWall.jpg'; // Set source for the first texture

    var image1 = new Image();  // Create the image object for the second texture
    image1.onload = function () { sendImageToTexture1(image1); };
    // image1.src = '../resources/uv_grid_opengl.jpg'; 
    image1.src = '../resources/psyduck.jpg';

    var image2 = new Image();
    image2.onload = function () { sendImageToTexture2(image2); };
    image2.src = '../resources/psyduck2.jpg'; 
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

function sendImageToTexture2(image) {
    var texture = gl.createTexture();  // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object for texture 2');
        return;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
    console.log('Finished loading texture 2');
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngle();
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
function drawDuck(globalMatrix = new Matrix4(), rotationAngles = [0, 0, 0]) {

    var body = new Cube();
    body.color = [0.984, 0.816, 0.324, 1.0];
    body.textureNumber = 0;
    body.matrix = new Matrix4(globalMatrix);

    body.matrix.translate(-0.25, -0.58, 0.0);
    body.matrix.rotate(g_bodyAngle, 0, 0, 1);
    body.matrix.rotate(-2, 1, 0, 0);
    body.matrix.rotate(rotationAngles[0], 1, 0, 0);
    body.matrix.rotate(rotationAngles[1], 0, 1, 0);
    body.matrix.rotate(rotationAngles[2], 0, 0, 1);
    var neckCoords = new Matrix4(body.matrix);
    var tail1 = new Matrix4(body.matrix);
    var leftLegCoord = new Matrix4(body.matrix);
    var rightLegCoord = new Matrix4(body.matrix);
    body.matrix.scale(0.5, 0.5, 0.5);
    body.render();

    var neck = new Cube();
    neck.color = [0.984, 0.816, 0.34, 1.0];
    neck.textureNumber = 0;
    neck.matrix = neckCoords;
    neck.matrix.rotate(g_headAngle, 0, 0, 1);
    var headCoords = new Matrix4(neck.matrix);
    neck.matrix.scale(0.2, 0.2, 0.2);
    neck.matrix.translate(0.7, 2, 0.001);
    neck.render();

    var head = new Cube();
    head.textureNumber = 0;
    head.color = [0.984, 0.816, 0.35, 1.0];
    head.matrix = headCoords;
    var beakCoords = new Matrix4(neck.matrix);
    head.matrix.scale(0.35, 0.35, 0.35);
    head.matrix.translate(0.2, 1.6, 0.1);
    head.render();

    var beak = new Cube();
    beak.textureNumber = 0;
    beak.color = [0.926, 0.904, 0.739, 1.0];
    beak.matrix = beakCoords;
    beak.matrix.scale(1.4, 0.3, 0.8);
    beak.matrix.translate(-0.1, 4.5, 0.8);
    beak.matrix.rotate(-45, 1, 0, 0);
    beak.matrix.rotate(g_beakAngle, 1, 0, 0);
    beak.render();

    var tail = new Cube();
    tail.textureNumber = 0;
    tail.color = [0.984, 0.82, 0.35, 1.0];
    tail.matrix = tail1;
    tail.matrix.scale(0.45, 0.45, 0.45);
    tail.matrix.translate(0.05, 0.03, -0.4);
    tail.matrix.rotate(-2, 75, 0, 1);
    tail.matrix.rotate(g_tailSegAngle, 0.5, 0, 0);
    tail.render();

    var tailTip = new Pyramid(2.0, 1.0, 36);
    tailTip.textureNumber = 0;
    tailTip.color = [0.984, 0.816, 0.35, 1.0];
    tailTip.matrix = tail.matrix;
    tailTip.matrix.scale(0.8, 0.8, 0.8);
    tailTip.matrix.rotate(-90, 1, 0.02, 0);
    tailTip.matrix.translate(0.6, 1.0, 0.6);
    tailTip.matrix.rotate(g_tailAngle, 1, 0, 0);
    tailTip.render();

    var leftLeg = new Cube();
    leftLeg.color = [0.8, 0.8, 0.8, 1];
    leftLeg.textureNumber = 0;
    leftLeg.matrix = leftLegCoord;
    leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0);
    var leftFeetCoord = new Matrix4(leftLeg.matrix);
    leftLeg.matrix.scale(0.1, 0.3, 0.1);
    leftLeg.matrix.translate(0.1, -0.5, -2);
    leftLeg.render();

    var leftFeet = new Cube();
    leftFeet.color = [0.926, 0.904, 0.739, 1.0];
    leftFeet.textureNumber = 0;
    leftFeet.matrix = leftFeetCoord;
    leftFeet.matrix.scale(0.2, 0.03, 0.3);
    leftFeet.matrix.translate(-0.2, -5.01, -0.01);
    leftFeet.render();

    var rightLeg = new Cube();
    rightLeg.color = [0.8, 0.8, 0.8, 1];
    rightLeg.textureNumber = 0;
    rightLeg.matrix = rightLegCoord;
    rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0);
    var rightFeetCoord = new Matrix4(rightLeg.matrix);
    rightLeg.matrix.scale(0.1, 0.3, 0.1);
    rightLeg.matrix.translate(3.8, -0.5, -2);
    rightLeg.render();

    var rightFeet = new Cube();
    rightFeet.color = [0.926, 0.904, 0.739, 1.0];
    rightFeet.textureNumber = 0;
    rightFeet.matrix = rightFeetCoord;
    rightFeet.matrix.scale(0.2, 0.03, 0.3);
    rightFeet.matrix.translate(1.7, -5.01, -0.01);
    rightFeet.render();
}

function renderAllShapes() {
    // Clear <canvas>
    var startTime = performance.now();

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMat.elements);

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
    floor.textureNumber = 4;
    floor.matrix.translate(-16, -0.76, 15.2);
    floor.matrix.scale(32, 0, 32);
    floor.render();

    var sky = new Cube();
    sky.color = [0.68, 0.85, 0.9, 1.0];
    sky.textureNumber = 0;
    sky.matrix.scale(1000, 1000, 1000);
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

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}