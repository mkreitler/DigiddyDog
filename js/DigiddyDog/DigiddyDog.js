tj.DigiddyDog = function() {
  this.blocksImage = null,
  this.backBuffer = null;

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

  this.game.setState(new tj.DigiddyDog.StateResourceLoad(this));
  this.game.start();
};

tj.DigiddyDog.prototype.strings = {
  YOU_DIED: "You Died",
  LEVEL_PREFIX: "Level",
  READY: "Ready",
};

tj.DigiddyDog.prototype.constants = {
  ROWS: 16,
  COLS: 16,
  CELL_SIZE_PX: 40,
  BACK_COLOR: "#bbaa44",
  DIRT_COLOR: "#443300",
  COLOR_MISSING: "#ff00ff",
  FOCUS_CELL_COLOR: "white",
  TYPE: {PLAYER: "dog",
         GEM: "gem",
         ROCK: "rock",
         SOLID_ROCK: "solidRock"},
  MAX_CELLS_PER_PATH: 7,
  SWAP_TIME: 0.25,
  FALL_TIME: 0.15,
  ROTDIR: {CCW: "ccw",
           CW: "cw"},
  ROT_THRESH_PX: 20,
  ROT_TIME: 0.3,
  DROP_TEXT_OFFSET: 2,

  DEFAULT_MAX_TYPE: 4,
  MAX_NORMAL_TILE_TYPE: 6,  // Normal tiles have indices 0-5
  DEFAULT_SPAWN_INTERVAL: 1.5,  // seconds
  BIG_TILE_TYPE: 6,
  BORDER_WIDTH: 4,
  MAX_SPEED: 4,     // MUST equal MAX_CELLS_PER_PATH
  DEFAULT_MOVE_TIME_MS: 500,
  MIN_DRAG_TIME_MS: 50,
  BACKGROUND_CELL_FACTOR: 6,
  DIR: {UNKNOWN: 99,
        NONE: 0,
        UP: -1,
        DOWN: 1,
        LEFT: -1,
        RIGHT: 1},
};

tj.DigiddyDog.prototype.startGame = function() {
  this.game.setState(new tj.DigiddyDog.StateLevelTest(this));
};

tj.DigiddyDog.prototype.abortGame = function(errMsg) {
  this.game.setState(new tj.DigiddyDog.StateGameError(this, errMsg));
};

tj.DigiddyDog.prototype.setBlocksImage = function(blocksImage) {
  this.blocksImage = blocksImage;
};

tj.DigiddyDog.prototype.createBackBuffer = function() {
  this.backBuffer = tj.Graphics.newBuffer(tj.Graphics.width(), tj.DD.constants.ROWS * tj.DD.constants.CELL_SIZE_PX);

  return this.backBuffer;
};

tj.DigiddyDog.prototype.drawBackBufferBackground = function() {
  var rows = 0,
      cols = 0,
      iRow = 0,
      iCol = 0,
      x = 0,
      y = 0,
      top = 0,
      left = 0,
      cellWidth = 0,
      cellHeight = 0,
      gfx = null;

  // Draw the default background into the grid buffer.
  gfx = this.backBuffer.getContext('2d');
  if (gfx) {
    gfx.fillStyle = "#000000";
    gfx.beginPath();
    gfx.rect(0, 0, this.backBuffer.width, this.backBuffer.height);
    gfx.closePath();
    gfx.fill();

    rows = Math.round(this.backBuffer.height / (tj.DD.constants.CELL_SIZE_PX * tj.DD.constants.BACKGROUND_CELL_FACTOR));
    cols = Math.round(this.backBuffer.width / (tj.DD.constants.CELL_SIZE_PX * tj.DD.constants.BACKGROUND_CELL_FACTOR));
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
  return Math.floor(x / (tj.DD.constants.CELL_SIZE_PX + tj.DD.constants.BORDER_WIDTH)); 
};

tj.DigiddyDog.prototype.yToRow = function(y, top) {
  y = y - top;
  return Math.floor(y / (tj.DD.constants.CELL_SIZE_PX + tj.DD.constants.BORDER_WIDTH)); 
};

// tj.DigiddyDog.prototype.colToX = function(col, left) {
//   var colWidth = Math.floor((this.backBuffer.width - tj.DD.constants.BORDER_WIDTH) / tj.DD.constants.COLS);
//   return left + colWidth * col + (colWidth + tj.DD.constants.BORDER_WIDTH) * 0.5;
// };

// tj.DigiddyDog.prototype.rowToY = function(row, top) {
//   var rowHeight = Math.floor((this.backBuffer.height - tj.DD.constants.BORDER_WIDTH) / tj.DD.constants.ROWS);
//   return top + rowHeight * row + (rowHeight + tj.DD.constants.BORDER_WIDTH) * 0.5;
// };


