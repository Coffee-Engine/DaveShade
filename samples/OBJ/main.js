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
attribute mediump vec3 a_normal;

varying mediump vec3 v_colour;
varying mediump vec3 v_normal;

uniform mediump mat4 u_transform;
uniform mediump mat4 u_projection;

void vertex() {
    //Now send to the fragment
    gl_Position = vec4(a_position, 1) * u_transform * u_projection;
    v_normal = (vec4(a_normal, 0) * u_transform).xyz;
    v_colour = a_colour;
}

void fragment() {
    mediump float shading = dot(v_normal, vec3(0, 0, -1));
    gl_FragColor = vec4(v_colour * shading, 1);
}
`);

//Manually programming in this, since we just need a cube.
let currentMesh;
const loadMesh = (url) => {
    //Dipose previous mesh if we had one
    if (currentMesh) {
        currentMesh.dispose();
        currentMesh = null;
    }

    //I Typically use the british spelling of colour/color,
    //so I have to tell the parser to use colour
    instance.parseOBJ(url, { color: "a_colour", oneSet: true}).then(loaded => {
        currentMesh = loaded;
    });
}

//Now attach the dropdown to the loader, and load the default torus
const meshDropdown = document.getElementById("meshSelector");
meshDropdown.onchange = () => loadMesh(meshDropdown.value);
loadMesh("models/torus.obj");


//Turn on depth
instance.useZBuffer(true);

//Draw our triangle
const loop = () => {
    const now = Date.now() / 1000;

    if (currentMesh instanceof DaveShade.AttributeSet) {
        cubeShader.setBuffers(currentMesh);
        cubeShader.setUniforms({
            //                                                             It's still X,   Y,       Z
            u_transform: DaveShade.Matrix4.identity().translate(0, 0, 1.5).rotateYXZ(now, now / 3, now / 5),
            u_projection: DaveShade.Matrix4.projection(50, 4/3, 0.1) // Also a projection matrix, you could use an orthographic matrix too
        });

        cubeShader.drawFromBuffers(currentMesh.POINT_COUNT);
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);