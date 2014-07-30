var WIDTH = 660, //$(window).width(),
    HEIGHT = 600; //$(window).height();

var game, Menu, Scoreboard, UI, HTML_MENU;

function startGame() {
    $( "#btnPlay").text( "loading" );

    game = new Phaser.Game( WIDTH, HEIGHT,
        Phaser.AUTO, "6ManChess",
        { preload: gamePreload,
            create: gameCreate,
            update: gameUpdate } );

    Scoreboard = {
        player1: null,
        player2: null,
        turn: null,
        p1_icon: null,
        p2_icon: null,

        create: function( game ) {

            var x = game.world.centerX, y = 460,
                font = "30px Arial", align = "center";

            var player1 = game.add.text(
                364.8, y, "", {
                    font: font, fill: "#ccc", align: align
                });

            var player2 = game.add.text(
                410.2, y, "", {
                    font: font, fill: "#ccc", align: align
                });

            var scale = 0.5,
                p1_icon = new Piece( game, STATE_PLAYER1,
                    false, 250, y ),
                p2_icon = new Piece( game, STATE_PLAYER2,
                    false, 500, y );

            p1_icon.state = 1;
            p1_icon.visible = false;
            p1_icon.scale.setTo( scale );
            p1_icon.setFace( Face.meh );

            p2_icon.state = 2;
            p2_icon.visible = false;
            p2_icon.scale.setTo( scale );
            p2_icon.setFace( Face.meh );

            Scoreboard.player1 = player1;
            Scoreboard.player2 = player2;
            Scoreboard.p1_icon = p1_icon;
            Scoreboard.p2_icon = p2_icon;

        },

        reset: function() {

            Scoreboard.p1_icon.setFace( Face.meh );
            Scoreboard.p2_icon.setFace( Face.meh );

        },

        //updates scoreboard icons based on score
        update: function( winner, loser ) {

            var w_icon = winner.icon, l_icon = loser.icon,
                w_score = winner.wins, l_score = loser.wins,
                w_state, l_state;

            if( w_score == l_score ) {

                w_state = Face.meh;
                l_state = Face.meh;

            } else if( w_score < l_score ) {

                w_state = Face.frawn;
                l_state = Face.smile;

            } else {

                if( (w_score - l_score) > 1) {

                    w_state = Face.grin;
                    l_state = Face.dejected;

                } else {

                    w_state = Face.smile;
                    l_state = Face.frawn;

                }

            }

            w_icon.setFace( Face.awesome );
            l_icon.setFace( Face.cry );

            setTimeout( function() {

                w_icon.setFace( w_state );
                l_icon.setFace( l_state );

            }, 3000 );


        }

    };

    game.audio = {
        cheer: null,
        jeer: null,
        move: null,
        select: null,

        load: function() {

            game.load.audio( "audio_yay",
                "audio/Cheer_GradeSchoolYay.mp3" );
            game.load.audio( "audio_jeer",
                    "audio/Yelling from arena " +
                    "crowd_AOS02556.mp3" );
            // game.load.audio( "move",
            // 	"" );
            // game.load.audio( "select",
            // 	"" );

        },

        create: function( g ) {

            game.audio.cheer = g.add.audio(
                "audio_yay" );
            game.audio.jeer = g.add.audio(
                "audio_jeer" );

            //add markers to play certain parts of audio
            game.audio.cheer.addMarker( "cheer", 0, 5 );
            game.audio.jeer.addMarker( "jeer", 0, 5 );

        },

        play: function( sound ) {

            if( sound == "cheer" ) {

            } else if( sound == "jeer" ) {

            } else if( sound == "move" ) {

            } else if( sound == "select" ) {

            }

        }
    };

    Menu = {
        intro: "#introToast",
        alert: "#alertToast",
        gameOver: "#gameOverToast",
        title: null,
        msg: null,
        background: null,
        close_btn: null,
        yes_btn: null,
        no_btn: null,
        children: null,

        create: function( game ) {

            Menu.children = [];

            //http://docs.phaser.io/Phaser.Button.html
            Menu.background = game.add.sprite( 240, 150,
                "background_menu" );
            Menu.background.anchor.setTo(0.5, 0.5);
            Menu.background.scale.setTo( 0.5 );
            Menu.background.visible = false;

            Menu.title = game.add.text(
                250, 40, "title", {
                    font: "30px Arial",
                    fill: "#000",
                    align: "center"
                });
            Menu.title.anchor.setTo(0.5, 0.5);
            Menu.title.visible = false;

            Menu.msg = game.add.text(
                250, 120, "msg", {
                    font: "20px Arial",
                    fill: "#000",
                    align:"center"
                });
            Menu.msg.anchor.setTo(0.5, 0.5);
            Menu.msg.visible = false;

            Menu.close_btn = game.add.button( 400, 30,
                "btn_close", Menu.onClick, game, 0, 0, 0, 0 );
            Menu.close_btn.anchor.setTo(0.5, 0.5);
            Menu.close_btn.scale.setTo( 0.2 );
            Menu.close_btn.name = "close_btn";
            Menu.close_btn.visible = false;

            //http://docs.phaser.io/Phaser.Button.html
//            Menu.yes_btn = game.add.button( 180, 250,
//                "btns_yes_no", Menu.onClick, game, 0, 0, 0, 0  );
//            Menu.yes_btn.anchor.setTo(0.5, 0.5);
//            Menu.yes_btn.scale.setTo( 0.6, 0.4 );
//            Menu.yes_btn.name = "yes_btn";
//            Menu.yes_btn.visible = false;
//
//            Menu.no_btn = game.add.button( 300, 250,
//                "btns_yes_no", Menu.onClick, game, 1, 1, 1, 1  );
//            Menu.no_btn.anchor.setTo(0.5, 0.5);
//            Menu.no_btn.scale.setTo( 0.6, 0.4 );
//            Menu.no_btn.name = "no_btn";
//            Menu.no_btn.visible = false;

            Menu.children.push( Menu.background,
                Menu.title,
                Menu.msg,
                Menu.close_btn );

            //centers menu in game world
            Menu.children.forEach( function( child ) {

                child.x += 160;
                child.y += 80;

//                child.in_tween = game.add.tween( child ).from(
//                    { y: -500 }, //move from y=-500 to current pos
//                    2000, //duration
//                    Phaser.Easing.Bounce.Out, //easing function
//                    false //auto start
//                );
                child.in_tween = game.add.tween( child ).to(
                    { alpha: 1 },
                    1500,
                    Phaser.Easing.Quadratic.InOut,
                    false
                );

                child.in_tween.onStart.add(function () {
                    //child.alpha = 1;
                    child.visible = true;
                });

                child.out_tween = game.add.tween( child ).to(
                    { alpha: 0 },
                    1500,
                    Phaser.Easing.Quadratic.InOut,
                    false
                );

                child.out_tween.onComplete.add(function () {
                    child.visible = false;
                });

            } );

            //Menu.togglePhaserMenu( false );

        },

        createMenu: function( title, msg, display ) {

            title = title || "";
            msg = msg || "";
            display = display === undefined ? true : display;

            Menu.title.setText( title );
            Menu.msg.setText( msg );

            if( display ) Menu.togglePhaserMenu( display );

        },

        displayAlert: function( title, msg ) {

            if( !Menu.background.visible ) {

                Menu.createMenu( title, msg, true );

            }

        },

        onClick: function( btn ) {

            if( btn.name == Menu.close_btn.name ) {

                Menu.togglePhaserMenu( false );
                console.log( "close" );

            } else if( btn.name == Menu.yes_btn.name ) {

                //Menu.togglePhaserMenu( false );
                console.log( "dah" );

            } else if( btn.name == Menu.no_btn.name ) {

                //Menu.togglePhaserMenu( false );
                console.log( "neit" );

            }

        },

        toggleMenu: function( menu, force_display ) {

            if( force_display !== undefined )
                $( menu ).toggleClass( "invis",
                    !force_display  );
            else
                $( menu ).toggleClass( "invis" );

        },

        //TODO: adds tweens on menu create and than play them here
        togglePhaserMenu: function( display ) {

            if( display === undefined )
               display = !Menu.background.visible;

            Menu.children.forEach( function( child ) {

                if (display) {

                    child.in_tween.start();

                } else {

                    child.out_tween.start();

                }

            } );
        }

    };

    UI = {
        btn_nudge: null,
        btn_option: null,
        btn_quit: null,
        btn_play: null,
        btn_help: null,
        btn_hide: null,
        btn_show: null,
        group: null,
        hidden: false,
        panel: null,
        tile_highlights: [],
        player_label: null,
        game_label: null,

        create: function( game ) {
            //476
            UI.panel = game.add.sprite( 164, 455, "ui_panel" );

            UI.btn_nudge = new LabelButton( game, 402, 480,
                "btn_wooden",
                "nudge",
                UI.onNudge, this,
                1, 0, 1, 0 );
            UI.btn_nudge.scale.setTo( 0.3, 0.2 );
            UI.btn_nudge.label.fontSize = 120;

            UI.btn_option = new LabelButton( game, 402, 520,
                "btn_wooden",
                "options",
                UI.onOption, this,
                1, 0, 1, 0 );
            UI.btn_option.scale.setTo( 0.3, 0.2 );
            UI.btn_option.label.fontSize = 110;

            UI.btn_quit = new LabelButton( game, 402, 560,
                "btn_wooden",
                "quit",
                UI.onQuit, this,
                1, 0, 1, 0 );
            UI.btn_quit.scale.setTo( 0.3, 0.2 );
            UI.btn_quit.label.fontSize = 120;

            //30x50
            UI.btn_help = game.add.button( 185, 475, "wooden_qmark",
            UI.onHelp, this, 1, 0, 1, 0 );
            UI.btn_help.anchor.setTo( 0.5 );

            //27x32
            UI.btn_hide = game.add.button( 618, 475, "hide_arrow",
                UI.onHide, this, 1, 0, 1, 0 );
            UI.btn_hide.anchor.setTo( 0.5 );

            UI.btn_show = game.add.button( 618, 475, "show_arrow",
                UI.onShow, this, 1, 0, 1, 0 );
            UI.btn_show.anchor.setTo( 0.5 );
            UI.btn_show.visible = false;

            UI.player_label = game.add.text( 364.8, 520, "Waiting..", {
                font: "30px Arial", fill: "#ccc", align: "center"
            } );
            UI.player_label.visible = false;
            UI.player_label.anchor.setTo( 0.5 );

            UI.group = game.add.group();
            UI.group.add( UI.panel );
            UI.group.add( UI.btn_help );
            UI.group.add( UI.btn_hide );
            UI.group.add( UI.btn_nudge );
            UI.group.add( UI.btn_option );
            UI.group.add( UI.btn_quit );
//            UI.group.add( Scoreboard.p1_icon );
//            UI.group.add( Scoreboard.p2_icon );
//            UI.group.add( Scoreboard.player1 );
//            UI.group.add( Scoreboard.player2 );
            UI.group.add( UI.player_label );
//            UI.group.add( th1 );
//            UI.group.add( th2 );
//            UI.group.add( th3 );

            UI.btn_nudge.input.enabled = false;
            UI.btn_quit.input.enabled = false;

        },

        tweenGameLabel: function( text, tween_in ) {

            if( tween_in ) {

                UI.game_label.setText( text );
                game.add.tween( UI.game_label ).to( { alpha: 1 },
                    3500, Phaser.Easing.Cubic.In, true).onComplete.add(
                       function() {
                           UI.tweenGameLabel(text, false);
                       }
                    );

            } else {

                UI.game_label.setText( text );
                game.add.tween( UI.game_label ).to( { alpha: 0 },
                    2500, Phaser.Easing.Cubic.Out, true );

            }

        },

        onNudge: function() {
            console.log( "nudge btn pressed" );

            sendMsg( "nudge", { game_id: Board.local_player.game_id,
                player_id: Board.local_player.id } );

            UI.btn_nudge.input.enabled = false;
            Board.turn_start_time = Date.now();
            Board.seconds_to_move -= 5000;
        },

        onOption: function() {
            console.log( "option btn pressed" );

            $( "#optionMenu" ).toggleClass( "invis" );
        },

        //quit game to splash screen
        onQuit: function() {
            console.log( "quit btn pressed" );

            //put in timeout to allow btn event to complete before
            //game is destroyed
            //setTimeout( gameQuit, 500 );
            Board.declareWinner( Board.remote_player );
            Board.play = false;
            setTimeout( Board.reset, 3500 );

            sendMsg( "quit" );
        },

        onHelp: function() {
            console.log( "help btn pressed" );

            $( "#helpMenu" ).toggleClass( "invis" );
        },

        onHide: function() {
            console.log( "hide btn pressed" );
            if( UI.hidden ) return false;

            game.add.tween( UI.group ).to(
                { y: 600 }, 3000, Phaser.Easing.Linear.Out, true)
                .onComplete.add(

                function() {
                    UI.btn_show.visible = true;
                    UI.btn_show.input.enabled = true;
                    UI.btn_hide.input.enabled = false;
                    UI.hidden = true;
                }

            );
//            UI.tile_highlights[0].visible = false;
//            UI.tile_highlights[1].visible = false;
//            UI.tile_highlights[2].visible = false;

        },

        onShow: function() {
            console.log( "show btn pressed" );
            if( !UI.hidden ) return false;

            game.add.tween( UI.group ).to(
                { y: 0 }, 1500, Phaser.Easing.Linear.Out, true)
                .onComplete.add(

                    function() {
                        UI.btn_show.visible = false;
                        UI.btn_show.input.enabled = false;
                        UI.btn_hide.input.enabled = true;
                        UI.hidden = false;
                    }

            );

//            if( Board.state == MOVE_STATE ) {
//
//                UI.tile_highlights[0].visible = true;
//                UI.tile_highlights[1].visible = true;
//                UI.tile_highlights[2].visible = true;
//
//            } else {
//
//                UI.tile_highlights[0].visible = false;
//                UI.tile_highlights[1].visible = false;
//                UI.tile_highlights[2].visible = false;
//
//            }

        },

        reset: function() {

            UI.btn_nudge.input.enabled = false;
            UI.btn_quit.input.enabled = false;

            UI.tile_highlights[0].visible = false;
            UI.tile_highlights[1].visible = false;
            UI.tile_highlights[2].visible = false;

            if( UI.hidden ) {

                UI.onShow();

            }

        }
    };

    HTML_MENU = {
        title: ".title",
        body: ".body",
        img: ".smiley",
        close_btn: ".close-btn",
        bottom_menu: "#bottomMenu",

        displayMenu: function( menu, title, msg, img, disable_close_btn ) {

            title = title || "";
            msg = msg || "";
            if( disable_close_btn === undefined )
                disable_close_btn = false;

            $( menu ).find( HTML_MENU.title )
                .toggleClass( "invis", title == "" );
            $( menu ).find( HTML_MENU.title ).text( title );

            $( menu ).find( HTML_MENU.body )
                .toggleClass( "invis", msg == "" );
            $( menu ).find( HTML_MENU.body ).text( msg );


            if( img === undefined ) {

                $( menu ).find( HTML_MENU.img )
                    .toggleClass("invis", true);

            } else {

                var span = $( menu ).find( HTML_MENU.img ),
                   face = "";

                switch( img ) {
                    case Face.awesome:
                        face = "awesome";
                        break;
                    case Face.cry:
                        face = "cry";
                        break;
                    default:
                        face = "sleep";
                }

                if( Board.play && Board.local_player.id == 2)
                    face += "_red";

                //removes all classes and than adds a class afterwards
                //call substring to remove "." from ".smiley"
                span.removeClass().addClass( HTML_MENU.img.substring(1) );

                span.addClass( face );
                span.toggleClass("invis", false);

            }

            $( menu ).find( HTML_MENU.close_btn )
                .toggleClass( "invis", disable_close_btn );

            HTML_MENU.toggleMenu( menu, true );

        },

        toggleMenu: function( menu, force_display ) {

            if( force_display !== undefined )
                $( menu ).toggleClass( "invis", !force_display  );
            else
                $( menu ).toggleClass( "invis" );

        }

    };

}

