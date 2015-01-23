tj.DigiddyDog.StateGameError = function(gameIn, errMsg) {
  this.game = gameIn;
  this.errorMessage = errMsg;

  this.draw = function(gfx) {
    tj.Graphics.clearToColor("#000000");
    tj.Graphics.showMessage(gfx, this.errorMessage, 0.5, 0.5, "red");
  };
};

