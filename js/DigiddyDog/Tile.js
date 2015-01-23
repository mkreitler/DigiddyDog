// Represents a single tile on the board.
tj.DigiddyDog.Tile = function(type, row, col, x, y, color) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.offsetX = 0;
  this.offsetY = 0;
  this.color = color;
  this.dest = {row: -1, col: -1};
  this.setGridPos(row, col);
  this.bFalling = false;

  if (this.drawFns.hasOwnProperty(this.type)) {
    this.draw = this.drawFns[this.type];
  }
  else {
    this.draw = this.defaultDraw;
  }
};

// Prototype Functions ////////////////////////////////////////////////////////
tj.DigiddyDog.TileClass = tj.DigiddyDog.Tile.prototype;

tj.DigiddyDog.Tile.prototype.gemImages = null;
tj.DigiddyDog.Tile.prototype.rockImages = null;
tj.DigiddyDog.Tile.prototype.playerImages = null;

tj.DigiddyDog.Tile.prototype.setGemImages = function(images) {
  this.gemImages = images;
};

tj.DigiddyDog.Tile.prototype.setRockImages = function(images) {
  this.rockImages = images;
};

tj.DigiddyDog.Tile.prototype.setPlayerImages = function(images) {
  this.playerImages = images;
};

tj.DigiddyDog.Tile.prototype.getRow = function() {
  return this.row;
};

tj.DigiddyDog.Tile.prototype.getCol = function() {
  return this.col;
};

tj.DigiddyDog.Tile.prototype.getDestRow = function() {
  return this.dest.row;
};

tj.DigiddyDog.Tile.prototype.getDestCol = function() {
  return this.dest.col;
};

tj.DigiddyDog.Tile.prototype.setFalling = function() {
  this.bFalling = true;
};

tj.DigiddyDog.Tile.prototype.clearFalling = function() {
  this.bFalling = false;
};

tj.DigiddyDog.Tile.prototype.isFalling = function() {
  return this.bFalling;
};

tj.DigiddyDog.Tile.prototype.setOffset = function(x, y) {
  this.offsetX = x;
  this.offsetY = y;
};

tj.DigiddyDog.Tile.prototype.isDisplaced = function() {
  return this.row !== this.dest.row || this.col !== this.dest.col;
};

tj.DigiddyDog.Tile.prototype.isPassable = function() {
  return this.type === tj.DD.constants.TYPE.GEM ||
         this.type === tj.DD.constants.TYPE.ROCK;
};

tj.DigiddyDog.Tile.prototype.squishesPlayer = function() {
  return this.type === tj.DD.constants.TYPE.ROCK ||
         this.type === tj.DD.constants.TYPE.SLAB;
};

tj.DigiddyDog.Tile.prototype.getType = function() {
  return this.type;
};

tj.DigiddyDog.Tile.prototype.getColor = function() {
  return this.color;
};

tj.DigiddyDog.Tile.prototype.setColor = function(newColor) {
  this.color = newColor;
};

tj.DigiddyDog.Tile.prototype.wantsCollapse = function() {
  // TODO: set collapse behavior based on tile type.
  // FORNOW: all tiles want to collapse.
  return true;
};

tj.DigiddyDog.Tile.prototype.setGridPos = function(row, col) {
  this.row = row;
  this.col = col;

  this.setGridDest(row, col);
};

tj.DigiddyDog.Tile.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};

tj.DigiddyDog.Tile.prototype.setGridDest = function(row, col) {
  this.dest.row = row;
  this.dest.col = col;
};

tj.DigiddyDog.Tile.prototype.canSpin = function() {
  return this.type === tj.DD.constants.TYPE.GEM ||
                       tj.DD.constants.TYPE.ROCK ||
                       tj.DD.constants.TYPE.PLAYER;
};

tj.DigiddyDog.Tile.prototype.drawGem = function(gfx, cellSize) {
  var x = 0,
      y = 0,
      tileKey = null,
      srcY = 0,
      halfSize = Math.round(cellSize * 0.5);

  this.x += this.offsetX;
  this.y += this.offsetY;

  if (tj.DigiddyDog.TileClass.gemImages && tj.DigiddyDog.TileClass.gemImages["" + cellSize]) {
    x = this.x - halfSize;
    y = this.y - halfSize;
    tileKey = "" + cellSize;
    srcY = tj.DigiddyDog.TileClass.indexMap[this.color] * cellSize;
    tj.DigiddyDog.TileClass.gemImages[tileKey].drawRect(gfx, 0, srcY, cellSize, cellSize, x, y);
  }
  else {
    gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
    gfx.beginPath();
    gfx.moveTo(this.x, this.y - Math.round(cellSize * 0.5));
    gfx.lineTo(this.x + Math.round(cellSize * 0.25), this.y);
    gfx.lineTo(this.x, this.y + Math.round(cellSize * 0.5));
    gfx.lineTo(this.x - Math.round(cellSize * 0.25), this.y);
    gfx.closePath();
    gfx.fill();
  }

  this.x -= this.offsetX;
  this.y -= this.offsetY;
};

