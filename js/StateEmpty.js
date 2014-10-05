StateEmpty = function(gameIn) {
  var game = gameIn;

  this.enter = function() {
  };

  this.exit = function() {
  };

  this.draw = function(gfx) {
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
    return this.onMouseDown(pos);    
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

