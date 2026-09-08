DaveShade.matrix4 = class {
    //Two basic construction methods
    constructor(xx, xy, xz, xw, yx, yy, yz, yw, zx, zy, zz, zw, wx, wy, wz, ww) {
        this.xx = xx || 0; this.xy = xy || 0; this.xz = xz || 0; this.xw = xw || 0;
        this.yx = yx || 0; this.yy = yy || 0; this.yz = yz || 0; this.yw = yw || 0;
        this.zx = zx || 0; this.zy = zy || 0; this.zz = zz || 0; this.zw = zw || 0;
        this.wx = wx || 0; this.wy = wy || 0; this.wz = wz || 0; this.ww = ww || 0;
    }

    duplicate() {
        return new DaveShade.matrix4(
            this.xx, this.xy, this.xz, this.xw,
            this.yx, this.yy, this.yz, this.yw,
            this.zx, this.zy, this.zz, this.zw,
            this.wx, this.wy, this.wz, this.ww
        );
    }

    //Simple math
    multiply(multiplicator) {
        const resultor = this.duplicate();
        if (multiplicator instanceof DaveShade.matrix4) {
            resultor.xx = this.xx * multiplicator.xx + this.xy * multiplicator.yx + this.xz * multiplicator.zx + this.xw * multiplicator.wx;
            resultor.xy = this.xx * multiplicator.xy + this.xy * multiplicator.yy + this.xz * multiplicator.zy + this.xw * multiplicator.wy;
            resultor.xz = this.xx * multiplicator.xz + this.xy * multiplicator.yz + this.xz * multiplicator.zz + this.xw * multiplicator.wz;
            resultor.xw = this.xx * multiplicator.xw + this.xy * multiplicator.yw + this.xz * multiplicator.zw + this.xw * multiplicator.ww;

            resultor.yx = this.yx * multiplicator.xx + this.yy * multiplicator.yx + this.yz * multiplicator.zx + this.yw * multiplicator.wx;
            resultor.yy = this.yx * multiplicator.xy + this.yy * multiplicator.yy + this.yz * multiplicator.zy + this.yw * multiplicator.wy;
            resultor.yz = this.yx * multiplicator.xz + this.yy * multiplicator.yz + this.yz * multiplicator.zz + this.yw * multiplicator.wz;
            resultor.yw = this.yx * multiplicator.xw + this.yy * multiplicator.yw + this.yz * multiplicator.zw + this.yw * multiplicator.ww;

            resultor.zx = this.zx * multiplicator.xx + this.zy * multiplicator.yx + this.zz * multiplicator.zx + this.zw * multiplicator.wx;
            resultor.zy = this.zx * multiplicator.xy + this.zy * multiplicator.yy + this.zz * multiplicator.zy + this.zw * multiplicator.wy;
            resultor.zz = this.zx * multiplicator.xz + this.zy * multiplicator.yz + this.zz * multiplicator.zz + this.zw * multiplicator.wz;
            resultor.zw = this.zx * multiplicator.xw + this.zy * multiplicator.yw + this.zz * multiplicator.zw + this.zw * multiplicator.ww;

            resultor.wx = this.wx * multiplicator.xx + this.wy * multiplicator.yx + this.wz * multiplicator.zx + this.ww * multiplicator.wx;
            resultor.wy = this.wx * multiplicator.xy + this.wy * multiplicator.yy + this.wz * multiplicator.zy + this.ww * multiplicator.wy;
            resultor.wz = this.wx * multiplicator.xz + this.wy * multiplicator.yz + this.wz * multiplicator.zz + this.ww * multiplicator.wz;
            resultor.ww = this.wx * multiplicator.xw + this.wy * multiplicator.yw + this.wz * multiplicator.zw + this.ww * multiplicator.ww;
        }

        return resultor;
    }

    multiplyVector(x, y, z, w) {
        if (typeof w != "number") w = 1;

        return [
            x * this.xx + y * this.xy + z * this.xz + w * this.xw,
            x * this.yx + y * this.yy + z * this.yz + w * this.yw,
            x * this.zx + y * this.zy + z * this.zz + w * this.zw,
            x * this.wx + y * this.wy + z * this.wz + w * this.ww
        ];
    }

    //Simple transformations
    translate(x, y, z) {
        return this.multiply(new DaveShade.matrix4(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ));
    }

    scale(x, y, z) {
        return this.multiply(new DaveShade.matrix4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ));
    }

    //Rotations
    rotateX(angle) {
        return this.multiply(new DaveShade.matrix4(
            1, 0, 0, 0,
            0, Math.cos(angle), Math.sin(angle), 0,
            0, -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 0, 1
        ));
    }

    rotateY(angle) {
        return this.multiply(new DaveShade.matrix4(
            Math.cos(angle), 0, Math.sin(angle), 0,
            0, 1, 0, 0,
            -Math.sin(angle), 0, Math.cos(angle), 0,
            0, 0, 0, 1
        ));
    }

    rotateZ(angle) {
        return this.multiply(new DaveShade.matrix4(
            Math.cos(angle), Math.sin(angle), 0, 0,
            -Math.sin(angle), Math.cos(angle), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ));
    }

    rotateXYZ(x, y, z) { return this.rotateX(x).rotateY(y).rotateZ(z); }
    rotateZXY(x, y, z) { return this.rotateZ(z).rotateX(x).rotateY(y); }
    rotateYZX(x, y, z) { return this.rotateY(y).rotateZ(z).rotateX(x); }

    rotateXZY(x, y, z) { return this.rotateX(x).rotateZ(z).rotateY(y); }
    rotateYXZ(x, y, z) { return this.rotateY(y).rotateX(x).rotateZ(z); }
    rotateZYX(x, y, z) { return this.rotateZ(z).rotateY(y).rotateX(x); }

    rotateQuaternion(x, y, z, w) {
        let x2 = x * 2; let y2 = y * 2; let z2 = z * 2;
        var xx = x * x2; let xy = x * y2; let xz = x * x2;
        var yy = y * x2; let yz = y * y2; let zz = z * x2;
        var wx = w * x2; let wy = w * y2; let wz = w * x2;

        return this.multiply(new DaveShade.matrix4(
            1 - (yy + zz), xy + wz, xz - wy, 0,
            xy - wz, 1 - (xx + zz), yz + wx, 0,
            xz + wy, yz - wx, 1 - (xx + yy), 0,
            0, 0, 0, 1
        ));
    }

    //Below is just a quick helper function for finding the 4x4 determinant
    _3x3_det(xx, xy, xz, yx, yy, yz, zx, zy, zz) {
        return (
            (xx * yy * zz) - (xz * yy * zx) + 
            (xy * yz * zx) - (xx * yz * zy) +
            (xz * yx * zy) - (xy * yx * zz)
        );
    }

    //More advanced transforms
    determinant() {
        const x = this.xx * this._3x3_det(
            this.yy, this.yz, this.yw,
            this.zy, this.zz, this.zw,
            this.wy, this.wz, this.ww
        );

        const y = this.xy * this._3x3_det(
            this.yx, this.yz, this.yw,
            this.zx, this.zz, this.zw,
            this.wx, this.wz, this.ww
        );

        const z = this.xz * this._3x3_det(
            this.yx, this.yy, this.yw,
            this.zx, this.zy, this.zw,
            this.wx, this.wy, this.ww
        );

        const w = this.xw * this._3x3_det(
            this.yx, this.yy, this.yz,
            this.zx, this.zy, this.zz,
            this.wx, this.wy, this.wz
        );

        return x - y + z - w;
    }

    inverse() {
        
    }

    get _UNIFORM_VALUE_() {
        return [
            this.xx, this.xy, this.xz, this.xw,
            this.yx, this.yy, this.yz, this.yw,
            this.zx, this.zy, this.zz, this.zw,
            this.wx, this.wy, this.wz, this.ww
        ];
    }

    get translation() {
        return [ this.xw, this.yw, this.zw ];
    }

    get scalar() {
        const xx = this.xx; const xy = this.xy; const xz = this.xz;
        const yx = this.yx; const yy = this.yy; const yz = this.yz;
        const zx = this.zx; const zy = this.zy; const zz = this.zz;

        return [
            Math.sqrt(xx * xx + xy * xy + xz * xz),
            Math.sqrt(yx * yx + yy * yy + yz * yz),
            Math.sqrt(zx * zx + zy * zy + zz * zz),
        ];
    }

    //Extract the rotation matrix
    get rotationMatrix() {
        const s = this.scalar;
        
        const rotationMat = [
            this.xx / s, this.xy / s, this.xz / s,
            this.yx / s, this.yy / s, this.yz / s,
            this.zx / s, this.zy / s, this.zz / s
        ];

        if (DaveShade.matrix3) return new DaveShade.matrix3(...rotationMat);
        return rotationMat;
    }
}

// Just a simple identity matrix
DaveShade.matrix4.identity = () => {
    return new DaveShade.matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

//Camera stuff
DaveShade.matrix4.projection = (FOV, aspect, near) => {
    const vertical = Math.tan(FOV * Math.PI / 360);

    //Get near and invert
    if (typeof near != "number" || isNaN(near)) near = 1;
    else if (near <= 0) near = 0.1; //Make sure it isn't <0
    near = 1/near;
    
    return new DaveShade.matrix4(
        near / (vertical * aspect * 2), 0, 0, 0,
        0, near / (vertical * 2), 0, 0,
        0, 0, 1, -1,
        0, 0, near, 0
    );
}

DaveShade.matrix4.orthographic = (zoom, aspect) => {
    return new DaveShade.matrix4(
        zoom / aspect, 0, 0, 0,
        0, zoom, 0, 0,
        0, 0, 1, -1,
        0, 0, 0, 1
    );
}