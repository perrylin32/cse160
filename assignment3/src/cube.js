class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [0.5, 0.5, 0.5, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the color point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        // Front of cube
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Other sides of cube top, bottom, left, right, back
        // Back face
        drawTriangle3D([0.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 1.0, -1.0]); // v4,v7,v5
        drawTriangle3D([0.0, 0.0, -1.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0]); // v4,v6,v7

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Top face
        drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, -1.0]); // v3,v1,v5
        drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0]); // v3,v5,v6

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Bottom face
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, -1.0, 1.0, 0.0, 0.0]); // v0,v4,v7
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, -1.0]); // v0,v7,v2

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Left face
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, -1.0]); // v0,v3,v6
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0, -1.0]); // v0,v6,v4

        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        // Right face
        drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0]); // v2,v5,v1
        drawTriangle3D([1.0, 0.0, 0.0, 1.0, 0.0, -1.0, 1.0, 1.0, -1.0]); // v2,v7,v5
    }
}
