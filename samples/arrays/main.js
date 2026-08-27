/*
    SOME NOTES
    The object matrix is formatted like this
    [
        [PITCH SIN, PITCH COS, X],
        [YAW SIN, YAW COS, Y],
        [ROLL SIN, ROLL COS, Z],
    ]

    The light matrices are formatted like this
    [
        [X, Y, Z],
        [R, G, B],
        [Radius, 0, 0]
    ]
*/

const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const cubeShader = instance.createShader(`
#define lightCount 3
attribute mediump vec3 a_position;
attribute mediump vec3 a_normal;

varying mediump vec3 v_position;
varying mediump vec3 v_normal;

uniform mediump mat3 u_transform;
uniform mediump float u_aspect;

uniform mediump mat3 u_lights[lightCount];

//Just a quick function to do rotations so we don't have to write this out twice.
mediump vec3 rotate(mediump vec3 vector) {
    mediump vec3 calc = vector;

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

    return calc;
}

void vertex() {
    //Find the final 3d position of the point
    vec3 finalPosition = rotate(a_position);
    finalPosition += vec3(u_transform[0][2], u_transform[1][2], u_transform[2][2]);
	
    //Now send to the fragment
    gl_Position = vec4(finalPosition - vec3(0, 0, 1), finalPosition.z) / vec4(u_aspect, 1, 1, 1);
    v_position = finalPosition;
    v_normal = rotate(a_normal);
}

void fragment() {
    gl_FragColor = vec4(1);

    mediump vec3 lighting = vec3(0);
    for (int i = 0; i < lightCount; i++) {
        //Get the light from the array
        mediump mat3 light = u_lights[i];

        //Get offset and influence, these will determine how much the light affects the pixel
        mediump vec3 offset = light[0] - v_position;
        mediump float influence = max(0.0, dot(offset, v_normal));

        //Now just a simple lighting calculation
        lighting += light[1] * (light[2][0] / pow(length(offset), 2.0)) * influence;
    }

    gl_FragColor.xyz *= lighting;
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

    a_normal: [
        0 ,0 ,-1,  0 ,0 ,-1,  0 ,0 ,-1,  0 ,0 ,-1, //Front
        0 ,0 ,1 ,  0 ,0 ,1 ,  0 ,0 ,1 ,  0 ,0 ,1 , //Back
        -1,0 ,0 ,  -1,0 ,0 ,  -1,0 ,0 ,  -1,0 ,0 , //Left
        1 ,0 ,0 ,  1 ,0 ,0 ,  1 ,0 ,0 ,  1 ,0 ,0 , //Right
        0 ,-1,0 ,  0 ,-1,0 ,  0 ,-1,0 ,  0 ,-1,0 , //Bottom
        0 ,1 ,0 ,  0 ,1 ,0 ,  0 ,1 ,0 ,  0 ,1 ,0   //Top
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

//Setup the light array that we will pass to the shader
const lights = [
    [
        0, 0, 0,
        1, 0.5, 0.75,
        0.25, 0, 0
    ],
    [
        -1, 1, 0,
        1, 1, 1,
        1, 0, 0
    ],
    [
        1, -1, 1.5,
        0.5, 0.5, 1,
        0.5, 0, 0
    ]
];

//Draw our triangle
const loop = () => {
    const now = Date.now() / 1000;

    cubeShader.setBuffers(triangleBuffers);
    cubeShader.setUniforms({
        u_transform: [
            Math.cos(now), Math.sin(now), 0,
            Math.sin(now / 3), Math.cos(now / 3), 0,
            Math.sin(now / 5), Math.cos(now / 5), 1.5,
        ],
        u_aspect: 4/3, //Just going to make the cube stay a cube.
        u_lights: lights
    });

    cubeShader.drawFromBuffers(36);
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);