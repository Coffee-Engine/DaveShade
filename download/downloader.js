{
    //Create and get essential elements
    const downloadLink = document.createElement("a");
    const scriptType = document.getElementById("scriptType");
    const mainScrawl = document.getElementById("main");
    const optionsDiv = document.getElementById("options");

    //For downloading the actual dev file
    async function downloadDevFile(settings) {
        let script = await (await fetch(`../dist/DS3.2.js`)).text();

        for (let key in settings) {
            if (settings[key]) {
                const url = `../dist/extras/${key}`;
                script += `\n//--\\\\  ${url}  //--\\\\\n`;

                script += await (await fetch(url)).text();
            }
        }
        
        let fileType = "js";
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

        for (let i in json) {
            const [name, file, defaultValue] = json[i];
            options[file] = defaultValue || false;

            //Get the two elements created
            const nameP = document.createElement("p");
            const checkbox = document.createElement("input");

            nameP.innerText = name;

            checkbox.type = "checkbox";
            checkbox.checked = defaultValue || false;

            optionsDiv.appendChild(nameP);
            optionsDiv.appendChild(checkbox);

            //Add functionality
            checkbox.onchange = () => { options[file] = checkbox.checked; }
        }

        //Setup the download button
        const downloadButton = document.createElement("button");
        downloadButton.innerText = "Download";
        downloadButton.onclick = () => downloadDevFile(options);
        mainScrawl.appendChild(downloadButton);
    })
}