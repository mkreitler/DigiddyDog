StateWindTurbine = function(gameIn) {
  var game = gameIn,
      totalDistance = 0,
      message = null,
      MAX_DIST_METERS = 1500,
      MIN_DIST_METERS = 100,
      EYE_TO_SCREEN_DIST_METERS = 0.5,
      MIN_SLIDE_X = 10,
      TURBINE_HEIGHT_PIXELS = 10000,
      TURBINE_HEIGHT_METERS = 100,
      WIDTH_TO_HEIGHT_RATIO = 1.0 / 30.0,
      pixelsPerMeter = TURBINE_HEIGHT_PIXELS / TURBINE_HEIGHT_METERS;

  this.enter = function() {
  };

  this.exit = function() {
  };

  this.draw = function(gfx) {
    var hScreen = 0,
        w = 0,
        h = 0;

    tj.Graphics.clearToColor("blue");

    gfx.beginPath();
    gfx.fillStyle = "#449922";
    gfx.fillRect(0, tj.Graphics.height() * 0.5, tj.Graphics.width(), tj.Graphics.height() * 0.5);

    if (totalDistance >= MIN_DIST_METERS) {
      h = TURBINE_HEIGHT_METERS * pixelsPerMeter * EYE_TO_SCREEN_DIST_METERS / totalDistance;
      w = h * WIDTH_TO_HEIGHT_RATIO;

      gfx.fillStyle = "white";
      gfx.fillRect(tj.Graphics.width() * 0.5 - w * 0.5, tj.Graphics.height() * 0.5 - h, w, h);

      gfx.globalAlpha = 0.5;
      gfx.arc(tj.Graphics.width() * 0.5, tj.Graphics.height() * 0.5 - h * 0.95, h * 0.5, 0, 2 * Math.PI);
      gfx.fill();

      tj.Graphics.print(gfx, "Distance is " + Math.round(totalDistance) + " meters", tj.Graphics.width() * 0.5, tj.Graphics.height() - 20, "#004400", "17pt verdana");
    }

    gfx.closePath();
  };

  this.update = function(dt) {
  };

  // IO Handlers //////////////////////////////////////////////////////////////
  this.onMouseUp = function(pos) {
    return true;
  };

  this.onMouseDown = function(pos) {
    totalDistance = pos.x / tj.Graphics.width() * (MAX_DIST_METERS - MIN_DIST_METERS) + MIN_DIST_METERS;
    return true;
  };

  this.onMouseDrag = function(pos) {
    totalDistance = pos.x / tj.Graphics.width() * (MAX_DIST_METERS - MIN_DIST_METERS) + MIN_DIST_METERS;
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

