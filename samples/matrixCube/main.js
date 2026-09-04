/*
    SOME NOTES
    The matrix is formatted like this
    [
        [PITCH SIN, PITCH COS, X],
        [YAW SIN, YAW COS, Y],
        [ROLL SIN, ROLL COS, Z],
    ]
*/

const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const cubeShader = instance.createShader(`
attribute mediump vec3 a_position;
attribute mediump vec3 a_colour;

varying mediump vec3 v_colour;

uniform mediump mat4 u_transform;
uniform mediump mat4 u_projection;

void vertex() {
    //Now send to the fragment
    gl_Position = vec4(a_position, 1) * u_transform * u_projection;
    v_colour = a_colour;
}

void fragment() {
    gl_FragColor = vec4(v_colour, 1);
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

    a_colour: [
        1,1,0,  1,1,0,  1,1,0,  1,1,0, //Front
        0,0,1,  0,0,1,  0,0,1,  0,0,1, //Back
        0,1,1,  0,1,1,  0,1,1,  0,1,1, //Left
        1,0,0,  1,0,0,  1,0,0,  1,0,0, //Right
        1,0,1,  1,0,1,  1,0,1,  1,0,1, //Bottom
        0,1,0,  0,1,0,  0,1,0,  0,1,0  //Top
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

    cubeShader.setBuffers(triangleBuffers);
    cubeShader.setUniforms({
        //                                                             It's still X,   Y,       Z
        u_transform: DaveShade.matrix4.identity().translate(0, 0, 1.5).rotateYXZ(now, now / 3, now / 5),
        u_projection: DaveShade.matrix4.projection(70, 4/3, 0.1) // Also a projection matrix, you could use an orthographic matrix too
    });

    cubeShader.drawFromBuffers(36);
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);