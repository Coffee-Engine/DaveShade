<img align="center" src="github/Logo.svg"></img>
<h2>A WebGL rendering library with portability in mind.</h2>

<p>DaveShade is meant to abstract WebGL and any future rendering libraries into a set of easy to use and easy to manage components and functions.</p>


<h2>Getting Started</h2>

<p>To get started get the latest version from <code>dist/DS3.js</code> and drop it into your project. After that you should be good to add the script to your main HTML file.</p>

<p>Once DaveShade is added you can create an instance like this,</p>

```js
const instance = DaveShade.createInstance(CANVAS);
```

<p>If you would like you can also add a secondary option specifying WebGL arguments.</p>

```js
//DaveShade also includes an additional option
//for initilizing with a blend function
const instance = DaveShade.createInstance(CANVAS, {
    blendFunc: "ONE_MINUS_CONSTANT_COLOR"
});
```

<p>Creating a shader is fairly straightforward, you will need to call <code>DaveShade.createShader</code></p>

```js
const myShader = instance.createShader(`//Vertex
    attribute highp vec4 a_position;
    
    void main() {
        gl_Position = a_position;
    }
`, `//Fragment
    void main() {
        gl_FragColor = vec4(0,0,1,1);
    }
`);
```

<p>After shader creation you will want to assign a buffer to it.</p>

```js
//We will create a buffer as shown
const myBuffer = instance.buffersFromJSON({
    //This will change in the future so that you don't have to manually make F32 Arrays.
    a_position: new Float32Array([
        0,0,1,1,
        1,0,1,1,
        0,1,1,1
    ])
});

//Then we will bindit to our shader.
myShader.setBuffers(myBuffer);
//There is also "shader.setBuffersRaw" but that uses the raw json and is slower.

//There is an optional secondary option that allows you to change the render mode.
//EG lines, triangles, etc... It defaults to triangles.
myShader.drawFromBuffers(3);
```

<p>Thank you for using or contributing to DaveShade ❤️</p>