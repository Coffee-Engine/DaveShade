/*
                         %@@@@@@@@@@@@@@@+               
                       @@@@##@@@@@@@####@@@              
                     #@@##@@@@@@@@@@@@@@@+               
                     @@##@@=                             
       @@@@@@@@@@@@@@@###@#                              
    @@@@@@@@@@@@@@@@#####@%                              
  -@@@@@@@        @@@@###@@                              
 :@@#@@.            @@%###@@@@                           
 @@#%@               @@#####@@@@@@                       
#@##@@                @###@@@###@@@@@@                   
@@##@:                @@##@-@@@@@@##@@@@@                
@%##@                 @@##@     @@@@@##@@@.              
@@##@                 @@##@+       #@@@##@@              
@@##@=                @@##@          @@###@@             
 @##@@                @##@@           @###@@             
 @@##@%              @@#@@=           @###@@             
  @@#@@@            @@##@           =@@##@@              
   @@@#@@@@     -@@@@###@@@@@@@@@@@@@@#@@@+              
     @@@@@@@@@@@@@@@@@@####%@@@@@@##@@@@@                
        @@@@@@@@@@@# @@@@@@@@@@@@@@@@@         

--===--  Written by : ObviousAlexC / Pinksheep2917  --===--
*/

window.DaveShade = {};

//Module Creation
DaveShade.module = class {
    COMPILE_STATUS = {
        SUCCESS: 1,
        FAILURE: 0
    }

    //Regex items
    REGEX = {
        ATTRIBUTE: /attribute.*;/g,
    }

    //Things we might want
    CANVAS = null;
    SHADERS = [];
    FRAMEBUFFERS = [];
    ATTRIBUTE_BINDINGS = {};
    TRI_COUNT = 0;

    //Enums set at start time
    RENDER_TYPE = {};
    SETTERS = {};
    SIDE = {};
    FILTERING = {};
    RENDERBUFFER_TYPE = {};
    CUBEMAP_ORDER = [];
    CLEAR_TARGET = {};
    DEPTH_FUNC = {};

    TYPE = "GENERIC";

    //Private variable for the buffer incrementing system
    #BUFFER_ID = 0;

    attachColorBuffer() { console.error(`"attachColorBuffer" not defined in module ${this.TYPE}!`) }

    createShader(VERTEX, FRAGMENT) { console.error(`"createShader" not defined in module ${this.TYPE}!`) }
    disposeShader(SHADER) { console.error(`"disposeShader" not defined in module ${this.TYPE}!`) }
    useProgram(PROGRAM) { console.error(`"useProgram" not defined in module ${this.TYPE}!`) }

    useZBuffer() { console.error(`"useZBuffer" not defined in module ${this.TYPE}!`) }
    cullFace() { console.error(`"cullFace" not defined in module ${this.TYPE}!`) }

    renderToCanvas() { console.error(`"renderToCanvas" not defined in module ${this.TYPE}!`) }
    createFramebuffer(WIDTH, HEIGHT, ATTACHMENTS) { console.error(`"createFramebuffer" not defined in module ${this.TYPE}!`) }

    createTexture() { console.error(`"createTexture" not defined in module ${this.TYPE}!`) }
    createTextureCube() { console.error(`"createTextureCube" not defined in module ${this.TYPE}!`) }
    createTexture3D() { console.error(`"createTexture3D" not defined in module ${this.TYPE}!`) }

    buffersFromJSON(ATTRIBUTE_JSON) { console.error(`"buffersFromJSON" not defined in module ${this.TYPE}!`) }

    dispose() { delete this; }

    clear(TARGET) { console.error(`"clear" not defined in module ${this.TYPE}!`) }

    setup(CANVAS, SETTINGS) { console.warn(`${this.TYPE} doesn't have a "setup" function. Does it exist?`) }
    setupTextureReader(CANVAS, SETTINGS) { console.warn(`${this.TYPE} doesn't have a "setupTextureReader" function. Does it exist?`) }
    readTexture(TEXTURE, X, Y, W, H) {}

    supported() { return true }

    constructor(CANVAS, SETTINGS) {
        //Remove ourselves if canvas doesn't exist
        if (!CANVAS) {
            this.dispose();
            return;
        }

        SETTINGS = SETTINGS || {};

        //These are seperated for cleanliness
        this.setup(CANVAS, SETTINGS);
        this.setupTextureReader(CANVAS, SETTINGS);
    }
}

//Define basic shader class
DaveShade.shader = class {
    VERTEX = {};
    FRAGMENT = {};
    PROGRAM = null;
    PARENT_MODULE = null;
    
    UNIFORM_INDICIES = [];
    ACTIVE_UNIFORMS = {};
    UNIFORMS = {};

    ATTRIBUTE_INDICIES = {};
    ATTRIBUTES = {};

    TEXTURE_COUNT = 0;

    //Just compatibility
    get uniforms() { return this.UNIFORMS; }

    use() {
        this.PARENT_MODULE.useProgram(this.PROGRAM);
    }
}

