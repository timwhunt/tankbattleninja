//console.log("main loaded");

import Game from "./Game.js";
import Map from "./Map.js";
import Player from "./Player.js";


var canvas = document.getElementById("renderCanvas"); // Get the canvas element
//var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var game = new Game(canvas);
game.map = new Map(1);

game.createScene();
game.map.addToScene(game.scene, game.playerMats);
game.scene.render();

game.socket = io();
game.setUpSocketCallbacks();

//game.socket.emit('newUser', {name: "Bob"});

function joinGame(){
}

$( document ).ready(function(){
    $('#joinBtn').click(function(){
        var name = $('#nameInput').val();
        if (name.length > 0) {
            //alert("Joining game " + name);
            game.joinGame(name);
        }
    });
});

$( document ).ready(function(){
    $('#playAgainBtn').click(function(){
        location.reload();
    });
});

// function runGame() {
// // Register a render loop to repeatedly render the scene
//     var lastTime = Date.now();
//     engine.runRenderLoop(function () {
//
//         game.players[game.localPlayerIndex].processKeys(game.keys);
//         var cyclems = Date.now() - lastTime;
//         lastTime = Date.now();
//         game.move(cyclems);
//         game.checkCollisions(cyclems);
//         //console.log(game.players[game.localPlayerIndex].dynamic.action);
//
//         game.scene.render();
//     });
// }

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    game.engine.resize();
});

document.onkeydown = function (e) {

    if (e.key === "ArrowUp") {
        game.keys.forward = true;
    }
    if (e.key === "ArrowDown") {
        game.keys.back = true;
    }
    if (e.key === "ArrowLeft") {
        game.keys.left = true;
    }
    if (e.key === "ArrowRight") {
        game.keys.right = true;
    }
    if (e.key === " ") {
        game.keys.shoot = true;
    }
    if (e.key === "x") {
        game.overhead = true;
    }
};

document.onkeyup = function (e) {
    //console.log("Key up: " + e.key);
    if (e.key === "ArrowUp") {
        game.keys.forward = false;
    }
    if (e.key === "ArrowDown") {
        game.keys.back = false;
    }
    if (e.key === "ArrowLeft") {
        game.keys.left = false;
    }
    if (e.key === "ArrowRight") {
        game.keys.right = false;
    }
    if (e.key === " ") {
        game.keys.shoot = false;
    }
    if (e.key === "x") {
        game.overhead = false;
    }

};