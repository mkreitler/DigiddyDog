var StateHeartRate = function(game) {
  var offColor = "#770000",
      onColor = "#00aa00",
      rates = [],
      nRates = tj.Graphics.width(),
      iCurRate = 0,
      MIN_RATE = 30,
      MAX_RATE = 180;

  tj.HeartRateMonitor.register(this);
  tj.HeartRateMonitor.start();

  this.update = function(dt) {
    // Nothing to do here, yet.
  };

  this.draw = function(gfx) {
    var i = 0,
        iRate = 0,
        x = 0,
        y = 0,
        accum = 0;

    if (tj.HeartRateMonitor.isOn()) {
      tj.Graphics.clearToColor(onColor);

      gfx.lineWidth = 2;
      gfx.strokeStyle = "white";
      gfx.beginPath();

      for (i=0; i<nRates; ++i) {
        iRate = (i + 1) % nRates;
        x = i;
        y = tj.Graphics.height() * 0.5 * (1.0 - (rates[iRate] - MIN_RATE) / (MAX_RATE - MIN_RATE));

        accum += rates[iRate];

        if (i === 0) {
          gfx.moveTo(x, y);
        }
        else {
          gfx.lineTo(x, y);
        }
      }

      gfx.stroke();

      accum /= nRates;
      tj.Graphics.print(gfx, "Rate " + Math.round(accum), tj.Graphics.width() * 0.5, tj.Graphics.height() * 0.75, "white");
    }
    else {
      tj.Graphics.clearToColor(offColor);
    }
  };

  this.enter = function() {
    if (isMobile) {
      tj.Touch.register(this);
    }
    else {
      tj.Mouse.register(this);
    }

    this.resetRates();
  };

  this.exit = function() {
    if (isMobile) { 
      tj.Touch.deregister(this);
    }
    else {
      tj.Mouse.deregister(this);
    }
  };

  this.resetRates = function() {
    for (iCurRate=0; iCurRate<tj.Graphics.width(); ++iCurRate) {
      rates[iCurRate] = 0;
    }

    iCurRate = 0;
  };

// Events /////////////////////////////////////////////////////////////////////
  this.onHeartRateNotification = function(info) {
    // Heart rate code here.
    rates[iCurRate] = into.rate;

    iCurRate = (iCurRate + 1) % nRates;

    return true;
  };

  this.onMouseUp = function(pos) {
    return true;
  };

  this.onMouseDown = function(pos) {
    if (tj.HeartRateMonitor.isOn()) {
      tj.HeartRateMonitor.stop();
    }
    else {
      tj.HeartRateMonitor.start();
    }
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
