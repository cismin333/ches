var DEBUG = false;

var http = require('http'),
	express = require('express'),
    util = require("util"),
    io = require("socket.io"),
	app = express(), 
	port = DEBUG ? 8080 : process.env.PORT,
    socket,
    players,
    empty_games,
    full_games;

/**
 * Creates a new Player.
 * @class Player
 * @param client_id (String)
 * @param game_id (String)
 * @param in_game_id (Int)
 * @param client (Object)
 * @constructor
 */
function Player( client_id, game_id, in_game_id, client ) {

    /** The socket.io id of this player. */
    this.client_id = client_id;

    /** The id of the game this player is in. */
	this.game_id = game_id;

    /** The in game id of the player, either 1 or 2. */
	this.in_game_id = in_game_id || 1;
    this.client = client;
	this.tiles = [];
}

function Game( player1 ) {
	this.id = player1.client_id;
	this.player1 = player1;
	this.player2 = null;
	this.tiles = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	this.current_player = player1.game_id;
    this.full = false;
}

app.use( express.static(__dirname + '/public') );

var server = http.createServer(app);

server.listen(port);

console.log('http server listening on %d', port);

function init() {
    players = [];
   	empty_games = [];
    full_games = [];
	socket = io.listen( server );
	socket.configure(function() {
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2);
	});
	
	setEventHandlers();
}

var setEventHandlers = function() {
    socket.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: " 
        + client.id);

    client.on( "disconnect", onClientDisconnect );
    client.on( "player_join", onPlayerJoin );
    client.on( "player_move", onMovePlayer );
    client.on( "get_games", onGetGames );
    client.on( "nudge", onNudge );
    client.on( "quit", onQuit );

}

function onQuit( data ) {
    util.log( "onQuit", "player", data.player_id, "quit" );

    var game_index = getGameIndex( full_games, this.id );

    if( game_index === false ) {
        util.log( "onQuit", "game not found" );
        return false;
    }

    leaveFullGame( game_index, data.player_id );

}

function onMovePlayer(data) {
	util.log( data.player_id + " is moving piece "
        + data.tile_id );

	var game = inArray( full_games, data.game_id ),
        other_player;

	if( !game ) {
		util.log( "onPlayerMove: " + data.game_id
            + " not in full_games" );
		return false;
	}

    if( !game.full ) {
        util.log( "onPlayerMove: game is not full" );
        return false;
    }

    if( game.player1 == null ) {
        util.log( "onPlayerMove: player1 is null" );
        return false;
    } 

    if( game.player2 == null ) {
        util.log( "onPlayerMove: player2 is null" );
        return false;
    }

	if( data.player_id == game.player1.in_game_id )
		other_player = game.player2;
	else
		other_player = game.player1;
    
    other_player.client.emit( "player_move",  data );
}

function onNudge( data ) {
    util.log( data.player_id + " is nudging a player!" );

    var game = inArray( full_games, data.game_id ),
        other_player;

    if( !game ) {
        util.log( "onNudge: " + data.game_id
            + " not in empty_games" );
        return false;
    }

    if( data.player_id == game.player1.in_game_id )
        other_player = game.player2;
    else
        other_player = game.player1;

    other_player.client.emit( "nudge" );

}

