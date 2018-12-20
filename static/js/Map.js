export default class Map {
    constructor(mapNum){
        this.sizeX =  500;
        this.sizeZ = 500;
        this.obstacles = [];
        this.basePos = []; //x and z

        // this.obstacles.push(new Obstacle("box",0,0,5,5,5));
        // this.obstacles.push(new Obstacle("box",10,10,15,15,25));
        // this.obstacles.push(new Obstacle("box",-100,-50,-95,50,10));
        // this.obstacles.push(new Obstacle("cube", 0,20, 20));

        //place obstacles
        var mapData = this.getMapData(mapNum);
        //console.log("Map data", mapData);
        for (var z = 0; z < mapData.length; z ++){
            //console.log("Length " + mapData[z].length);
            for (var x = 0; x < mapData[z].length; x++){
                //console.log("x " + x);
                if (mapData[z][x] === 'b'){
                    //box
                    this.obstacles.push(new Obstacle("box",x*5-250,z*5-250,x*5+5-250,z*5+5-250,10));
                } else if (mapData[z][x] === 'B'){
                    //box
                    this.obstacles.push(new Obstacle("box",x*5-250,z*5-250,x*5+5-250,z*5+5-250,15));
                }
            }
        }


        //place bases
        this.basePos.push([-200,0], [200,0], [0,-200], [0,200]);
    }

    addToScene(scene, baseMats) {

        //add ground
        var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: this.sizeX, height: this.sizeZ, subdivsions: 4}, scene);
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        //groundMaterial.ambientColor = new BABYLON.Color3(0.2, 0.1, 0.2);
        groundMaterial.freeze();
        ground.material = groundMaterial;

        var boxMat =  new BABYLON.StandardMaterial("boxMaterial", scene);
        boxMat.diffuseColor = new BABYLON.Color3(0, 0, 0.5);
        boxMat.ambientColor = new BABYLON.Color3(0, 0, 0.1);
        boxMat.freeze();

        //add obstacles
        for (var i=0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].type === "cone"){
                var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
                    diameterTop: 0,
                    diameterBottom: 5,
                    height: 5,
                    tessellation: 16}, scene);
                cone.position.x = this.obstacles[i].x;
                cone.position.z = this.obstacles[i].z;
                cone.position.y = this.obstacles[i].y + 2.5; //add half the height to sit on ground
            } else if (this.obstacles[i].type === "box"){
                var box = BABYLON.MeshBuilder.CreateBox("box" + i, {
                    height: this.obstacles[i].height,
                    width: this.obstacles[i].maxX - this.obstacles[i].minX,
                    depth: this.obstacles[i].maxZ - this.obstacles[i].minZ});
                box.position.x = (this.obstacles[i].minX + this.obstacles[i].maxX)/2;
                box.position.z = (this.obstacles[i].minZ + this.obstacles[i].maxZ)/2;
                box.position.y = this.obstacles[i].height/2; //add half the height to sit on ground
                box.material = boxMat;
                box.freezeWorldMatrix();
            }
        }
        //add bases
        for (var i = 0; i < this.basePos.length; i++){
            var hoop = BABYLON.MeshBuilder.CreateTorus("hoop", {thickness: 1, diameter: 10}, scene);
            hoop.position.x = this.basePos[i][0];
            hoop.position.z = this.basePos[i][1];
            hoop.position.y = 0;
            hoop.material = baseMats[i];
        }
    }

    getMapData(num) {
        var out = [];
        out.push("B                   b                                                           b                  B");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("bbbbbbbbbb                                                                                bbbbbbbbbb"); //tenth 10th
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    "); //tenth 20th
        out.push("              b                                                                      b              ");
        out.push("             b                                                                        b             ");
        out.push("            b                                                                          b            ");
        out.push("           b                                                                            b           ");
        out.push("          b              bbbbbbbbbbbbbbbbbbbbbbb    bbbbbbbbbbbbbbbbbbbbbbb              b          ");
        out.push("         b                                                                                b         ");
        out.push("        b                                                                                  b        ");
        out.push("       b                                                                                    b       ");
        out.push("      b                                                                                      b      ");
        out.push("     b                                                                                        b     "); //tenth 30th
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("  bbbbbbbbbbbbbbb                                                                  bbbbbbbbbbbbbbb  ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                        b                                                  b                        "); //tenth 40th
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        ");
        out.push("                                            BbbbbbbbbbbbbbbbB                                       ");
        out.push("                                                                                                    ");
        out.push("                                          B                   B                                     ");
        out.push("                                          b                   b                                     ");
        out.push("                                          b                   b                                     ");
        out.push("                                          b                   b                                     "); //tenth 50th
        out.push("                                          b                   b                                     ");
        out.push("                                          b                   b                                     ");
        out.push("                                          b                   b                                     ");
        out.push("                                          B                   B                                     ");
        out.push("                                                                                                    ");
        out.push("                                            BbbbbbbbbbbbbbbbB                                       ");
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        ");
        out.push("                        b                                                  b                        "); //tenth 60th
        out.push("                        b                                                  b                        ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("  bbbbbbbbbbbbbbb                                                                  bbbbbbbbbbbbbbb  ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("     b                                                                                        b     "); //tenth 70th
        out.push("      b                                                                                      b      ");
        out.push("       b                                                                                    b       ");
        out.push("        b                                                                                  b        ");
        out.push("         b                                                                                b         ");
        out.push("          b              bbbbbbbbbbbbbbbbbbbbbbb    bbbbbbbbbbbbbbbbbbbbbbb              b          ");
        out.push("           b                                                                            b           ");
        out.push("            b                                                                          b            ");
        out.push("             b                                                                        b             ");
        out.push("              b                                                                      b              ");
        out.push("                                                                                                    "); //tenth 80th
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("bbbbbbbbbb                                                                                bbbbbbbbbb"); //tenth 90th
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                                                                                                    ");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("                    b                                                           b                   ");
        out.push("B                   b                                                           b                  B"); //tenth 100th

        return out;
    }

}

class Obstacle {
    constructor(type, minX, minZ, maxX, maxZ, height){
        this.type = type;
        this.minX = minX;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxZ = maxZ;
        this.height = height;
    }
}