function gamePreload() {
    //http://www.html5gamedevs.com/topic/1397-keep-running-on-losing-focus/
    //prevent game auto pause when lose focus
    game.stage.disableVisibilityChange = true;

	//sprites
	game.load.spritesheet( "faces", "imgs/faces.png", 
		125, 125, 26 );
	game.load.image( "blank", "imgs/tile_none.png" );
    game.load.spritesheet( "btns_yes_no", "imgs/btn_yes_no.png",
        183, 176, 2 );
    game.load.image( "background_menu", "imgs/clove.jpg" );
    game.load.image( "btn_close", "imgs/btn_close.png" );
    game.load.spritesheet( "btn_wooden", "imgs/btn_wooden_2_400x200.png",
    400, 200, 2 );
    game.load.image( "wooden_qmark", "imgs/wooden_qmark.png" );
    game.load.image( "hide_arrow", "imgs/hide_arrow.png" );
    game.load.image( "show_arrow", "imgs/show_arrow.png" );
    game.load.image( "ui_panel", "imgs/ui_panel_w.png" );
    game.load.image( "tile_highlight", "imgs/tile_highlight.png" );
//    game.load.image( "tile_black", "imgs/tile_wooden_black.png" );
//    game.load.image( "tile_red", "imgs/tile_wooden_red.png" );
//    game.load.image( "tile_black", "imgs/tile_marble_black.png" );
//    game.load.image( "tile_red", "imgs/tile_marble_red.png" );
    game.load.image( "tile_black", "imgs/tile_shiny_black.png" );
    game.load.image( "tile_red", "imgs/tile_shiny_red.png" );

	//backgrounds
    game.load.image( "background_mahogany", "imgs/mahogany_board.png");

	//audio
	game.audio.load();

}

