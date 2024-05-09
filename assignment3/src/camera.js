class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
        this.updateViewMatrix();

    }

    updateViewMatrix() {
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveForward(speed) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.at.add(f);
        this.eye.add(f);
        this.updateViewMatrix();
    }

    moveBack(speed) {
        var b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);
        this.at.add(b);
        this.eye.add(b);
        this.updateViewMatrix();
    }

    moveLeft(speed) {
        var f = new Vector3();
        var s = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    moveRight(speed) {
        var f = new Vector3();
        var s = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    panLeft(degrees) {
        let direction = new Vector3();
        direction.set(this.at);
        direction.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let rotatedDirection = rotationMatrix.multiplyVector3(direction);
        this.at.set(this.eye);
        this.at.add(rotatedDirection);
        this.updateViewMatrix();
    }
    
    panRight(degrees) {
        let direction = new Vector3();
        direction.set(this.at);
        direction.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let rotatedDirection = rotationMatrix.multiplyVector3(direction);
        this.at.set(this.eye);
        this.at.add(rotatedDirection);
        this.updateViewMatrix();
    }
}

