DaveShade.color = class {
    //Private values
    #r = 0; #g = 0; #b = 0; #a = 0;
    
    //Keeping the color clean
    set r(v) { this.#r = Math.max(0, Math.min(DaveShade.cleanNumber(v), 255)) | 0 } get r() { return this.#r}
    set g(v) { this.#g = Math.max(0, Math.min(DaveShade.cleanNumber(v), 255)) | 0 } get g() { return this.#g}
    set b(v) { this.#b = Math.max(0, Math.min(DaveShade.cleanNumber(v), 255)) | 0 } get b() { return this.#b}
    set a(v) { this.#a = Math.max(0, Math.min(DaveShade.cleanNumber(v), 255)) | 0 } get a() { return this.#a}
    

    //Then the DS value
    get _UNIFORM_VALUE_() { return [ this.r / 255, this.g / 255, this.b / 255, this.a / 255 ]; }

    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

DaveShade.color.regex8 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
DaveShade.color.regex6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
DaveShade.color.regex4 = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i;
DaveShade.color.regex3 = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i;

DaveShade.color.hex = (hex) => {
    let r = 0; let g = 0; let b = 0; let a = 255;

    switch (typeof hex) {
        //Strings are typically "#ffffff" or "ffffff"
        case "string":
            let regex = null;

            //Make sure we start with a #
            if (!hex.startsWith("#")) hex = `#${hex}`;

            //If we are above range return black
            if (hex.length > 9) return new DaveShade.color(0, 0, 0, 1);
            //Find the best parsing regex for the hex
            if (hex.length > 5)
                regex = (hex.length > 7) ? DaveShade.color.regex8 : DaveShade.color.regex6;
            else if (hex.length > 3)
                regex = (hex.length > 3) ? DaveShade.color.regex4 : DaveShade.color.regex3;
            //If we aren't valid, return black
            else return new DaveShade.color(0, 0, 0, 1);

            //If we are sucessful start parsing the hex
            const split = regex.exec(hex);
            const multiplier = (hex.length <= 5) ? 17 : 1;
            
            //Parse results
            r = parseInt(split[1], 16) * multiplier;
            g = parseInt(split[2], 16) * multiplier;
            b = parseInt(split[3], 16) * multiplier;
            if (split.length > 4) a = parseInt(split[4], 16) * multiplier;
            break;
        
        //Numbers are typically 0xffffff or 16777215
        case "bigint":
        case "number":
            //Make sure it is a number
            hex = Number(hex);
            if (isNaN(hex)) hex = 0;

            //Add alpha into the equation
            if (hex >= 16777216) {
                r = ((hex / 16777216) % 256) | 0;
                g = ((hex / 65536) % 256) | 0;
                b = ((hex / 256) % 256) | 0;
                a = (hex % 256) | 0;
            }
            else {
                r = ((hex / 65536) % 256) | 0;
                g = ((hex / 256) % 256) | 0;
                b = (hex % 256) | 0;
                a = 255;
            }
            break;
    
        default:
            break;
    }

    //Convert to 0-1 range and send back as color
    return new DaveShade.color(r, g, b, a);
}