var backdrop;
function gameCreate() {
	//style game canvas
	$( game.canvas ).css( "cursor", "pointer" );
    $( game.canvas ).css( "margin-top", "20px" );
    $( game.canvas ).css( "z-index", "-100" );

	//add background, omg why was this so hard to do
	//use a tilesprite next time bro :D
	game.stage.backgroundColor = "#000000";

    //152 = Board.board.x - ( backdrop.width - Board.board.width / 2 )
    backdrop = game.add.sprite( 152, 0, "background_mahogany" );
    backdrop.scale.setTo( 0.5, 0.5 );

    Scoreboard.create( game );

	game.audio.create( game );

    //resize the game when window resizes
    //$(window).resize(function() { resizeGame(); } );

    Menu.create( game );

    UI.create( game );

    Board.create( game );

    socketInit();

    //create highlight tiles for movement hints
    var th1 = game.add.sprite( 400, 235, "tile_highlight"),
        th2 = game.add.sprite( 330, 165, "tile_highlight"),
        th3 = game.add.sprite( 330, 165, "tile_highlight" );

    th1.anchor.setTo( 0.5 );
    th2.anchor.setTo( 0.5 );
    th3.anchor.setTo( 0.5 );

    th1.highlighting = false;
    th2.highlighting = false;
    th3.highlighting = false;

    th1.visible = false;
    th2.visible = false;
    th3.visible = false;
    UI.tile_highlights.push( th1, th2, th3 );

    UI.game_label = game.add.text( 400, 230, "Start!", {
            font: "60px Arial", fill: "#ec008c", align: "center"
        } );
    UI.game_label.alpha = 0;
    UI.game_label.anchor.setTo( 0.5 );

    Menu.toggleMenu( Menu.intro, false );

    $( "#btnPlay").text( "play" );

    HTML_MENU.displayMenu( HTML_MENU.bottom_menu,
        "", "Waiting for another player...", Face.asleep, true );

}

