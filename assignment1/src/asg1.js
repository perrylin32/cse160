
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = u_Size;
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

const SQUARES = 0;
const TRIANGLES = 1;
const CIRCLES = 2;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor = [0.5, 0.5, 0.5, 1.0];
let g_selectedShape = SQUARES;
let g_selectedSize = 5;
let g_selectedSegment = 10;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('canvas');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function addActionFromHTMLUI() {

    document.getElementById('Squares').onclick = function () { g_selectedShape = SQUARES; };
    document.getElementById('Triangles').onclick = function () { g_selectedShape = TRIANGLES; };
    document.getElementById('Circles').onclick = function () { g_selectedShape = CIRCLES; };

    document.getElementById('ClearCanvas').onclick = function () {g_shapesList = []; renderAllShapes(); };

    document.getElementById('Red').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('Green').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('Blue').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    document.getElementById('ShapeSize').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('SegmentCount').addEventListener('mouseup', function () { g_selectedSegment = this.value; });
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();

    addActionFromHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) }};

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

}

/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
var g_shapes = [];
*/
var g_shapesList = [];

function click(ev) {

    [x, y] = convertCoordinatesEventToGL(ev);

    // Store the coordinates to g_points array

    let point;

    if (g_selectedShape == SQUARES) {
        point = new Point();
    }else if (g_selectedShape == TRIANGLES){
        point = new Triangle();
    }else {
        point = new Circle();
        point.segments = g_selectedSegment;
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;

    g_shapesList.push(point);

    /*
    g_points.push([x, y]);

    g_colors.push(g_selectedColor.slice());

    g_sizes.push(g_selectedSize);

    g_shapes.push(g_selectedShape);
    */

    /* 
    // Store the coordinates to g_points array
    if (x >= 0.0 && y >= 0.0) {      // First quadrant
        g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    } else if (x < 0.0 && y < 0.0) { // Third quadrant
        g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    } else {                         // Others
        g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    }
    */

    renderAllShapes();

}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}

