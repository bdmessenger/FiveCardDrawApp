const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { uuid } = require('uuidv4');

const DIST_DIR = path.join(__dirname, '../dist');

const Deck = require('./classes/deck');
const Player = require('./classes/player');
const Poker = require('./classes/poker');

const clients = {};
const games = {};

const passCodes = {};

const PORT = process.env.PORT || 3000;


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(DIST_DIR));

    app.get('*', (req,res) => {
        res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
    });
}

io.on('connection', socket => {

    /*
        The socket event below will create a player object after the client submits a display name for
        their player. After creation, client is redirected to the main menu with two options availble 
        to click on. The 'Host' button will create a game and generate a pass-code for another client 
        to use in order to join. The 'Join' button will require the client to submit a pass-code for entry
        to a host's game.
    */

    socket.on('PLAYER_CREATED', name => {
        clients[socket.id] = new Player(socket.id, name, null, false);
        socket.gameID = null;
        socket.emit('DISPATCH_SERVER_STATE', {player: clients[socket.id], game: null});
    });

    socket.on('CREATE_GAME', cb => {
        if(clients.hasOwnProperty(socket.id)) {
            const gameId = uuid();
            const passCode = [...Array(2)].map(i => Math.random().toString(36).substring(2, 8)).join('');
            games[gameId] = new Poker(gameId, clients[socket.id], new Deck);
            passCodes[passCode] = gameId;
            socket.join(gameId, () => {
                clients[socket.id].isHost = true;
                socket.gameID = gameId;
                socket.passCode = passCode;
                broadcastToPlayers(gameId);
            });
            return cb(passCode, true);
        }
        return cb(null, false);
    });

    socket.on('PLAYER_JOINED_GAME', (code, cb) => {
        if(
            clients.hasOwnProperty(socket.id) && 
            passCodes.hasOwnProperty(code) &&
            games.hasOwnProperty(passCodes[code])
        ) {
            const gameId = passCodes[code];
            const game = games[gameId];
            game.addPlayer(clients[socket.id]);
            socket.join(gameId, () => {
                socket.gameID = gameId;
                socket.passCode = code;
                broadcastToPlayers(gameId);
            });
            return cb(true);
        }
        return cb(false);
    });



    /* 
        This socket event is called when the host is ready to start the game, 
        and this will direct the players to the game's layout and its process begins running.
    */
    socket.on('BEGIN_GAME', gameId => {
        games[gameId].startGame();
        broadcastToPlayers(gameId);
    });

    /* 
        This socket event is called when a player leaves the game and the opponent player 
        will be redirected back to the waiting room. The player that leaves the game will 
        also be signed out and is redirected to the main menu. If both players leave the game, 
        the game object is deleted.
    */
   
    socket.on('LEAVE_GAME', gameId => {
        if(games.hasOwnProperty(gameId)) {
            const game = games[gameId];
            game.removePlayer(clients[socket.id]);

            if(game.players.length === 1) {
                game.backToLobby();
                socket.to(gameId).emit('DISPATCH_SERVER_STATE', {player: game.players[0], game:games[gameId]});
            } else {
                delete games[gameId];
                delete passCodes[socket.passCode];
            }
            socket.leave(gameId, () => {
                socket.gameId = null;
                socket.passCode = null;
            });
            socket.emit('DISPATCH_SERVER_STATE', {player: null, game: null});
        } else {
            socket.emit('DISPATCH_SERVER_STATE', {player: null, game: null});
        }
    });

    //-----------------------------------------------------------------------------------//
    /*
        The socket events that start with "PLAYER_" are all player interaction events.
        Each event performs the player's action and will then check the game's process
        for its next process or it will give the other player their turn to play.
    */

    socket.on('PLAYER_BET', async ({gameId, betAmount}) => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)){
            const game = games[gameId];
            if(await game.playerBet(game.currentTurn, betAmount, () => broadcastToPlayers(gameId))){
                checkGameProcess(gameId);
            }
        }
    });

    socket.on('PLAYER_CHECK', async gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            if(await games[gameId].playerCheck(games[gameId].currentTurn, () => broadcastToPlayers(gameId))) {
                checkGameProcess(gameId);
            }
        }
    });

    socket.on('PLAYER_ALL_IN', async gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            if(await games[gameId].playerAllIn(games[gameId].currentTurn, () => broadcastToPlayers(gameId))){
                checkGameProcess(gameId);
            }
        }
    });

    socket.on('PLAYER_CALL', async gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            if(await games[gameId].playerCall(games[gameId].currentTurn, () => broadcastToPlayers(gameId))) {
                checkGameProcess(gameId);
            }
        }
    });

    socket.on('PLAYER_FOLD', async gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            if(await games[gameId].playerFold(games[gameId].currentTurn, () => broadcastToPlayers(gameId))) {
                checkGameProcess(gameId);
            }
        }
    });

    socket.on('PLAYER_DISCARDS', async ({gameId, handIndexes}) => {
        if(games.hasOwnProperty(gameId)) {
            if(games[gameId].playerDiscards(games[gameId].currentTurn, handIndexes, () => broadcastToPlayers(gameId))) {
                checkGameProcess(gameId);
            }
        }
    });

    //-------------------------------------------------------------------------------//

    /*
        The function is called when a player performed an action that triggers a socket event.
        This function call will call the game object's method to process the gameplay.
    */
    async function checkGameProcess(gameId) {
        if(games.hasOwnProperty(gameId)) {

            const game = games[gameId];
            if(game.players.filter(player => player.action !== 'FOLD').length === 2) {
                return await game.processing((hideOpponentCards = true) => broadcastToPlayers(gameId, hideOpponentCards));
            } 
            
            game.emptyBetsToPot();
            game.process = 'SHOWDOWN';
            return await game.processing(() => broadcastToPlayers(gameId));
        }
    }

    /* 
        This function is called for every game event to update the 
        client-side by having SocketIO emit to the client.
    */
    function broadcastToPlayers(gameId, hideOpponentCards = true) {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            const opponent = games[gameId].players.find(player => player.id !== socket.id);
            socket.emit('DISPATCH_SERVER_STATE', {player: clients[socket.id], game: games[gameId], hideOpponentCards});
            socket.to(gameId).emit('DISPATCH_SERVER_STATE', {player: opponent, game: games[gameId], hideOpponentCards});
        }
    }

    /* 
        Just like the socket event of "LEAVE_GAME", the player leaves the game by 
        refreshing or closing the webpage and thus redirects the other player to the 
        waiting room. This event will delete the player from the object list of players. 
        If the game has no players, this event will delete the game from the object 
        list of games.
    */
    socket.on('disconnect', () => {
        if(clients.hasOwnProperty(socket.id)) {
            const client = clients[socket.id];
            if(games.hasOwnProperty(client.gameId)) {
                const game = games[client.gameId]
                game.removePlayer(client);

                if(game.players.length === 0) {
                    delete games[client.gameId];
                    delete passCodes[socket.passCode];
                } else {
                    game.backToLobby();
                    socket.to(client.gameId).emit('DISPATCH_SERVER_STATE', {player: game.players[0], game:games[client.gameId]});
                }
            }
            delete clients[socket.id];
        }
    });
});

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));