function gameUpdate() {
    if( !Board.play ) return false;

    if( Board.current_player.id == Board.remote_player.id ) {

        if( UI.btn_nudge.input.enabled )
            return false;

        var time_elapsed = Date.now() - Board.turn_start_time;
        if( time_elapsed >= Board.seconds_to_move )
            UI.btn_nudge.input.enabled = true;

    }

}

function gameQuit() {
    socket.disconnect();

    //the btn fires an event after the game is destroyed, causing
    //an error
    //UI.btn_quit.input.enabled = false;

    Board.reset();
    game.destroy();

    $( "canvas" ).remove();
    $( "#introToast" ).toggleClass( "invis" );
}

function gamePlayAgain() {

}

/***************************
				Event Handlers
					********************************/
//NOTE: what is passed, e, when event occurs is the sprite
function onMouseDown( e ) {
	e.scale.setTo( 1.1 );
}

function onMouseUp( e ) {
	e.scale.setTo( 1 );
}

function onDragStart( e ) {

    e.prev_position.setTo( e.x, e.y );
    dragHighLight( e.position );

}

//go to nearest open(legal move) tile
function onDragStop( e, pointer ) {
    UI.tile_highlights[1].visible = false;
    UI.tile_highlights[2].visible = false;

    var to = getTileByPosition( e ),
        from =  getTileByPosition(e.prev_position );

	if( !Board.checkRules( to, from )
		|| !Board.isLocalPlayerTurn() ) {

		e.x = e.prev_position.x;
		e.y = e.prev_position.y;

		sendConsoleLog( "onDragStop", "player"
			+ " made illegal move", true );
		return false;

	}

    //var next_tile = getTileByPosition( pointer.position );
    if( to.occupied ) {

        e.x = e.prev_position.x;
        e.y = e.prev_position.y;

        sendConsoleLog( "onDragStop",
            "the tile is already occupied", true );
        return false
    }

	if( e.position.equals( e.prev_position ) ) {

		sendConsoleLog( "onDragStop", "tile did not move",
            true );
		return false;

	}

//    var distance = game.physics.arcade.distanceBetween( to,
//        getTileByPosition( e.hard_position ) );
//
//    //TODO: this depends on game mode
//    if( /**distance > 140 ||**/ distance > 240 ) {
//
//        sendConsoleLog( "onDragStop", "moving too far",
//            true );
//        return false;
//
//    }

    var start_x = 330, start_y = 165;
    if( e.y < start_y ) {
        e.y = 95;
    } else if( e.y < (start_y+140) ) {
        e.y = 235;
    } else {
        e.y = 375;
    }

    if( e.x < start_x ) {
        e.x = 260;
    } else if( e.x < (start_x + 140) ) {
        e.x = 400;
    } else {
        e.x = 540;
    }

    e.hard_position.copyFrom( e.position );

    getTileByPosition( e.position ).occupied = true;
    getTileByPosition( e.prev_position ).occupied = false;

	//send message to server on succesful drag
	sendPlayerMove( e );

    Board.checkForWinner();

}

