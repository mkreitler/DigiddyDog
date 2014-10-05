window.FPS = 60;

// From Paul Irish's article on 'requestAnimFrame':
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//
// Shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ) {
            window.setTimeout(callback, 1000 / window.FPS);
          };
});

// Define namespace for engine components.
tj = {};

tj.assert = function(test, message) {
	if (!test) {
		console.log("ASSERTION FAILED: " + message);
		debugger;
	}
};

tj.Game = function(client, backColor) {
	var clearColor = backColor ? backColor : null,
		delegate = client || this,
		bRunning = false,
		lastNow = 0,
		self = this,
		currentState = null;

	this.setState = function(newState) {
		if (newState != currentState) {
			if (currentState) {
				if (currentState.exit) {
					currentState.exit();
				}

				if (tj.Utility.isMobile()) {
					tj.Touch.deregister(currentState);
				}
				else {
					tj.Mouse.deregister(currentState);
				}
			}
				
			if (newState) {
				if (newState.enter) {
					newState.enter();
				}

				if (tj.Utility.isMobile()) {
					tj.Touch.register(newState);
				}
				else {
					tj.Mouse.register(newState);
				}
			}
				
			currentState = newState;
		}
	};
	
	this.start = function() {
		if (!bRunning) {
			console.log("--- Starting game!");
			bRunning = true;
			lastNow = Date.now();
			window.requestAnimFrame()(self.gameLoop.bind(this));
		}
	}
	
	this.gameLoop = function() {
		var gfx = tj.Graphics.lock(),
		then = Date.now(),
		dt = (then - lastNow) * 0.001;

		tj.MusicMixer.update(dt);
		
		// Update delegate
		if (delegate && delegate.update) {
			delegate.update(dt);
		}
		
		if (currentState && currentState.update) {
			currentState.update(dt);
		}
		
		if (clearColor) {
			gfx.fillStyle = clearColor;
			gfx.fillRect(0, 0, tj.Graphics.width(), tj.Graphics.height());
		}

		// Draw delegate
		if (delegate && delegate.draw) {
			delegate.draw(gfx);
		}
		
		if (currentState && currentState.draw) {
			currentState.draw(gfx);
		}
		
		tj.Graphics.unlock();

		if (bRunning) {
			lastNow = Date.now();
			window.requestAnimFrame()(self.gameLoop.bind(self));
		}
	};
	
	this.stop = function() {
		bRunning = false;
	};
};
