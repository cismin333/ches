var socket, 
	debug = true,
	url = "http://.herokuapp.com/";

function socketInit() {
	if(debug) {
		socket = io.connect("http://localhost", 
			{port: 8080, transports: ["websocket"]});
	} else {
		socket = io.connect(url, 
					{transports: ["websocket"]});
	}

	setEventHandlers();
}

var setEventHandlers = function() {
	
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("start_game", onStartGame);
	socket.on("join_game", onPlayerJoin);
	socket.on("player_move", onPlayerMove);
	socket.on("remove_player", onRemovePlayer);
    socket.on( "nudge", onNudge );

    //this is only for tests u can find it tests.js
    socket.on( "get_games", onGetGames );

};

function onNudge() {

    Board.nudge_count++;

    if( Board.nudge_count == 3 )

        gameQuit();

    else {

        $("#nudges").text(3 - Board.nudge_count);
        $("#nudgeMenu").toggleClass("invis");

    }

}

function onSocketConnected() {
    console.log("Connected to socket server");
	sendMsg( "player_join", {} );
}

function onPlayerMove(data) {
	console.log( "player moved" );

	var tile = Board.remote_player.pieces[ data.tile_id ];

	if( Board.state == MOVE_STATE ) {

		tile.hard_position.copyFrom( data.tile_position );
        tile.moveTo( data.tile_position );

        getTileByPosition( tile.prev_position ).occupied = false;

	} else {

        Board.remote_player.setPiece( data.tile_position );

	}

    getTileByPosition( data.tile_position ).occupied = true;
    Board.checkForWinner();

}

function onStartGame() {
	console.log( "starting game" );

    setTimeout(
        function() {
            Menu.toggleMenu( Menu.alert, false );
        } ,
        3000 );

    HTML_MENU.toggleMenu( HTML_MENU.bottom_menu );

	Board.play = true;
    UI.btn_quit.input.enabled = true;
    UI.player_label.visible = true;
    UI.tile_highlights[0].visible = true;

	Board.changePlayer();

    UI.tweenGameLabel( "Start!", true );

}

function onSocketDisconnect() {
    console.log("Disconnected from socket server");  
}

function onPlayerJoin(data) {
    console.log("New player joined:", data.player_id);

	var icon;

    if( data.player_id == 1 )
    	icon = Scoreboard.p1_icon;
    else
    	icon = Scoreboard.p2_icon;

	var player = new Player( data.player_id, true,
		data.is_host, icon );
	player.game_id = data.game_id;

	if( data.player_id == 1 ) {

		Board.players[0] = player;

		Board.players[1] = new Player( 2, false, false,
			Scoreboard.p2_icon );
		Board.remote_player = Board.players[1];

        UI.player_label.x = 260;
        UI.player_label.setStyle( { fill: "#ffff00" } )

	} else {

		Board.players[0] = new Player( 1, false, true,
			Scoreboard.p1_icon );
		Board.remote_player = Board.players[0];

		Board.players[1] = player;

        UI.player_label.x = 540;
        UI.player_label.setStyle( { fill: "#ff0000" } )

	}

	Board.local_player = player;

    //create player pieces
    Board.local_player.createPieces( game );
    Board.remote_player.createPieces( game );

	Board.game_id = data.game_id;

}

function onRemovePlayer(data) {
	console.log( "removing player " + data.player_id );

    Board.declareWinner( Board.local_player );
	Board.play = false;
    setTimeout( Board.reset, 3500 );

	console.log(
        "Player Disconnected w8ing for new player" );
}

function sendMsg( msg, data ) {

    if( data === undefined )
        data = {};

    if( data.player_id === undefined && Board.local_player !== null )
        data.player_id = Board.local_player.id;

    if( data.game_id === undefined && Board.game_id !== null )
        data.game_id = Board.game_id;


	socket.emit( msg, data );
}

function sendPlayerMove( tile ) {
	if( Board.current_player.id != Board.local_player.id ) 
		return false;

	sendMove( tile );
}

function sendMove( tile ) {

	socket.emit( "player_move", {

		player_id: Board.local_player.id, 
		game_id: Board.game_id, 
		tile_id: tile.id,
		tile_position: tile.position

	} );

}