//click handler for board sprite
function onBoardClick( sprite, pointer ) {
	if( Board.state == MOVE_STATE ) return false;
	if( !Board.isLocalPlayerTurn() ) return false;
    if( getTileByPosition( sprite ).occupied )
        return false;

    var center = sprite.position;
    var piece = Board.local_player.setPiece( center );

    if( !piece ) {

        sendConsoleLog( "onBoardClick", "failed to move piece", true );
        return false;

    }

    sendPlayerMove({ id: piece.id, position: center });

    sprite.occupied = true;

    Board.checkForWinner();

}

function onBoardOver( sprite, pointer ) {
    if( !UI.tile_highlights[0].visible ) return false;

    UI.tile_highlights[0].x = sprite.x;
    UI.tile_highlights[0].y = sprite.y;

}

function dragHighLight( position ) {
    //TODO: create this on game start
    var tile = getTileByPosition( position );

    //TODO: this depends on the game mode
    var neighbors = tile.neighbors_d.concat( tile.neighbors_s );

    //TODO: optimize here
    for( var i=0; i < 3; i++ )
        UI.tile_highlights[i].highlighting = false;

    for( var n=0; n < neighbors.length; n++ ) {
        var m = neighbors[n];
        var neighbor = Board.tile_group.children[m];

        if( !neighbor.occupied ) {

            for( var p=0; p < 3; p++ ) {

                if( !UI.tile_highlights[p].highlighting ) {

                    UI.tile_highlights[p].x = neighbor.x;
                    UI.tile_highlights[p].y = neighbor.y;
                    UI.tile_highlights[p].highlighting = true;
                    UI.tile_highlights[p].visible = true;

                    break;
                }

            }


        }

    }

}

