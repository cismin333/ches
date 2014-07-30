
function Player( id, is_local_player, turn, icon ) {
	this.id = id;
    this.is_local_player = is_local_player;
	this.turn = turn || false;
	this.icon = icon || null;
	this.tiles = [];
    this.pieces = [];
    this.pieces_in_play = 0;

	this.wins = 0;
	this.loses = 0;
	this.games = 0;
}

Player.prototype.constructor = Player;
Player.prototype = Object.create( null );

Player.prototype.addTile = function( tile ) {
	if( this.tiles.length == 3 ) return false;
	if( tile.state == this.id ) return false;
	
	this.tiles.push( tile );
	tile.state = this.id;
	changeFace( tile );
};

Player.prototype.createPieces = function( game ) {
    //18.75 = ( Tile.width * 0.3(scale) ) / 2
    var x, y = 455 + 18.75, dx;

    if (this.id == STATE_PLAYER1) {
        x = 206 + 18.75;
        dx = 40;
    } else {
        x = 558 + 18.75;
        dx = -40;
    }

    this.pieces = [
        new Piece( game, this.id, this.is_local_player,
            x, y ),
        new Piece( game, this.id, this.is_local_player,
            x+dx, y ),
        new Piece( game, this.id, this.is_local_player,
            x+dx*2, y )
    ];

    for( var n=0; n < 3; n++  ) {
        var piece = this.pieces[n];

        piece.id = n;
        piece.state = this.id;
        piece.scale.setTo( 0.3 );
        piece.owner_is_local_player =
            ( this.id == Board.local_player.id );

        Board.pieces_group.add(piece);

    }

};

Player.prototype.setPiece = function( position ) {

    for( var n=0; n < 3; n++ ) {
        var piece = this.pieces[n];

        if( !piece.inplay ) {

            piece.moveTo( position );
            var twn = piece.scaleTo( 1 );

            twn.onComplete.add( function() {
                //piece.setFace( Face.smile );
                if( this.is_local_player )
                    piece.prev_face = Face.smile;
                else
                    piece.prev_face = Face.frawn;
//                this.pieces.forEach( function( apiece ) {
//
//                        apiece.setTurn( false );
//
//                } );

            }, this );

            piece.inplay = true;
            piece.hard_position.copyFrom( position );

            Board.pieces_on_board++;

            if( Board.pieces_on_board == 6 )
                Board.changeState( SET_STATE );

            this.pieces_in_play++;

            return piece;

        }

    }

    console.log( "all pieces set for player:", this.id );
    return false;

};

Player.prototype.isWinner = function() {
    if( this.pieces_in_play < 3 ) return false;

	var piece1 = this.pieces[0],
		piece2 = this.pieces[1],
		piece3 = this.pieces[2];

	//alright solution 3, use BETTER MATH, algebra
	var slope1 = findSlope( piece1.hard_position,
							piece2.hard_position ),
		slope2 = findSlope( piece2.hard_position,
							piece3.hard_position );

//    slope1 = slope1 === undefined ? 10000 : slope1;
//    slope2 = slope2 === undefined ? 10000 : slope2;

    //close enough, cause im tired being off by one pixel
//    var diff = ( slope1 - slope2 );
//
//	return ( diff < 0.5 && diff > -0.5 );

    return ( slope1 == slope2 );
};

Player.prototype.reset = function() {

    for( var n=0; n < 3; n++ ) this.pieces[n].reset();

    this.pieces_in_play = 0;

};
