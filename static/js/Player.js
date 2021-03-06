export default class Player {
    constructor(name, modelId, playerIndex, posX, posZ, rotY, game) {
        this.basics = {
            name: name,
            modelId: modelId,
            shield: 75,
            speed: 20,
            rotSpeed: Math.PI/4,
            damage: 100,
            shotDelay: 0.5,
            length: 5
        };
        this.dynamic = {
            playerIndex: playerIndex, //not really dynamic, but here for easy identification
            points: 0,
            health: 100,
            action: "stop",
            posX: posX,
            posZ: posZ,
            rotY: rotY,
            msAtBase: 0, //ms for end of flight for return to base
            startX: 0,
            startZ: 0
        };
        this.nextShotTime = 0;
        this.updateNeeded = false; //true means server needs to be given an update
        this.rootmesh = null;
        this.game = game;
    }

    addToScene(scene, mat) {
        var sphere = BABYLON.MeshBuilder.CreateSphere("player" + this.dynamic.playerIndex, {diameter: 2.5}, scene);
        this.rootmesh = sphere;

        var rightWingShape = [
            new BABYLON.Vector3(0, 0, 2.5),
            new BABYLON.Vector3(0, 0, -2.5),
            new BABYLON.Vector3(2, 0, -1.0),
            new BABYLON.Vector3(3, 0, -1.0),
            new BABYLON.Vector3(3, 0, 2.0),
            new BABYLON.Vector3(2, 0, 2.0),
        ];

        rightWingShape.push(rightWingShape[0]);

        var rightWing = BABYLON.MeshBuilder.ExtrudePolygon("wing", {shape: rightWingShape, depth: 0.5}, scene);
        rightWing.rotation.z = -0.25;
        rightWing.position.y = 0.5;
        rightWing.material = mat;
        rightWing.parent = sphere;

        var leftWingShape = [
            new BABYLON.Vector3(0, 0, 2.5),
            new BABYLON.Vector3(-2, 0, 2.0),
            new BABYLON.Vector3(-3, 0, 2.0),
            new BABYLON.Vector3(-3, 0, -1.0),
            new BABYLON.Vector3(-2, 0, -1.0),
            new BABYLON.Vector3(0, 0, -2.5),

        ];

        leftWingShape.push(leftWingShape[0]);

        var leftWing = BABYLON.MeshBuilder.ExtrudePolygon("wing", {shape: leftWingShape, depth: 0.5}, scene);
        leftWing.rotation.z = 0.25;
        leftWing.position.y = 0.5;
        leftWing.material = mat;
        leftWing.parent = sphere;


        /*
                var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
                    diameterTop: 1,
                    diameterBottom: 3,
                    height: this.basics.length,
                    tessellation: 5
                }, scene);
                cone.rotation.z = Math.PI / 2;
                cone.rotation.y = -Math.PI / 2;
                cone.convertToFlatShadedMesh();
                cone.material = mat;
                cone.parent = sphere;
        */

        sphere.position.x = this.dynamic.posX;
        sphere.position.z = this.dynamic.posZ;
        sphere.rotation.y = this.dynamic.rotY;
        sphere.position.y = 3;
        sphere.material = mat;
    }

    processKeys(keys) {
        if (this.dynamic.action === "flyToBase") {
            return;
        }
        var startingAction = this.dynamic.action;
        if (keys.forward) {
            if (keys.left) {
                this.dynamic.action = "ForwardLeft";
            } else if (keys.right) {
                this.dynamic.action = "ForwardRight";
            } else {
                this.dynamic.action = "Forward";
            }
        } else if (keys.back) {
            if (keys.left) {
                this.dynamic.action = "BackLeft";
            } else if (keys.right) {
                this.dynamic.action = "BackRight";
            } else {
                this.dynamic.action = "Back";
            }
        } else {
            if (keys.left) {
                this.dynamic.action = "Left";
            } else if (keys.right) {
                this.dynamic.action = "Right";
            } else {
                this.dynamic.action = "Stop";
            }
        }

        if (startingAction != this.dynamic.action) {
            this.updateNeeded = true;
        }
        if (keys.shoot) {
            if (this.nextShotTime < Date.now()) {
                this.nextShotTime = Date.now() + this.basics.shotDelay * 1000;
                this.shoot();
            }
        }

    }

    move(cyclems, map) {

        if (this.dynamic.action === "flyToBase") {

            if (Date.now() >= this.dynamic.msAtBase) {
                this.dynamic.action = "stop";
                this.dynamic.health = 100;
                this.rootmesh.position.y = 3;
                this.dynamic.posX = map.basePos[this.dynamic.playerIndex][0];
                this.dynamic.posZ = map.basePos[this.dynamic.playerIndex][1];
                if (this.dynamic.playerIndex === this.game.localPlayerIndex) {
                    this.updateNeeded = true;
                }

            } else {
                var dX = map.basePos[this.dynamic.playerIndex][0] - this.dynamic.startX;
                var dZ = map.basePos[this.dynamic.playerIndex][1] - this.dynamic.startZ;
                var dt = (5000 - (this.dynamic.msAtBase - Date.now())) / 5000;

                this.dynamic.posX = this.dynamic.startX + dt * dX;
                this.dynamic.posZ = this.dynamic.startZ + dt * dZ;

                this.dynamic.rotY += cyclems/1000 * 3;

                this.rootmesh.position.y = 3 + 50 * Math.sin(Math.PI * (this.dynamic.msAtBase - Date.now()) / 5000);

                // this.rootmesh.position.x = this.dynamic.posX;
                // this.rootmesh.position.z = this.dynamic.posZ;
                // this.rootmesh.rotation.y = this.dynamic.rotY;

            }

        } else { //not fly to base
            this.rootmesh.position.y = 3; //make sure there's now leftover elevation from flying

            var startX = this.dynamic.posX;
            var startZ = this.dynamic.posZ;
            var dist = this.basics.speed * cyclems / 1000;
            var rot = this.basics.rotSpeed * cyclems / 1000;
            if (this.dynamic.action.startsWith("Forward")) {
                this.dynamic.posZ -= dist * Math.cos(this.dynamic.rotY);
                this.dynamic.posX -= dist * Math.sin(this.dynamic.rotY);
            }
            if (this.dynamic.action.startsWith("Back")) {
                this.dynamic.posZ += dist * Math.cos(this.dynamic.rotY);
                this.dynamic.posX += dist * Math.sin(this.dynamic.rotY);
            }
            if (this.dynamic.action.endsWith("Left")) {
                this.dynamic.rotY -= rot;
            }
            if (this.dynamic.action.endsWith("Right")) {
                this.dynamic.rotY += rot;
            }

            //if local player, check for obstacle collision and map boundry
            if (this.dynamic.playerIndex === this.game.localPlayerIndex) {
                if (this.obstacleCollision(map.obstacles) ||
                    this.dynamic.posX < -map.sizeX/2 ||
                    this.dynamic.posX > map.sizeX/2 ||
                    this.dynamic.posZ < -map.sizeZ/2 ||
                    this.dynamic.posZ > map.sizeZ/2
                ){
                    this.dynamic.posX = startX;
                    this.dynamic.posZ = startZ;

                    //fix action value
                    var newAction=this.dynamic.action;
                    switch(this.dynamic.action) {
                        case "Forward":
                            newAction = "Stop";
                            break;
                        case "ForwardRight":
                            newAction = "Right";
                            break;
                        case "ForwardLeft":
                            newAction = "Left";
                            break;
                        case "Back":
                            newAction = "Stop";
                            break;
                        case "BackRight":
                            newAction = "Right";
                            break;
                        case "BackLeft":
                            newAction = "Left";
                            break;
                    }
                    this.dynamic.action = newAction;
                }
            }
        } //end of not flying

         this.rootmesh.position.x = this.dynamic.posX;
         this.rootmesh.position.z = this.dynamic.posZ;
         this.rootmesh.rotation.y = this.dynamic.rotY;

        if (this.updateNeeded) {

            this.game.socket.emit('playerChanged', this.dynamic);
            this.updateNeeded = false;
        }

        // this.game.showDebug("Player x: " + this.dynamic.posX.toFixed(1) +
        //     " z: " + this.dynamic.posZ.toFixed(1) +
        //     " rotY: " + this.dynamic.rotY.toFixed(1));

    }

    shoot() {
        //calculate the position in front of the player
        var posZ = this.dynamic.posZ - (6 + this.basics.length/2) * Math.cos(this.dynamic.rotY);
        var posX = this.dynamic.posX - (6 + this.basics.length/2) * Math.sin(this.dynamic.rotY);
        this.game.createProjectile(this.dynamic.playerIndex,"bolt", posX, posZ, this.dynamic.rotY);
    }

    obstacleCollision(obstacles){
        //console.log("Checking for obstacle collisions " + obstacles.length);
        var pMinX = this.dynamic.posX - 2.0;
        var pMaxX = this.dynamic.posX + 2.0;
        var pMinZ = this.dynamic.posZ - 2.0;
        var pMaxZ = this.dynamic.posZ + 2.0;

        for (var i = 0; i < obstacles.length; i++) {
            //console.log("collision check obj " + i);
            if(pMinX < obstacles[i].maxX &&
                pMaxX > obstacles[i].minX &&
                pMinZ < obstacles[i].maxZ &&
                pMaxZ > obstacles[i].minZ){
                return true;
            }
        }
        return false;
    }
}
