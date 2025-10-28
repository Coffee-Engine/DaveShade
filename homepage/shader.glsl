precision highp float;

attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

uniform float u_time;

highp vec4 HSVToRGB(highp float hue, highp float saturation, highp float value, highp float a) {
  highp float huePrime = mod(hue,360.0);
  highp float c = (value/100.0) * (saturation/100.0);
  highp float x = c * (1.0 - abs(mod(huePrime/60.0, 2.0) - 1.0));
  highp float m = (value/100.0) - c;
  highp float r = 0.0;
  highp float g = 0.0;
  highp float b = 0.0;
  
  if (huePrime >= 0.0 && huePrime < 60.0) {
      r = c;
      g = x;
      b = 0.0;
  } else if (huePrime >= 60.0 && huePrime < 120.0) {
      r = x;
      g = c;
      b = 0.0;
  } else if (huePrime >= 120.0 && huePrime < 180.0) {
      r = 0.0;
      g = c;
      b = x;
  } else if (huePrime >= 180.0 && huePrime < 240.0) {
      r = 0.0;
      g = x;
      b = c;
  } else if (huePrime >= 240.0 && huePrime < 300.0) {
      r = x;
      g = 0.0;
      b = c;
  } else if (huePrime >= 300.0 && huePrime < 360.0) {
      r = c;
      g = 0.0;
      b = x;
  }
  r += m;
  g += m;
  b += m;
  return vec4(r, g, b, a);
}

void vertex() {
    gl_Position = vec4(a_position, 0, 1);
    v_texcoord = a_texcoord;
}

void fragment() {
    //Honestly just a cool effect I made a long time ago, copied from the compiled scratch code
    gl_FragColor = HSVToRGB(80.0,60.0,(sin(((sin((((v_texcoord.x + v_texcoord.y) * 10.0) + (u_time * float(3)))) * cos(((u_time * 2.0) + (v_texcoord.y * 40.0)))) + (v_texcoord.x * 100.0))) * 100.0),1.0);
    gl_FragColor = (gl_FragColor * sin((((v_texcoord.x + v_texcoord.y) * 2.0) + (u_time * 1.5))));
    gl_FragColor = (gl_FragColor + HSVToRGB(140.0,60.0,(sin(((cos((((v_texcoord.x + v_texcoord.y) * 10.0) + (u_time * float(3)))) * sin(((u_time * 2.0) + (v_texcoord.y * 40.0)))) + (v_texcoord.x * 100.0))) * 100.0),1.0));
    gl_FragColor = (gl_FragColor * sin((((v_texcoord.x + v_texcoord.y) * 2.0) + (u_time * 1.5))));

    gl_FragColor.w = 1.0;
}