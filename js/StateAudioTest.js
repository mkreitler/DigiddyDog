StateAudioTest = function(gameIn) {
  var game = gameIn;

  this.enter = function() {
    tj.MusicMixer.randomize(true);
    tj.MusicMixer.start();
  };

  this.exit = function() {
    tj.MusicMixer.stop();
  };

  this.draw = function(gfx) {
    tj.Graphics.clearToColor("#00ff00");
  };

  this.update = function(dt) {
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

