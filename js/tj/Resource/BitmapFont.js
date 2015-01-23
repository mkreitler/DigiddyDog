// Modified from Dominic Szablewski's Impact engine (www.impactjs.com),
// version 1.23.

tj.BitmapFont = function(url) {
	this.widthMap = [];
	this.indices = [];
	this.firstChar = 32;
	this.alpha = 1;
	this.letterSpacing = 1;
	this.lineSpacing = 0;
	this.data = null;
	this.height = 0;
	this.width = 0;
	this.loaded = false;
	this.extImages = [];
	this.extBreakpoints = [];
	this.nLoaded = 0;
	this.metricsOut = {width: 0, height: 0};
	this.url = url;
};

tj.BitmapFont.prototype.addImage = function(imageEx) {
	this.extImages.push(imageEx.image);
};

tj.BitmapFont.prototype.load = function(loadedCallback, errorCallback, observer) {
	var urlList = this.url instanceof Array ? this.url : [],
			newImage = null,
			self = this,
			i = 0;

	if (urlList.length === 0 && typeof(this.url) === "string") {
		urlList.push(this.url);
	}

	for (i=0; i<urlList.length; ++i) {
		newImage = new tj.ImageEx(urlList[i]);
		this.addImage(newImage);

		newImage.load(function(image) {
			if (self.onLoad(image)) {
				loadedCallback.call(observer, self);
			}
		}, errorCallback, observer);
	}
};

tj.BitmapFont.prototype.onLoad = function(image) {
	this.nLoaded += 1;

	if (this.nLoaded === this.extImages.length) {
		this._loadMetrics();
		this.loaded = true;
	}

	return this.loaded;
};

tj.BitmapFont.prototype._loadMetrics = function( ) {
	// Draw the bottommost line of this font image into an offscreen canvas
	// and analyze it pixel by pixel.
	// A run of non-transparent pixels represents a character and its width
	
	this.widthMap = [];
	this.indices = [];
	this.height = this.extImages[0].height - 1;
	this.width = this.extImages[0].width;
	
	var px = null;
	var currentImage = 0;
	var currentChar = 0;
	var currentWidth = 0;
	var lastChar = -1;
	for (var i=0; i<this.extImages.length; ++i) {
		image = this.extImages[i];
		this.extBreakpoints.push(currentChar);
		currentWidth = 0;

		if (image) {
				canvas = document.createElement('canvas');
				canvas.width = image.width;
				canvas.height = image.height;
				ctx = canvas.getContext('2d');
				ctx.drawImage( image, 0, 0 );
				px = this._getImagePixels(image, 0, image.height-1, image.width, 1);
		}
		else {
			break;
		}

		for( var x = 0; x < image.width; x++ ) {
			var index = x * 4 + 3; // alpha component of this pixel
			if( px.data[index] > tj.BitmapFont.ALPHA_THRESHOLD ) {
				currentWidth++;
			}
			else if( px.data[index] < tj.BitmapFont.ALPHA_THRESHOLD && currentWidth ) {
				this.widthMap.push( currentWidth );
				this.indices.push( x-currentWidth );
				currentChar++;
				currentWidth = 0;
				lastChar = currentChar;
			}
		}

		if (lastChar != currentChar) {
			this.widthMap.push( currentWidth );
			this.indices.push( x-currentWidth );
			lastChar = currentChar;
		}
	}
};

tj.BitmapFont.prototype.draw = function( gfx, text, x, y, align, vAlign ) {
	var vertAlign = (1 - (vAlign || 0.5)) * (this.height + this.lineSpacing);

	align = align || tj.BitmapFont.ALIGN.CENTER;

	if( typeof(text) != 'string' ) {
		text = text.toString();
	}
	
	// Multiline?
	if( text.indexOf('\n') !== -1 ) {
		var lines = text.split( '\n' );
		var lineHeight = this.height + this.lineSpacing;
		for( var i = 0; i < lines.length; i++ ) {
			this.draw( gfx, lines[i], x, y + i * lineHeight, align );
		}
		return;
	}
	
	if( align == tj.BitmapFont.ALIGN.RIGHT || align == tj.BitmapFont.ALIGN.CENTER ) {
		var width = this._widthForLine( text );
		x -= align == tj.BitmapFont.ALIGN.CENTER ? Math.round(width/2) : width;
	}
	

	if( this.alpha !== 1 ) {
		tj.Graphics.setGlobalAlpha(this.alpha);
	}

	for( var i = 0; i < text.length; i++ ) {
		var c = text.charCodeAt(i);
		x += this._drawChar( gfx, c - this.firstChar, x, y - vertAlign);
	}

	if( this.alpha !== 1 ) {
		tj.Graphics.setGlobalAlpha(1);
	}
};

