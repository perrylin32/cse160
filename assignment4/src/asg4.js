
var VSHADER_SOURCE =
    `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertexPosition;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix *  u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        // gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        // v_Normal = a_Normal;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        v_VertexPosition = u_ModelMatrix * a_Position;
    }
    `

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    uniform vec3 u_lightPosition;
    uniform vec3 u_spotlightPosition;
    uniform vec3 u_spotlightDirection;
    uniform float u_spotlightCutoff;
    uniform bool u_lightOn;
    uniform bool u_spotlightOn;
    uniform vec3 u_lightColor;
    uniform vec3 u_spotlightColor;
    uniform vec3 u_cameraPosition;
    varying vec4 v_VertexPosition;
    void main() {

        // Texture and color handling
        if (u_whichTexture == -1) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        } else if (u_whichTexture == 0) {
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

        vec3 lightColor = vec3(u_FragColor) * 0.3;
        if (u_whichTexture == 3) {
            lightColor = vec3(u_FragColor) * 0.5;
        }

        if (u_whichTexture == 0 || u_whichTexture == 3) {

            if (u_lightOn) {
                vec3 lightVector = u_lightPosition - vec3(v_VertexPosition);
                vec3 L = normalize(lightVector);
                vec3 N = normalize(v_Normal);
                float nDotL = max(dot(N, L), 0.0);
            
                vec3 R = reflect(L, N);
                vec3 E = normalize(u_cameraPosition - vec3(v_VertexPosition));
                // float specular = pow(max(dot(E, R), 0.0), 10.0) * u_lightColor;
                float specularIntensity = pow(max(dot(E, R), 0.0), 10.0);
                vec3 specular = vec3(specularIntensity) * u_lightColor;
                vec3 diffuse = u_lightColor * nDotL * 0.7;
            
                lightColor += diffuse + specular;
            }

            if (u_spotlightOn) {
                vec3 L = normalize(u_spotlightPosition - vec3(v_VertexPosition));
                vec3 N = normalize(v_Normal); // Normal at the fragment
                vec3 V = normalize(u_cameraPosition - vec3(v_VertexPosition));
                vec3 D = normalize(u_spotlightDirection);
                float spotEffect = dot(D, -L);

                if (spotEffect > cos(radians(u_spotlightCutoff))) {
                    float nDotL = max(dot(N, L), 0.0);
                    vec3 reflectDir = reflect(-L, N);
                    float specularStrength = pow(max(dot(reflectDir, V), 0.0), 32.0); 
                    vec3 diffuse = u_FragColor.rgb * nDotL * u_spotlightColor;
                    vec3 specular = vec3(1.0, 1.0, 1.0) * specularStrength * u_spotlightColor;

                    lightColor += diffuse * pow(spotEffect, 20.0) + specular;
                }
            }

            gl_FragColor.rgb *= lightColor;
        }
    }