tj.DigiddyDog.Tile.prototype.drawDog = function(gfx, cellSize) {
  var x = 0,
      y = 0,
      tileKey = null,
      srcY = 0,
      halfSize = Math.round(cellSize * 0.5);

  this.x += this.offsetX;
  this.y += this.offsetY;

  if (tj.DigiddyDog.TileClass.playerImages && tj.DigiddyDog.TileClass.playerImages["" + cellSize]) {
    x = this.x - halfSize;
    y = this.y - halfSize;
    tileKey = "" + cellSize;
    srcY = cellSize;
    tj.DigiddyDog.TileClass.playerImages[tileKey].drawRect(gfx, 0, srcY, cellSize, cellSize, x, y);
  }
  else {
    gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
    gfx.strokeStyle = "#444444";
    gfx.lineWidth = 2;
    gfx.beginPath();
    gfx.arc(this.x, this.y, Math.round(cellSize * 0.4), 0, 2 * Math.PI, true);
    gfx.closePath();
    gfx.fill();
    gfx.stroke();
  }

  this.x -= this.offsetX;
  this.y -= this.offsetY;
};

tj.DigiddyDog.Tile.prototype.drawRock = function(gfx, cellSize) {
  var x = 0,
      y = 0,
      tileKey = null,
      srcY = 0,
      halfSize = Math.round(cellSize * 0.5);

  this.x += this.offsetX;
  this.y += this.offsetY;

  if (tj.DigiddyDog.TileClass.rockImages && tj.DigiddyDog.TileClass.rockImages["" + cellSize]) {
    x = this.x - halfSize;
    y = this.y - halfSize;
    tileKey = "" + cellSize;
    srcY = cellSize;
    tj.DigiddyDog.TileClass.rockImages[tileKey].drawRect(gfx, 0, srcY, cellSize, cellSize, x, y);
  }
  else {
    gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
    gfx.strokeStyle = "#aaaaaa";
    gfx.lineWidth = 2;
    gfx.beginPath();
    gfx.moveTo(this.x - Math.round(cellSize * 0.5 * 0.9), this.y + Math.round(cellSize * 0.5 * 0.9));
    gfx.lineTo(this.x + Math.round(cellSize * 0.5 * 0.9), this.y + Math.round(cellSize * 0.5 * 0.9));
    gfx.lineTo(this.x + Math.round(cellSize * 0.5 * 0.5), this.y - Math.round(cellSize * 0.5 * 0.1));
    gfx.lineTo(this.x - Math.round(cellSize * 0.5 * 0.5), this.y - Math.round(cellSize * 0.5 * 0.1));
    gfx.closePath();
    gfx.fill();
    gfx.stroke();
  }

  this.x -= this.offsetX;
  this.y -= this.offsetY;
};

tj.DigiddyDog.Tile.prototype.drawSlab = function(gfx, cellSize) {
  var x = 0,
      y = 0,
      tileKey = null,
      srcY = 0,
      halfSize = Math.round(cellSize * 0.5);

  this.x += this.offsetX;
  this.y += this.offsetY;

  if (tj.DigiddyDog.TileClass.rockImages && tj.DigiddyDog.TileClass.rockImages["" + cellSize]) {
    x = this.x - halfSize;
    y = this.y - halfSize;
    tileKey = "" + cellSize;
    srcY = 2 * cellSize;
    tj.DigiddyDog.TileClass.rockImages[tileKey].drawRect(gfx, 0, srcY, cellSize, cellSize, x, y);
  }
  else {
    gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
    gfx.strokeStyle = "#ffffff";
    gfx.lineWidth = 2;
    gfx.beginPath();
    gfx.moveTo(this.x - Math.round(cellSize * 0.5 * 0.67), this.y + Math.round(cellSize * 0.5 * 0.9));
    gfx.lineTo(this.x + Math.round(cellSize * 0.5 * 0.67), this.y + Math.round(cellSize * 0.5 * 0.9));
    gfx.lineTo(this.x + Math.round(cellSize * 0.5 * 0.67), this.y - Math.round(cellSize * 0.5 * 0.4));
    gfx.lineTo(this.x - Math.round(cellSize * 0.5 * 0.67), this.y - Math.round(cellSize * 0.5 * 0.4));
    gfx.closePath();
    gfx.fill();
    gfx.stroke();
  }

  this.x -= this.offsetX;
  this.y -= this.offsetY;
};

tj.DigiddyDog.Tile.prototype.drawFns = {gem: null, rock: null, dog: null};  // Keys MUST match tj.DD.constants.TYPE keys
tj.DigiddyDog.Tile.prototype.drawFns.gem = tj.DigiddyDog.Tile.prototype.drawGem;
tj.DigiddyDog.Tile.prototype.drawFns.dog = tj.DigiddyDog.Tile.prototype.drawDog;
tj.DigiddyDog.Tile.prototype.drawFns.rock = tj.DigiddyDog.Tile.prototype.drawRock;
tj.DigiddyDog.Tile.prototype.drawFns.slab = tj.DigiddyDog.Tile.prototype.drawSlab;

tj.DigiddyDog.Tile.prototype.colorMap = {r: "red",
                                         y: "yellow",
                                         g: "green",
                                         b: "blue",
                                         o: "orange",
                                         p: "purple",
                                         w: "white",
                                         e: "#555555",
                                         l: "black"};

tj.DigiddyDog.Tile.prototype.indexMap = {r: 1,
                                         g: 2,
                                         b: 3,
                                         y: 4,
                                         p: 5,
                                         o: 6};

