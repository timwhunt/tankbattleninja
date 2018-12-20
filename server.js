const express = require('express');
const app = express();
app.use(express.static(__dirname + "/static"));
const server = app.listen(8000, ()=> console.log("Starting server on port 8000"));
const io = require('socket.io')(server);
var games = [];
var sockets = {};
var partialGame = null;

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

        // if (waitingUserSocket == null) {
        //     waitingUserSocket = socket;
        //     waitingUserName = data.name;
        //     socket.emit("wait");
        // } else {
        //     var newGame = createGame(waitingUserSocket, waitingUserName, socket, data.name);
        //     games.push(newGame);
        //     sockets[waitingUserSocket.id] = newGame;
        //     sockets[socket.id] = newGame;
        //     waitingUserSocket = null;
        //     waitingUserName = "";
        //
        //     newGame.socket1.emit('gameSet', {num: 1, opponentName: newGame.name2});
        //     newGame.socket2.emit('gameSet', {num: 2, opponentName: newGame.name1});
        //
        //     setTimeout(function(){
        //         newGame.socket1.emit("ready", {rand2: rand2, rand3: rand3});
        //         newGame.socket2.emit("ready", {rand2: rand2, rand3: rand3});
        //
        //         setTimeout(function(){
        //             newGame.socket1.emit("go");
        //             newGame.socket2.emit("go");
        //         }, 4000);
        //     }, 3000);

                // io.emit("ready", {rand2: rand2, rand3: rand3});
                // setTimeout(function(){
                //     io.emit("go");
                // }, 4000);
        //}

        // } else {
        //     socket.emit("tooMany");
        // }
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



        /*
            socket.on('chomp', function (data) {
                var game = sockets[socket.id];
                var points = 10;
                if (data.type === "powerUp") {
                    points = 100;
                }
                if (socket == game.socket1) {
                    game.scores[0] += points;
                    game.socket2.emit('clear-space', {row: data.row, col: data.col});
                } else {
                    game.scores[1] += points;
                    game.socket1.emit('clear-space', {row: data.row, col: data.col});
                }
                game.socket1.emit('scores', {scores: game.scores});
                game.socket2.emit('scores', {scores: game.scores});

                //socket.broadcast.emit('player-data', {playerData: data.playerData});
            });
        */
/*
    socket.on('player-data', function (data) {
        //send the data to the other player in the game
        var game = sockets[socket.id];
        if (socket == game.socket1) {
            game.socket2.emit('player-data', {playerData: data.playerData});
        } else {
            game.socket1.emit('player-data', {playerData: data.playerData});
        }
        //console.log("player-data socketId : " + socket.id);
        //socket.broadcast.emit('player-data', {playerData: data.playerData});
    });
*/
    // socket.on('disconnect', function (data) {
    //     console.log("Disconnect socketId : " + socket.id);
    //     var msg = users[socket.id] +" left the room";
    //     io.emit('msg', { msg: msg, name: "Sys"});
    // });

});

class Game {
    constructor(name){
        this.name = name;
        this.playerSockets = [];
        this.playerNames = [];
    }

    addPlayer(name, socket) {
        this.playerSockets.push(socket);
        this.playerNames.push(name);
        return this.playerNames.length;
    }

    start() {
        var data = {
            name: this.name,
            playerNames: this.playerNames
        };
        for (var i = 0; i < this.playerSockets.length; i++){
            this.playerSockets[i].emit("GameSet", data);
        }
    }
}