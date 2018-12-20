import Player from "./Player.js";
import Projectile from "./Projectile.js";

export default class Game {
    constructor(canvas) {
        this.localPlayerIndex = 0;
        this.scene = null;
        this.socket = null;
        this.map = null;
        this.players = [];
        this.projectiles = [];
        this.timeStart = 0;
        this.camera = null;
        this.keys = {
            forward: false,
            back: false,
            right: false,
            left: false,
            shoot: false
        }
        this.overhead = false;
        this.framesThisCycle = 0;
        this.secondStart = Date.now();
        this.endTime = null;

        this.playerMats = [];
        this.socket = null;
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
        this.ping = 0;
        this.done = false;
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.scene.ambientColor = new BABYLON.Color3(1, 1, 1);


        //Add a camera to the scene and attach it to the canvas
        // var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,10,40), this.scene);
        // camera.attachControl(canvas, true);

        var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), this.scene);
        this.camera = camera;
        // The goal distance of camera from target
        camera.radius = 15;
        // The goal height of camera above local origin (centre) of target
        camera.heightOffset = 5;
        // The goal rotation of camera around local origin (centre) of target in x y plane
        camera.rotationOffset = 0;
        // Acceleration of camera in moving from current to goal position
        camera.cameraAcceleration = 0.05;
        // The speed at which acceleration is halted
        camera.maxCameraSpeed = 10;

        var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0.5, -1, 0.25), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);

        //add some objects for orientation
