/**
 * Created by Work on 7/18/2014.
 */

//http://docs.phaser.io/Phaser.Button.html
function Button( name, game, x, y, key, callback, callbackContext,
                 overFrame, outFrame, downFrame, upFrame ) {

    Phaser.Button.call( this, game, x, y, key,
        callback, //event handler onInputUp
        callbackContext, //event context
        overFrame, //sprite frame onInputOver
        outFrame, //sprite frame onInputOut
        downFrame, //frame onInputOut
        upFrame ); //frame onInputUp

    this.name = name || "btn";
    this.text = null;
    this.text_offset = null;
    this.anchor.setTo( 0.5, 0.5 );

    game.add.existing( this );

}

Button.prototype = Object.create( Phaser.Button.prototype );

Button.prototype.setText = function( text, style, offset ) {

    this.text = game.add.text( this.x, this.y, text, style );
    this.text.scale.copyFrom( this.scale );
    this.text.anchor.copyFrom( this.anchor );
    this.text_offset = offset || new Phaser.Point( 90, 70 );

    //call the buttons click handler when the text is clicked
    if( this.callback ) {

        this.text.inputEnabled = true;
        this.text.events.onInputUp.add(
            this.events.onInputUp.dispatch
        );

    }

    this.fitText();

};

Button.prototype.fitText = function( offset_x, offset_y ) {
    if( this.text == null ) return false;
    offset_x = offset_x === undefined ? this.text_offset.x : offset_x;
    offset_y = offset_y === undefined ? offset_x : offset_y;

    this.text.scale.setTo( 1 );

    var w_diff = this.width - this.text.width,
        h_diff = this.height - this.text.height;

    //update offset to scale of button
    offset_x *= this.scale.x;
    offset_y *= this.scale.y;

    if( w_diff != offset_x ) {

        this.text.scale.x = ( this.width - offset_x )
            / this.text.width;

    }

    if( h_diff != offset_y ) {

        this.text.scale.y = ( this.height - offset_y )
            / this.text.height;

    }

};

Button.prototype.update = function() {
    //this.fitText();
};

var LabelButton = function(game, x, y, key, label, callback,
                       callbackContext, overFrame, outFrame, downFrame, upFrame)
{
    Phaser.Button.call(this, game, x, y, key, callback,
        callbackContext, overFrame, outFrame, downFrame, upFrame);

    //Style how you wish...
    this.style = {
        'font': '120px Arial',
        'fill': 'black'
    };
    this.anchor.setTo( 0.5, 0.5 );
    this.label = new Phaser.Text(game, 0, 0, label, this.style);
    this.label.anchor.setTo( 0.5, 0.5 );

    this.addChild(this.label);
    this.setLabel( label );

    game.add.existing( this );
};

LabelButton.prototype = Object.create(Phaser.Button.prototype);
LabelButton.prototype.constructor = LabelButton;

LabelButton.prototype.setLabel = function( label ) {
    this.label.setText(label);

};
