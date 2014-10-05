tj.GraphicsClass = function() {
	var canvasDiv = document.getElementById("canvasDiv"),
			canvas = null,
	    context = null,
	    w = tj.Utility.getPageWidth(),
	    h = tj.Utility.getPageHeight(),
	    refCount = 0;
	    
	// Create a canvas that matches the device.
	canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	context = canvas.getContext('2d');

	// Insert the canvas into the document.
	if (canvasDiv) {
		canvasDiv.appendChild(canvas);
	}
	else {
		document.body.appendChild(canvas);
	}

	this.newBuffer = function(w, h) {
		var newCanvas = document.createElement('canvas');

		newCanvas.width = w;
		newCanvas.height = h;

		return newCanvas;
	};

	this.lock = function() {
	  ++refCount;
	  if (context) {
		  context.save();
	  }
	  
	  return context;
	};
	
	this.unlock = function() {
		if (context) {
			context.restore();
		}
		
		--refCount;
	};

	this.clear = function() {
		if (context) {
			context.clearRect(0, 0, w, h);
		}
	};

	this.clearToColor = function(color) {
		if (context) {
			context.fillStyle = color;
			context.fillRect(0, 0, w, h);
		}
	};

	this.getCanvas = function() {
		return canvas;
	};
	
	this.width = function() {
		return w;
	};
	
	this.height = function() {
		return h;
	};

	this.defaultContext = function() {
		return context;
	};

  // In order for this to size correctly along the vertical, the strFont must have the
  // form "Npt fontName", where 'N' is a number, like 20.
  // Example: "20pt verdana".
	this.print = function(gfx, message, xAnchor, yAnchor, strColor, dropOffset, dropColor, strFont, hAlign, vAlign) {
		var xCenter = hAlign || 0.5,
				yCenter = vAlign || 0.5,
				color = strColor || "white",
				font = strFont || "20pt verdana",
				textSize = null,
				x = 0,
				y = 0;

		if (gfx) {
			gfx.font = font;
			gfx.textAlign = 'left';
			gfx.textBaseline = 'top';
			textSize = gfx.measureText(message);

			x = xAnchor - textSize.width * xCenter;
			y = yAnchor - parseInt(font) * yCenter;

			if (dropOffset) {
				gfx.fillStyle = dropColor || "black";
				gfx.fillText(message, x + dropOffset, y + dropOffset);
			}

			gfx.fillStyle = color;
			gfx.fillText(message, x, y);
		}
	}
};

tj.Graphics = new tj.GraphicsClass();
