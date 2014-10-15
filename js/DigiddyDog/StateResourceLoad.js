tj.DigiddyDog.StateResourceLoad = function(gameIn) {
  var game = gameIn;

  this.enter = function() {
    // Load music.
    tj.Resources.requestMusic("art/music/theme-red");
    tj.Resources.requestMusic("art/music/theme-blue");
    tj.Resources.requestMusic("art/music/theme-white");

    // Load images.
    game.setBlocksImage(tj.Resources.requestImage("art/blocks.png"));
    game.setHeadImage(tj.Resources.requestImage("art/digiddyHead.png"));
    game.setLogoImage(tj.Resources.requestImage("art/logo.png"));
    game.setGemImages(tj.Resources.requestImage("art/gems64.png"),
                       tj.Resources.requestImage("art/gems40.png"),
                       tj.Resources.requestImage("art/gems32.png"),
                       tj.Resources.requestImage("art/gems16.png"));
    game.setPlayerImages(tj.Resources.requestImage("art/player64.png"),
                       tj.Resources.requestImage("art/player40.png"),
                       tj.Resources.requestImage("art/player32.png"),
                       tj.Resources.requestImage("art/player16.png"));
    game.setRockImages(tj.Resources.requestImage("art/rocks64.png"),
                       tj.Resources.requestImage("art/rocks40.png"),
                       tj.Resources.requestImage("art/rocks32.png"),
                       tj.Resources.requestImage("art/rocks16.png"));

    // Load fonts.
    game.setFontLarge(tj.Resources.requestFont("art/font_white64.png"));
    game.setFontMedium(tj.Resources.requestFont("art/font_white32.png"));
    game.setFontSmall(tj.Resources.requestFont("art/font_white20.png"));

    // Load sounds.
    game.setCollectSound(tj.Resources.requestSound("art/sounds/collected01", 2));
    game.setFallSound(tj.Resources.requestSound("art/sounds/fall02", 1));
    game.setInfoSound(tj.Resources.requestSound("art/sounds/info01", 1));
    game.setInfoCloseSound(tj.Resources.requestSound("art/sounds/infoClose04", 2));
    game.setMoveSound(tj.Resources.requestSound("art/sounds/move", 2));
    game.setPickupSound(tj.Resources.requestSound("art/sounds/pickup01", 2));
    game.setSquishSound(tj.Resources.requestSound("art/sounds/squish02", 2));
    game.setRotateSound(tj.Resources.requestSound("art/sounds/rotate01", 2));

    tj.Resources.sendRequests();
  };

  this.exit = function() {
  };

  this.draw = function(gfx) {
    var pDone = tj.Resources.getProgress();

    tj.Graphics.clearToColor("#000000");

    gfx.lineWidth = 8;
    gfx.strokeStyle = "green";
    gfx.beginPath();

    if (pDone < 0.33) {
      gfx.strokeStyle = "orange";
    }
    else if (pDone < 0.67) {
      gfx.strokeStyle = "yellow";
    }

    gfx.arc(tj.Graphics.width() * 0.5, tj.Graphics.height() * 0.5, Math.min(tj.Graphics.width() * 0.1, tj.Graphics.height() * 0.25),
            0, 2 * Math.PI * (1.0 - pDone), true);

    gfx.stroke();
    gfx.closePath();
  };

  this.update = function(dt) {
    if (tj.Resources.loadComplete()) {
      if (tj.Resources.loadSuccessful()) {
        tj.Game.sendMessage(tj.Game.MESSAGES.START_GAME, null);
      }
      else {
        tj.Game.sendMessage(tj.Game.MESSAGES.ABORT_GAME, null);
      }
    }
  };

  // IO Handlers //////////////////////////////////////////////////////////////
  this.onMouseUp = function(pos) {
    return true;
  };

  this.onMouseDown = function(pos) {
    return true;
  };

  this.onMouseDrag = function(pos) {
    return true;
  };

  this.onMouseOver = function(pos) {
    return true;
  };

  this.onMouseOut = function(pos) {
    return true;
  };

  this.onTouchStart = function(pos) {
    return true;
  };

  this.onTouchEnd = function(pos) {
    return true;
  };

  this.onTouchMove = function(pos) {
    return true;
  };

  this.onTouchCancel = function(pos) {
    return true;
  };
};

