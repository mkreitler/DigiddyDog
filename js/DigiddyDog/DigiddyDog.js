tj.DigiddyDog = function() {
  tj.DD = this;

  this.blocksImage = null;
  this.backBuffer = null;
  this.headImage = null;
  this.logoImage = null;
  this.cellSize = 32;
  this.gemImages = {};
  this.playerImages = {};
  this.rockImages = {};
  this.statusMsgAnchor = {x:0, y:0};
  this.rotateSound = null;
  this.squishSound = null;
  this.pickupSound = null;
  this.fallSound = null;
  this.moveSound = null;
  this.infoCloseSound = null;
  this.infoSound = null;
  this.collectSound = null;
  this.stateLevelTest = null;

  this.init();
};

tj.DigiddyDog.prototype.init = function() {
  //  stateMainMap = null,
  //  stateHeartRate = null,
  //  stateWindTurbine = null,
  //  stateCombatTest = null,
  //  stateFactorFarm = null;

	// Initialization /////////////////////////////////////////////////////////
	this.game = new tj.Game(this);

	// stateMainMap = new StateMainMap(game);
  //  stateHeartRate = new StateHeartRate(game);
  //  stateWindTurbine = new StateWindTurbine(game);
  //  stateCombatTest = new StateCombatTest(game);
  //  stateFactorFarm = new StateFactorFarm(game);

  tj.Game.addListener(this, tj.Game.MESSAGES.START_GAME);
  tj.Game.addListener(this, tj.Game.MESSAGES.ABORT_GAME);
  tj.Game.addListener(this, tj.DD.strings.MSG.RENDER_BACKGROUND);
  tj.Game.addListener(this, tj.DD.strings.MSG.DRAW_LOGO);

  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_ROTATE);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_SQUISH);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_PICKUP);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_MOVE);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_INFO_CLOSE);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_INFO);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_COLLECT);
  tj.Game.addListener(this, tj.DD.strings.MSG.PLAY_SOUND_FALL);

  this.game.setState(new tj.DigiddyDog.StateResourceLoad(this));

  this.levelMessages = null;
  this.levelMessagesAlt = null;

  this.game.start();
};

tj.DigiddyDog.prototype.strings = {
  YOU_DIED: "You Died",
  LEVEL_PREFIX: "Level",
  READY: "Ready",
  PATTERN: "Pattern",
  SCORE: "Score",
  COMBO: "Combo",

  // Messages
  MSG: {DRAW_LOGO: "drawLogo",
        RESUME_PLAY: "resumePlay",
        STATUS_MESSAGE_DISMISSED: "statusMessageDismissed",
        ADD_STATUS_MESSAGE: "addStatusMessage",
        RENDER_BACKGROUND: "renderBackground",
        PLAY_SOUND_ROTATE: "playSoundRotate",
        PLAY_SOUND_SQUISH: "playSoundSquish",
        PLAY_SOUND_PICKUP: "playSoundPickup",
        PLAY_SOUND_MOVE: "playSoundMove",
        PLAY_SOUND_INFO_CLOSE: "playSoundInfoClose",
        PLAY_SOUND_INFO: "playSoundInfo",
        PLAY_SOUND_COLLECT: "playSoundCollect",
        PLAY_SOUND_FALL: "playSoundFall",
  },

  LEVEL_MSG: {
    LEVEL_ONE: ["Welcome to Digiddy Dog! (Tap here to dismiss)",
                "Object: clear all gems.",
                "How: Drag Digiddy over gems in the order shown by the pattern.",
                "Try it: tap or press the white dog and drag over 4 adjacent gems."],

    LEVEL_TWO: ["As you advance, patterns increase in complexity.",
                "On this level, the pattern is 'red, green, green, red'.",
                "The 'pattern' box on the right always shows the pattern for the level."],

    LEVEL_THREE:["You can earn combos by clearing consecutive patterns without swapping.",
               "Try it: clear two or more patterns without swapping adjacent gems."],

    LEVEL_FIVE: ["If a rock falls on Digiddy, he will lose a life."],

    LEVEL_NINE: ["Slabs are too heavy for Digiddy to move."],
  },

  LEVEL_MSG_ALT: {
    LEVEL_ONE:["If you get stuck, you can swap adjacent gems and rotate the board.",
               "To swap, tap above, below, left, or right of Digiddy.",
               "To rotate, drag around the outer circle."],
  },
};