function onPlayerJoin(data) {
    util.log("Player has joined: ", this.id );

    var game_id,
        player_id,
       // is_host = false,
        new_player,
        game,
        game_index;

    //create a game if no games exist
    if( empty_games.length == 0 ) {
        
        game_id = this.id;
        player_id = 1;
        //is_host = true;
 
        new_player = new Player( this.id, game_id, 
            player_id, this );
        game = new Game( new_player );

        util.log("Creating game: " + game.id + 
            " Player1 id: " + 
            game.player1.client_id );

        empty_games.push( game );

    //join a game
    } else {

        //for( var n=0; n < empty_games.length; n++ ) {
            //if( empty_games[n].full ) continue;

        //join the first game in empty games list
        var n = 0;
        game = empty_games[n];
        game_id = game.id;
        game_index = n;

        //TODO: optimize this redundant conditional
        if( game.player2 == null )
            player_id = 2;
        else
            player_id = 1;

            //break;
        //}

        new_player = new Player( this.id, game_id, 
            player_id, this );
        
        if( game.player2 == null )
            game.player2 = new_player;
        else
            game.player1 = new_player;

        game.full = ( game.player2 != null && 
            game.player1 != null );

        util.log( "Player ", this.id, "Joining game: " + game.id );
    }

    players.push( new_player );

    this.emit( "join_game", { game_id: game_id, 
        player_id: player_id } );

    if( game.full ) {

        util.log( "Starting game: " + game.id );

        //let the player who has been in the game longer
        //have the first turn
        game.player1.client.emit( "start_game", 
            { turn: ( game.player1.in_game_id != player_id ) } );

        game.player2.client.emit( "start_game", 
            { turn: ( game.player2.in_game_id != player_id ) } );

        full_games.push( game );
        empty_games.splice( game_index, 1 );

    }

}

function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    var n = getGameIndex( empty_games, this.id ),
        game;

    if( n === false ) {
        util.log( "game is not in empty_games array" );

        n = getGameIndex( full_games, this.id );

        if( n === false ) {

            util.log("onClientDisconnect" +
                " game not found");
            return false;

        }

        game = full_games[n];
        util.log( "game is in full_games array: "
            + game.id );

    } else
        game = empty_games[n];

    if( !game.full ) {

        empty_games.splice( n, 1 );

        util.log( "deleted game from empty_games: "
            + game.id );
        return false;

    } else {

        var remaining_player;
        if (this.id == game.player2.client_id) {

            game.player2 = null;
            remaining_player = game.player1.client;

        } else {

            game.player1 = null;
            remaining_player = game.player2.client;

        }

        game.full = false;
        empty_games.push( game );
        full_games.splice( n, 1 );

        util.log( "deleted game from full_games" );

        remaining_player.emit("remove_player",
            { player_id: this.id, game_id: game.id });
    }

}

function onGetGames() {
    util.log( "sending game lists" );

//    this.broadcast.emit( "get_games", { empty_games: empty_games,
//        full_games: full_games } );

}

function leaveFullGame( game_index, leaving_player_id ) {
    var game = full_games[ game_index ],
        remaining_player;


    if( leaving_player_id == game.player2.client_id ) {

        game.player2 = null;
        remaining_player = game.player1.client;

    } else {

        game.player1 = null;
        remaining_player = game.player2.client;

    }

    game.full = false;
    empty_games.push( game );
    full_games.splice( game_index, 1 );

    util.log( "deleted game", game.id, "from full_games" );

    remaining_player.emit("remove_player",
        { player_id: this.id, game_id: game.id });
}

function inArray( array, item ) {
    if( array.length < 0 ) {
        util.log( "inArray, array is empty" );
        return false;
    }

	for( var n=0; n < array.length; n++ ) {

		if( item == array[n].id ) return array[n];

	}

	return false;
}

function getGame( array, client_id ) {
    if( array.length < 0 ) {
        util.log( "getGameIndex, array is empty" );
        return false;
    }

    for( var n=0; n < array.length; n++ ) {

        if( array[n].player1 != null )
            if( client_id == array[n].player1.client_id )
                return array[n];

        if( array[n].player2 != null )
            if( client_id == array[n].player2.client_id )
                return array[n];

    }

    return false;
}

function getGameIndex( array, client_id ) {
    if( array.length < 0 ) {
        util.log( "getGameIndex, array is empty" );
        return false;
    }

    for( var n=0; n < array.length; n++ ) {

        if( array[n].player1 != null )
            if( client_id == array[n].player1.client_id )
                return n;

        if( array[n].player2 != null )
            if( client_id == array[n].player2.client_id )
                return n;

    }

    return false;
}

function sendConsoleLog( function_name, msg, send_only_on_debug ) {

    if( send_only_on_debug && !DEBUG ) return false;
    util.log( function_name, msg );

}

init();
