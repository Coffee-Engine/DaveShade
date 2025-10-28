(async function () {
    const instance = DaveShade.createInstance(mainCanvas);
    console.log(instance);

    const geometry = instance.buffersFromJSON({
        a_position: [
            -1, -1,
            1, -1,
            1, 1,

            -1, -1,
            -1, 1,
            1, 1,
        ],

        a_texcoord: [
            0,0,
            1,0,
            1,1,

            0,0,
            0,1,
            1,1
        ]
    });

    //Load shader from url
    instance.shaderFromURL("homepage/shader.glsl").then(shader => {
        //Set our geometry first
        shader.setBuffers(geometry);

        //Animate!
        const renderLoop = (time) => {
            shader.setUniforms({
                u_time: time / 2000,
            })

            instance.viewport(0,0, window.innerWidth, window.innerHeight);
            instance.CANVAS.width = window.innerWidth;
            instance.CANVAS.innerHeight = window.innerHeight;

            shader.drawFromBuffers(6);
            requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
    });
})();