tj.DigiddyDog.prototype.constants = {
  ROWS: 16,
  COLS: 16,
  CELL_SIZE_PX: {DESIRED: 64,
                 LARGE: 40,
                 MEDIUM: 32,
                 SMALL: 16},
  FONTS: {WHITE_64: null,
          WHITE_32: null,
          WHITE_20: null},
  BACK_COLOR: "#bbaa44",
  DIRT_COLOR: "#443300",
  COLOR_MISSING: "#ff00ff",
  FOCUS_CELL_COLOR: "white",
  ALPHA_BLACK: "rgba(0, 0, 0, 0.5)",
  STATUS_BLACK: "rgba(0, 0, 0, 0.8)",
  MARGIN_SCALE: 0.9,
  TYPE: {PLAYER: "dog",
         GEM: "gem",
         ROCK: "rock",
         SLAB: "slab"},
  MAX_CELLS_PER_PATH: 7,
  SWAP_TIME: 0.25,
  FALL_TIME: 0.15,
  ROTDIR: {CCW: "ccw",
           CW: "cw"},
  ROT_THRESH_PX: 20,
  ROT_TIME: 0.3,
  SPIN_TIME: 0.3,
  DROP_TEXT_OFFSET: 2,
  LOGO_MARGIN: 0,
  MESSAGE_WINDOW_WIDTH_FACTOR: 6.0 / 8.0,
  MESSAGE_WINDOW_HEIGHT_FACTOR: 1.0 / 6.0,
  STATUS_MESSAGE_ANCHOR_X_FACTOR: 0.8,
  STATUS_MESSAGE_ANCHOR_Y_FACTOR: 0.0,
  MESSAGE_WINDOW_HEIGHT_OFFSET: 1.0,
  ROT_CIRCLE_WIDTH: Math.round(tj.Graphics.width() * 1.0 / 33.0),
  ROT_CIRCLE_COLOR: "rgba(255, 255, 0, 0.25)",
  ROT_THRESH_DOT: Math.cos(Math.PI * 15.0 / 180.0),  // 15 degree tolerance 
  FORMAT_MARGIN: 0.95,
  RIGHT_GUI_SPACING: 2.5,

  DEFAULT_MAX_TYPE: 4,
  MAX_NORMAL_TILE_TYPE: 6,  // Normal tiles have indices 0-5
  DEFAULT_SPAWN_INTERVAL: 1.5,  // seconds
  BIG_TILE_TYPE: 6,
  BORDER_WIDTH: 4,
  MAX_SPEED: 4,     // MUST equal MAX_CELLS_PER_PATH
  DEFAULT_MOVE_TIME_MS: 500,
  DOUBLE_TAP_INTERVAL: 250, // ms
  MIN_DRAG_TIME_MS: 50,
  BACKGROUND_CELL_FACTOR: 3,
  DIR: {UNKNOWN: 99,
        NONE: 0,
        UP: -1,
        DOWN: 1,
        LEFT: -1,
        RIGHT: 1},
};

tj.DigiddyDog.prototype.gameInfo = {
  score: 0,
  comboMultiplier: 1,
};

