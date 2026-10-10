//Add parseOBJ as a function in the default module class
//I don't like this, but using an arrow function won't bind this?
//For some reason, it's an odd JS standard
DaveShade.Module.prototype.parseOBJ = function (url, settings) {
    return new Promise(async (resolve, reject) => {
        //Make sure we have all available properties mapped
        settings = Object.assign({
            position: "a_position",
            uv: "a_texcoord",
            color: "a_color",
            normal: "a_normal",
            oneSet: false,

            positionIsVec4 : false,
            colorIsVec4: false
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
        //We aren't using indices since that is kinda ridiculous for OBJ file's structure
        //And webGL's indice structure
        const parsed = {};

        let writing;
        const setActiveSubmesh = (name) => {
            if (parsed[name]) {
                writing = parsed[name];
                return parsed[name];
            }

            writing = {};
            writing[settings.position] = [];
            writing[settings.uv] = [];
            writing[settings.color] = [];
            writing[settings.normal] = [];
            writing.POINT_COUNT = 0;

            parsed[name] = writing;
            return writing;
        }

        setActiveSubmesh("default");

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
                    if (line.length == 5) {
                        if (settings.positionIsVec4) vertex.push([ line[1], line[2], line[3], line[4] ]);
                        else vertex.push([ line[1] / line[4], line[2] / line[4], line[3] / line[4] ]);

                        if (settings.colorIsVec4) color.push([ 1, 1, 1, 1 ]);
                        else color.push([ 1, 1, 1 ]);
                    }
                    else {
                        //Otherwise just push the normal vertex
                        if (settings.positionIsVec4) vertex.push([ line[1], line[2], line[3], 1 ]);
                        else vertex.push([ line[1], line[2], line[3] ]);
                    
                        //Support colors through the xyz rgb format with optional rgba (uncommon, but could be useful)
                        //We also have to differentiate between color being vec3 or vec4
                        if (settings.colorIsVec4) {
                            if (line.length == 8) color.push([ line[4], line[5], line[6], line[7] ]);
                            else if (line.length == 7) color.push([ line[4], line[5], line[6], 1 ]);
                            else color.push([ 1, 1, 1, 1 ]);
                        }
                        else {
                            //If we are a vec3 and we encounter rgba multiply rgb by a
                            if (line.length == 8) color.push([ line[4] * line[7], line[5] * line[7], line[6] * line[7] ]);
                            else if (line.length == 7) color.push([ line[4], line[5], line[6] ]);
                            else color.push([ 1, 1, 1 ]);
                        }
                    }
                    break;
                }

                case "vn": { normal.push([ line[1], line[2], line[3] ]); break; }
                case "vt": { texcoord.push([ line[1], line[2] ]); break; }

                //For faces we need to do some leg-work due to the way everything is formatted!
                case "f": {
                    //Parse the points in the face
                    line = line.map((v, i) => {
                        //Parse the point values
                        if (i != 0) {
                            const point = v.split("/").map((a) => (DaveShade.cleanNumber(a) - 1));
                            return point;
                        }
                        return v;
                    });

                    //Now triangulate the face,
                    //This is due to the obj standard not specifying triangles
                    const primary = line[1];
                    for (let p = 1; p < line.length - 2; p++) {
                        //Get the other points
                        const secondary = line[p + 1];
                        const tertiary = line[p + 2];

                        //Push position and color for all three points
                        writing[settings.position].push(
                            vertex[primary[0]],
                            vertex[secondary[0]],
                            vertex[tertiary[0]]
                        );

                        writing[settings.color].push(
                            color[primary[0]],
                            color[secondary[0]],
                            color[tertiary[0]]
                        );

                        //And if we have them push texcoord and normal
                        //Otherwise push a default for texcoord
                        if (
                            primary[1] == -1 &&
                            secondary[1] == -1 &&
                            tertiary[1] == -1
                        ) writing[settings.uv].push(
                            texcoord[primary[1]],
                            texcoord[secondary[1]],
                            texcoord[tertiary[1]]
                        );
                        else writing[settings.uv].push([ 0, 0 ], [ 0, 0 ], [ 0, 0 ]);

                        //Okay, so this one is interesting, if we
                        //don't have a normal, we have to calculate one via cross product
                        if (
                            primary[2] != -1 &&
                            secondary[2] != -1 &&
                            tertiary[2] != -1
                        ) writing[settings.normal].push(
                            normal[primary[2]],
                            normal[secondary[2]],
                            normal[tertiary[2]],
                        );
                        else {
                            //First we need to gather the 3 positional values of the points
                            const a = vertex[primary[0]];
                            const b = vertex[secondary[0]];
                            const c = vertex[tertiary[0]];
                            
                            //Then we get a-b and a-c
                            const ab = [
                                b[0] - a[0],
                                b[1] - a[1],
                                b[2] - a[2],
                            ];

                            const ac = [
                                c[0] - a[0],
                                c[1] - a[1],
                                c[2] - a[2],
                            ]

                            //Then calculate the cross product
                            const crs = [
                                ab[1] * ac[2] - ab[2] * ac[1],
                                ab[2] * ac[0] - ab[0] * ac[2],
                                ab[0] * ac[1] - ab[1] * ac[0]
                            ]

                            //Normalize it
                            const length = Math.sqrt((crs[0] * crs[0]) + (crs[1] * crs[1]) + (crs[2] * crs[2]));
                            crs[0] /= length;
                            crs[1] /= length;
                            crs[2] /= length;

                            //And push it to the mesh
                            writing[settings.normal].push(crs, crs, crs);
                        }

                        writing.POINT_COUNT += 3;
                    }
                    break;
                }

                //And since we can have multiple materials allow multiple sub-meshes
                case "usemtl": { if (!settings.oneSet) setActiveSubmesh(line.splice(1).join(" ")); }
            
                default:
                    break;
            }
        }

        //If we are using one set, return one set
        if (settings.oneSet) {
            const returned = this.buffersFromJSON(parsed.default);
            returned.POINT_COUNT = parsed.default.POINT_COUNT;

            resolve(returned)
        }
        //Otherwise parse all sets
        else {
            //Run through and parse the buffers and return the final part.
            const returned = {};
            for (let key in parsed) {
                if (parsed[key].POINT_COUNT == 0) continue;

                returned[key] = this.buffersFromJSON(parsed[key]);
                returned[key].POINT_COUNT = parsed[key].POINT_COUNT;
            }

            resolve(returned);
        }
    });
}