function getTileByPosition( x, y ) {
    if( y === undefined ) {
        y = x.y;
        x = x.x;
    }

    //330 = tile0.x + tile_width/2
    //165 = tile0.y + tile_height/2
    var index, start_x = 330, start_y = 165;

    if( y < start_y ) {
        index = 0;
    } else if( y < start_y + 140 ) {
        index = 3;
    } else {
        index = 6;
    }

    if( x < start_x ) {
        index += 0;
    } else if( x < start_x + 140 ) {
        index += 1;
    } else {
        index += 2;
    }

    return Board.tile_group.children[index];
}


function getTileCenter( pointer ) {
    var mouse_x = pointer.x,
        mouse_y = pointer.y,
        row = 0,
        col = 0;

    //141 = width_of_sprite / 3
    var width = 331,
        height = 142;

    if( mouse_x < width ) {
        col = 200;//10
    } else if( mouse_x < 472 ) {
        col = 340;//150
    } else if( mouse_x > 472 ) {
        col = 480;//290
    }

    if( mouse_y < height ) {
        row = 35;
    } else if( mouse_y < 284 ) {
        row = 175;
    } else {
        row = 315;
    }

    return new Phaser.Point( col, row );
}

//(y1-y2)=m(x1-x2)
//m = (y2-y1) / (x2-x1)
//returns the slope of the line created by two points 
//returns undefined if the points line on the same x axis
function findSlope( point1, point2 ) {
	var dx = point2.x - point1.x,
		dy = point2.y - point1.y;

	if( dx == 0 ) return undefined;

	return ( dy / dx );
}

function sendConsoleLog( function_name, msg, send_only_on_debug ) {
	
	if( send_only_on_debug && debug == false )
		return false;
	console.log( function_name, msg );

}

function getCenterOfSprite( sprite ) {
	var half_w = sprite.width * 0.5,
		half_h;

	if( sprite.width == sprite.height )
		half_h = half_w;
	else
		half_h = sprite.height * 0.5;

	return { x: sprite.x + half_w,
			 y: sprite.y + half_h };
}

//http://www.html5gamedevs.com/topic/1638-changing-game-size-to-fit-page/
function resizeGame() {
    WIDTH = $(window).width();
    HEIGHT = $(window).height();

    game.width = WIDTH ;
    game.height = HEIGHT;
    game.world.width = WIDTH;
    game.world.height = HEIGHT;
    game.stage.bounds.width = WIDTH;
    game.stage.bounds.height = HEIGHT;

    if ( game.renderType === Phaser.WEBGL )
        game.renderer.resize( WIDTH , HEIGHT );

}
