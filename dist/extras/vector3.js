DaveShade.vector3 = class {
    //Private values
    #x = 0; #y = 0; #z = 0;

    //To keep the vector clean
    set x(v) { this.#x = DaveShade.cleanNumber(v); } get x() { return this.#x; }
    set y(v) { this.#y = DaveShade.cleanNumber(v); } get y() { return this.#y; }
    set z(v) { this.#z = DaveShade.cleanNumber(v); } get z() { return this.#z; }

    //Clean and simple
    get _UNIFORM_VALUE_() { return [ this.x, this.y, this.z ]; }

    //Basic methods
    constructor(x, y, z) { 
        this.x = DaveShade.cleanNumber(x);
        
        //If we only define x, use x
        if (y === undefined || z === undefined) {
            this.y = this.x;
            this.z = this.x;
        }
        else {
            this.y = DaveShade.cleanNumber(y);
            this.z = DaveShade.cleanNumber(z);
        }
    }

    duplicate() { return new DaveShade.vector3(this.x, this.y, this.z); }

    //Basic arithmatic
    add(x, y, z) {
        //If we are adding by a vector
        if (x instanceof DaveShade.vector3) {
            const returned = this.duplicate();

            returned.x += x.x;
            returned.y += x.y;
            returned.z += x.z;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.add(new DaveShade.vector3(x, y, z));
    }

    subtract(x, y, z) {
        //If we are subtracting by a vector
        if (x instanceof DaveShade.vector3) {
            const returned = this.duplicate();

            returned.x -= x.x;
            returned.y -= x.y;
            returned.z -= x.z;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.subtract(new DaveShade.vector3(x, y, z));
    }

    multiply(x, y, z) {
        //If we are multiplying by a vector
        if (x instanceof DaveShade.vector3) {
            const returned = this.duplicate();

            returned.x *= x.x;
            returned.y *= x.y;
            returned.z *= x.z;

            return returned;
        }

        //If we aren't a vector 3, turn into one.
        return this.multiply(new DaveShade.vector3(x, y, z));
    }

    divide(x, y, z) {
        //If we are dividing by a vector
        if (x instanceof DaveShade.vector3) {
            const returned = this.duplicate();

            returned.x /= x.x;
            returned.y /= x.y;
            returned.z /= x.z;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.divide(new DaveShade.vector3(x, y, z));
    }

    exponent(x, y, z) {
        //If we are exponentiating by a vector
        if (x instanceof DaveShade.vector3) {
            const returned = this.duplicate();

            returned.x = Math.pow(returned.x, x.x);
            returned.y = Math.pow(returned.y, x.y);
            returned.z = Math.pow(returned.z, x.z);

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.exponent(new DaveShade.vector3(x, y, z));
    }

    //Also add some shortcuts
    sub(x, y, z) { return this.subtract(x, y, z); }
    mul(x, y, z) { return this.multiply(x, y, z); }
    div(x, y, z) { return this.divide(x, y, z); }
    pow(x, y, z) { return this.exponent(x, y, z); }

    //comparisons, with a shorthand
    equals(x, y, z) {
        if (x instanceof DaveShade.vector3) return x == this.x && y == this.y && z == this.z;
        return this.equals(new DaveShade.vector3(x, y, z));
    }

    dot(x, y, z) {
        if (x instanceof DaveShade.vector3) {
            const m = this.mul(x);
            return m.x + m.y + m.z;
        }

        return this.dot(new DaveShade.vector3(x, y, z));
    }

    eql(x, y, z) { return this.equals(x, y, z); }

    //Useful data
    get lengthSquared() { return (this.x * this.x) + (this.y * this.y) + (this.z * this.z); }
    get length() { return Math.sqrt(this.lengthSquared); }

    get normalized() { return this.div(this.length); }

    //Stranger transformations
    flip() { return new DaveShade.vector3(-this.x, -this.y, -this.z); }
    
    cross(x, y, z) {
        //If we are a vector, start.
        if (x instanceof DaveShade.vector3) return new DaveShade.vector3(
            this.y * x.z - this.z * x.y,
            this.z * x.x - this.x * x.z,
            this.x * x.y - this.y * x.x
        );

        //Otherwise, convert
        return this.cross(new DaveShade.vector3(x, y, z));
    }

    //Simple rotations, since we may want to rotate a vector 3
    rotateX(a) {
        return new DaveShade.vector3(
            this.x,
            this.z * Math.sin(a) + this.y * Math.cos(a),
            this.z * Math.cos(a) - this.y * Math.sin(a)
        )
    }

    rotateY(a) {
        return new DaveShade.vector3(
            this.z * Math.sin(a) + this.x * Math.cos(a),
            this.y,
            this.z * Math.cos(a) - this.x * Math.sin(a)
        )
    }

    rotateZ(a) {
        return new DaveShade.vector3(
            this.y * Math.sin(a) + this.x * Math.cos(a),
            this.y * Math.cos(a) - this.x * Math.sin(a),
            this.z
        )
    }
}

//Some basic vectors and directions
DaveShade.vector3.zero = () => { return new DaveShade.vector3(0); }
DaveShade.vector3.one = () => { return new DaveShade.vector3(1); }

DaveShade.vector3.right = () => { return new DaveShade.vector3(1, 0, 0); }
DaveShade.vector3.left = () => { return new DaveShade.vector3(-1, 0, 0); }

DaveShade.vector3.up = () => { return new DaveShade.vector3(0, 1, 0); }
DaveShade.vector3.down = () => { return new DaveShade.vector3(0, -1, 0); }

DaveShade.vector3.forward = () => { return new DaveShade.vector3(0, 0, 1); }
DaveShade.vector3.backward = () => { return new DaveShade.vector3(0, 0, -1); }