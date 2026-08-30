precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

uniform float u_time;
uniform float u_aspect;

void vertex() {
    gl_Position = vec4(a_position, 0, 1);
    v_texcoord = a_texcoord * vec2(u_aspect, 1);
}

float funkyEquation(float x, float y, float z, float w) {
    return pow(abs(sin((x * 32.0) + cos(y * 64.0 + sin(x * 30.0 + z)))), w);
}

void fragment() {
    //First pass of the funky equation
    gl_FragColor = vec4(
        funkyEquation(v_texcoord.y, v_texcoord.x, u_time, 4.0),
        funkyEquation(v_texcoord.x, v_texcoord.y + (u_time / 50.0), u_time + (v_texcoord.y * 25.0), 6.0), 
        funkyEquation(v_texcoord.x  + (u_time / 50.0), v_texcoord.y, u_time, 2.0), 
        1
    );

    gl_FragColor.xyz *= vec3(
        funkyEquation(v_texcoord.x + v_texcoord.y, v_texcoord.y + v_texcoord.x, u_time, 1.0),
        funkyEquation(v_texcoord.x + v_texcoord.y, v_texcoord.y - v_texcoord.x, u_time, 1.0), 
        funkyEquation(v_texcoord.x - v_texcoord.y, v_texcoord.y + v_texcoord.x, u_time, 1.0)
    );

    gl_FragColor.xyz = pow(gl_FragColor.xyz, vec3(3.0));
}