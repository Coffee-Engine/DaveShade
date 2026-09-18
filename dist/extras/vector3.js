DaveShade.vector3 = class {
    constructor(x, y, z) { 
        this.x = DaveShade.cleanNumber(x);
        
        //If we only define x, use x
        if (x !== undefined && y === undefined && z === undefined) {
            this.y = this.x;
            this.z = this.x;
        }
        else {
            this.y = DaveShade.cleanNumber(y);
            this.z = DaveShade.cleanNumber(z);
        }
    }
}

DaveShade.vector3.zero = () => { DaveShade.vector3(0); }
DaveShade.vector3.one = () => { DaveShade.vector3(1); }