//Now for the base webGL module
DaveShade.webGLModule = class extends DaveShade.module {
    GL_VERSION = 2;

    _poachShaderUniforms(SHADER) {
        //* Grab the uniforms
        SHADER.UNIFORM_INDICIES = [...Array(this.GL.getProgramParameter(SHADER.PROGRAM, this.GL.ACTIVE_UNIFORMS)).keys()];
        SHADER.ACTIVE_UNIFORMS = this.GL.getActiveUniforms(SHADER.PROGRAM, SHADER.UNIFORM_INDICIES, this.GL.UNIFORM_TYPE);
        SHADER.TEXTURE_COUNT = 0;

        //* use the program while we assign stuff
        this.GL.useProgram(SHADER.PROGRAM);

        //* Loop through the uniforms
        for (let id = 0; id < SHADER.ACTIVE_UNIFORMS.length; id++) {
            const uniformInfo = this.GL.getActiveUniform(SHADER.PROGRAM, id);
            const uniformName = uniformInfo.name.split("[")[0];
            const isArray = uniformInfo.name.includes("[");

            //differentiate arrays and
            if (isArray) {
                const arrayLength = uniformInfo.size;
                SHADER.uniforms[uniformName] = [];

                for (let index = 0; index < arrayLength; index++) {
                    const location = this.GL.getUniformLocation(SHADER.PROGRAM, `${uniformName}[${index}]`);

                    SHADER.uniforms[uniformName].push({
                        location: location,
                        type: uniformInfo.type,
                        isArray: isArray,
                        "#value": null,

                        set value(value) {
                            this.GL.useProgram(SHADER.PROGRAM);
                            SHADER.UNIFORMS[uniformName]["#value"] = value;
                            this.setters[uniformInfo.type](location, value, uniformInfo);
                        },

                        get value() { return SHADER.UNIFORMS[uniformName]["#value"]; },
                    });
                }
            } else {
                const location = this.GL.getUniformLocation(SHADER.PROGRAM, uniformName);

                SHADER.UNIFORMS[uniformName] = {
                    location: location,
                    type: uniformInfo.type,
                    isArray: isArray,
                    "#value": null,

                    set value(value) {
                        this.GL.useProgram(SHADER.PROGRAM);
                        SHADER.UNIFORMS[uniformName]["#value"] = value;
                        this.SETTERS[uniformInfo.type](location, value, uniformInfo);
                    },

                    get value() { return SHADER.UNIFORMS[uniformName]["#value"]; },
                };
            }

            if (uniformInfo.type == 35678) {
                uniformInfo.SAMPLER_ID = SHADER.TEXTURE_COUNT;
                SHADER.TEXTURE_COUNT += 1;
            }
        }
    }

    _poachShaderAttributes(SHADER) {
        //* Grab the attributes
        SHADER.ATTRIBUTE_INDICIES = [...Array(this.GL.getProgramParameter(SHADER.PROGRAM, this.GL.ACTIVE_ATTRIBUTES)).keys()];

        //* Loop through the attributes
        SHADER.ATTRIBUTE_INDICIES.forEach((attributeID) => {
            //* Lets split the attribute definition
            const attributeDef = this.GL.getActiveAttrib(SHADER.PROGRAM, attributeID);

            //? could probably conglomerate better?
            SHADER.ATTRIBUTES[attributeDef.name] = {
                type: attributeDef.type,
            };

            //* Attribute Stuff
            SHADER.ATTRIBUTES[attributeDef.name].location = this.GL.getAttribLocation(SHADER.PROGRAM, attributeDef.name);
            this.GL.enableVertexAttribArray(SHADER.ATTRIBUTES[attributeDef.name].location);

            //* Create the buffer
            SHADER.ATTRIBUTES[attributeDef.name].buffer = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, SHADER.ATTRIBUTES[attributeDef.name].buffer);
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(65536), this.GL.STATIC_DRAW);

            //* Assign values dependant on types
            switch (SHADER.ATTRIBUTES[attributeDef.name].type) {
                case this.GL.FLOAT:
                    SHADER.ATTRIBUTES[attributeDef.name].divisions = 1;
                    break;

                case this.GL.FLOAT_VEC2:
                    SHADER.ATTRIBUTES[attributeDef.name].divisions = 2;
                    break;

                case this.GL.FLOAT_VEC3:
                    SHADER.ATTRIBUTES[attributeDef.name].divisions = 3;
                    break;

                case this.GL.FLOAT_VEC4:
                    SHADER.ATTRIBUTES[attributeDef.name].divisions = 4;
                    break;

                default:
                    SHADER.ATTRIBUTES[attributeDef.name].divisions = 1;
                    break;
            }
            
            const location = SHADER.ATTRIBUTES[attributeDef.name].location;
            const divisions = SHADER.ATTRIBUTES[attributeDef.name].divisions;

            //* The setter legacy (DS2)
            SHADER.ATTRIBUTES[attributeDef.name].setRaw = (newValue) => {
                this.oldAttributes[location] = 0;
                this.GL.bindBuffer(this.GL.ARRAY_BUFFER, SHADER.ATTRIBUTES[attributeDef.name].buffer);
                this.GL.bufferData(this.GL.ARRAY_BUFFER, newValue, this.GL.STATIC_DRAW);
                this.GL.vertexAttribPointer(location, divisions, this.GL.FLOAT, false, 0, 0);
            };

            //* The setter
            SHADER.ATTRIBUTES[attributeDef.name].set = (newValue) => {
                if (this.oldAttributes[location] == newValue.bufferID) return;
                this.oldAttributes[location] = newValue.bufferID;
                this.GL.bindBuffer(GL.ARRAY_BUFFER, newValue);
                this.GL.vertexAttribPointer(location, divisions, this.GL.FLOAT, false, 0, 0);
            };

            this.GL.vertexAttribPointer(location, divisions, this.GL.FLOAT, false, 0, 0);
        });

        //* The buffer setter! the Legacy ONE!
        SHADER.setBuffersRaw = (attributeJSON) => {
            //? Loop through the keys
            SHADER.usingIndices = false;
            for (let key in attributeJSON) {
                //* if it exists set the attribute
                if (key == DaveShade.IndiceIdent) {
                    //Do nothing
                    continue;
                }
                if (SHADER.ATTRIBUTES[key]) {
                    SHADER.ATTRIBUTES[key].setRaw(attributeJSON[key]);
                }
            }
        };
    }

    createShader(VERTEX, FRAGMENT) {
        //Create our shader and add it to the list
        const createdShader = new DaveShade.shader();

        //* Compile the vertex shader
        createdShader.VERTEX.shader = this.GL.createShader(this.GL.VERTEX_SHADER);
        createdShader.VERTEX.src = VERTEX;

        //Set shader source first
        this.GL.shaderSource(createdShader.VERTEX.shader, VERTEX);
        this.GL.compileShader(createdShader.VERTEX.shader);

        //? could potentially be better?
        if (!this.GL.getShaderParameter(createdShader.VERTEX.shader, this.GL.COMPILE_STATUS)) {
            console.error(`shader not compiled!\nclearing memory\nCompile Log\n***\n${this.GL.getShaderInfoLog(createdShader.VERTEX.shader)}\n***`);
            this.disposeShader(createdShader);
            return {
                status: this.COMPILE_STATUS.FAILURE,
            };
        }

        //* Compile the fragment shader
        createdShader.FRAGMENT.shader = this.GL.createShader(this.GL.FRAGMENT_SHADER);
        createdShader.FRAGMENT.src = FRAGMENT;

        //Set shader source first
        this.GL.shaderSource(createdShader.FRAGMENT.shader, FRAGMENT);
        this.GL.compileShader(createdShader.FRAGMENT.shader);

        //? could potentially be better?
        if (!this.GL.getShaderParameter(createdShader.FRAGMENT.shader, this.GL.COMPILE_STATUS)) {
            console.error(`shader not compiled!\nclearing memory\nCompile Log\n***\n${this.GL.getShaderInfoLog(createdShader.FRAGMENT.shader)}\n***`);
            this.clearShaderFromMemory(createdShader);
            return {
                status: this.COMPILE_STATUS.FAILURE,
            };
        }

        //* Get in the oven frank
        createdShader.PROGRAM = this.GL.createProgram();

        this.GL.attachShader(createdShader.PROGRAM, createdShader.VERTEX.shader);
        this.GL.attachShader(createdShader.PROGRAM, createdShader.FRAGMENT.shader);

        this.GL.linkProgram(createdShader.PROGRAM);

        //? could potentially be better?
        if (!this.GL.getProgramParameter(createdShader.PROGRAM, this.GL.LINK_STATUS)) {
            console.error(`shader not compiled!\nerror in program linking!\nclearing memory\nlink log\n***\n${gl.getProgramInfoLog(createdShader.PROGRAM)}\n***`);
            this.clearShaderFromMemory(createdShader);
            return {
                status: this.COMPILE_STATUS.FAILURE,
            };
        }

        //Set and find stuff we need before finally returning the created shader
        createdShader.PARENT_MODULE = this;
        this._poachShaderUniforms(createdShader);
        this._poachShaderAttributes(createdShader);
        this.SHADERS.push(createdShader);
        return createdShader;
    }
    
    disposeShader(SHADER) {
        //*Remove the shader from the list
        if (this.SHADERS.includes(SHADER)) {
            this.SHADERS.splice(this.SHADERS.indexOf(SHADER), 1);
        }

        //*Delete the program and shaders
        if (SHADER.PROGRAM) {
            GL.deleteProgram(SHADER.PROGRAM);
        }
        if (SHADER.VERTEX.shader) {
            GL.deleteShader(SHADER.VERTEX.shader);
        }
        if (SHADER.FRAGMENT.shader) {
            GL.deleteShader(SHADER.FRAGMENT.shader);
        }
    }
    
    useProgram(PROGRAM) {
        this.GL.useProgram(PROGRAM);
    }

    useZBuffer(FUNC) {
        //Classic "BOOL"
        switch (typeof FUNC) {
            case "boolean":
                if (FUNC) GL.enable(GL.DEPTH_TEST);
                else GL.disable(GL.DEPTH_TEST);
                
                GL.depthFunc(FUNC ? GL.LEQUAL : GL.NEVER);
                break;
            
            case "number":
                if (FUNC == this.DEPTH_FUNC.NEVER) GL.disable(GL.DEPTH_TEST);
                else GL.enable(GL.DEPTH_TEST);
                GL.depthFunc(FUNC);
                break;
        
            default:
                break;
        }        
    }

    cullFace(SIDE) {
        if (typeof SIDE != "number") return;

        if (SIDE == 0) { this.GL.disable(this.GL.CULL_FACE); }
        else {
            this.GL.enable(this.GL.CULL_FACE);
            this.GL.cullFace(SIDE);
        }
    }

    clear(TARGET) {
        if (typeof TARGET != "number") return;

        this.TRI_COUNT = 0;
        this.GL.clear(TARGET);
    }

    setup(CANVAS, SETTINGS) {
        //I set type in here so we don't get "GENERIC" in the console
        this.TYPE = "WEBGL";

        //Try webGL2 creation first
        this.GL = CANVAS.getContext("webgl2", SETTINGS);
        this.VOA_MANAGER = this.GL;

        //If we fail try webGL1
        if (!this.GL) {
            this.GL = CANVAS.getContext("webgl", SETTINGS);
            this.GL_VERSION = 1;
            
            //Webgl doesn't have native support for VOAs or Multipass Rendering so we add the addon for VOAs, and extra Draw Buffers
            this.VOA_MANAGER = this.GL.getExtension("OES_vertex_array_object");
            this.DRAWBUFFER_MANAGER = this.GL.getExtension("WEBGL_draw_buffers");
        } 
        //Else we add our extensions
        else {
            this.COLORBUFFER_FLOAT = this.GL.getExtension("EXT_color_buffer_float");
            this.FLOAT_BLEND = this.GL.getExtension("EXT_float_blend");
        }

        //Now we set up our variables
        //First clear targets
        this.CLEAR_TARGET.COLOR = this.GL.COLOR_BUFFER_BIT;
        this.CLEAR_TARGET.DEPTH = this.GL.DEPTH_BUFFER_BIT;
        this.CLEAR_TARGET.STENCIL = this.GL.STENCIL_BUFFER_BIT;

        //Face sides
        this.SIDE.FRONT = this.GL.FRONT;
        this.SIDE.BACK = this.GL.BACK;
        this.SIDE.BOTH = this.GL.FRONT_AND_BACK;
        this.SIDE.NEITHER = 0;

        //Depth Functions
        this.DEPTH_FUNC.NEVER = this.GL.NEVER;
        this.DEPTH_FUNC.NOTEQUAL = this.GL.NOTEQUAL;
        this.DEPTH_FUNC.LESS = this.GL.LESS;
        this.DEPTH_FUNC.LEQUAL = this.GL.LEQUAL;
        this.DEPTH_FUNC.EQUAL = this.GL.EQUAL;
        this.DEPTH_FUNC.GEQUAL = this.GL.GEQUAL;
        this.DEPTH_FUNC.GREATER = this.GL.GREATER;
        this.DEPTH_FUNC.ALWAYS = this.GL.ALWAYS;

        //Setters
        
        //We clamp the boolean
        this.SETTERS[this.GL.BOOL] = (LOCATION, VALUE) => { this.GL.uniform1ui(LOCATION, Math.max(Math.min(1, Math.floor(VALUE)), 0)); }

        //Make sure integers are rounded
        this.SETTERS[this.GL.INT] = (LOCATION, VALUE) => { this.GL.uniform1i(LOCATION, Math.floor(VALUE)); }
        this.SETTERS[this.GL.UNSIGNED_INT] = (LOCATION, VALUE) => { this.GL.uniform1ui(LOCATION, Math.floor(VALUE)); }

        //Then the float likes
        this.SETTERS[this.GL.FLOAT] = (LOCATION, VALUE) => { this.GL.uniform1f(LOCATION, VALUE); }
        this.SETTERS[this.GL.FLOAT_VEC2] = (LOCATION, VALUE) => { this.GL.uniform2fv(LOCATION, VALUE); }
        this.SETTERS[this.GL.FLOAT_VEC3] = (LOCATION, VALUE) => { this.GL.uniform3fv(LOCATION, VALUE); }
        this.SETTERS[this.GL.FLOAT_VEC4] = (LOCATION, VALUE) => { this.GL.uniform4fv(LOCATION, VALUE); }
        
        this.SETTERS[this.GL.FLOAT_MAT2] = (LOCATION, VALUE) => { this.GL.uniformMatrix2fv(LOCATION, VALUE); }
        this.SETTERS[this.GL.FLOAT_MAT3] = (LOCATION, VALUE) => { this.GL.uniformMatrix3fv(LOCATION, VALUE); }
        this.SETTERS[this.GL.FLOAT_MAT4] = (LOCATION, VALUE) => { this.GL.uniformMatrix4fv(LOCATION, VALUE); }

        //Finally the textures, these ones are a little more complicated
        this.SETTERS[this.GL.SAMPLER_2D] = (LOCATION, VALUE, UNIFORM_INFO) => {
            this.GL.activeTexture(this.GL[`TEXTURE${UNIFORM_INFO.SAMPLER_ID}`]);
            this.GL.bindTexture(this.GL.TEXTURE_2D, VALUE);
            this.GL.uniform1i(LOCATION, UNIFORM_INFO.SAMPLER_ID);
        }

        this.SETTERS[this.GL.SAMPLER_CUBE] = (LOCATION, VALUE, UNIFORM_INFO) => {
            this.GL.activeTexture(this.GL[`TEXTURE${UNIFORM_INFO.SAMPLER_ID}`]);
            this.GL.bindTexture(this.GL.TEXTURE_CUBE_MAP, VALUE);
            this.GL.uniform1i(LOCATION, UNIFORM_INFO.SAMPLER_ID);
        }

        this.SETTERS[this.GL.SAMPLER_3D] = (LOCATION, VALUE, UNIFORM_INFO) => {
            this.GL.activeTexture(this.GL[`TEXTURE${UNIFORM_INFO.SAMPLER_ID}`]);
            this.GL.bindTexture(this.GL.TEXTURE_3D, VALUE);
            this.GL.uniform1i(LOCATION, UNIFORM_INFO.SAMPLER_ID);
        }
    }

    supported() { return (window.WebGLRenderingContext !== undefined); }
};

