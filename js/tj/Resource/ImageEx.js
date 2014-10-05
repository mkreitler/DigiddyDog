tj.ImageEx = function(path) {
	this.path = path;
	this.image = new Image();

	return this;
};

tj.ImageEx.prototype.width = function() {
	return this.image ? this.image.width : 0.0;
};

tj.ImageEx.prototype.height = function() {
	return this.image ? this.image.height : 0.0;
};

tj.ImageEx.prototype.draw = function(gfx, x ,y) {
	if (gfx) {
		gfx.drawImage(this.image, x, y);
	}
};

tj.ImageEx.prototype.drawRect = function(gfx, srcX, srcY, w, h, destX, destY) {
	if (gfx) {
		gfx.drawImage(srcX, srcY, w, h, destX, destY, w, h);
	}
};

tj.ImageEx.prototype.getImage = function() {
	return this.image;
};

tj.ImageEx.prototype.load = function(onLoadedCallback, onErrorCallback, observer) {
	var imgEx = this;
	
	if (observer) {
		this.image.onload = function() {
			if (onLoadedCallback) {
				onLoadedCallback.call(observer, imgEx);
			}

			imgEx.image.onload = null;
		};
		
		this.image.onerror = function() {
			if (onErrorCallback) {
				onErrorCallback.call(observer, imgEx);
			}

			imgEx.image.onerror = null;
		}
	}

	this.image.src = this.path;
};
