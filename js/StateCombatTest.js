StateCombatTest = function(gameIn) {
  var game = gameIn,
      spline = null,
      bCapturePoints = false,
      message = null;

  this.enter = function() {
  };

  this.exit = function() {
  };

  this.draw = function(gfx) {
    var points = spline ? spline.getPoints() : null,
        i = 0;

    tj.Graphics.clearToColor("black");

    if (points && points.length) {
      gfx.lineWidth = 2;
      gfx.strokeStyle = "#00ff00";
      
      gfx.beginPath();
      gfx.moveTo(points[0].x, points[0].y);

      for (i=1; i<points.length; ++i) {
        gfx.lineTo(points[i].x, points[i].y);
      }

      gfx.stroke();
    }

    if (message) {
      tj.Graphics.print(gfx, message, tj.Graphics.width() * 0.5, tj.Graphics.height() * 0.5, "white");
    }
  };

  this.update = function(dt) {
  };

  // IO Handlers //////////////////////////////////////////////////////////////
  this.onMouseUp = function(pos) {
    return true;
  };

  this.onMouseDown = function(pos) {
    if (spline == null) {
      spline = new tj.MathEx.Spline2D();
      bCapturePoints = true;
    }
    else {
      bCapturePoints = false;
    }

    return true;
  };

  this.onMouseDrag = function(pos) {
    if (bCapturePoints) {
      spline.addPoint({x:pos.x, y:pos.y});
      // message = "Point is (" + pos.x + ", " + pos.y + ")";
    }

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
    return this.onMouseDrag(pos);
  };

  this.onTouchCancel = function(pos) {
    return true;
  };
};

