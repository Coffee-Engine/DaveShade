DaveShade.matrix3 = class {
    //Two basic construction methods
    constructor(xx, xy, xz, yx, yy, yz, zx, zy, zz) {
        this.xx = xx || 0; this.xy = xy || 0; this.xz = xz || 0;
        this.yx = yx || 0; this.yy = yy || 0; this.yz = yz || 0;
        this.zx = zx || 0; this.zy = zy || 0; this.zz = zz || 0;
    }

    duplicate() {
        return new DaveShade.matrix3(
            this.xx, this.xy, this.xz,
            this.yx, this.yy, this.yz,
            this.zx, this.zy, this.zz
        );
    }

    //Simple math
    multiply(multiplicator) {
        const resultor = this.duplicate();
        if (multiplicator instanceof DaveShade.matrix3) {
            resultor.xx = this.xx * multiplicator.xx + this.xy * multiplicator.yx + this.xz * multiplicator.zx;
            resultor.xy = this.xx * multiplicator.xy + this.xy * multiplicator.yy + this.xz * multiplicator.zy;
            resultor.xz = this.xx * multiplicator.xz + this.xy * multiplicator.yz + this.xz * multiplicator.zz;

            resultor.yx = this.yx * multiplicator.xx + this.yy * multiplicator.yx + this.yz * multiplicator.zx;
            resultor.yy = this.yx * multiplicator.xy + this.yy * multiplicator.yy + this.yz * multiplicator.zy;
            resultor.yz = this.yx * multiplicator.xz + this.yy * multiplicator.yz + this.yz * multiplicator.zz;

            resultor.zx = this.zx * multiplicator.xx + this.zy * multiplicator.yx + this.zz * multiplicator.zx;
            resultor.zy = this.zx * multiplicator.xy + this.zy * multiplicator.yy + this.zz * multiplicator.zy;
            resultor.zz = this.zx * multiplicator.xz + this.zy * multiplicator.yz + this.zz * multiplicator.zz;
        }

        return resultor;
    }

    multiplyVector(x, y, z) {
        if (typeof z != "number") z = 1;

        return [
            x * this.xx + y * this.xy + z * this.xz,
            x * this.yx + y * this.yy + z * this.yz,
            x * this.zx + y * this.zy + z * this.zz,
        ];
    }

    //Simple transformations
    translate(x, y) {
        return this.multiply(new DaveShade.matrix3(
            1, 0, x,
            0, 1, y,
            0, 0, 1
        ));
    }

    rotate(angle) {
        return this.multiply(new DaveShade.matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1
        ));
    }

    scale(x, y) {
        return this.multiply(new DaveShade.matrix3(
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        ));
    }

    //Advanced transformations
    determinant() {
        //We are doing the diagonal method,
        //though I do have the more traditional method commented out below
        return (
            (this.xx * this.yy * this.zz) - (this.xz * this.yy * this.zx) + 
            (this.xy * this.yz * this.zx) - (this.xx * this.yz * this.zy) +
            (this.xz * this.yx * this.zy) - (this.xy * this.yx * this.zz)
        );
        /*
        const x = this.xx * (this.yy * this.zz - this.yz * this.zy);
        const y = this.xy * (this.zz * this.yx - this.yz * this.zx);
        const z = this.xz * (this.yx * this.zy - this.zx * this.yy);

        return x - y + z;
        */
    }

    inverse() {
        //First we will calculate the matrix of minors
        const mxx = (this.yy * this.zz - this.zy * this.yz);
        const myx = -(this.yz * this.zx - this.zz * this.yx);
        const mzx = (this.yx * this.zy - this.zx * this.yy);

        const mxy = -(this.zy * this.xz - this.xy * this.zz);
        const myy = (this.zz * this.xx - this.xz * this.zx);
        const mzy = -(this.zx * this.xy - this.xx * this.zy);

        const mxz = (this.xy * this.yz - this.yy * this.xz);
        const myz = -(this.xz * this.yx - this.yz * this.xx);
        const mzz = (this.xx * this.yy - this.yx * this.xy);
        
        //Get the inverse determinant and transpose.
        const inv = 1 / this.determinant();
        return new DaveShade.matrix3(
            inv * mxx, inv * mxy, inv * mxz,
            inv * myx, inv * myy, inv * myz,
            inv * mzx, inv * mzy, inv * mzz
        );
    }

    get array() {
        return [
            this.xx, this.xy, this.xz,
            this.yx, this.yy, this.yz,
            this.zx, this.zy, this.zz
        ];
    }

    get translation() {
        return [ this.xz, this.yz ];
    }

    get rotation() { return Math.atan2(this.xy, this.xx); }

    get scalar() {
        let xx = this.xx; let xy = this.xy;
        let yx = this.yx; let yy = this.yy;

        return [ Math.sqrt(xx * xx + xy * xy), Math.sqrt(yx * yx + yy * yy) ];
    }
}

// Just a simple identity matrix
DaveShade.matrix3.identity = () => {
    return new DaveShade.matrix3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    );
}