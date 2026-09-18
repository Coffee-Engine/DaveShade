DaveShade.vector2 = class {
    //Private values
    #x = 0; #y = 0;

    //To keep the vector clean
    set x(v) { this.#x = DaveShade.cleanNumber(v); } get x() { return this.#x; }
    set y(v) { this.#y = DaveShade.cleanNumber(v); } get y() { return this.#y; }

    //Clean and simple
    get _UNIFORM_VALUE_() { return [ this.x, this.y ]; }

    //Basic methods
    constructor(x, y) { 
        this.x = DaveShade.cleanNumber(x);
        
        //If we only define x, use x
        this.y = (y === undefined) ? this.x : DaveShade.cleanNumber(y);
    }

    duplicate() { return new DaveShade.vector2(this.x, this.y); }

    //Basic arithmatic
    add(x, y) {
        //If we are adding by a vector
        if (x instanceof DaveShade.vector2) {
            const returned = this.duplicate();

            returned.x += x.x;
            returned.y += x.y;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.add(new DaveShade.vector2(x, y));
    }

    subtract(x, y) {
        //If we are subtracting by a vector
        if (x instanceof DaveShade.vector2) {
            const returned = this.duplicate();

            returned.x -= x.x;
            returned.y -= x.y;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.subtract(new DaveShade.vector2(x, y));
    }

    multiply(x, y) {
        //If we are multiplying by a vector
        if (x instanceof DaveShade.vector2) {
            const returned = this.duplicate();

            returned.x *= x.x;
            returned.y *= x.y;

            return returned;
        }

        //If we aren't a vector 3, turn into one.
        return this.multiply(new DaveShade.vector2(x, y));
    }

    divide(x, y) {
        //If we are dividing by a vector
        if (x instanceof DaveShade.vector2) {
            const returned = this.duplicate();

            returned.x /= x.x;
            returned.y /= x.y;

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.divide(new DaveShade.vector2(x, y));
    }

    exponent(x, y) {
        //If we are exponentiating by a vector
        if (x instanceof DaveShade.vector2) {
            const returned = this.duplicate();

            returned.x = Math.pow(returned.x, x.x);
            returned.y = Math.pow(returned.y, x.y);

            return returned;
        }
        
        //If we aren't a vector 3, turn into one.
        return this.exponent(new DaveShade.vector2(x, y));
    }

    //Also add some shortcuts
    sub(x, y) { return this.subtract(x, y); }
    mul(x, y) { return this.multiply(x, y); }
    div(x, y) { return this.divide(x, y); }
    pow(x, y) { return this.exponent(x, y); }

    //comparisons, with a shorthand
    equals(x, y) {
        if (x instanceof DaveShade.vector2) return x == this.x && y == this.y;
        return this.equals(new DaveShade.vector2(x, y));
    }

    dot(x, y) {
        if (x instanceof DaveShade.vector2) {
            const m = this.mul(x);
            return m.x + m.y;
        }

        return this.dot(new DaveShade.vector2(x, y));
    }

    eql(x, y) { return this.equals(x, y); }

    //Useful data
    get lengthSquared() { return (this.x * this.x) + (this.y * this.y); }
    get length() { return Math.sqrt(this.lengthSquared); }

    get normalized() { return this.div(this.length); }

    //Stranger transformations
    flip() { return new DaveShade.vector2(-this.x, -this.y); }
    parallel() { return new DaveShade.vector2(this.y, -this.x); }

    rotate(a) {
        return new DaveShade.vector2(
            this.y * Math.sin(a) + this.x * Math.cos(a),
            this.y * Math.cos(a) - this.x * Math.sin(a)
        )
    }
}

//Some basic vectors and directions
DaveShade.vector2.zero = () => { return new DaveShade.vector2(0); }
DaveShade.vector2.one = () => { return new DaveShade.vector2(1); }

DaveShade.vector2.right = () => { return new DaveShade.vector2(1, 0); }
DaveShade.vector2.left = () => { return new DaveShade.vector2(-1, 0); }

DaveShade.vector2.up = () => { return new DaveShade.vector2(0, 1); }
DaveShade.vector2.down = () => { return new DaveShade.vector2(0, -1); }