var SET_STATE = 0,
	MOVE_STATE = 1,
	STATE_NEUTRAL = 0, 
	STATE_PLAYER1 = 1,
	STATE_PLAYER2 = 2, 
	SPRITE_W = 125, SPRITE_H = 125,
	STRAIGHT = 0, DIAGONAL = 1;


var Board = {
	//if board is in play
	play: false,
    input_enabled: true,
	width: SPRITE_W * 3.3,
	height: SPRITE_H * 3.3,
	players: [],
	//tile that is being moved
	selected_tile: null,
	state: SET_STATE,
	//player who is moving
	current_player: null,
	//player on this compute
	local_player: null,
	//the facless scourage
	remote_player: null,
	//current players animation circle or cross
	player_animation: "",

	//what kind of movements are allowed, straight only
	//allows horizontal/vertical movements and diagnol
	//allows all movements
	game_mode: DIAGONAL,
    game_id: null,
	board: null,

	//phaser group for holding all tiles, easier collision
	tile_group: null,
    pieces_group: null,
    pieces_on_board: 0,
    //if the player is afk too long than other player can nudge
    //him, if player reaches a certain amount of nudges than he
    //is auto kicked
    nudge_count: 0,
    //the amount of time before player is allowed to nudge afk player
    seconds_to_move: 30000,
    turn_start_time: 0,

    //handles turns, change the current player moving
    changePlayer: function( force_player ) {

        //if we are not forcing a player to end turn
        //than set player to current player
        if( force_player === undefined )
            force_player = Board.current_player;

        if( force_player == Board.players[0]  ){

            Board.current_player = Board.players[1];


        } else {

            Board.current_player = Board.players[0];

        }

        if( Board.current_player.id == Board.remote_player.id ) {

            //start nudge timer
            Board.turn_start_time = Date.now();
            UI.player_label.setText( "Zzz.." );

        //local player's turn disable nudge btn if enabled
        } else if( UI.btn_nudge.input.enabled ) {

            UI.btn_nudge.input.enabled = false;

        }

        if( Board.current_player.id == Board.local_player.id )
            UI.player_label.setText( "Go!" );

        var cid = Board.current_player.id;
        setTimeout( function() {

                Board.pieces_group.children.forEach( function( tile ) {

                    tile.setTurn( tile.owner == cid );

                } );

            },
            1700 );

    },

    //TODO: this depends on game mode
    //checks movement meets game mode rules
    checkRules: function( tile1, tile2 ) {
        var distance = game.physics.arcade.distanceBetween(
                tile1, tile2 ),
            wh = SPRITE_H; // + SPRITE_W;

        if( Board.game_mode == STRAIGHT ) {

            return( distance < wh && distance > 50);

        } else {

            return( distance < ( 200 ) && distance > 50);

        }

    },

    //TODO: the if statement here makes no sense if we pass a state should
    //TODO: the game not go into that state?
    //changes the state of the game to move state
    changeState: function( current_state ) {

        if( current_state == SET_STATE ) {

            UI.tweenGameLabel( "Move your pieces!", true );

            $( game.canvas ).css( "cursor", "move" );
            Board.state = MOVE_STATE;
            Board.board.inputEnabled = false;

            Board.pieces_group.children.forEach( function( tile ) {

                if( tile.state == Board.local_player.id ) {

                    tile.toggleDrag( true );

                }


            } );

        //go to SET_STATE
        } else {

            $( game.canvas ).css( "cursor", "pointer" );
            Board.state = SET_STATE;
            Board.board.inputEnabled = true;

            Board.players[0].reset();
            Board.players[1].reset();

        }

    },

    checkForWinner: function() {

        if( Board.current_player.isWinner() ) {

            Board.declareWinner( Board.current_player );
            setTimeout( Board.reset, 3500 );

        } else {

            Board.changePlayer();
        }

    },

	//creates board, sprites etc.
	create: function() {

		var dx = 140, //SPRITE_W * 1.2,
			dy = 140; //SPRITE_H * 1.2;
		var x = 190,//g.world.centerX - ( Board.width/2 ), 0,
			y = 25;//g.world.centerY - ( Board.height/2 ), 25;

        x += 70;
        y += 70;

		Board.board = game.add.sprite( x, y, "background_checker" );
		Board.board.inputEnabled = true;
		Board.board.events.onInputDown.add( onBoardClick );
        //Board.board.events.onInputOver.add( onBoardOver );
        Board.board.visible = false;

		Board.tile_group = game.add.group();

        var texture;
		for( var n=0; n < 9; n++ ) {

			var mx = x + dx * (n%3),
				my = 0;

			if( n >= 3 ) my = 1;
			if( n >= 6 ) my = 2;

			my = y + dy * my;

            if( n % 2 )
                texture = "tile_black";
            else
                texture = "tile_red";

            var tile = Board.tile_group.create( mx, my, texture );
            tile.name = "tile" + n;
            tile.occupied = false;
            tile.anchor.setTo( 0.5 );
            tile.inputEnabled = true;
            tile.events.onInputDown.add( onBoardClick );
            tile.events.onInputOver.add( onBoardOver );
            //tile.input.enabled = false;

//            tile.neighbors_d = [ n-4, n-2, n+2, n+4 ];
//            tile.neighbors_s = [ n-3, n-1, n+1, n+3 ];
        }

        Board.tile_group.children[0].neighbors_d = [ 4 ];
        Board.tile_group.children[0].neighbors_s = [ 1, 3 ];
        Board.tile_group.children[1].neighbors_d = [ 3, 5 ];
        Board.tile_group.children[1].neighbors_s = [ 0, 2, 4];
        Board.tile_group.children[2].neighbors_d = [ 4 ];
        Board.tile_group.children[2].neighbors_s = [ 1, 5 ];

        Board.tile_group.children[3].neighbors_d = [ 1, 7 ];
        Board.tile_group.children[3].neighbors_s = [ 0, 4, 6 ];
        Board.tile_group.children[4].neighbors_d = [ 0, 2, 6, 8 ];
        Board.tile_group.children[4].neighbors_s = [ 1, 3, 5, 7 ];
        Board.tile_group.children[5].neighbors_d = [ 1, 7 ];
        Board.tile_group.children[5].neighbors_s = [ 2, 4, 8 ];

        Board.tile_group.children[6].neighbors_d = [ 4 ];
        Board.tile_group.children[6].neighbors_s = [ 3, 7 ];
        Board.tile_group.children[7].neighbors_d = [ 3, 5 ];
        Board.tile_group.children[7].neighbors_s = [ 4, 6, 8 ];
        Board.tile_group.children[8].neighbors_d = [ 4 ];
        Board.tile_group.children[8].neighbors_s = [ 5, 7 ];

        Board.pieces_group = game.add.group();

	},

    declareWinner: function( winner ) {
        var loser;

        winner.wins += 1;

        if( winner == Board.players[0] ){

            Board.players[1].loses += 1;
            loser = Board.players[1];

        } else {

            Board.players[0].loses += 1;
            loser = Board.players[0];

        }

        winner.pieces.forEach( function( tile ) {

            tile.toggleInput( false );
            tile.setFace( Face.awesome );

        } );

        loser.pieces.forEach( function( tile ) {

            tile.toggleInput( false );
            tile.setFace( Face.cry );

        } );

        //Scoreboard.update( winner, loser );

        //TODO: set up audio
        if( winner == Board.local_player ) {

            game.audio.cheer.play( "cheer" );
            HTML_MENU.displayMenu( HTML_MENU.bottom_menu, "Victory!",
                "click close to play again" );

        } else {

        	game.audio.jeer.play( "jeer" );
            HTML_MENU.displayMenu( HTML_MENU.bottom_menu, "Defeat!",
                "click close to play again" );

        }

    },

    isLocalPlayerTurn: function() {
        if( !Board.play ) return false;

        if( Board.current_player == null ) return false;

        return( Board.current_player.id
            == Board.local_player.id );
    },

    isOccupiedTile: function( position ) {
        var active_tiles = Board.remote_player.pieces.concat(
            Board.local_player.pieces );

        for( var n = 0; n < active_tiles.length; n++ ) {

            var d = position.distance( active_tiles[n].position );

            if( d < SPRITE_H )
                console.log( "distance to ",
                    active_tiles[n].name, ": ", d );

            if( d < ( 100 ) )
                return true;

        }

        return false;

    },

    toggleInput: function( enable ) {

        if( enable === undefined )
            enable = !Board.input_enabled;

        Board.tile_group.children.forEach( function( child ) {

            child.input.enabled = enable;

        } );

        Board.input_enabled = enable;
    },

    reset: function() {
        console.log( "board reset called" );

        //move all the tiles to open list
        Board.pieces_on_board = 0;
        Board.nudge_count = 0;
        Board.seconds_to_move =  30000;

        //change game state
        Board.changeState();
        //Board.toggleInput( false );

        UI.reset();

        UI.btn_quit.input.enabled = true;

        //reset players
        Board.players[0].reset();
        Board.players[1].reset();
//        Board.current_player =
//            Board.players[1].wins > Board.players[0].wins ?
//                Board.players[0] : Board.players[1];
        Board.changePlayer();

        Board.tile_group.children.forEach( function( tile ) {
            tile.occupied = false;
        } );

    }

};
