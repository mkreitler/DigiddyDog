tj.TouchClass = function() {
   var canvas = tj.Graphics.getCanvas(),
       self = this;

   /* touchstart event */
   canvas.addEventListener("touchstart", function(e) 
   {
      self.getClientPos(e.touches[0]);

      self.listeners.send("onTouchStart", self.pos);
   }, false);
    
   /* touchend event */
   canvas.addEventListener("touchend", function(e) 
   {
      self.getClientPos(e.touches[0]);

      self.listeners.send("onTouchEnd", self.pos);
   }, false);
    
   /* touchmove event */
   canvas.addEventListener("touchmove", function(e) 
   {
      self.getClientPos(e.touches[0]);

      self.listeners.send("onTouchMove", self.pos);
   }, false);
    
   /* touchcancel event */
   canvas.addEventListener("touchcancel", function(e) 
   {
      self.getClientPos(e.touches[0]);

      self.listeners.send("onTouchCancel", self.pos);
   }, false);
};

tj.TouchClass.prototype.listeners = new tj.ListenerClass();
tj.TouchClass.prototype.pos = {x:0, y:0};

tj.TouchClass.prototype.getClientPos = function(touch) {
   // Adapted from gregers' response in StackOverflow:
   // http://stackoverflow.com/questions/5885808/includes-touch-events-clientx-y-scrolling-or-not
  if (touch) {
    var winOffsetX = window.pageXoffset;
    var winOffsetY = window.pageYoffset;
    var x = touch.clientX;
    var y = touch.clientY;
      
    if (touch.pageY === 0 && Math.floor(y) > Math.floor(touch.pageY) ||
        touch.pageX === 0 && Math.floor(x) > Math.floor(touch.pageX)) {
      x = x - winOffsetX;
      y = y - winOffsetY;
    }
    else if (y < (touch.pageY - winOffsetY) || x < (touch.pageX - winOffsetX)) {
      x = touch.pageX - winOffsetX;
      y = touch.pageY - winOffsetY;
    }
      
    this.pos.x = x;
    this.pos.y = y;
  }
};

tj.TouchClass.prototype.register = function(listener, fnCompare) {
   this.listeners.add(listener, "onTouchStart", fnCompare);
   this.listeners.add(listener, "onTouchEnd", fnCompare);
   this.listeners.add(listener, "onTouchMove", fnCompare);
   this.listeners.add(listener, "onTouchCancel", fnCompare);

   console.log(">>> Listener Added");
};

tj.TouchClass.prototype.deregister = function(listener) {
   this.listeners.remove(listener);

   console.log("<<< Listener Removed");
};

tj.Touch = new tj.TouchClass();

