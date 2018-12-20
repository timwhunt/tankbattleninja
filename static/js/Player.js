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
            heath: 100,
            action: "stop",
            posX: posX,
            posZ: posZ,
            rotY: rotY
        };
        this.nextShotTime = 0;
        this.updateNeeded = false; //true means server needs to be given an update
        this.rootmesh = null;
        this.game = game;
    }

    addToScene(scene, mat) {
        var sphere = BABYLON.MeshBuilder.CreateSphere("player" + this.dynamic.playerIndex, {diameter: 2.5}, scene);
        this.rootmesh = sphere;

        var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
            diameterTop: 1,
            diameterBottom: 3,
            height: this.basics.length,
            tessellation: 5
        }, scene);
        //cone.position.x = this.dynamic.posX;
        //cone.position.z = this.dynamic.posZ;
        //cone.position.y = 3;
        cone.rotation.z = Math.PI / 2;
        cone.rotation.y = -Math.PI / 2;
        cone.convertToFlatShadedMesh();
        cone.material = mat;
        cone.parent = sphere;

        sphere.position.x = this.dynamic.posX;
        sphere.position.z = this.dynamic.posZ;
        sphere.rotation.y = this.dynamic.rotY;
        sphere.position.y = 3;
        sphere.material = mat;
    }

    processKeys(keys) {
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
