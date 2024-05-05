class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [0.5, 0.5, 0.5, 1.0];
        this.matrix = new Matrix4();
        this.baseSize = 1.0; // Length of the square base
    }

    render() {
        var rgba = this.color;

        // Set color and transform matrix
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Apex of the pyramid, positioned above the center of the base
        var apex = [0.0, 1.0, 0.0];

        // Draw the base using two triangles with explicit coordinates
        drawTriangle3D([
            -0.5, 0.0, -0.5,  // Bottom left corner
             0.5, 0.0, -0.5,  // Bottom right corner
            -0.5, 0.0,  0.5   // Top left corner
        ]);
        drawTriangle3D([
             0.5, 0.0, -0.5,  // Bottom right corner
             0.5, 0.0,  0.5,  // Top right corner
            -0.5, 0.0,  0.5   // Top left corner
        ]);

        // Draw the sides of the pyramid
        // Darken the color for the pyramid's sides to distinguish them
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        drawTriangle3D([
             0.0, 1.0,  0.0,  // Apex
            -0.5, 0.0, -0.5,  // Bottom left corner
             0.5, 0.0, -0.5   // Bottom right corner
        ]);
        drawTriangle3D([
             0.0, 1.0,  0.0,  // Apex
             0.5, 0.0, -0.5,  // Bottom right corner
             0.5, 0.0,  0.5   // Top right corner
        ]);
        drawTriangle3D([
             0.0, 1.0,  0.0,  // Apex
             0.5, 0.0,  0.5,  // Top right corner
            -0.5, 0.0,  0.5   // Top left corner
        ]);
        drawTriangle3D([
             0.0, 1.0,  0.0,  // Apex
            -0.5, 0.0,  0.5,  // Top left corner
            -0.5, 0.0, -0.5   // Bottom left corner
        ]);
    }
}