(function () {
    //Compile status enum
    DaveShade.COMPILE_STATUS = {
        SUCCESS: 1,
        FAILURE: 0,
    };

    DaveShade.IndiceIdent = "__INDICIES__";

    DaveShade.REGEX = {
        ATTRIBUTE: /attribute.*;/g,
    };

    DaveShade.setters = {
        //?Boolean
        35670: (GL, location, value) => {
            GL.uniform1ui(location, Math.floor(value));
        },

        //?Int
        5124: (GL, location, value) => {
            GL.uniform1i(location, Math.floor(value));
        },

        //?Unsigned Int
        5125: (GL, location, value) => {
            GL.uniform1ui(location, Math.floor(value));
        },

        //?Float
        5126: (GL, location, value) => {
            GL.uniform1f(location, value);
        },
        //?Vec2
        35664: (GL, location, value) => {
            GL.uniform2fv(location, value);
        },
        //?Vec3
        35665: (GL, location, value) => {
            GL.uniform3fv(location, value);
        },
        //?Vec4
        35666: (GL, location, value) => {
            GL.uniform4fv(location, value);
        },

        //?Mat2
        35674: (GL, location, value) => {
            GL.uniformMatrix2fv(location, false, value);
        },

        //?Mat3
        35675: (GL, location, value) => {
            GL.uniformMatrix3fv(location, false, value);
        },

        //?Mat4
        35676: (GL, location, value) => {
            GL.uniformMatrix4fv(location, false, value);
        },

        //?Sampler2D
        35678: (GL, location, value, uniformInfo) => {
            GL.activeTexture(GL[`TEXTURE${uniformInfo.samplerID}`]);
            GL.bindTexture(GL.TEXTURE_2D, value);
            GL.uniform1i(location, uniformInfo.samplerID);
        },

        //?SamplerCube
        35680: (GL, location, value) => {
            GL.activeTexture(GL[`TEXTURE${uniformInfo.samplerID}`]);
            GL.bindTexture(GL.TEXTURE_CUBE_MAP, value);
            GL.uniform1i(location, uniformInfo.samplerID);
        },

        //?Sampler3D
        35679: (GL, location, value) => {
            GL.activeTexture(GL[`TEXTURE${uniformInfo.samplerID}`]);
            GL.bindTexture(GL.TEXTURE_3D, value);
            GL.uniform1i(location, uniformInfo.samplerID);
        },
    };

    DaveShade.renderTypes = {
        LINES: 1,
        TRIANGLES: 4,
    };

    DaveShade.side = {
        FRONT:0,
        BACK:1,
        NEITHER: 2,
    }

    DaveShade.filtering = {
        LINEAR: 9729,
        NEAREST: 9728,
    }

    DaveShade.EZAttachColorBuffer = (GL, framebufferInfo, dsInfo, renderBufferInfo) => {
        //Size up the render buffer's texture
        renderBufferInfo.resize(framebufferInfo.width, framebufferInfo.height);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

        //Get our color attachment
        const attachedBuffer = dsInfo.DRAWBUFFER_MANAGER ? dsInfo.DRAWBUFFER_MANAGER[`COLOR_ATTACHMENT${framebufferInfo.colorAttachments}`] : GL[`COLOR_ATTACHMENT${framebufferInfo.colorAttachments}`];
        GL.framebufferTexture2D(GL.FRAMEBUFFER, attachedBuffer, GL.TEXTURE_2D, renderBufferInfo.texture, 0);

        framebufferInfo.colorAttachments += 1;
    };

    DaveShade.RENDERBUFFER_TYPES = {
        TEXTURE_RGB: (GL, framebufferInfo, dsInfo) => {
            //Make sure our next buffer is even possible!
            if (dsInfo.GL_TYPE != "webgl2" && !dsInfo.DRAWBUFFER_MANAGER && framebufferInfo.colorAttachments > 0) {
                console.error("Cannot have multiple draw buffers! There will be graphical glitches!");
                return { resize: () => {} };
            }
            //define our info
            const renderBufferInfo = {
                texture: GL.createTexture(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindTexture(GL.TEXTURE_2D, renderBufferInfo.texture);
                    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, width, height, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
                },
                dispose: () => {
                    GL.deleteTexture(renderBufferInfo.texture);
                },
            };

            //Attach the buffer
            DaveShade.EZAttachColorBuffer(GL, framebufferInfo, dsInfo, renderBufferInfo);

            return renderBufferInfo;
        },

        TEXTURE_RGBA: (GL, framebufferInfo, dsInfo) => {
            //Make sure our next buffer is even possible!
            if (dsInfo.GL_TYPE != "webgl2" && !dsInfo.DRAWBUFFER_MANAGER && framebufferInfo.colorAttachments > 0) {
                console.error("Cannot have multiple draw buffers! There will be graphical glitches!");
                return { resize: () => {} };
            }

            //define our info
            const renderBufferInfo = {
                texture: GL.createTexture(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindTexture(GL.TEXTURE_2D, renderBufferInfo.texture);
                    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
                },
                dispose: () => {
                    GL.deleteTexture(renderBufferInfo.texture);
                },
            };

            //Attach the buffer
            DaveShade.EZAttachColorBuffer(GL, framebufferInfo, dsInfo, renderBufferInfo);

            return renderBufferInfo;
        },

        TEXTURE_RGBA_FLOAT: (GL, framebufferInfo, dsInfo) => {
            //Make sure we are in webGL2
            if (dsInfo.GL_TYPE != "webgl2") return DaveShade.RENDERBUFFER_TYPES.TEXTURE_RGBA(GL, framebufferInfo, dsInfo);

            //define our info
            const renderBufferInfo = {
                texture: GL.createTexture(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindTexture(GL.TEXTURE_2D, renderBufferInfo.texture);
                    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA16F, width, height, 0, GL.RGBA, GL.FLOAT, null);
                },
                dispose: () => {
                    GL.deleteTexture(renderBufferInfo.texture);
                },
            };

            //Attach the buffer
            DaveShade.EZAttachColorBuffer(GL, framebufferInfo, dsInfo, renderBufferInfo);

            return renderBufferInfo;
        },

        TEXTURE_R: (GL, framebufferInfo, dsInfo) => {
            //Make sure we are in webGL2
            if (dsInfo.GL_TYPE != "webgl2") return DaveShade.RENDERBUFFER_TYPES.TEXTURE_RGB(GL, framebufferInfo, dsInfo);

            //define our info
            const renderBufferInfo = {
                texture: GL.createTexture(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindTexture(GL.TEXTURE_2D, renderBufferInfo.texture);
                    GL.texImage2D(GL.TEXTURE_2D, 0, GL.R8, width, height, 0, GL.RED, GL.UNSIGNED_BYTE, null);
                },
                dispose: () => {
                    GL.deleteTexture(renderBufferInfo.texture);
                },
            };

            //Attach the buffer
            DaveShade.EZAttachColorBuffer(GL, framebufferInfo, dsInfo, renderBufferInfo);

            return renderBufferInfo;
        },

        TEXTURE_R_FLOAT: (GL, framebufferInfo, dsInfo) => {
            //Make sure we are in webGL2
            if (dsInfo.GL_TYPE != "webgl2") return DaveShade.RENDERBUFFER_TYPES.TEXTURE_RGB(GL, framebufferInfo, dsInfo);

            //define our info
            const renderBufferInfo = {
                texture: GL.createTexture(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindTexture(GL.TEXTURE_2D, renderBufferInfo.texture);
                    GL.texImage2D(GL.TEXTURE_2D, 0, GL.R16F, width, height, 0, GL.RED, GL.FLOAT, null);
                },
                dispose: () => {
                    GL.deleteTexture(renderBufferInfo.texture);
                },
            };

            //Attach the buffer
            DaveShade.EZAttachColorBuffer(GL, framebufferInfo, dsInfo, renderBufferInfo);

            return renderBufferInfo;
        },

        DEPTH: (GL, framebufferInfo, dsInfo) => {
            //Make sure we are in webGL2
            let attachedData = [GL.R32F, GL.RED, GL.FLOAT];
            if (dsInfo.GL_TYPE != "webgl2") attachedData = [GL.RGB, GL.RGB, GL.UNSIGNED_BYTE];

            //define our info
            const renderBufferInfo = {
                renderBuffer: GL.createRenderbuffer(),
                resize: (width, height) => {
                    renderBufferInfo.width = width;
                    renderBufferInfo.height = height;
                    GL.bindRenderbuffer(GL.RENDERBUFFER, renderBufferInfo.renderBuffer);
                    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);
                },
                dispose: () => {
                    GL.deleteRenderbuffer(renderBufferInfo.renderBuffer);
                },
            };

            //Resize and attach our buffer
            renderBufferInfo.resize(framebufferInfo.width, framebufferInfo.height);
            GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, renderBufferInfo.renderBuffer);

            return renderBufferInfo;
        },
    };

    DaveShade.createInstance = (CANVAS, SETTINGS) => {
        const daveShadeInstance = {
            CANVAS: CANVAS,
            SHADERS: [],
            FRAMEBUFFERS: [],
            oldAttributes: {}
        };

        if (SETTINGS.blendFunc) {
            daveShadeInstance.blendFunc = SETTINGS.blendFunc;
        }

        daveShadeInstance.GL = CANVAS.getContext("webgl2", SETTINGS);
        daveShadeInstance.GL_TYPE = "webgl2";
        daveShadeInstance.VOA_MANAGER = daveShadeInstance.GL;
        if (!daveShadeInstance.GL) {
            daveShadeInstance.GL = CANVAS.getContext("webgl", SETTINGS);
            daveShadeInstance.GL_TYPE = "webgl";
            //Webgl doesn't have native support for VOAs or Multipass Rendering so we add the addon for VOAs, and extra Draw Buffers
            daveShadeInstance.VOA_MANAGER = daveShadeInstance.GL.getExtension("OES_vertex_array_object");
            daveShadeInstance.DRAWBUFFER_MANAGER = daveShadeInstance.GL.getExtension("WEBGL_draw_buffers");
        } else {
            daveShadeInstance.COLORBUFFER_FLOAT = daveShadeInstance.GL.getExtension("EXT_color_buffer_float");
            daveShadeInstance.FLOAT_BLEND = daveShadeInstance.GL.getExtension("EXT_float_blend");
        }

        //Make our GL more easily accessable from the object
        const GL = daveShadeInstance.GL;

        if (daveShadeInstance.blendFunc) {
            GL.enable(GL.BLEND);
            GL.blendEquation(GL[daveShadeInstance.blendFunc[0]]);
            GL.blendFunc(GL[daveShadeInstance.blendFunc[1]], GL[daveShadeInstance.blendFunc[2]]);
        }
        
        GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        //*When we need to split the shader into 2 parts due to it being in a single file. good for keeping storage sizes down
        daveShadeInstance.decomposeShader = (shaderCode) => {
            let vertexFunction = DaveShade.findFunctionInGLSL(shaderCode, "vertex");
            let fragmentFunction = DaveShade.findFunctionInGLSL(shaderCode, "fragment");

            //Return failure code if we fail
            if (!vertexFunction || !fragmentFunction) return {
                status: DaveShade.COMPILE_STATUS.FAILURE,
            };

            //Return a new shader
            return daveShadeInstance.createShader(
                shaderCode.replace(fragmentFunction, ""),
                shaderCode.replace(vertexFunction, "")
            )
        };

        //?Could potentially be better? Maybe less if statement hell.
        daveShadeInstance.clearShaderFromMemory = (shader) => {
            //*Remove the shader from the list
            if (daveShadeInstance.SHADERS.includes(shader)) {
                daveShadeInstance.SHADERS.splice(daveShadeInstance.SHADERS.indexOf(shader), 1);
            }

            //*Delete the program and shaders
            if (shader.program) {
                GL.deleteProgram(shader.program);
            }
            if (shader.vertex) {
                GL.deleteShader(shader.vertex.shader);
            }
            if (shader.fragment) {
                GL.deleteShader(shader.fragment.shader);
            }
        };

        daveShadeInstance.createShader = (vertex, fragment) => {
            //? If we have a single code shader then decompose it.
            let compileStatus = true;
            if (vertex && !fragment) return daveShadeInstance.decomposeShader(vertex);

            const shader = {};

            //* Set the compile status
            shader.status = DaveShade.COMPILE_STATUS.SUCCESS;

            //* Grab the uniforms
            shader.uniformIndicies = [...Array(GL.getProgramParameter(shader.program, GL.ACTIVE_UNIFORMS)).keys()];
            shader.activeUniformIDs = GL.getActiveUniforms(shader.program, shader.uniformIndicies, GL.UNIFORM_TYPE);
            shader.uniforms = {};
            shader.textureCount = 0;

            //* use the program while we assign stuff
            GL.useProgram(shader.program);

            //* Loop through the uniforms
            for (let id = 0; id < shader.activeUniformIDs.length; id++) {
                const uniformInfo = GL.getActiveUniform(shader.program, id);
                const uniformName = uniformInfo.name.split("[")[0];
                const isArray = uniformInfo.name.includes("[");

                //differentiate arrays and
                if (isArray) {
                    const arrayLength = uniformInfo.size;
                    shader.uniforms[uniformName] = [];

                    for (let index = 0; index < arrayLength; index++) {
                        const location = GL.getUniformLocation(shader.program, `${uniformName}[${index}]`);

                        shader.uniforms[uniformName].push({
                            location: location,
                            type: uniformInfo.type,
                            isArray: isArray,
                            "#value": null,

                            set value(value) {
                                GL.useProgram(shader.program);
                                shader.uniforms[uniformName]["#value"] = value;
                                DaveShade.setters[uniformInfo.type](GL, location, value, uniformInfo);
                            },
                            get value() {
                                return shader.uniforms[uniformName]["#value"];
                            },
                        });
                    }
                } else {
                    const location = GL.getUniformLocation(shader.program, uniformName);

                    shader.uniforms[uniformName] = {
                        location: location,
                        type: uniformInfo.type,
                        isArray: isArray,
                        "#value": null,

                        set value(value) {
                            GL.useProgram(shader.program);
                            shader.uniforms[uniformName]["#value"] = value;
                            DaveShade.setters[uniformInfo.type](GL, location, value, uniformInfo);
                        },
                        get value() {
                            return shader.uniforms[uniformName]["#value"];
                        },
                    };
                }

                if (uniformInfo.type == 35678) {
                    uniformInfo.samplerID = shader.textureCount;
                    shader.textureCount += 1;
                }
            }

            //* Grab the attributes
            shader.attributeIndicies = [...Array(GL.getProgramParameter(shader.program, GL.ACTIVE_ATTRIBUTES)).keys()];
            shader.attributes = {};

            //* Loop through the attributes
            shader.attributeIndicies.forEach((attributeID) => {
                //* Lets split the attribute definition
                const attributeDef = GL.getActiveAttrib(shader.program, attributeID);

                //? could probably conglomerate better?
                shader.attributes[attributeDef.name] = {
                    type: attributeDef.type,
                };

                //* Attribute Stuff
                shader.attributes[attributeDef.name].location = GL.getAttribLocation(shader.program, attributeDef.name);
                GL.enableVertexAttribArray(shader.attributes[attributeDef.name].location);

                //* Create the buffer
                shader.attributes[attributeDef.name].buffer = GL.createBuffer();
                GL.bindBuffer(GL.ARRAY_BUFFER, shader.attributes[attributeDef.name].buffer);
                GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(65536), GL.STATIC_DRAW);

                //* Assign values dependant on types
                switch (shader.attributes[attributeDef.name].type) {
                    case 5126:
                        shader.attributes[attributeDef.name].divisions = 1;
                        break;

                    case 35664:
                        shader.attributes[attributeDef.name].divisions = 2;
                        break;

                    case 35665:
                        shader.attributes[attributeDef.name].divisions = 3;
                        break;

                    case 35666:
                        shader.attributes[attributeDef.name].divisions = 4;
                        break;

                    default:
                        shader.attributes[attributeDef.name].divisions = 1;
                        break;
                }
                
                const location = shader.attributes[attributeDef.name].location;
                const divisions = shader.attributes[attributeDef.name].divisions;

                //* The setter legacy (DS2)
                shader.attributes[attributeDef.name].setRaw = (newValue) => {
                    daveShadeInstance.oldAttributes[location] = 0;
                    GL.bindBuffer(GL.ARRAY_BUFFER, shader.attributes[attributeDef.name].buffer);
                    GL.bufferData(GL.ARRAY_BUFFER, newValue, GL.STATIC_DRAW);
                    GL.vertexAttribPointer(location, divisions, GL.FLOAT, false, 0, 0);
                };

                //* The setter
                shader.attributes[attributeDef.name].set = (newValue) => {
                    if (daveShadeInstance.oldAttributes[location] == newValue.bufferID) return;
                    daveShadeInstance.oldAttributes[location] = newValue.bufferID;
                    GL.bindBuffer(GL.ARRAY_BUFFER, newValue);
                    GL.vertexAttribPointer(location, divisions, GL.FLOAT, false, 0, 0);
                };

                GL.vertexAttribPointer(location, divisions, GL.FLOAT, false, 0, 0);
            });

            //* The buffer setter! the Legacy ONE!
            shader.setBuffersRaw = (attributeJSON) => {
                //? Loop through the keys
                shader.usingIndices = false;
                for (let key in attributeJSON) {
                    //* if it exists set the attribute
                    if (key == DaveShade.IndiceIdent) {
                        //Do nothing
                        continue;
                    }
                    if (shader.attributes[key]) {
                        shader.attributes[key].setRaw(attributeJSON[key]);
                    }
                }
            };

            //* The buffer setter! the Big ONE!
            shader.setBuffers = (attributeJSON) => {
                //? Loop through the keys
                shader.usingIndices = false;
                for (let key in attributeJSON) {
                    //Make sure we are using a buffer
                    if (!(attributeJSON[key] instanceof WebGLBuffer)) return;

                    //* if it exists set the attribute
                    if (key == DaveShade.IndiceIdent) {
                        const newValue = attributeJSON[key];
                        shader.usingIndices = true;

                        //Make sure we don't already have the indice bound
                        if (daveShadeInstance.oldAttributes[DaveShade.IndiceIdent] == newValue.bufferID) return;
                        daveShadeInstance.oldAttributes[DaveShade.IndiceIdent] = newValue.bufferID;
                        GL.bindBuffer(GL.ARRAY_BUFFER, newValue);
                    }
                    else if (shader.attributes[key]) {
                        shader.attributes[key].set(attributeJSON[key]);
                    }
                }
            };

            shader.drawFromBuffers = (triAmount, renderMode) => {
                GL.useProgram(shader.program);

                //Draw using indicies if we are using indicies
                if (!shader.usingIndices) GL.drawArrays(renderMode || GL.TRIANGLES, 0, triAmount);
                else GL.drawElements(renderMode || GL.TRIANGLES, triAmount, GL.UNSIGNED_INT, 0);

                //Increment drawn tri count
                daveShadeInstance.triCount += triAmount;
            };

            shader.dispose = () => {
                daveShadeInstance.clearShaderFromMemory(shader);
            };

            //* Quick function
            shader.setUniforms = (uniforms) => {
                //Make sure we have an object
                if (typeof uniforms != "object" || Array.isArray(uniforms)) return;
                
                //Loop through keys
                for (let key in uniforms) {
                    if (shader.uniforms[key]) {
                        shader.uniforms[key].value = uniforms[key];
                    }
                }
            }

            //*Add it to the list of shaders to dispose of when the instance no longer exists.
            daveShadeInstance.SHADERS.push(shader);

            return shader;
        };

        daveShadeInstance.useZBuffer = (use) => {
            GL.enable(GL.DEPTH_TEST);
            GL.depthFunc(use ? GL.LEQUAL : GL.NEVER);
        };

        daveShadeInstance.cullFace = (face) => {
            switch (face) {
                case DaveShade.side.BACK:
                    GL.enable(GL.CULL_FACE);
                    GL.cullFace(GL.BACK);                    
                    break;

                case DaveShade.side.FRONT:
                    GL.enable(GL.CULL_FACE);
                    GL.cullFace(GL.FRONT);
                    break;
            
                default:
                    GL.disable(GL.CULL_FACE);
                    break;
            }
        }

        //For going back to canvas rendering
        daveShadeInstance.renderToCanvas = () => {
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);
            if (daveShadeInstance.GL_TYPE == "webgl2") GL.drawBuffers([GL.BACK]);
            GL.viewport(0, 0, GL.canvas.width, GL.canvas.height);
        };

        //Texture creation!!!
        daveShadeInstance.createTexture = (data, width, height) => {
            const texture = GL.createTexture();
            GL.bindTexture(GL.TEXTURE_2D, texture);

            if (data instanceof Image) {
                GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, data);

                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

                width = data.width;
                height = data.height;
            } else {
                GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, data);

                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
                GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            }

            //Create our texture object
            const textureOBJ = { 
                type: "TEXTURE2D",
                texture: texture, width: width, height: height,
                currentFilter: GL.LINEAR,
                setFiltering: (newFilter, isMin) => {
                    isMin = isMin || false;

                    if (textureOBJ.currentFilter == newFilter) return;

                    GL.bindTexture(GL.TEXTURE_2D, texture);
                    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, newFilter);

                    textureOBJ.currentFilter = newFilter;
                }
            };

            return textureOBJ;
        };

        //Cubes :)
        daveShadeInstance.cubemapOrder = [
            GL.TEXTURE_CUBE_MAP_POSITIVE_X,
            GL.TEXTURE_CUBE_MAP_POSITIVE_Y,
            GL.TEXTURE_CUBE_MAP_POSITIVE_Z,
            GL.TEXTURE_CUBE_MAP_NEGATIVE_X,
            GL.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            GL.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        //Orientations
        //X+
        //Y+
        //Z+
        //X-
        //Y-
        //Z-
        daveShadeInstance.createTextureCube = (textures, width, height) => {
            if (!Array.isArray(textures)) return;
            if (textures.length != 6) return;

            //Create our cubemap
            const texture = GL.createTexture();
            GL.bindTexture(GL.TEXTURE_CUBE_MAP, texture);

            const sizes = [];

            //Loop through our cubemap
            for (let texID in textures) {
                const data = textures[texID];
                const target = daveShadeInstance.cubemapOrder[texID];

                //Parse our textures
                if (data instanceof Image) {
                    GL.texImage2D(target, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, data);
                    sizes.push({ width: data.width, height: data.height });
                } else {
                    GL.texImage2D(target, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, data);
                    sizes.push({ width: width, height: height });
                }
            }

            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

            //Create our texture object
            const textureOBJ = {
                type: "CUBEMAP",
                texture: texture, sizes: sizes,
                currentFilter: GL.LINEAR,
                setFiltering: (newFilter, isMin) => {
                    isMin = isMin || false;

                    if (textureOBJ.currentFilter == newFilter) return;

                    GL.bindTexture(GL.TEXTURE_CUBE_MAP, texture);
                    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, newFilter);

                    textureOBJ.currentFilter = newFilter;
                }
            };

            return textureOBJ;
        }

        //Voxels :(
        daveShadeInstance.createTexture3D = (data, size, height, depth) => {
            if (!daveShadeInstance.GL_TYPE == "webgl2") return;

            const texture = GL.createTexture();
            GL.bindTexture(GL.TEXTURE_3D, texture);

            //Set our data, if we are using an image make sure the image gets the data
            if (data instanceof Image) {
                //Use size or split the data in half
                size = size || data.height/2;

                //Set our stuff to be appropriate
                height = size;
                depth = data.height / size;
                size = data.width;

                GL.texImage3D(GL.TEXTURE_3D, 0, GL.RGBA, size, height, depth, 0, GL.RGBA, GL.UNSIGNED_BYTE, data);
            } else {
                GL.texImage3D(GL.TEXTURE_3D, 0, GL.RGBA, size, height, depth, 0, GL.RGBA, GL.UNSIGNED_BYTE, data);
            }

            GL.texParameteri(GL.TEXTURE_3D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_3D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_3D, GL.TEXTURE_WRAP_R, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_3D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

            //Create our texture object
            const textureOBJ = { 
                type: "TEXTURE3D",
                texture: texture, width: size, height: height, depth: depth,
                currentFilter: GL.LINEAR,
                setFiltering: (newFilter, isMin) => {
                    isMin = isMin || false;

                    if (textureOBJ.currentFilter == newFilter) return;

                    GL.bindTexture(GL.TEXTURE_3D, texture);
                    GL.texParameteri(GL.TEXTURE_3D, GL.TEXTURE_MAG_FILTER, newFilter);

                    textureOBJ.currentFilter = newFilter;
                }
            };

            return textureOBJ;
        }

        //Framebuffer stuff
        daveShadeInstance.createFramebuffer = (width, height, attachments) => {
            const framebuffer = {
                buffer: GL.createFramebuffer(),
                attachments: [],
                drawBuffers: [],
                width: width,
                height: height,
                colorAttachments: 0,
            };

            //Our frame buffer binding stuff
            GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer.buffer);
            framebuffer.use = () => {
                GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer.buffer);
                //Make sure to use our attachments
                if (daveShadeInstance.GL_TYPE == "webgl2") GL.drawBuffers(framebuffer.drawBuffers);
                GL.viewport(0, 0, framebuffer.width, framebuffer.height);
            };

            //Easy removal
            framebuffer.dispose = () => {
                framebuffer.attachments.forEach((attachement) => {
                    attachement.dispose();
                });
                GL.deleteFramebuffer(framebuffer.buffer);

                if (daveShadeInstance.FRAMEBUFFERS.includes(shader)) {
                    daveShadeInstance.FRAMEBUFFERS.splice(daveShadeInstance.FRAMEBUFFERS.indexOf(framebuffer), 1);
                }
            };

            //Easy resizing
            framebuffer.resize = (width, height) => {
                framebuffer.attachments.forEach((attachement) => {
                    attachement.resize(width, height);
                });

                framebuffer.width = width;
                framebuffer.height = height;
            };

            //Add the attachements
            for (let attID in attachments) {
                framebuffer.attachments.push(attachments[attID](GL, framebuffer, daveShadeInstance));
            }

            for (let drawBufferID = 0; drawBufferID < framebuffer.colorAttachments; drawBufferID++) {
                //framebuffer.drawBuffers.push(GL.NONE);
                framebuffer.drawBuffers.push(daveShadeInstance.DRAWBUFFER_MANAGER ? daveShadeInstance.DRAWBUFFER_MANAGER[`COLOR_ATTACHMENT${drawBufferID}`] : GL[`COLOR_ATTACHMENT${drawBufferID}`]);
            }

            //Then add and finalize the creation
            daveShadeInstance.FRAMEBUFFERS.push(framebuffer);
            GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer.buffer);
            return framebuffer;
        };

        daveShadeInstance.dispose = () => {
            daveShadeInstance.SHADERS.forEach((shader) => {
                daveShadeInstance.clearShaderFromMemory(shader);
            });

            delete GL;
            if (daveShadeInstance.CANVAS.parentElement) {
                daveShadeInstance.CANVAS.parentElement.removeChild(daveShadeInstance.CANVAS);
            }
            delete daveShadeInstance.CANVAS;
        };

        daveShadeInstance.clear = (bufferBits) => {
            daveShadeInstance.triCount = 0;
            GL.clear(bufferBits);
        };

        daveShadeInstance.bufferID = 0;
        daveShadeInstance.buffersFromJSON = (attributeJSON) => {
            const returned = {};
            for (const key in attributeJSON) {
                //Increment our ID
                daveShadeInstance.bufferID++;

                const element = attributeJSON[key];
                const buffer = GL.createBuffer();
                buffer.bufferID = daveShadeInstance.bufferID;

                //If we have indicies use indicies
                if (key == DaveShade.IndiceIdent) {
                    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer);
                    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, element, GL.STATIC_DRAW);
                }
                else {
                    GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
                    GL.bufferData(GL.ARRAY_BUFFER, element, GL.STATIC_DRAW);
                }

                returned[key] = buffer;
            }

            //Remove buffers
            returned.dispose = () => {
                //It's gone :(
                for (const key in attributeJSON) { GL.deleteBuffer(returned[key]); }
            }

            return returned;
        };

        //* Our texture reader
        daveShadeInstance.textureReadingBuffer = daveShadeInstance.createFramebuffer(1,1,[DaveShade.RENDERBUFFER_TYPES.TEXTURE_RGBA]);

        //? create stuff required to render these temporary textures
        daveShadeInstance.textureReadingShader = daveShadeInstance.createShader(`precision highp float;
        attribute vec4 a_position;
        attribute vec2 a_texcoord;

        varying vec2 v_texCoord;
        
        void main() {
            gl_Position = a_position;
            v_texCoord = a_texcoord;
        }
        `,`precision highp float;
        varying vec2 v_texCoord;

        uniform sampler2D u_texture;
        
        void main() {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }
        `);

        //? Create the data for the quad
        daveShadeInstance.textureReadingQuad = daveShadeInstance.buffersFromJSON({
            a_position: new Float32Array(
                [
                    1,-1,0,1,
                    -1,-1,0,1,
                    1,1,0,1,

                    -1,-1,0,1,
                    -1,1,0,1,
                    1,1,0,1
                ]
            ),
            a_texcoord: new Float32Array(
                [
                    1,0,
                    0,0,
                    1,1,

                    0,0,
                    0,1,
                    1,1
                ]
            )
        });
        
        //? the actual read function
        daveShadeInstance.readTexturePixel = (texture,x,y) => {
            //Resize the texture
            daveShadeInstance.textureReadingBuffer.resize(texture.width,texture.height);
            daveShadeInstance.textureReadingBuffer.use();
            
            //Clear and draw
            GL.clear(GL.COLOR_BUFFER_BIT);
            daveShadeInstance.textureReadingShader.uniforms.u_texture.value = texture.texture;
            daveShadeInstance.textureReadingShader.setBuffers(daveShadeInstance.textureReadingQuad);
            daveShadeInstance.textureReadingShader.drawFromBuffers(6);

            //Then finally get the data
            let output = new Uint8Array(4);
            GL.readPixels(x,y,1,1,GL.RGBA, GL.UNSIGNED_BYTE, output);
            //scale it back down to hopefully save ram
            daveShadeInstance.textureReadingBuffer.resize(1,1);

            return Array.from(output);
        }

        //? Make sure we are rendering to the canvas!!!
        daveShadeInstance.renderToCanvas();
        return daveShadeInstance;
    };  

    DaveShade.findFunctionInGLSL = (glsl, func, type) => {
        type = type || "void";
        func = func || "func";

        //Match out the function
        const matches = glsl.match(RegExp(`(${type})(\\s*)(${func})`));
        if (matches && matches.length > 0) {
            let matcher = matches[0];
            let inFunction = 0;
            let funcCode = "";
            const charIndex = glsl.indexOf(matcher);

            //Loop through every character until we get out of the function
            for (let index = charIndex; index < glsl.length; index++) {
                let char = glsl.charAt(index);
                funcCode += char;

                if (char == "{") {
                    inFunction++;
                } else if (char == "}") {
                    inFunction--;
                    if (inFunction == 0) {
                        //Return our code if we get out of our function
                        return funcCode;
                    }
                }
            }
        }

        //Return a blank if we don't have any function
        return "";
    };
})();
