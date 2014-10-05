tj.MetaBlocks = function() {
  this.gridImage = null,
  this.blocksImage = null,
  this.gridBuffer = null;

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

  this.game.setState(new tj.MetaBlocks.StateResourceLoad(this));
  this.game.start();
};

tj.MetaBlocks.prototype.constants = {
  ROWS: 16,
  COLS: 16,
  DEFAULT_MAX_TYPE: 4,
  MAX_NORMAL_TILE_TYPE: 6,  // Normal tiles have indices 0-5
  DEFAULT_SPAWN_INTERVAL: 1.5,  // seconds
  BIG_TILE_TYPE: 6,
  BORDER_WIDTH: 4,
  MAX_CELLS_PER_PATH: 4,
  MAX_SPEED: 4,     // MUST equal MAX_CELLS_PER_PATH
  DEFAULT_MOVE_TIME_MS: 500,
  MIN_DRAG_TIME_MS: 50,
  DIR: {UNKNOWN: 99,
        NONE: 0,
        UP: -1,
        DOWN: 1,
        LEFT: -1,
        RIGHT: 1},
};

tj.MetaBlocks.prototype.startGame = function() {
  this.game.setState(new tj.MetaBlocks.StateLevelTest(this));
};

tj.MetaBlocks.prototype.abortGame = function(errMsg) {
  this.game.setState(new tj.MetaBlocks.StateGameError(this, errMsg));
};

tj.MetaBlocks.prototype.setGridImage = function(gridImage) {
  this.gridImage = gridImage;
};

tj.MetaBlocks.prototype.setBlocksImage = function(blocksImage) {
  this.blocksImage = blocksImage;
};

tj.MetaBlocks.prototype.createGridBuffer = function() {
  this.gridBuffer = tj.Graphics.newBuffer(this.gridImage.width(), this.gridImage.height());
  return this.gridBuffer;
};

tj.MetaBlocks.prototype.getGridImage = function() {
  return this.gridImage;
};

tj.MetaBlocks.prototype.xToCol = function(x, left) {
  x = x - left;
  return Math.max(0, Math.floor((x - tj.MB.constants.BORDER_WIDTH * 0.5) / (this.gridBuffer.width - tj.MB.constants.BORDER_WIDTH) * tj.MB.constants.COLS)); 
};

tj.MetaBlocks.prototype.yToRow = function(y, top) {
  y = y - top;
  return Math.max(0, Math.floor((y - tj.MB.constants.BORDER_WIDTH * 0.5) / (this.gridBuffer.height - tj.MB.constants.BORDER_WIDTH) * tj.MB.constants.ROWS)); 
};

tj.MetaBlocks.prototype.colToX = function(col, left) {
  var colWidth = Math.floor((this.gridBuffer.width - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.COLS);
  return left + colWidth * col + (colWidth + tj.MB.constants.BORDER_WIDTH) * 0.5;
};

tj.MetaBlocks.prototype.rowToY = function(row, top) {
  var rowHeight = Math.floor((this.gridBuffer.height - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.ROWS);
  return top + rowHeight * row + (rowHeight + tj.MB.constants.BORDER_WIDTH) * 0.5;
};


