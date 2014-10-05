tj.ListenerClass = function() {
  this.listeners = {};
};

tj.ListenerClass.prototype.receiver = [];

tj.ListenerClass.prototype.getResponder = function() {
  return this.receiver[0];
};

tj.ListenerClass.prototype.send = function(message, argObj) {
  var listenerList = this.listeners[message.toUpperCase()],
      i = 0;

  if (listenerList) {
    for (i=0; i<listenerList.length; ++i) {
      this.receiver.unshift(listenerList[i]);
      if (listenerList[i][message] && listenerList[i][message](argObj)) {
        this.receiver.shift();
        break;
      }
      else {
        this.receiver.shift();
      }
    }
  }
};

tj.ListenerClass.prototype.broadcast = function(message, argObj) {
  var listenerList = this.listeners[message.toUpperCase()],
      i = 0;

  if (listenerList) {
    for (i=0; i<listenerList.length; ++i) {
      if (this.listenerList[i][message]) {
        this.receiver.unshift(listenerList[i]);
        listenerList[i][message](argObj);
        this.receiver.shift();
      }
    }
  }
};

// The fnCompare function compares two listeners, always taking the new listener
// as the first, and returns 'true' if the new listener should be inserted into
// the position of the current list element.
//
// EXAMPLE:
// var newListener = {priority: 100};
// var oldListener = {priority: 10};
// var fnCompare = function(new, old) {
//   return new.priority > old.priority;
// }
//
tj.ListenerClass.prototype.add = function(listener, message, fnCompare) {
  var listenerList = null,
      i = 0,
      bAdded = false,
      msgIndex = message.toUpperCase();

  if (!this.listeners[msgIndex]) {
    this.listeners[msgIndex] = [];
  }

  listenerList = this.listeners[msgIndex];

  // If this listener isn't already in the list...
  if (listenerList.indexOf(listener) < 0) {
    // If we're adding without sorting.
    if (!fnCompare) {
      listenerList.push(listener);
    }
    else {
      for (i=0; i<listenerList.length; ++i) {
        if (fnCompare(listenerList[i], listener)) {
          listenerList.splice(i, 0, listener);
          bAdded = true;
          break;
        }
      }

      if (!bAdded) {
        listenerList.push(listener);
      }
    }
  }
};

tj.ListenerClass.prototype.remove = function(listener, message) {
  var upperMessage = message ? message.toUpperCase() : null,
      listenerList = null,
      index = -1,
      key = null;

  if (message) {
    // Unregister the listener from this message.
    listenerList = this.listeners[message];
    if (listenerList) {
      index = listenerList.indexOf(listener);
      if (index >= 0) {
        listenerList.splice(index, 1);
      }
    }
  }
  else {
    // Remove the listener from the table.
    for (key in this.listeners) {
      listenerList = this.listeners[key];

      if (listenerList) {
        index = listenerList.indexOf(listener);
        if (index >= 0) {
          listenerList.splice(index, 1);
        }
      }
    }
  }
};


///////////////////////////////////////////////////////////////////////////
// Add Listeners to the base game class
///////////////////////////////////////////////////////////////////////////
tj.Game.listeners = new tj.ListenerClass();

tj.Game.addListener = function(listener, message, fnCompare) {
  tj.Game.listeners.add(listener, message, fnCompare);
};

tj.Game.removeListener = function(listener, message) {
  tj.Game.listeners.remove(listener, message);
};

tj.Game.sendMessage = function(message, argObj) {
  tj.Game.listeners.send(message, argObj);
};

tj.Game.broadcastMessage = function(message, argObj) {
  tj.Game.listeners.send(message, argObj);
};
