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

const PORT = process.env.PORT || 3000;


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(DIST_DIR));

    app.get('*', (req,res) => {
        res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
    });
}

io.on('connection', socket => {

    /* 
        Once the client has submitted a display name, the socket event is called and it will either create
        a new game or allow them to join into a game that has been created by another client. After the
        event has been called, the client is redirected to a waiting room (lobby).
    */
    socket.on('PLAYER_JOINED_IN', name => {
        const gameId = Object.keys(games).find(key => games[key].players.length < 2) || uuid();

        clients[socket.id] = new Player(socket.id, name, gameId, false);
        socket.gameID = gameId;

        if(!games.hasOwnProperty(gameId)) {
            games[gameId] = new Poker(gameId, clients[socket.id], new Deck);
            clients[socket.id].isHost = true;
        } else {
            games[gameId].addPlayer(clients[socket.id]);
        }

        socket.join(gameId, () => {
            broadcastToPlayers(gameId);
        });
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
            }
            socket.leave(gameId);
            socket.emit('DISPATCH_SERVER_STATE', {player: null, game: null});
        }
    });

    //-----------------------------------------------------------------------------------//
    /*
        The socket events that start with "PLAYER_" are all player interaction events.
        Each event performs the player's action and will then check the game's process
        for its next process or it will give the other player their turn to play.
    */

    socket.on('PLAYER_BET', ({gameId, betAmount}) => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)){
            const game = games[gameId];
            game.playerBet(game.currentTurn, betAmount);

            checkGameProcess(gameId);
        }
    });

    socket.on('PLAYER_CHECK', gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            games[gameId].playerCheck(games[gameId].currentTurn);
            checkGameProcess(gameId);
        }
    });

    socket.on('PLAYER_ALL_IN', gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            games[gameId].playerAllIn(games[gameId].currentTurn);
            checkGameProcess(gameId);
        }
    });

    socket.on('PLAYER_CALL', gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            games[gameId].playerCall(games[gameId].currentTurn);
            checkGameProcess(gameId);
        }
    });

    socket.on('PLAYER_FOLD', gameId => {
        if(clients.hasOwnProperty(socket.id) && games.hasOwnProperty(gameId)) {
            games[gameId].playerFold(games[gameId].currentTurn);
            checkGameProcess(gameId);
        }
    });

    socket.on('PLAYER_DISCARDS', ({gameId, handIndexes}) => {
        if(games.hasOwnProperty(gameId)) {
            games[gameId].playerDiscards(games[gameId].currentTurn, handIndexes);
            checkGameProcess(gameId);
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