`;

// Shader and general global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_NormalMatrix;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

// Normals and Lighting(Assignment 4)
let g_normal = false;
let g_lightPosition = [0, 1, -2];
let u_lightPosition;
let u_lightOn;
let g_lightOn = false;
let u_spotlightOn;
let g_spotlightOn = false;
let g_spotlightPosition = [0, 2, -2];
let u_spotlightPosition;
let u_cameraPosition;

let u_spotlightDirection;
let u_spotlightCutoff;

// Color of point light
let u_lightColor;
let g_lightColorRed = 128;
let g_lightColorGreen = 128;
let g_lightColorBlue = 128;

// Color of spotlight
let u_spotlightColor;
let g_spotlightColorRed = 128;
let g_spotlightColorGreen = 0;
let g_spotlightColorBlue = 0;

// (Spot)Light Animation
let g_lightAnimation = true;
let g_lightAnimationOn = true;
let g_spotlightAnimation = true;
let g_spotlightAnimationOn = true;

// Camera Control variables
var g_eye = new Vector3([-1, 0, -5]);
var g_at = new Vector3([0, 0, 100]);
var g_up = new Vector3([0, 1, 0]);
var fov = 60;
var g_camera = new Camera();

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

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Draws maze
function drawMap() {
    var body = new Cube();
    body.duck = true;
    for (var x = 0; x < g_map.length; x++) {
        for (var y = 0; y < g_map[x].length; y++) {
            var stackHeight = g_map[x][y];
            for (var z = 0; z < stackHeight; z++) {
                if (stackHeight > 0) {
                    body.color = [0.0, 1.0, 1.0, 1.0];
                    body.textureNumber = 2;
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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log("Failed to get the storage location of a_Normal");
        return;
    }

    u_lightPosition = gl.getUniformLocation(gl.program, 'u_lightPosition');
    if (!u_lightPosition) {
        console.log('Failed to get the storage location of u_lightPosition');
        return;
    }

    u_cameraPosition = gl.getUniformLocation(gl.program, 'u_cameraPosition');
    if (!u_cameraPosition) {
        console.log('Failed to get the storage location of u_cameraPosition');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log("Failed to get the storage location of u_NormalMatrix");
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

    u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
    if (!u_spotlightDirection) {
        console.log('Failed to get the storage location of u_spotlightDirection');
        return;
    }
    u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
    if (!u_spotlightCutoff) {
        console.log('Failed to get the storage location of u_spotlightCutoff');
        return;
    }

    u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
    if (!u_spotlightOn) {
        console.log('Failed to get the storage location of u_spotlightOn');
        return;
    }

    u_spotlightPosition = gl.getUniformLocation(gl.program, 'u_spotlightPosition');
    if (!u_spotlightPosition) {
        console.log('Failed to get the storage location of u_spotlightPosition');
        return;
    }

    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get the storage location of u_lightColor');
        return;
    }

    u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
    if (!u_spotlightColor) {
        console.log('Failed to get the storage location of u_spotlightColor');
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

    // Normals On/Off
    document.getElementById('NormalOn').onclick = function () { g_normal = true; };
    document.getElementById('NormalOff').onclick = function () { g_normal = false; };

    // Light X, Y, Z
    document.getElementById('lightSlideX').addEventListener('input', function () { g_lightPosition[0] = this.value / 100; renderAllShapes(); });
    document.getElementById('lightSlideY').addEventListener('input', function () { g_lightPosition[1] = this.value / 100; renderAllShapes(); });
    document.getElementById('lightSlideZ').addEventListener('input', function () { g_lightPosition[2] = this.value / 100; renderAllShapes(); });

    // Spotlight X, Y, Z
    document.getElementById('spotlightSlideX').addEventListener('input', function () { g_spotlightPosition[0] = this.value / 100; renderAllShapes(); });
    document.getElementById('spotlightSlideY').addEventListener('input', function () { g_spotlightPosition[1] = this.value / 100; renderAllShapes(); });
    document.getElementById('spotlightSlideZ').addEventListener('input', function () { g_spotlightPosition[2] = this.value / 100; renderAllShapes(); });

    // Lights On/Off
    document.getElementById('LightsOn').onclick = function () { g_lightOn = true; };
    document.getElementById('LightsOff').onclick = function () { g_lightOn = false; };

    // Spotlights On/Off
    document.getElementById('SpotlightOn').onclick = function () { g_spotlightOn = true; };
    document.getElementById('SpotlightOff').onclick = function () { g_spotlightOn = false; };

    // Light Color(RGB)
    document.getElementById('Lred').addEventListener('input', function () { g_lightColorRed = this.value; document.getElementById('LredValue').value = this.value; });
    document.getElementById('Lgreen').addEventListener('input', function () { g_lightColorGreen = this.value; document.getElementById('LgreenValue').value = this.value; });
    document.getElementById('Lblue').addEventListener('input', function () { g_lightColorBlue = this.value; document.getElementById('LblueValue').value = this.value; });

    // Spotlight Color(RGB)
    document.getElementById('Sred').addEventListener('input', function () { g_spotlightColorRed = this.value; document.getElementById('SredValue').value = this.value; });
    document.getElementById('Sgreen').addEventListener('input', function () { g_spotlightColorGreen = this.value; document.getElementById('SgreenValue').value = this.value; });
    document.getElementById('Sblue').addEventListener('input', function () { g_spotlightColorBlue = this.value; document.getElementById('SblueValue').value = this.value; });

    // Light Animation(Point + Spot)
    document.getElementById('LightsAnimationOn').onclick = function () { if (!g_lightAnimationOn) { g_lightAnimation = true; g_startTime = performance.now() / 1000.0; g_lightAnimationOn = true; } };
    document.getElementById('LightsAnimationOff').onclick = function () { if (g_lightAnimationOn) { g_lightAnimation = false; g_baseAngle += performance.now() / 1000.0 - g_startTime; g_lightAnimationOn = false; } };

    document.getElementById('SpotlightsAnimationOn').onclick = function () {if (!g_spotlightAnimationOn) { g_spotlightBaseTime = performance.now() / 1000.0; g_spotlightAnimation = true; g_spotlightAnimationOn = true; } };
    document.getElementById('SpotlightsAnimationOff').onclick = function () { if (g_spotlightAnimationOn) { g_spotlightAnimation = false; g_spotlightAnimationOn = false; g_spotlightAccumulatedTime += performance.now() / 1000.0 - g_spotlightBaseTime; } };
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

    if (ev.keyCode == 81) {
        // Q: Camera turns left
        g_camera.panLeft(5);
    } else if (ev.keyCode == 69) {
        // E: Camera turns right
        g_camera.panRight(5);
    } else if (ev.keyCode == 87) {
        // W: Move up
        g_camera.moveForward(0.5);
    } else if (ev.keyCode == 65) {
        // A: Move left
        g_camera.moveLeft(0.5);
    } else if (ev.keyCode == 83) {
        // S: Move back
        g_camera.moveBack(0.5);
    } else if (ev.keyCode == 68) {
        // D: Move right
        g_camera.moveRight(0.5);
    } else if (ev.keyCode == 38) {
        g_camera.moveUp(0.5);
    } else if (ev.keyCode == 40) {
        g_camera.moveDown(0.5);
    }

    renderAllShapes();
    console.log("Key Code pressed: " + ev.keyCode);
}

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

// Variables used to keep track of the position of the animation if paused
var g_currentAnimationTime = 0;
var g_baseAngle = 0;
var g_spotlightBaseTime = 0;
var g_spotlightAccumulatedTime = 0;

function updateAnimationAngle() {

    // Block Animal Duck animation
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

    // Lighting Animation
    if (g_lightAnimation) {
        g_currentAnimationTime = performance.now() / 1000.0 - g_startTime;
        g_lightPosition[0] = 4 * Math.cos(g_currentAnimationTime + g_baseAngle);
    }
    if (g_spotlightAnimation) {
        let currentTime = performance.now() / 1000.0;
        g_spotlightAnimationTime = currentTime - g_spotlightBaseTime + g_spotlightAccumulatedTime;
        
        let radius = 4;
        let angle = g_spotlightAnimationTime * 0.5; // Rotate half a radian per second
        g_spotlightPosition[0] = radius * Math.cos(angle);
        g_spotlightPosition[2] = radius * Math.sin(angle);
    }
    
}

// Draw blocky animal duck
function drawDuck(globalMatrix = new Matrix4(), rotationAngles = [0, 0, 0]) {

    var body = new Cube();
    body.duck = true;
    body.color = [0.984, 0.816, 0.324, 1.0];
    if (g_normal) { body.textureNumber = -1 } else { body.textureNumber = 0 };
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
    neck.duck = true;
    neck.color = [0.984, 0.816, 0.34, 1.0];
    if (g_normal) { neck.textureNumber = -1 } else { neck.textureNumber = 0 };
    neck.matrix = neckCoords;
    neck.matrix.rotate(g_headAngle, 0, 0, 1);
    var headCoords = new Matrix4(neck.matrix);
    neck.matrix.scale(0.2, 0.2, 0.2);
    neck.matrix.translate(0.7, 2, 0.001);
    neck.render();

    var head = new Cube();
    head.duck = true;
    if (g_normal) { head.textureNumber = -1 } else { head.textureNumber = 0 };
    head.color = [0.984, 0.816, 0.35, 1.0];
    head.matrix = headCoords;
    var beakCoords = new Matrix4(neck.matrix);
    head.matrix.scale(0.35, 0.35, 0.35);
    head.matrix.translate(0.2, 1.6, 0.1);
    head.render();

    var beak = new Cube();
    beak.duck = true;
    if (g_normal) { beak.textureNumber = -1 } else { beak.textureNumber = 0 };
    beak.color = [0.926, 0.904, 0.739, 1.0];
    beak.matrix = beakCoords;
    beak.matrix.scale(1.4, 0.3, 0.8);
    beak.matrix.translate(-0.1, 4.5, 0.8);
    beak.matrix.rotate(-45, 1, 0, 0);
    beak.matrix.rotate(g_beakAngle, 1, 0, 0);
    beak.render();

    var tail = new Cube();
    tail.duck = true;
    if (g_normal) { tail.textureNumber = -1 } else { tail.textureNumber = 0 };
    tail.color = [0.984, 0.82, 0.35, 1.0];
    tail.matrix = tail1;
    tail.matrix.scale(0.45, 0.45, 0.45);
    tail.matrix.translate(0.05, 0.03, -0.4);
    tail.matrix.rotate(-2, 75, 0, 1);
    tail.matrix.rotate(g_tailSegAngle, 0.5, 0, 0);
    tail.render();

    var tailTip = new Pyramid(2.0, 1.0, 36);
    if (g_normal) { tailTip.textureNumber = -1 } else { tailTip.textureNumber = 0 };
    tailTip.color = [0.984, 0.816, 0.35, 1.0];
    tailTip.matrix = tail.matrix;
    tailTip.matrix.scale(0.8, 0.8, 0.8);
    tailTip.matrix.rotate(-90, 1, 0.02, 0);
    tailTip.matrix.translate(0.6, 1.0, 0.6);
    tailTip.matrix.rotate(g_tailAngle, 1, 0, 0);
    tailTip.render();

    var leftLeg = new Cube();
    leftLeg.duck = true;
    leftLeg.color = [0.8, 0.8, 0.8, 1];
    if (g_normal) { leftLeg.textureNumber = -1 } else { leftLeg.textureNumber = 0 };
    leftLeg.matrix = leftLegCoord;
    leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0);
    var leftFeetCoord = new Matrix4(leftLeg.matrix);
    leftLeg.matrix.scale(0.1, 0.3, 0.1);
    leftLeg.matrix.translate(0.1, -0.5, -2);
    leftLeg.render();

    var leftFeet = new Cube();
    leftFeet.duck = true;
    leftFeet.color = [0.926, 0.904, 0.739, 1.0];
    if (g_normal) { leftFeet.textureNumber = -1 } else { leftFeet.textureNumber = 0 };
    leftFeet.matrix = leftFeetCoord;
    leftFeet.matrix.scale(0.2, 0.03, 0.3);
    leftFeet.matrix.translate(-0.2, -5.01, -0.01);
    leftFeet.render();

    var rightLeg = new Cube();
    rightLeg.duck = true;
    rightLeg.color = [0.8, 0.8, 0.8, 1];
    if (g_normal) { rightLeg.textureNumber = -1 } else { rightLeg.textureNumber = 0 };
    rightLeg.matrix = rightLegCoord;
    rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0);
    var rightFeetCoord = new Matrix4(rightLeg.matrix);
    rightLeg.matrix.scale(0.1, 0.3, 0.1);
    rightLeg.matrix.translate(3.8, -0.5, -2);
    rightLeg.render();

    var rightFeet = new Cube();
    rightFeet.duck = true;
    rightFeet.color = [0.926, 0.904, 0.739, 1.0];
    if (g_normal) { rightFeet.textureNumber = -1 } else { rightFeet.textureNumber = 0 };
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

    gl.uniform3f(u_lightPosition, g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);
    gl.uniform3f(u_spotlightPosition, g_spotlightPosition[0], g_spotlightPosition[1], g_spotlightPosition[2]);

    gl.uniform3f(u_cameraPosition, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_spotlightOn, g_spotlightOn);
    gl.uniform3f(u_lightColor, g_lightColorRed / 255.0, g_lightColorGreen / 255.0, g_lightColorBlue / 255.0);
    gl.uniform3f(u_spotlightColor, g_spotlightColorRed / 255.0, g_spotlightColorGreen / 255.0, g_spotlightColorBlue / 255.0);

    gl.uniform3fv(u_spotlightDirection, [0.0, -1, 0.0]);
    gl.uniform1f(u_spotlightCutoff, 30.0);


    var floor = new Cube();
    floor.duck = true;
    floor.color = [0.5, 0.5, 0.5, 1.0];
    floor.textureNumber = 3;
    floor.matrix.translate(-16, -1, 15.2);
    floor.matrix.scale(32, 0, 32);
    floor.render();

    var sky = new Cube();
    sky.duck = true;
    sky.color = [0.68, 0.85, 0.9, 1.0];
    sky.textureNumber = 0;
    sky.matrix.scale(1000, 1000, 1000);
    sky.matrix.translate(-0.5, -0.5, 0.5);
    sky.render();

    var box = new Cube();
    box.color = [1, 1, 1, 1.0];
    if (g_normal) { box.textureNumber = -1 } else { box.textureNumber = 0 };
    box.matrix.scale(-20, -10, -20);
    box.matrix.translate(-0.45, -0.89, -0.5);
    box.render();

    var sphere = new Sphere();
    if (g_normal) { sphere.textureNumber = -1 } else { sphere.textureNumber = 0 };
    sphere.render();

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.textureNumber = 0;
    light.matrix.translate(g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

    var spotlightCube = new Cube();
    spotlightCube.color = [2, 0, 0, 1];
    spotlightCube.textureNumber = 0;
    spotlightCube.matrix.translate(g_spotlightPosition[0], g_spotlightPosition[1], g_spotlightPosition[2]);
    spotlightCube.matrix.scale(-0.1, -0.1, -0.1);
    spotlightCube.render();

    var duck = new Matrix4();
    duck.translate(2, -0.25, 0);
    drawDuck(duck, [0, 180, 0]);

    var duckduck = new Matrix4();
    duckduck.translate(-1, -0.25, 0);
    drawDuck(duckduck, [0, 180, 0]);

    // drawMap();

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

    document.onkeydown = keydown;

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}