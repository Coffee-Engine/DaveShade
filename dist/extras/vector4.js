DaveShade.vector4 = class {
    //Private values
    #x = 0; #y = 0; #z = 0; #w = 0;

    //To keep the vector clean
    set x(v) { this.#x = DaveShade.cleanNumber(v); } get x() { return this.#x; }
    set y(v) { this.#y = DaveShade.cleanNumber(v); } get y() { return this.#y; }
    set z(v) { this.#z = DaveShade.cleanNumber(v); } get z() { return this.#z; }
    set w(v) { this.#w = DaveShade.cleanNumber(v); } get w() { return this.#w; }

    //Clean and simple
    get _UNIFORM_VALUE_() { return [ this.x, this.y, this.z, this.w ]; }

    //Basic methods
    constructor(x, y, z, w) { 
        this.x = DaveShade.cleanNumber(x);
        
        //If we only define x, use x
        if (y === undefined || z === undefined || w === undefined) {
            this.y = this.x;
            this.z = this.x;
            this.w = this.x;
        }
        else {
            this.y = DaveShade.cleanNumber(y);
            this.z = DaveShade.cleanNumber(z);
            this.w = DaveShade.cleanNumber(w);
        }
    }

    duplicate() { return new DaveShade.vector4(this.x, this.y, this.z, this.w); }

    //Basic arithmatic
    add(x, y, z, w) {
        //If we are adding by a vector
        if (x instanceof DaveShade.vector4) {
            const returned = this.duplicate();

            returned.x += x.x;
            returned.y += x.y;
            returned.z += x.z;
            returned.w += x.w;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.add(new DaveShade.vector4(x, y, z, w));
    }

    subtract(x, y, z, w) {
        //If we are subtracting by a vector
        if (x instanceof DaveShade.vector4) {
            const returned = this.duplicate();

            returned.x -= x.x;
            returned.y -= x.y;
            returned.z -= x.z;
            returned.w -= x.w;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.subtract(new DaveShade.vector4(x, y, z, w));
    }

    multiply(x, y, z, w) {
        //If we are multiplying by a vector
        if (x instanceof DaveShade.vector4) {
            const returned = this.duplicate();

            returned.x *= x.x;
            returned.y *= x.y;
            returned.z *= x.z;
            returned.w *= x.w;

            return returned;
        }

        //If we aren't a vector 3, turn into one.
        return this.multiply(new DaveShade.vector4(x, y, z, w));
    }

    divide(x, y, z, w) {
        //If we are dividing by a vector
        if (x instanceof DaveShade.vector4) {
            const returned = this.duplicate();

            returned.x /= x.x;
            returned.y /= x.y;
            returned.z /= x.z;
            returned.w /= x.w;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.divide(new DaveShade.vector4(x, y, z, w));
    }

    exponent(x, y, z, w) {
        //If we are exponentiating by a vector
        if (x instanceof DaveShade.vector4) {
            const returned = this.duplicate();

            returned.x = Math.pow(returned.x, x.x);
            returned.y = Math.pow(returned.y, x.y);
            returned.z = Math.pow(returned.z, x.z);
            returned.w = Math.pow(returned.w, x.w);

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.exponent(new DaveShade.vector4(x, y, z, w));
    }

    //Also add some shortcuts
    sub(x, y, z, w) { return this.subtract(x, y, z, w); }
    mul(x, y, z, w) { return this.multiply(x, y, z, w); }
    div(x, y, z, w) { return this.divide(x, y, z, w); }
    pow(x, y, z, w) { return this.exponent(x, y, z, w); }

    //comparisons, with a shorthand
    equals(x, y, z, w) {
        if (x instanceof DaveShade.vector4) return x == this.x && y == this.y && z == this.z && w == this.w;
        return this.equals(new DaveShade.vector4(x, y, z, w));
    }

    dot(x, y, z, w) {
        if (x instanceof DaveShade.vector4) {
            const m = this.mul(x);
            return m.x + m.y + m.z + m.w;
        }

        return this.dot(new DaveShade.vector4(x, y, z, w));
    }

    eql(x, y, z, w) { return this.equals(x, y, z, w); }

    //Useful data
    get lengthSquared() { return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w); }
    get length() { return Math.sqrt(this.lengthSquared); }

    get normalized() { return this.div(this.length); }

    //Stranger transformation
    flip() { return new DaveShade.vector4(-this.x, -this.y, -this.z, -this.w); }
}

//Some basic vectors and directions
DaveShade.vector4.zero = () => { return new DaveShade.vector4(0); }
DaveShade.vector4.one = () => { return new DaveShade.vector4(1); }

DaveShade.vector4.right = () => { return new DaveShade.vector4(1, 0, 0, 0); }
DaveShade.vector4.left = () => { return new DaveShade.vector4(-1, 0, 0, 0); }

DaveShade.vector4.up = () => { return new DaveShade.vector4(0, 1, 0, 0); }
DaveShade.vector4.down = () => { return new DaveShade.vector4(0, -1, 0, 0); }

DaveShade.vector4.forward = () => { return new DaveShade.vector4(0, 0, 1, 0); }
DaveShade.vector4.backward = () => { return new DaveShade.vector4(0, 0, -1, 0); }

DaveShade.vector4.ana = () => { return new DaveShade.vector4(0, 0, 0, 1); }
DaveShade.vector4.kata = () => { return new DaveShade.vector4(0, 0, 0, -1); }