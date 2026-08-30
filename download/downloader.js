{
    //Create and get essential elements
    const downloadLink = document.createElement("a");
    const scriptType = document.getElementById("scriptType");
    const mainScrawl = document.getElementById("main");

    //For downloading the actual dev file
    async function downloadDevFile(settings) {
        let script = await (await fetch(`../dist/DS3.2.js`)).text();
        
        let fileType = "js";
        console.log(scriptType.value);
        if (scriptType.value == "module") {
            script = script.replace("window.DaveShade", "const DaveShade");
            script += "\n//Export DaveShade.\nexport default DaveShade;\n";
            fileType = "mjs";
        }

        //Then download.
        downloadLink.href = `data:text/plain;charset=utf-8,${encodeURIComponent(script.trim())}`;
        downloadLink.download = `DaveShade_${Date.now()}.${fileType}`;
        downloadLink.click();
    }

    //For building the form that is used to determine modules or addons for the install.
    fetch("form.json").then(res => res.text()).then(text => {
        const json = JSON.parse(text);

        //Just barren for now until we have some modules in the future
        const options = {};

        //Setup the download button
        const downloadButton = document.createElement("button");
        downloadButton.innerText = "Download";
        downloadButton.onclick = () => downloadDevFile(options);
        mainScrawl.appendChild(downloadButton);
    })
}