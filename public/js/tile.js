/**
 * Created by Work on 7/11/2014.
 */
function Piece( game, owner, local_player, x, y, key, frame ) {

    if( key === undefined )
        Phaser.Sprite.call( this, game, x, y, "faces",
            Face.meh );
    else if( frame === undefined )
        Phaser.Sprite.call( this, game, x, y, key );
    else
        Phaser.Sprite.call( this, game, x, y, key, frame );

    this.id = 0;
    this.owner = owner;
    this.name = "Piece" + String( this.owner );
    this.prev_position = new Phaser.Point();
    this.hard_position = new Phaser.Point();
    this.original_postion = new Phaser.Point( x, y );

    this.owner_is_local_player = local_player === undefined ?
        false : local_player;
    this.prev_face = 0;
    this.visible = true;
    this.inplay = false;

    this.setFace( Face.meh );
    this.anchor.setTo( 0.5 );

    //this line adds the sprite to the game, crucial
    game.add.existing( this );

}

Piece.prototype = Object.create( Phaser.Sprite.prototype );
Piece.prototype.constructor = Piece;

Piece.prototype.moveTo = function( position ) {

    this.setFace( Face.grin );
    this.prev_position.copyFrom( this.position );

    Board.pieces_group.bringToTop( this );

    return game.add.tween( this ).to( {
        x: position.x,
        y: position.y }, 1000, Phaser.Easing.Cubic.Out, true );

};

Piece.prototype.scaleTo = function( scale_x, scale_y ) {
    if( scale_x === undefined ) scale_x = 1;
    if( scale_y === undefined ) scale_y = scale_x;

    this.setFace( Face.grin );
    Board.pieces_group.bringToTop( this );

    return game.add.tween( this.scale ).to( {
        x: scale_x,
        y: scale_y  }, 1000, Phaser.Easing.Cubic.Out, true );

};

Piece.prototype.setFace = function( face ) {

    if( face < Face.neutral_faces ) {

        if( this.owner == STATE_PLAYER2 && ( face % 2 ) == 0 ) {

            face += 1;

        }

    }

    this.prev_face = this.frame;
    this.loadTexture( "faces", face );

};

Piece.prototype.setOwner = function( owner, is_local_player ) {
    if( is_local_player === undefined )
        is_local_player = false;

    this.state = owner;
    this.visible = ( owner == STATE_PLAYER1|| owner == STATE_PLAYER2 );
    this.owner_is_local_player = is_local_player;

    if( is_local_player ) this.toggleInput( true );

    if( owner == STATE_PLAYER1 ) {

        this.setFace( is_local_player ? Face.smile :
            Face.frawn );

    } else if( owner == STATE_PLAYER2 ) {

        this.setFace( is_local_player ? Face.smile :
            Face.frawn );

    } else {

        this.setFace( Face.meh );

    }

};

//NOTE: sprites do have a reset function, this is an overwrite
Piece.prototype.reset = function() {

    this.prev_position.setTo( 0 );
    this.hard_position.setTo( 0 );
    this.inplay = false;

    this.moveTo( { x: this.original_postion.x,
                   y: this.original_postion.y } );
    var twn = this.scaleTo( 0.3 );

    twn.onComplete.add( function() {
        this.setFace( Face.meh ); }, this );

    this.toggleInput( false );

};

Piece.prototype.toggleDrag = function( enable ) {

    if( enable === undefined )
        enable = !this.input.draggable;

    if( enable ) {

        if( !this.inputEnabled ) this.toggleInput( true );

        this.input.enableDrag( false, true,
            true, 255, null, Board.board );

        //http://docs.phaser.io/Phaser.InputHandler.html#enableSnap
        //width, height of snap, snap when drag
        //snap when released, offsets x, y
        this.input.enableSnap( 202.5, 202.5,
            false, true, 200, 35 ); //10,35

        //TODO: tile drag event handlers move over from main.js
        this.events.onDragStart.add(
            onDragStart );
        this.events.onDragStop.add(
            onDragStop );

        //disable on click
        this.events.onInputDown.active = true;
        this.events.onInputUp.active = true;

    } else {

        this.input.disableDrag();

    }

};

Piece.prototype.toggleInput = function( enable ) {

    if( enable === undefined )
        enable = !this.inputEnabled;

    if( enable ) {

        this.inputEnabled = true;
        this.events.onInputDown.add( onMouseDown );
        this.events.onInputUp.add( onMouseUp );
        this.events.onInputOver.add( this.onMouseOver );
        this.events.onInputOut.add( this.onMouseOut );

        //disable on click
        this.events.onInputDown.active = false;
        this.events.onInputUp.active = false;

    } else {

        this.inputEnabled = false;

    }

};

Piece.prototype.setTurn = function( turn_start ) {

    if( turn_start ) {

        this.setFace( this.prev_face );

    } else {

        this.setFace( Face.asleep );

    }

    if( this.owner_is_local_player )
        this.toggleInput( turn_start );

};

/** event handlers **/
Piece.prototype.onMouseDown = function( sprite, pointer ) {

};

Piece.prototype.onMouseUp = function( sprite, pointer ) {

};

Piece.prototype.onMouseOver = function( sprite, pointer ) {
    if( !sprite.inputEnabled ) return false;
    if( sprite.state != Board.current_player.id )
        return false;

    if( sprite.owner_is_local_player ) {

        sprite.setFace( Face.grin );

    } else {

        sprite.setFace( Face.angry );

    }

};

Piece.prototype.onMouseOut = function( sprite, pointer ) {
    if( !sprite.inputEnabled ) return false;
    if( sprite.state != Board.current_player.id )
        return false;

    if( sprite.owner_is_local_player ) {

        sprite.setFace( Face.frawn );
        setTimeout( function(){ sprite.setFace( Face.smile ); }, 250 );

    } else {

        sprite.setFace( sprite.prev_face );

    }

};

Piece.prototype.onDragStart = function( sprite, pointer ) {

};

Piece.prototype.onDragStop = function( sprite, pointer ) {

};

var Face = {
    meh: 0,
    smile: 2,
    frawn: 4,
    grin: 6,
    dejected: 8,
    awesome: 10,
    cry: 12,
    angry: 14,
    asleep: 16,

    neutral_faces: 18
};
