tj.MetaBlocks.StateGameError = function(gameIn, errMsg) {
  var game = gameIn,
      errorMessage = errMsg;

  this.draw = function(gfx) {
    tj.Graphics.clearToColor("#000000");
    tj.Graphics.showMessage(gfx, errorMessage, 0.5, 0.5, "red");
  };
};

