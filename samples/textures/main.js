const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const colourShader = instance.createShader(`
attribute mediump vec4 a_position;
attribute mediump vec2 a_texcoord;

varying mediump vec2 v_texcoord;

uniform sampler2D u_texture;

void vertex() {
	gl_Position = a_position;
    v_texcoord = a_texcoord;
}

void fragment() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
}
`);

const triangleBuffers = instance.buffersFromJSON({
	a_position: [
		0,0.5,0,1,
		0.5,-0.5,0,1,
		-0.5,-0.5,0,1
	],
    a_texcoord: [
        0.5,0,
        1,1,
        0,1
    ]
});

//Load the texture from our directory
instance.textureFromURL("main.svg").then(tex => {
    //Draw our triangle
    colourShader.setBuffers(triangleBuffers);
    colourShader.setUniforms({
        u_texture: tex
    })
    colourShader.drawFromBuffers(3);
})