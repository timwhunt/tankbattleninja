export default class Projectile {
    constructor(ownerIndex, type, posX, posZ, rotY, game) {
        this.basics = {
            randId: Math.floor(Math.random()*100000000),
            ownerIndex: ownerIndex,
            type: type,
            rotY: rotY,
            speed: 200,
        };
        this.dynamic = {
            posX: posX,
            posZ: posZ,
        };
        this.rootmesh = null;
        this.game = game;
        this.dead = false;
        this.firstCycle = true;
        //console.log("New Projectile", this);
    }

    addToScene(scene) {
        var cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
            diameterTop: 0,
            diameterBottom: 2,
            height: 3,
            tessellation: 4
        }, scene);
        cone.convertToFlatShadedMesh();
        this.rootmesh = cone;

        cone.rotation.x = -Math.PI / 2;

        cone.rotation.y = this.basics.rotY;
        cone.convertToFlatShadedMesh();

        cone.position.x = this.dynamic.posX;
        cone.position.z = this.dynamic.posZ;
        cone.position.y = 3;
        cone.isPickable = false;

        var matYellow = new BABYLON.StandardMaterial("matBlue", this.scene);
        matYellow.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0);
        matYellow.ambientColor = new BABYLON.Color3(0.3, 0.3, 0);
        matYellow.freeze();
        //matYellow.wireframe = true;
        cone.material = matYellow;

        //this.castRay();


    }

    move(cyclems) {
        var dist = this.basics.speed * cyclems / 1000;
        this.rootmesh.position.z -= dist * Math.cos(this.rootmesh.rotation.y);
        this.rootmesh.position.x -= dist * Math.sin(this.rootmesh.rotation.y);

        //check if out of bounds
        if (this.rootmesh.position.x > this.game.map.sizeX/2 ||
            this.rootmesh.position.x < -this.game.map.sizeX/2 ||
            this.rootmesh.position.z > this.game.map.sizeZ/2 ||
            this.rootmesh.position.z < -this.game.map.sizeZ/2) {
            this.die();
        }
        //this.castRay();

    }

    vecToLocal(vector, mesh){
        var m = mesh.getWorldMatrix();
        var v = BABYLON.Vector3.TransformCoordinates(vector, m);
        return v;
    }

    castRay(){
        //var origin = this.rootmesh.position;

        var origin = new BABYLON.Vector3(this.rootmesh.position.x, this.rootmesh.position.y, this.rootmesh.position.z);

        var direction = new BABYLON.Vector3(-Math.sin(this.rootmesh.rotation.y),0,-Math.cos(this.rootmesh.rotation.y));

        var length = 5;

        var ray = new BABYLON.Ray(origin, direction, length);

        var hit = this.game.scene.pickWithRay(ray);

        if (hit.pickedMesh){
            //hit.pickedMesh.scaling.y += 0.5;
            console.log("Hit!");
        }
    }

    checkCollision(cyclems){
        if (this.dead) {
            return null;
        }
        //called each cycle AFTER moving
        // calc origin as back of projectile before last movement
        var dist = this.basics.speed * cyclems / 1000;
        var origin = new BABYLON.Vector3(   this.rootmesh.position.x + (dist + 1.5) * Math.sin(this.rootmesh.rotation.y),
                                            this.rootmesh.position.y,
                                            this.rootmesh.position.z + (dist + 1.5) * Math.cos(this.rootmesh.rotation.y));

        var direction = new BABYLON.Vector3(-Math.sin(this.rootmesh.rotation.y),0,-Math.cos(this.rootmesh.rotation.y));

        var length = dist + 3;
        //console.log("ray length " + length);

        var ray = new BABYLON.Ray(origin, direction, length);
        ray.isPickable = false;

        //for debugging, show ray
        if (this.firstCycle) {
            this.firstCycle = false;
            //BABYLON.RayHelper.CreateAndShow(ray, this.game.scene, new BABYLON.Color3(1, 1, 0.1));
        }


        var hit = this.game.scene.pickWithRay(ray);

        if (hit.pickedMesh){
            this.die();
            var hitObj = this.getRootName(hit.pickedMesh);
            if (hitObj.startsWith("player")){
                var playerIndex = parseInt(hitObj.substring(6));
                //console.log("Hit Player Index " + playerIndex)
                this.game.reportPlayerHit(playerIndex, this.basics.randId, this.basics.ownerIndex);
            }
            return hitObj;
        }
    }

    getRootName(mesh) {
        var runner = mesh;
        while (mesh.parent) {
            mesh = mesh.parent;
        }
        return mesh.name;
    }

    die() {
        this.dead = true;
        this.rootmesh.dispose();
    }

}
