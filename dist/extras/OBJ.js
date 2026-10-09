//Add parseOBJ as a function in the default module class
DaveShade.Module.prototype.parseOBJ = async (url, settings) => {
    return new Promise(async (resolve, reject) => {
        //Make sure we have all available properties mapped
        settings = Object.assign({
            position: "a_position",
            uv: "a_texcoord",
            color: "a_color",
            normal: "a_normal"
        }, settings);

        //Fetch the obj as text
        const rawOBJ = await (await fetch(url)).text();
        const lines = rawOBJ.split("\n");

        //Make arrays for data that gets pulled from the OBJ
        const vertex = [];
        const texcoord = [];
        const color = [];
        const normal = [];

        //Ready the final model data
        const parsed = {};
        const createdPoints = {};

        //Create arrays in parsed
        parsed[settings.position] = [];
        parsed[settings.uv] = [];
        parsed[settings.color] = [];
        parsed[settings.normal] = [];
        parsed[DaveShade.INDICE_IDENTIFIER] = [];

        const parsePoint = (data) => {
            const id = data.join("/");

            //Correlate the point to the created points
            if (createdPoints[id]) return createdPoints[id];
            
            createdPoints[id] = parsed[DaveShade.INDICE_IDENTIFIER].length;

            //Push position and color
            parsed[settings.position].push(vertex[data[0] - 1]);
            parsed[settings.color].push(color[data[0] - 1]);

            //And if we have them push texcoord and normal
            //Otherwise push a default for texcoord
            if (data[1] > 0) parsed[settings.uv].push(texcoord[data[1] - 1]);
            else parsed[settings.uv].push([ 0, 0 ]);

            if (data[2] > 0) parsed[settings.position].push(normal[data[2] - 1]);

            return createdPoints[id];
        }

        //Parse through the file
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(" ");

            //If we are a vertex based value, clean it up
            if (line[0].startsWith("v")) line = line.map((v, i) => {
                if (i != 0) return DaveShade.cleanNumber(v);
                return v;
            });

            //Find and push data
            switch (line[0]) {
                //Vertex data is pretty simple, just a V2 or V3,
                //Unless it is just v, we need extra parsing for v
                case "v": {
                    //Support W in vertex format
                    if (vertex.length == 5) vertex.push([ line[1] / line[4], line[2] / line[4], line[3] / line[4] ]);
                    else {
                        //Otherwise just push the normal vertex
                        vertex.push([ line[1], line[2], line[3] ]);
                    
                        //Support colors through the xyz rgb format with optional rgba (uncommon, but would be useful)
                        if (vertex.length == 8) color.push([ line[1], line[2], line[3], line[4] ]);
                        else if (vertex.length == 7) color.push([ line[1], line[2], line[3], 1 ]);
                        else color.push([ 1, 1, 1, 1 ]);
                    }
                    break;
                }

                case "vn": { normal.push([ line[1], line[2], line[3] ]); break; }
                case "vt": { texcoord.push([ line[1], line[2] ]); break; }

                //For faces
                case "f": {
                    //Parse the points in the face
                    line = line.map((v, i) => {
                        //Parse the point values
                        if (i != 0) {
                            const point = v.split("/").map((a) => DaveShade.cleanNumber(a));
                            return point;
                        }
                        return v;
                    });

                    //Now triangulate the face,
                    //This is due to the obj standard not specifying triangles
                    const anchorPoint = parsePoint(line[1]);
                    for (let p = 1; p < line.length - 2; p++) {
                        
                    }
                    break;
                }
            
                default:
                    break;
            }
        }
    });
}