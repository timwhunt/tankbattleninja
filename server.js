const express = require('express');
const app = express();
app.use(express.static(__dirname + "/static"));
const server = app.listen(8000, ()=> console.log("Starting server on port 8000"));
const io = require('socket.io')(server);
var games = [];
var sockets = {};
var partialGame = null;


//set up interval to delete old games
setInterval(() =>{
    var count = 0;
    for (let i = 0; i < games.length; i++) {
        if (Date.now() - games[i].startTime > 60000) {
            games.splice(i,1);
            count ++;
        }
    }
    console.log("Deleted " + count + " old games");
}, 60000);


io.on('connection', function (socket) {

    socket.on('newUser', function (data) {
        console.log("New user, " + data.name + " socketId : " + socket.id);

        if (partialGame == null) {
            partialGame = new Game("default");
        }

        var playerNum = partialGame.addPlayer(data.name, socket);
        sockets[socket.id] = partialGame;

        socket.emit("Joined", {playerNumber: playerNum});

        if (playerNum == 2) {
            partialGame.start();
            games.push(partialGame);
            partialGame = null;
        }

    });

    socket.on('playerChanged', function (data) {
        //console.log("player update", data);
        var game = sockets[socket.id];
        //console.log("Player update for from socket id " + socket.id);
        //console.log("Game ", game);
        if (game) {
            for (var i = 0; i < game.playerSockets.length; i++) {
                //console.log("testing socket id " + game.playerSockets[i].id);
                if (socket.id != game.playerSockets[i].id) {
                    game.playerSockets[i].emit("PlayerUpdate", data)
                    //console.log("Emitting player update to socket id " + game.playerSockets[i].id);
                }
            }
        }
    });

    socket.on('ProjectileCreated', function (data) {
        //console.log("Projectile created", data);
        var game = sockets[socket.id];
        if (game){
            for (var i = 0; i < game.playerSockets.length; i++) {
                if (socket.id != game.playerSockets[i].id) {
                    game.playerSockets[i].emit("CreateProjectile", data)
                }
            }
        }
    });

    socket.on('PlayerHit', function (data) {
        //console.log("Player hit", data);
        var game = sockets[socket.id];
        if (game){
            for (var i = 0; i < game.playerSockets.length; i++) {
                if (socket.id != game.playerSockets[i].id) {
                    game.playerSockets[i].emit("PlayerWasHit", data)
                }
            }
        }
    });

    socket.on('Ping', function (data) {
        socket.emit('Pong', data);
    });

    socket.on('disconnect', function (data) {
        //console.log("Disconnect socketId : " + socket.id);
        delete sockets[socket.id];
        //console.log("removed from socket map ", sockets)

    });

});

class Game {
    constructor(name){
        this.name = name;
        this.playerSockets = [];
        this.playerNames = [];
        this.startTime = 0;
    }

    addPlayer(name, socket) {
        this.playerSockets.push(socket);
        this.playerNames.push(name);
        return this.playerNames.length;
    }

    start() {
        this.startTime = Date.now();
        var data = {
            name: this.name,
            playerNames: this.playerNames
        };
        for (var i = 0; i < this.playerSockets.length; i++){
            this.playerSockets[i].emit("GameSet", data);
        }
    }
}