tj.DigiddyDog.prototype.formatLevelMessages = function() {
  var key = null,
      i = 0,
      bounds = this.stateLevelTest.getStatusBoxBounds();

  this.levelMessages = {};
  this.levelMessagesAlt = {};

  for (key in this.strings.LEVEL_MSG) {
    if (this.strings.LEVEL_MSG[key]) {
      this.levelMessages[key] = [];
      for (i=0; i<this.strings.LEVEL_MSG[key].length; ++i) {
        this.levelMessages[key].push(this.formatMessage(this.strings.LEVEL_MSG[key][i], bounds, tj.DD.constants.FONTS.WHITE_32));
      }
    }
  }

  for (key in this.strings.LEVEL_MSG_ALT) {
    if (this.strings.LEVEL_MSG_ALT[key]) {
      this.levelMessagesAlt[key] = [];
      for (i=0; i<this.strings.LEVEL_MSG_ALT[key].length; ++i) {
        this.levelMessagesAlt[key].push(this.formatMessage(this.strings.LEVEL_MSG_ALT[key][i], bounds, tj.DD.constants.FONTS.WHITE_32));
      }
    }
  }
};

tj.DigiddyDog.prototype.formatMessage = function(strIn, bounds, font) {
  var i = 0,
      curStr = "",
      out = [],
      words = strIn ? strIn.match(/\S+/g) : null;
      spaceSize = font ? font.measureText(" ").width : {width:10, height: 10},
      strSize = font ? font.measureText("").width : {width:0, height: 0},
      wordSize = font ? font.measureText("").width : {width: 0, height: 0},
      maxWidth = bounds ? Math.round(bounds.w * tj.DD.constants.FORMAT_MARGIN) : 20;

  if (words && bounds && font) {
    for (i=0; i<words.length; ++i) {
      wordSize = font.measureText(words[i]).width;

      if (strSize === 0 || strSize + spaceSize + wordSize < maxWidth) {
        // Add the word.
        if (strSize === 0) {
          curStr = words[i];
        }
        else {
          curStr += " " + words[i];
        }
      }
      else {
        // Push the line and start a new one.
        out.push(curStr);
        curStr = words[i];
      }

      strSize = font.measureText(curStr).width;
    }

    if (curStr) {
      out.push(curStr);
    }
  }

  return out;
};

tj.DigiddyDog.prototype.drawLogo = function(gfx) {
  var x = 0,
      y = 0;

  if (gfx && this.logoImage) {
    x = tj.DD.constants.LOGO_MARGIN;
    y = tj.DD.constants.LOGO_MARGIN;
    this.logoImage.draw(gfx, x, y);
  }
};

tj.DigiddyDog.prototype.setFontLarge = function(theFont) {
  tj.DD.constants.FONTS.WHITE_64 = theFont;
};

tj.DigiddyDog.prototype.setFontMedium = function(theFont) {
  tj.DD.constants.FONTS.WHITE_32 = theFont;
};

tj.DigiddyDog.prototype.setFontSmall = function(theFont) {
  tj.DD.constants.FONTS.WHITE_20 = theFont;
};

tj.DigiddyDog.prototype.printLarge = function(gfx, text, x, y, hAlign, vAlign) {
  var i = 0,
      dy = 0,
      fontHeight = tj.DD.constants.FONTS.WHITE_64.heightForString(" ");

  if (text instanceof Array) {
    dy = Math.round(fontHeight * (text.length * 0.5 - 0.5));

    for (i=0; i<text.length; ++i) {
      tj.DD.constants.FONTS.WHITE_64.draw(gfx, text[i], x, y - dy + i * fontHeight , hAlign, vAlign);
    }
  }
  else {
    tj.DD.constants.FONTS.WHITE_64.draw(gfx, text, x, y, hAlign, vAlign);
  }
};

tj.DigiddyDog.prototype.printMedium = function(gfx, text, x, y, hAlign, vAlign) {
  var i = 0,
      dy = 0,
      fontHeight = tj.DD.constants.FONTS.WHITE_32.heightForString(" ");

  if (text instanceof Array) {
    dy = Math.round(fontHeight * (text.length * 0.5 - 0.5));

    for (i=0; i<text.length; ++i) {
      tj.DD.constants.FONTS.WHITE_32.draw(gfx, text[i], x, y - dy + i * fontHeight , hAlign, vAlign);
    }
  }
  else {
    tj.DD.constants.FONTS.WHITE_32.draw(gfx, text, x, y, hAlign, vAlign);
  }
};

