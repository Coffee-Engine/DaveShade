const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const colourShader = instance.createShader(`
attribute mediump vec4 a_position;
attribute mediump vec3 a_color;

varying mediump vec3 v_color;

uniform mediump vec2 u_offset;
uniform mediump vec4 u_color;

void vertex() {
	gl_Position = a_position + vec4(u_offset, 0, 0);
    v_color = a_color;
}

void fragment() {
    //Just a quick hack to not make multiple shaders, if it isn't black use u_color.
    if (u_color.xyz != vec3(0,0,0)) { gl_FragColor = u_color; }
    else { gl_FragColor = vec4(v_color, u_color.w); }

    //Multiplicative blending
    gl_FragColor.xyz *= gl_FragColor.w;
}
`);

const triangleBuffers = instance.buffersFromJSON({
	a_position: [
		0,0.5,0,1,
		0.5,-0.5,0,1,
		-0.5,-0.5,0,1
	],
    a_color: [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]
});

//Turn on blending
instance.useBlending();


const loop = () => {
    //Draw our triangles
    colourShader.setBuffers(triangleBuffers);

    //Draw non transparent one,
    colourShader.setUniforms({
        u_offset: [0, 0],
        u_color: [1, 0, 0, 1]
    });
    colourShader.drawFromBuffers(3);

    //Draw the transparent one
    colourShader.setUniforms({
        u_offset: [Math.sin(Date.now() / 500) * 0.5, 0],
        u_color: [0, 0, 0, 0.5]
    });
    colourShader.drawFromBuffers(3);
    
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);