/*
        var markerX = BABYLON.MeshBuilder.CreateCylinder("markerX", {
            diameterTop: 1,
            diameterBottom: 1,
            height: 5,
            tessellation: 16}, this.scene);
        markerX.position.x = 30;
        markerX.position.z = 0;
        markerX.position.y = 2.5;
        var matRed = new BABYLON.StandardMaterial("matRed", this.scene);
        matRed.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
        markerX.material = matRed;

        var markerZ = BABYLON.MeshBuilder.CreateCylinder("markerZ", {
            diameterTop: 1,
            diameterBottom: 1,
            height: 5,
            tessellation: 16}, this.scene);
        markerZ.position.x = 0;
        markerZ.position.z = 30;
        markerZ.position.y = 2.5;
        var matBlue = new BABYLON.StandardMaterial("matBlue", this.scene);
        matBlue.diffuseColor = new BABYLON.Color3(0.1, 0.1, 1);
        matBlue.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.5);
        markerZ.material = matBlue;
        console.log("Red cylinder on x axis, blue on z axis");
*/

        var mat1 = new BABYLON.StandardMaterial("mat1", this.scene);
        mat1.diffuseColor = new BABYLON.Color3(0.7, 0.1, 0.1);
        mat1.ambientColor = new BABYLON.Color3(0.2, 0, 0);
        mat1.freeze();
        this.playerMats.push(mat1);

        var mat2 = new BABYLON.StandardMaterial("mat2", this.scene);
        mat2.diffuseColor = new BABYLON.Color3(0.1, 0.7, 0.1);
        mat2.ambientColor = new BABYLON.Color3(0, 0.2, 0);
        mat2.freeze();
        this.playerMats.push(mat2);

        var mat3 = new BABYLON.StandardMaterial("mat3", this.scene);
        mat3.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.7);
        mat3.ambientColor = new BABYLON.Color3(0, 0, 0.2);
        mat3.freeze();
        this.playerMats.push(mat3);

        var mat4 = new BABYLON.StandardMaterial("mat4", this.scene);
        mat4.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.1);
        mat4.ambientColor = new BABYLON.Color3(0.2, 0.2, 0);
        mat4.freeze();
        this.playerMats.push(mat4);
    }

    attachCameraToPlayer() {
        this.camera.lockedTarget = this.players[this.localPlayerIndex].rootmesh;
    }

    createPlayers(namesArr) {
        for (var i = 0; i < namesArr.length; i++) {
            var player = new Player(namesArr[i], 1, i, this.map.basePos[i][0],
                this.map.basePos[i][1],
                Math.atan2(this.map.basePos[i][0], this.map.basePos[i][1]),
                this);
            this.players.push(player);
            player.addToScene(this.scene, this.playerMats[i]);

        }
        //var player = new Player(1, 0, 20, 0, this);

    }

    createProjectile (ownerIndex, type, posX, posZ, rotY){
        let proj = new Projectile(ownerIndex, type, posX, posZ, rotY, this);
        proj.addToScene(this.scene);
        this.projectiles.push(proj);
        //console.log("created projectile ", proj);

        this.socket.emit("ProjectileCreated", {
            randId: proj.basics.randId,
            ownerIndex: ownerIndex,
            type: type,
            posX: posX,
            posZ: posZ,
            rotY: rotY
        });
    }

    createProjectileFromNet(data){
        let proj = new Projectile(data.ownerIndex, data.type, data.posX, data.posZ, data.rotY, this);
        proj.basics.randId = data.randId;
        proj.addToScene(this.scene);
        this.projectiles.push(proj);
    }

    moveProjectiles(cyclems){
        for (var i = 0; i < this.projectiles.length; i++){
            if (this.projectiles[i].dead) {
                this.projectiles.splice(i,1); //remove dead projectiles
            } else {
                this.projectiles[i].move(cyclems);
            }
        }
    }

    move(cyclems){
        this.moveProjectiles(cyclems);

        for (var i = 0; i < this.players.length; i ++) {
            this.players[i].move(cyclems, this.map);
        }

        // if (this.players[this.localPlayerIndex].obstacleCollision(this.map.obstacles)){
        //     console.log("Obstacle collision");
        // } else {
        //
        // }

        if (this.overhead) {
            this.camera.heightOffset = 200;
        } else {
            this.camera.heightOffset = 5;
        }
    }

    checkPeriodicTasks(){
        //calculate FPS and display stats
        this.framesThisCycle++;
        if (Date.now() - this.secondStart > 1000) {
            this.doPeriodicTasks();
        }
    }

    //called once per second
    doPeriodicTasks(){
        var fps = this.framesThisCycle / ((Date.now() - this.secondStart)/1000);
        this.framesThisCycle = 0;
        this.secondStart = Date.now();

        this.socket.emit("Ping", {timeStamp: this.secondStart});

        document.getElementById("stats").innerText = "FPS: " + Math.round(fps,0) + " Ping: " + this.ping;

        this.refreshScoreBoard();

        if ((! this.done) && Date.now() > this.endTime) {
            this.done = true;
            this.showWinner();
        }
    }

    showWinner(){
        //get the top score
        var topScore = this.players[0].dynamic.points;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].dynamic.points > topScore) {
                topScore = this.players[i].dynamic.points;
            }
        }
        //get all names with top score
        var topScoreNames = [];
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].dynamic.points === topScore) {
                topScoreNames.push(this.players[j].basics.name);
            }
        }

        var winnerText = "";
        if (topScoreNames.length == 1) {
            winnerText = "The winner is " + topScoreNames[0] + "!";
        } else if (topScoreNames.length == 2){
            winnerText = "The winners are " + topScoreNames[0] + " and " + topScoreNames[1] + "!";
        } else {
            winnerText = "The winners are ";
            for (var n = 0; n < topScoreNames.length; n++) {
                winnerText += topScoreNames[n];
                if (n < topScoreNames.length-1) {
                    winnerText += ", ";
                    if (n == topScoreNames.length-2) {
                        winnerText += "and ";
                    }
                }
            }
        }

        $('#winner-text').text(winnerText);
        $('#winner').show();
    }

    checkCollisions(cyclems) {
        this.checkProjectileCollisions(cyclems);
    }

    checkProjectileCollisions(cyclems) {
        for (var i = 0; i < this.projectiles.length; i++){
            var hit = this.projectiles[i].checkCollision(cyclems);
            // if (hit) {
            //     console.log("hit " + hit);
            // }
        }

    }
    //notifies of player hit by projectile. Could be any player, not necessarily the local player
    reportPlayerHit(playerIndex, projectileId, projectileOwner) {
        if (playerIndex === this.localPlayerIndex) { //only report if local player is hit
            var report = {
                playerIndex: playerIndex,
                projectileId: projectileId,
                projectileOwner: projectileOwner
            };
            //console.log("Hit player", report);
            this.socket.emit("PlayerHit", report);
            this.updatePlayersForHit(playerIndex, projectileOwner)
        }
    }
    //Handle notification from net that a player was hit
    handlePlayerWasHit(report){
        this.updatePlayersForHit(report.playerIndex, report.projectileOwner);
    }

    updatePlayersForHit(hitPlayerIndex, shootingPlayerIndex) {
        this.players[hitPlayerIndex].dynamic.points -= 50;
        this.players[shootingPlayerIndex].dynamic.points += 100;
        this.players[hitPlayerIndex].dynamic.heath -= 25;
        //this.refreshScoreBoard();
    }

    showDebug(message) {
        document.getElementById("debugDisplay").innerText = message;
    }

    refreshScoreBoard(){
        var totalSecondsLeft = Math.floor((this.endTime-Date.now())/1000);
        if (totalSecondsLeft < 0) {
            totalSecondsLeft = 0;
        }
        var minutesLeft = Math.floor(totalSecondsLeft/60);
        var secondsLeft = totalSecondsLeft % 60;

        if (secondsLeft < 10) {
            var timeLeft = minutesLeft + ":0" + secondsLeft;
        } else {
            var timeLeft = minutesLeft + ":" + secondsLeft;
        }

        var html = "<p>TIME> " + timeLeft + " | HEALTH> " + this.players[this.localPlayerIndex].dynamic.heath + " | SCORES> ";
        for (var i = 0; i < this.players.length; i++) {
            var name = this.players[i].basics.name;
            if (i === this.localPlayerIndex) {
                name = "You";
            }
            html += "<span class='player" + i +"'>" + name + ": " + this.players[i].dynamic.points + "</span>";
            if (i < this.players.length-1) {
                html += " / ";
            }
        }
        html += "</p>";
        document.getElementById("scoreboard").innerHTML = html;
    }

    setUpSocketCallbacks(){
        this.socket.on('Joined', (data) => {
            console.log("Joined game, player number = " + data.playerNumber);
            this.localPlayerIndex = data.playerNumber - 1;
            $('#welcome').hide();
            $('#waiting').show();

            //this.attachCameraToPlayer();
        });

        this.socket.on('GameSet', (data) => {
            console.log("Game set ", data);
            //this.refreshScoreBoard();
            this.runGame(data);
        });
        this.socket.on('PlayerUpdate', (data) => {
            //console.log("Player update", data);
            var playerIndex = data.playerIndex;
            if (playerIndex != this.localPlayerIndex) {
                this.players[playerIndex].dynamic = data;
            }
        });
        this.socket.on('CreateProjectile', (data) => {
            //console.log("Create projectile", data);
            this.createProjectileFromNet(data);
        });
        this.socket.on('PlayerWasHit', (data) => {
            //console.log("Player was hit net event", data);
            this.handlePlayerWasHit(data);
        });
        this.socket.on('Pong', (data) =>{
            this.ping = Date.now() - data.timeStamp;
        });

    }

    joinGame(name){
        this.socket.emit('newUser', {name: name});
    }

    runGame(data){
// Register a render loop to repeatedly render the scene
        $('#waiting').hide();
        var lastTime = Date.now();
        this.endTime = Date.now() + 3*60*1000;

        this.createPlayers(data.playerNames);
        this.attachCameraToPlayer();

        this.engine.runRenderLoop( () => {

            this.players[this.localPlayerIndex].processKeys(this.keys);
            var cyclems = Date.now() - lastTime;
            lastTime = Date.now();
            this.move(cyclems);
            this.checkPeriodicTasks();
            this.checkCollisions(cyclems);
            //console.log(this.players[this.localPlayerIndex].dynamic.action);

            this.scene.render();
        });

    }
}