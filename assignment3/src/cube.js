class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 1.0];
        this.matrix = new Matrix4();
        this.vertexBuffer = null;
        this.textureNumber = 1;

        this.vertices32 = new Float32Array([
            0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0,
            0.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 1.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0,
            0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, -1.0,
            0.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0,
            0.0, 0.0, 0.0, 1.0, 0.0, -1.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, -1.0,
            0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, -1.0,
            0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0, -1.0,
            1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0,
            1.0, 0.0, 0.0, 1.0, 0.0, -1.0, 1.0, 1.0, -1.0
        ]);
    }

    render() {

        if (this.vertexBuffer === null) {
            this.vertexBuffer = gl.createBuffer();
        }

        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNumber);

        // Pass the color point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV(this.vertices32, this.vertices32, this.vertexBuffer);

    }
}