tj.DigiddyDog.prototype.printSmall = function(gfx, text, x, y, hAlign, vAlign) {
  var i = 0,
      dy = 0,
      fontHeight = tj.DD.constants.FONTS.WHITE_20.heightForString(" ");

  if (text instanceof Array) {
    dy = Math.round(fontHeight * (text.length * 0.5 - 0.5));

    for (i=0; i<text.length; ++i) {
      tj.DD.constants.FONTS.WHITE_20.draw(gfx, text[i], x, y - dy + i * fontHeight , hAlign, vAlign);
    }
  }
  else {
    tj.DD.constants.FONTS.WHITE_20.draw(gfx, text, x, y, hAlign, vAlign);
  }
};

tj.DigiddyDog.prototype.startGame = function() {
  this.stateLevelTest = new tj.DigiddyDog.StateLevelTest(this, this.statusMsgAnchor);

  this.formatLevelMessages(this.stateLevelTest);

  this.gameInfo.score = 0;
  this.game.setState(this.stateLevelTest);
};

tj.DigiddyDog.prototype.playSoundRotate = function(dataIn) {
  if (this.rotateSound) {
    this.rotateSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundSquish = function(dataIn) {
  if (this.squishSound) {
    this.squishSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundPickup = function(dataIn) {
  if (this.pickupSound) {
    this.pickupSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundMove = function(dataIn) {
  if (this.moveSound) {
    this.moveSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundInfoClose = function(dataIn) {
  if (this.infoCloseSound) {
    this.infoCloseSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundInfo = function(dataIn) {
  if (this.infoSound) {
    this.infoSound.play();
  }  

  return true;
};

tj.DigiddyDog.prototype.playSoundCollect = function(dataIn) {
  if (this.collectSound) {
    this.collectSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.playSoundFall = function(dataIn) {
  if (this.fallSound) {
    this.fallSound.play();
  }

  return true;
};

tj.DigiddyDog.prototype.abortGame = function(errMsg) {
  this.game.setState(new tj.DigiddyDog.StateGameError(this, errMsg));
};

tj.DigiddyDog.prototype.setBlocksImage = function(blocksImage) {
  this.blocksImage = blocksImage;
};

tj.DigiddyDog.prototype.setHeadImage = function(headImage) {
  this.headImage = headImage;
};

tj.DigiddyDog.prototype.setLogoImage = function(logoImage) {
  this.logoImage = logoImage;
};

tj.DigiddyDog.prototype.setGemImages = function(gemsDesired, gemsLarge, gemsMedium, gemsSmall) {
  this.gemImages["" + tj.DD.constants.CELL_SIZE_PX.DESIRED] = gemsDesired;
  this.gemImages["" + tj.DD.constants.CELL_SIZE_PX.LARGE] = gemsLarge;
  this.gemImages["" + tj.DD.constants.CELL_SIZE_PX.MEDIUM] = gemsMedium;
  this.gemImages["" + tj.DD.constants.CELL_SIZE_PX.SMALL] = gemsSmall;

  tj.DigiddyDog.TileClass.setGemImages(this.gemImages);
};

tj.DigiddyDog.prototype.setPlayerImages = function(desired, large, medium, small) {
  this.playerImages["" + tj.DD.constants.CELL_SIZE_PX.DESIRED] = desired;
  this.playerImages["" + tj.DD.constants.CELL_SIZE_PX.LARGE] = large;
  this.playerImages["" + tj.DD.constants.CELL_SIZE_PX.MEDIUM] = medium;
  this.playerImages["" + tj.DD.constants.CELL_SIZE_PX.SMALL] = small;

  tj.DigiddyDog.TileClass.setPlayerImages(this.playerImages);
};

tj.DigiddyDog.prototype.setRockImages = function(desired, large, medium, small) {
  this.rockImages["" + tj.DD.constants.CELL_SIZE_PX.DESIRED] = desired;
  this.rockImages["" + tj.DD.constants.CELL_SIZE_PX.LARGE] = large;
  this.rockImages["" + tj.DD.constants.CELL_SIZE_PX.MEDIUM] = medium;
  this.rockImages["" + tj.DD.constants.CELL_SIZE_PX.SMALL] = small;

  tj.DigiddyDog.TileClass.setRockImages(this.rockImages);
};

tj.DigiddyDog.prototype.setCollectSound = function(sound) {
  this.collectSound = sound;
  if (this.collectSound) {
    this.collectSound.setVolume(0.1);
  }
};

tj.DigiddyDog.prototype.setFallSound = function(sound) {
  this.fallSound = sound;
};

tj.DigiddyDog.prototype.setInfoSound = function(sound) {
  this.infoSound = sound;
};

tj.DigiddyDog.prototype.setInfoCloseSound = function(sound) {
  this.infoCloseSound = sound;
};

tj.DigiddyDog.prototype.setMoveSound = function(sound) {
  this.moveSound = sound;
  if (this.moveSound) {
    this.moveSound.setVolume(0.1);
  }
};

tj.DigiddyDog.prototype.setPickupSound = function(sound) {
  this.pickupSound = sound;
};

tj.DigiddyDog.prototype.setSquishSound = function(sound) {
  this.squishSound = sound;
  if (this.squishSound) {
    this.squishSound.setVolume(0.25);
  }
};

tj.DigiddyDog.prototype.setRotateSound = function(sound) {
  this.rotateSound = sound;
};

tj.DigiddyDog.prototype.createBackBuffer = function() {
  this.backBuffer = tj.Graphics.newBuffer(tj.Graphics.width(), tj.Graphics.height() * tj.DD.constants.MARGIN_SCALE);

  return this.backBuffer;
};

tj.DigiddyDog.prototype.renderBackground = function(dimensions) {
  this.cellSize = dimensions.cellSize;
  this.drawBackBufferBackground(dimensions.rows, dimensions.cols);
};

tj.DigiddyDog.prototype.drawBackBufferBackground = function(nRows, nCols) {
  var rows = 0,
      cols = 0,
      iRow = 0,
      iCol = 0,
      x = 0,
      y = 0,
      r = 0,
      top = 0,
      left = 0,
      cellWidth = 0,
      cellHeight = 0,
      grad = null,
      gfx = null;

  // Draw the default background into the grid buffer.
  gfx = this.backBuffer.getContext('2d');
  if (gfx) {
    gfx.fillStyle = "#000000";
    gfx.beginPath();
    gfx.rect(0, 0, this.backBuffer.width, this.backBuffer.height);
    gfx.closePath();
    gfx.fill();

    rows = Math.round(this.backBuffer.height / (this.cellSize * tj.DD.constants.BACKGROUND_CELL_FACTOR));
    cols = Math.round(this.backBuffer.width / (this.cellSize * tj.DD.constants.BACKGROUND_CELL_FACTOR));
    cellWidth = Math.floor(this.backBuffer.width / cols);
    cellHeight = Math.floor(this.backBuffer.height / rows);

    gfx.fillStyle = tj.DD.constants.DIRT_COLOR;
    gfx.beginPath();

    for (iRow=0; iRow<rows; ++iRow) {
      top = Math.floor(this.backBuffer.height * iRow / rows);
      for (iCol=0; iCol<cols; ++iCol) {
        left = Math.floor(this.backBuffer.width * iCol / cols);

        if (Math.random() < 0.5) {
          // Sub-divide.
          this.drawBackgroundCell(gfx, left, top, cellWidth * 0.5, cellHeight * 0.5);
          this.drawBackgroundCell(gfx, left + cellWidth * 0.5, top, cellWidth * 0.5, cellHeight * 0.5);
          this.drawBackgroundCell(gfx, left, top + cellHeight * 0.5, cellWidth * 0.5, cellHeight * 0.5);
          this.drawBackgroundCell(gfx, left + cellWidth * 0.5, top + cellHeight * 0.5, cellWidth * 0.5, cellHeight * 0.5);
        }
        else {
          this.drawBackgroundCell(gfx, left, top, cellWidth, cellHeight);
        }
      }
    }

    gfx.closePath();
    gfx.fill();

    // Depth gradient.
    grad = gfx.createLinearGradient(0, 0, 0, this.backBuffer.height);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 1)");
    gfx.fillStyle = grad;
    gfx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);

    // Rotation circle.
    x = Math.round(this.backBuffer.width * 0.5);
    y = Math.round(this.backBuffer.height * 0.5);
    r = Math.round(Math.max(nRows, nCols) * this.cellSize * 0.5 * Math.sqrt(2));
    gfx.lineWidth = this.constants.ROT_CIRCLE_WIDTH;
    gfx.strokeStyle = this.constants.ROT_CIRCLE_COLOR;
    gfx.beginPath();
    gfx.arc(x, y, r + Math.round(gfx.lineWidth * 0.5), 0, 2.0 * Math.PI, true);
    gfx.closePath();
    gfx.stroke();

    if (this.headImage) {
      x = Math.round(this.headImage.width() * 0.1);
      y = this.backBuffer.height - this.headImage.height() - this.headImage.width() * 0.1;
      this.statusMsgAnchor.x = x + this.headImage.width() * tj.DD.constants.STATUS_MESSAGE_ANCHOR_X_FACTOR;
      this.statusMsgAnchor.y = this.backBuffer.height - this.headImage.height();
      this.headImage.draw(gfx, x, y);
    }
  }
};

tj.DigiddyDog.prototype.drawBackgroundCell = function(gfx, left, top, cellWidth, cellHeight) {
  var i = 0;

  for (i=0; i<4; ++i) {
    switch (i) {
      case 0:
        x = left + Math.floor(Math.random() * cellWidth * 0.5);
        y = top + Math.floor(Math.random() * cellHeight * 0.5);
        gfx.moveTo(x, y);
      break;

      case 1:
        x = left + Math.floor(cellWidth * 0.5 + Math.random() * cellWidth * 0.5);
        y = top + Math.floor(Math.random() * cellHeight * 0.5);
        gfx.lineTo(x, y);
      break;

      case 2:
        x = left + Math.floor(cellWidth * 0.5 + Math.random() * cellWidth * 0.5);
        y = top + Math.floor(cellHeight * 0.5 + Math.random() * cellHeight * 0.5);
        gfx.lineTo(x, y);
      break;

      case 3:
        x = left + Math.floor(Math.random() * cellWidth * 0.5);
        y = top + Math.floor(cellHeight * 0.5 + Math.random() * cellHeight * 0.5);
        gfx.lineTo(x, y);
      break;

      default:
      break;
    }
  }
};

tj.DigiddyDog.prototype.xToCol = function(x, left) {
  x = x - left;
  return Math.floor(x / (this.cellSize + tj.DD.constants.BORDER_WIDTH)); 
};

tj.DigiddyDog.prototype.yToRow = function(y, top) {
  y = y - top;
  return Math.floor(y / (this.cellSize + tj.DD.constants.BORDER_WIDTH)); 
};

// tj.DigiddyDog.prototype.colToX = function(col, left) {
//   var colWidth = Math.floor((this.backBuffer.width - tj.DD.constants.BORDER_WIDTH) / tj.DD.constants.COLS);
//   return left + colWidth * col + (colWidth + tj.DD.constants.BORDER_WIDTH) * 0.5;
// };

// tj.DigiddyDog.prototype.rowToY = function(row, top) {
//   var rowHeight = Math.floor((this.backBuffer.height - tj.DD.constants.BORDER_WIDTH) / tj.DD.constants.ROWS);
//   return top + rowHeight * row + (rowHeight + tj.DD.constants.BORDER_WIDTH) * 0.5;
// };


