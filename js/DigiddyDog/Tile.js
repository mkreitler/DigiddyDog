// Represents a single tile on the board.
tj.DigiddyDog.Tile = function(type, row, col, x, y, color) {
  this.type = type;
  this.x = x;
  this.y = y;
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

tj.DigiddyDog.Tile.prototype.isDisplaced = function() {
  return this.row !== this.dest.row || this.col !== this.dest.col;
};

tj.DigiddyDog.Tile.prototype.isPassable = function() {
  return this.type === tj.DD.constants.TYPE.GEM ||
         this.type === tj.DD.constants.TYPE.ROCK;
};

tj.DigiddyDog.Tile.prototype.squishesPlayer = function() {
  return this.type === tj.DD.constants.TYPE.ROCK ||
         this.type === tj.DD.constants.TYPE.SOLID_ROCK;
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

tj.DigiddyDog.Tile.prototype.drawGem = function(gfx) {
  gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
  gfx.beginPath();
  gfx.moveTo(this.x, this.y - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5));
  gfx.lineTo(this.x + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.25), this.y);
  gfx.lineTo(this.x, this.y + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5));
  gfx.lineTo(this.x - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.25), this.y);
  gfx.closePath();
  gfx.fill();
};

tj.DigiddyDog.Tile.prototype.drawDog = function(gfx) {
  gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
  gfx.strokeStyle = "#444444";
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.arc(this.x, this.y, Math.round(tj.DD.constants.CELL_SIZE_PX * 0.4), 0, 2 * Math.PI, true);
  gfx.closePath();
  gfx.fill();
  gfx.stroke();
};

tj.DigiddyDog.Tile.prototype.drawRock = function(gfx) {
  gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
  gfx.strokeStyle = "#aaaaaa";
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.moveTo(this.x - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9), this.y + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9));
  gfx.lineTo(this.x + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9), this.y + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9));
  gfx.lineTo(this.x + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.5), this.y - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.1));
  gfx.lineTo(this.x - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.5), this.y - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.1));
  gfx.closePath();
  gfx.fill();
  gfx.stroke();
};

tj.DigiddyDog.Tile.prototype.drawSolidRock = function(gfx) {
  gfx.fillStyle = this.colorMap[this.color] || tj.DD.constants.MISSING_COLOR;
  gfx.strokeStyle = "#ffffff";
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.moveTo(this.x - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.67), this.y + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9));
  gfx.lineTo(this.x + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.67), this.y + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.9));
  gfx.lineTo(this.x + Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.67), this.y - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.4));
  gfx.lineTo(this.x - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.67), this.y - Math.round(tj.DD.constants.CELL_SIZE_PX * 0.5 * 0.4));
  gfx.closePath();
  gfx.fill();
  gfx.stroke();
};

tj.DigiddyDog.Tile.prototype.drawFns = {gem: null, rock: null, dog: null};  // Keys MUST match tj.DD.constants.TYPE keys
tj.DigiddyDog.Tile.prototype.drawFns.gem = tj.DigiddyDog.Tile.prototype.drawGem;
tj.DigiddyDog.Tile.prototype.drawFns.dog = tj.DigiddyDog.Tile.prototype.drawDog;
tj.DigiddyDog.Tile.prototype.drawFns.rock = tj.DigiddyDog.Tile.prototype.drawRock;
tj.DigiddyDog.Tile.prototype.drawFns.solidRock = tj.DigiddyDog.Tile.prototype.drawSolidRock;

tj.DigiddyDog.Tile.prototype.colorMap = {r: "red",
                                         y: "yellow",
                                         g: "green",
                                         b: "blue",
                                         o: "orange",
                                         p: "purple",
                                         w: "white",
                                         e: "#555555",
                                         l: "black"};

