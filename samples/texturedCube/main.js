/*
    SOME NOTES
    The matrix is formatted like this
    [
        [PITCH SIN, PITCH COS, X],
        [YAW SIN, YAW COS, Y],
        [ROLL SIN, ROLL COS, Z],
    ]

    Go to Line 154 for the actual texture loading code, or just search "Load the texture from the url"
*/

const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);
let texture = null;

const colourShader = instance.createShader(`
attribute mediump vec3 a_position;
attribute mediump vec3 a_colour;
attribute lowp vec2 a_texcoord;

varying mediump vec3 v_colour;
varying lowp vec2 v_texcoord;

uniform mediump mat3 u_transform;
uniform mediump float u_aspect;
uniform sampler2D u_texture;

void vertex() {
    vec3 calc = a_position;

    //Rotate Yaw
    calc.xz = vec2(
        calc.z * u_transform[1][0] + calc.x * u_transform[1][1],
        calc.z * u_transform[1][1] - calc.x * u_transform[1][0]
    );

    //Rotate Pitch
    calc.yz = vec2(
        calc.z * u_transform[0][0] + calc.y * u_transform[0][1],
        calc.z * u_transform[0][1] - calc.y * u_transform[0][0]
    );

    //Rotate Roll
    calc.xy = vec2(
        calc.y * u_transform[2][0] + calc.x * u_transform[2][1],
        calc.y * u_transform[2][1] - calc.x * u_transform[2][0]
    );

    //Translate
    calc += vec3(u_transform[0][2], u_transform[1][2], u_transform[2][2]);
	
    //Now send to the fragment
    gl_Position = vec4(calc - vec3(0, 0, 1), calc.z) / vec4(u_aspect, 1, 1, 1);
    v_texcoord = a_texcoord;
    v_colour = a_colour;
}

void fragment() {
    gl_FragColor = texture2D(u_texture, v_texcoord) * vec4(v_colour, 1);
}
`);

//Manually programming in this, since we just need a cube.
const triangleBuffers = instance.buffersFromJSON({
	a_position: [
        //Front
		-0.5,0.5,-0.5,
		0.5,-0.5,-0.5,
		-0.5,-0.5,-0.5,
		0.5,0.5,-0.5,

        //Back
		-0.5,0.5,0.5,
		0.5,-0.5,0.5,
		-0.5,-0.5,0.5,
		0.5,0.5,0.5,

        //Left
		-0.5,0.5,-0.5,
		-0.5,-0.5,0.5,
		-0.5,-0.5,-0.5,
		-0.5,0.5,0.5,

        //Right
		0.5,0.5,-0.5,
		0.5,-0.5,0.5,
		0.5,-0.5,-0.5,
		0.5,0.5,0.5,

        //Bottom
		0.5,-0.5,-0.5,
		-0.5,-0.5,0.5,
		-0.5,-0.5,-0.5,
		0.5,-0.5,0.5,

        //Top
		0.5,0.5,-0.5,
		-0.5,0.5,0.5,
		-0.5,0.5,-0.5,
		0.5,0.5,0.5
	],

    a_texcoord: [
        0, 0,  1, 1,  0, 1,  1, 0, //Front
        1, 0,  0, 1,  1, 1,  0, 0, //Back
        1, 0,  0, 1,  1, 1,  0, 0, //Left
        0, 0,  1, 1,  0, 1,  1, 0, //Right
        0, 0,  1, 1,  0, 1,  1, 0, //Bottom
        1, 0,  0, 1,  1, 1,  0, 0 //Top
    ],

    a_colour: [
        1  ,1  ,0.5,  1  ,1  ,0.5,  1  ,1  ,0.5,  1  ,1  ,0.5, //Front
        0.5,0.5,1  ,  0.5,0.5,1  ,  0.5,0.5,1  ,  0.5,0.5,1  , //Back
        0.5,1  ,1  ,  0.5,1  ,1  ,  0.5,1  ,1  ,  0.5,1  ,1  , //Left
        1  ,0.5,0.5,  1  ,0.5,0.5,  1  ,0.5,0.5,  1  ,0.5,0.5, //Right
        1  ,0.5,1  ,  1  ,0.5,1  ,  1  ,0.5,1  ,  1  ,0.5,1  , //Bottom
        0.5,1  ,0.5,  0.5,1  ,0.5,  0.5,1  ,0.5,  0.5,1  ,0.5  //Top
    ],

    __INDICIES__: [
        0, 1, 2, 0, 3, 1,      //Front
        4, 5, 6, 4, 7, 5,      //Back
        8, 9, 10, 8, 11, 9,    //Left
        12, 13, 14, 12, 15, 13,//Right
        16, 17, 18, 16, 19, 17,//Bottom
        20, 21, 22, 20, 23, 21 //Top
    ]
});

//Turn on depth
instance.useZBuffer(true);

//Draw our triangle
const loop = () => {
    const now = Date.now() / 1000;

    colourShader.setBuffers(triangleBuffers);
    colourShader.setUniforms({
        u_transform: [
            Math.cos(now), Math.sin(now), 0,
            Math.sin(now / 3), Math.cos(now / 3), 0,
            Math.sin(now / 5), Math.cos(now / 5), 1.5,
        ],
        u_aspect: 4/3, //Just going to make the cube stay a cube.
        u_texture: texture
    });

    colourShader.drawFromBuffers(36);
    requestAnimationFrame(loop);
}

//Load the texture from the url, set the variable, and start the loop.
instance.textureFromURL("main.svg").then(tex => {
    texture = tex;
    requestAnimationFrame(loop);
});