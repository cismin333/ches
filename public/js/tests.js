function testNeighbors() {

    for( var n=0; n < 9; n++ ) {
        var tile = Board.tile_group.children[n];

        console.log( "tile", tile.name );

        console.log( "neighbors d array:" );
        for( var m=0; m < 4; m++ )
            if( tile.neighbors_d[m] >= 0 && tile.neighbors_d[m] <= 8 )
                console.log( tile.neighbors_d[m] );

        console.log( "neighbors s array:" );
        for( m=0; m < 4; m++ )
            if( tile.neighbors_s[m] >= 0 && tile.neighbors_s[m] <= 8 )
                console.log( tile.neighbors_s[m] );
    }

}

var labelbtn;
function testLabel() {
    labelbtn = new LabelButton( game, 300, 330,
        "btn_wooden",
        "button",
        function(){ alert( "btn pressed" ); } ,
        this,
        1, 0, 1, 0 );

}

var test_btn;
function testButton() {
    test_btn = new Button( "", game, 300, 330,
        "btn_wooden",
        function(){ alert( "btn pressed" ); } ,
        this,
        1, 0, 1, 0  );

    test_btn.setText( "button",
        { font: "65px Arial",
            fill: "#000000",
            align: "center" } );

    //test_btn.scale.setTo( 0.3, 0.2 );
}

function testMenu( msg, title, display ) {
    Menu.createMenu( "Some Title",
        "A really long message, is this?",
        true );
}

function onGetGames( data ) {

    if( data.empty_games == undefined )
        console.log( "empty_games array is empty");

    if( data.full_games == undefined )
        console.log( "full_games array is empty");

    data.empty_games.forEach( function( game ) {

        console.log( "ID:", game.id );
        console.log( "Is Full:", game.full );

    } );

    data.full_games.forEach( function( game ) {

        console.log( "ID:", game.id );
        console.log( "Is Full:", game.full );
        console.log( "P1:", game.player1.client_id );
        console.log( "P2:", game.player2.client_id );

    } );

}

function getPositionOfAllTiles() {
	
	Board.tiles.forEach( function( t ) { 

		console.log( t.name, "x", t.x, "y",t.y );

	} );

}

function testBoardClick() { 

	Board.play = true;
	Board.current_player = Board.local_player;

}

function testDragStop() {

	Board.local_player.addTile( Board.tiles[6] );
	Board.local_player.addTile( Board.tiles[8] );

	Board.remote_player.addTile( Board.tiles[3] );
	Board.remote_player.addTile( Board.tiles[5] );
	Board.remote_player.addTile( Board.tiles[7] );

	testDrag();
}

function testDrag() {
	Board.play = true;

	Board.local_player.addTile( Board.tiles[4] );

	Board.open_tiles.length = 3;

	Board.changeState();

}

function printTilesCord() {

	Board.tiles.forEach( function( tile ) { 

		console.log( "tile id: " + tile.id + 
			"( " + tile.x + " , " + tile.y + " )" );

	} );

}
