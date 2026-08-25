const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const colourShader = instance.createShader(`
attribute mediump vec4 a_position;

uniform mediump vec2 u_offset;
uniform mediump vec4 u_color;

void vertex() {
	gl_Position = a_position + vec4(u_offset, 0, 0);
}

void fragment() {
    gl_FragColor = u_color;

    //Multiplicative blending
    gl_FragColor.xyz *= gl_FragColor.w;
}
`);

const triangleBuffers = instance.buffersFromJSON({
	a_position: [
		0,0.5,0,1,
		0.5,-0.5,0,1,
		-0.5,-0.5,0,1
	]
});

//Turn on blending
instance.useBlending();

//Draw our triangles
colourShader.setBuffers(triangleBuffers);

colourShader.setUniforms({
    u_offset: [-0.25, 0],
    u_color: [1, 0, 0, 1]
});
colourShader.drawFromBuffers(3);

colourShader.setUniforms({
    u_offset: [0.25, 0],
    u_color: [0, 0, 1, 0.25]
});
colourShader.drawFromBuffers(3);