tj.BitmapFont.prototype.measureText = function(text) {
	this.metricsOut.width = this.widthForString(text);
	this.metricsOut.height = this.height;

	return this.metricsOut;
};
	
tj.BitmapFont.prototype.widthForString = function( text ) {
	// Multiline?
	if( text.indexOf('\n') !== -1 ) {
		var lines = text.split( '\n' );
		var width = 0;
		for( var i = 0; i < lines.length; i++ ) {
			width = Math.max( width, this._widthForLine(lines[i]) );
		}
		return width;
	}
	else {
		return this._widthForLine( text );
	}
};
	
tj.BitmapFont.prototype._widthForLine = function( text ) {
	var width = 0;
	for( var i = 0; i < text.length; i++ ) {
		width += this.widthMap[text.charCodeAt(i) - this.firstChar] + this.letterSpacing;
	}
	return width;
};

tj.BitmapFont.prototype.heightForString = function( text ) {
	return text.split('\n').length * (this.height + this.lineSpacing);
};

tj.BitmapFont.prototype._drawChar = function( gfx, c, targetX, targetY ) {
	if( !this.loaded || c < 0 || c >= this.indices.length ) { return 0; }
	
	var curImage = this.extImages[0],
			scale = 1;
	
	// Figure out which image to use.
	for (var i=0; i<this.extImages.length; ++i) {
		if (c >= this.extBreakpoints[i]) {
			curImage = this.extImages[i];
		}
	}

	var charX = this.indices[c] * scale;
	var charY = 0;
	var charWidth = this.widthMap[c] * scale;
	var charHeight = (this.height-2) * scale;		
	
	gfx.drawImage( 
		curImage,
		charX, charY,
		charWidth, charHeight,
		targetX, targetY,
		charWidth, charHeight
	);
	
	return this.widthMap[c] + this.letterSpacing;
};
	
tj.BitmapFont.prototype._getVendorAttribute = function( el, attr ) {
	var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
	return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
};

tj.BitmapFont.prototype._normalizeVendorAttribute = function( el, attr ) {
	var prefixedVal = this._getVendorAttribute( el, attr );
	if( !el[attr] && prefixedVal ) {
		el[attr] = prefixedVal;
	}
};

tj.BitmapFont.prototype._setVendorAttribute = function( el, attr, val ) {
	var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
	el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
};

tj.BitmapFont.prototype._getImagePixels = function( image, x, y, width, height ) {
	var canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	var ctx = canvas.getContext('2d');
	
	// Try to draw pixels as accurately as possible
	this._CRISP(canvas, ctx);

	var ratio = this._getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
	this._normalizeVendorAttribute( ctx, 'getImageDataHD' );

	var realWidth = image.width / ratio,
		realHeight = image.height / ratio;

	canvas.width = Math.ceil( realWidth );
	canvas.height = Math.ceil( realHeight );

	ctx.drawImage( image, 0, 0, realWidth, realHeight );
	
	return (ratio === 1)
		? ctx.getImageData( x, y, width, height )
		: ctx.getImageDataHD( x, y, width, height );
};

tj.BitmapFont.prototype._CRISP = function( canvas, context ) {
	this._setVendorAttribute( context, 'imageSmoothingEnabled', false );
	canvas.style.imageRendering = '-moz-crisp-edges';
	canvas.style.imageRendering = '-o-crisp-edges';
	canvas.style.imageRendering = '-webkit-optimize-contrast';
	canvas.style.imageRendering = 'crisp-edges';
	canvas.style.msInterpolationMode = 'nearest-neighbor'; // No effect on Canvas :/
};

tj.BitmapFont.ALIGN = {
							LEFT: 0,
							RIGHT: 1,
							CENTER: 2
};

tj.BitmapFont.ALPHA_THRESHOLD = 128;



