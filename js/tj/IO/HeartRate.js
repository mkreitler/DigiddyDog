tj.HeartRateClass = function() {
  var bOn = false,
      info = {rate:0, interval: 0};

  this.onHeartRateNotification = function onchangedCB(hrmInfo) {
    info.rate = hrmInfo.heartRate;
    info.interval = hrmInfo.rRInterval;

    self.listeners.send("onHeartRateNotification", info);
  };

  this.start = function() {
    if (isMobile) {
      webapis.motion.start("HRM", this.onHeartRateNotification);
    }

    bOn = true;
  };

  this.stop = function() {
    if (isMobile) {
      webapis.motion.stop("HRM");
    }
    
    bOn = false;
  };

  this.isOn = function() {
    return bOn;
  };
};

tj.HeartRateClass.prototype.listeners = new tj.ListenerClass();

tj.HeartRateClass.prototype.register = function(listener, fnCompare) {
   this.listeners.add(this, "onHeartRateNotification", fnCompare);
};

tj.HeartRateMonitor = new tj.HeartRateClass();

