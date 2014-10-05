tj.MetaBlocks.StateResourceLoad = function(gameIn) {
  var game = gameIn;

  this.enter = function() {
    tj.Resources.requestMusic("art/music/theme-red");
    tj.Resources.requestMusic("art/music/theme-blue");
    tj.Resources.requestMusic("art/music/theme-white");

    game.setGridImage(tj.Resources.requestImage("art/grid.png"));
    game.setBlocksImage(tj.Resources.requestImage("art/blocks.png"));

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
            0, 2 * Math.PI * pDone, true);

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

