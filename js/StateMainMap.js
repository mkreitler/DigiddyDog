var StateMainMap = function(game) {
	var // Constants
		NUM_WAVES = 11,
		WAVE_DX = 32 * 11,
		WAVE_DY = 32
		WAVE_START_X = -32,
		WAVE_OFFSET_X = 2,
		WAVE_OFFSET_Y = 2,
		WAVE_SIZE = 32,
		
		// Variables
		waves = [],
		imgWaves = null,
		imgMap = null,
		message = null,
		i=0;
	
	imgWaves = game.loadImage("art/waves.png");
	imgMap = game.loadImage("art/map.png");

	for (i=0; i<NUM_WAVES; ++i) {
		waves[i] = {x: WAVE_START_X + WAVE_OFFSET_X * i,
					y: -WAVE_DY + WAVE_DY * i,
					image: imgWaves,
					frame: 0};
	}

	this.enter = function() {
	};

	this.exit = function() {
	};
	
	this.update = function(dt) {
		// Move waves.
		var iWave = 0,
			x = 0,
			y = 0;
	
		for(iWave=0; iWave<NUM_WAVES; ++iWave) {
			waves[iWave].frame += 1;
		}
	};
	
	this.draw = function(gfx) {
		// Draw waves.
		for(iWave=0; iWave<NUM_WAVES; ++iWave) {
			x = waves[iWave].x + (waves[iWave].frame * WAVE_OFFSET_X) % WAVE_SIZE;
			y = waves[iWave].y + (waves[iWave].frame * WAVE_OFFSET_Y) % WAVE_SIZE;
			gfx.drawImage(waves[iWave].image, x, y);
		}
		
		// Draw map.
		gfx.drawImage(imgMap, (tj.Graphics.width() - imgMap.width) * 0.5, (tj.Graphics.height() - imgMap.height) * 0.5);

		if (this.message) {
			tj.Graphics.print(gfx, this.message, tj.Graphics.width() * 0.5, tj.Graphics.height() * 0.5);
		}
	}

	// Messaging ////////////////////////////////////////////////////////////////
	this.onMouseDown = function(pos) {
		this.message = "onMouseDown";
		return true;
	};

	this.onMouseUp = function(pos) {
		this.message = "onMouseUp";
		return true;
	};

	this.onMouseOut = function(pos) {
		this.message = "onMouseOut";
		return true;
	};

	this.onMouseOver = function(pos) {
		this.message = "onMouseOver";
		return true;
	};

	this.onMouseMove = function(pos) {
		this.message = "onMouseMove";
		return true;
	};
};
