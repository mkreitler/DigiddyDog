tj.MouseClass = function() {
   window.addEventListener("mouseover", this.onMouseOver.bind(this), true);
   window.addEventListener("mouseout", this.onMouseOut.bind(this), true);
   window.addEventListener("mousedown", this.onMouseDown.bind(this), true);
   window.addEventListener("mouseup", this.onMouseUp.bind(this), true);
};

tj.MouseClass.pos = {x:0, y:0};

tj.MouseClass.listeners = new tj.ListenerClass();

tj.MouseClass.prototype.register = function(listener, fnCompare) {
   tj.MouseClass.listeners.add(listener, "onMouseOver", fnCompare);
   tj.MouseClass.listeners.add(listener, "onMouseOut", fnCompare);
   tj.MouseClass.listeners.add(listener, "onMouseUp", fnCompare);
   tj.MouseClass.listeners.add(listener, "onMouseDown", fnCompare);
   tj.MouseClass.listeners.add(listener, "onMouseDrag", fnCompare);
};

tj.MouseClass.prototype.deregister = function(listener) {
   tj.MouseClass.listeners.remove(listener);
};

// Local Listeners ////////////////////////////////////////////////////////////
tj.MouseClass.prototype.onMouseOver = function(e) {
   tj.MouseClass.pos.x = e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX;
   tj.MouseClass.pos.y = e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY;

   tj.MouseClass.listeners.send("onMouseOver", tj.MouseClass.pos);
};

tj.MouseClass.prototype.onMouseOut = function(e) {
   tj.MouseClass.pos.x = e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX;
   tj.MouseClass.pos.y = e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY;

   this.removeMouseMove(this);

   tj.MouseClass.listeners.send("onMouseOut", tj.MouseClass.pos);
};

tj.MouseClass.prototype.onMouseDown = function(e) {
   tj.MouseClass.pos.x = e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX;
   tj.MouseClass.pos.y = e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY;

   this.addMouseMove(this);

   tj.MouseClass.listeners.send("onMouseDown", tj.MouseClass.pos);
};

tj.MouseClass.prototype.onMouseMove = function(e) {
   tj.MouseClass.pos.x = e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX;
   tj.MouseClass.pos.y = e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY;

   tj.MouseClass.listeners.send("onMouseDrag", tj.MouseClass.pos);
};

tj.MouseClass.prototype.onMouseUp = function(e) {
   tj.MouseClass.pos.x = e.srcElement ? e.clientX - e.srcElement.offsetLeft : e.clientX;
   tj.MouseClass.pos.y = e.srcElement ? e.clientY - e.srcElement.offsetTop : e.clientY;

   this.removeMouseMove(this);

   tj.MouseClass.listeners.send("onMouseUp", tj.MouseClass.pos);
};

tj.MouseClass.prototype.addMouseMove = function(self) { 
   window.addEventListener("mousemove", self.onMouseMove, true);
};

tj.MouseClass.prototype.removeMouseMove = function(self) {
   window.removeEventListener("mousemove",  self.onMouseMove, true);
};

tj.Mouse = new tj.MouseClass();
