const canvas = document.getElementById("canvas");
const instance = DaveShade.createInstance(canvas);

const colourShader = instance.createShader(`
attribute highp vec4 a_position;
attribute highp vec3 a_colour;

varying highp vec3 v_colour;

void main() {
	gl_Position = a_position;
    v_colour = a_colour;
}
`,`
varying highp vec3 v_colour;

void main() {
    gl_FragColor = vec4(v_colour, 1);
}
`);

const triangleBuffers = instance.buffersFromJSON({
	a_position: [
		0,0.5,0,1,
		0.5,-0.5,0,1,
		-0.5,-0.5,0,1
	],
    a_colour: [
        1,1,0,
        0,1,1,
        1,0,1
    ]
});

//Draw our triangle
colourShader.setBuffers(triangleBuffers);
colourShader.drawFromBuffers(3);