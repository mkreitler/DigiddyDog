// Represents a single tile on the board.
tj.MetaBlocks.Tile = function() {
  this.type = 0;
  this.bMeta = false;
  this.dirX = 0;
  this.dirY = 0;
  this.bRooted = false;
  this.speed = 0;
  this.bWantsDelete = false;
  this.path = null;
  this.pathIndex = -1;
  this.bWantsFall = false;
  this.bMovedThisFrame = false;
  this.bGoal = false;
  this.bRoot = false;
  this.subTiles = [];
  this.DEBUGcolorsByType = ["red", "green", "blue", "yellow", "purple", "orange"];
};

// Prototype Functions ////////////////////////////////////////////////////////
tj.MetaBlocks.Tile.prototype.spawn = function(type, bMeta, x, y, dirX, dirY, speed, bGoal) {
  this.type = type;
  this.bMeta = bMeta;
  this.dirX = dirX;
  this.dirY = dirY;
  this.bRooted = false;
  this.speed = speed;
  this.bWantsDelete = false;
  this.path = null;
  this.pathIndex = -1;
  this.bWantsFall = false;
  this.bMovedThisFrame = false;
  this.bRoot = false;
  this.bGoal = bGoal;
  this.subTiles.length = 0;
};

tj.MetaBlocks.Tile.prototype.markAsRoot = function(bRoot) {
  this.bRoot = bRoot;
};

tj.MetaBlocks.Tile.prototype.isBigTile = function() {
  // TODO: make this more robust.
  return this.type === tj.MB.constants.BIG_TILE_TYPE;
};

tj.MetaBlocks.Tile.prototype.wantsDelete = function() {
  this.bWantsDelete = true;
};

tj.MetaBlocks.Tile.prototype.stick = function() {
  var i = 0;

  if (this.bGoal) {
    for(i=0; i<this.subTiles.length; ++i) {
      this.subTiles[i].stick();
    }
  }

  this.bRooted = true;
  this.path = null;
  this.bWantsFall = false;
};

tj.MetaBlocks.Tile.prototype.addSubTile = function(subTile) {
  this.subTiles.push(subTile);
};

tj.MetaBlocks.Tile.prototype.setPath = function(path, row, col) {
  this.path = path;
  this.pathIndex = path ? path.indexOf(row, col) : -1;
};

tj.MetaBlocks.Tile.prototype.checkCollapse = function(type) {
  return this.bRooted && !this.bWantsDelete && this.type === type;
};

tj.MetaBlocks.Tile.prototype.collapse = function() {
  this.bWantsDelete = true;
};

tj.MetaBlocks.Tile.prototype.unpath = function() {
  this.path = null;
  this.pathIndex = -1;
};

tj.MetaBlocks.Tile.prototype.drop = function() {
  var i = 0;

  if (this.bGoal) {
    for(i=0; i<this.subTiles.length; ++i) {
      this.subTiles[i].drop();
    }
  }

  this.speed = 1;
  this.dirX = tj.MB.constants.DIR.NONE;
  this.dirY = tj.MB.constants.DIR.DOWN;
  this.path = null;
  this.pathIndex = -1;
};

tj.MetaBlocks.Tile.prototype.startFall = function() {
  this.bWantsFall = true;
  this.speed = tj.MB.constants.MAX_SPEED;
  this.path = null;
  this.pathIndex = -1;
  this.dirX = tj.MB.constants.DIR.NONE;
  this.dirY = tj.MB.constants.DIR.DOWN;
};

tj.MetaBlocks.Tile.prototype.prepForMove = function() {
  this.bMovedThisFrame = false;
};

tj.MetaBlocks.Tile.prototype.moved = function() {
  var i = 0;

  if (this.bGoal) {
    for(i=0; i<this.subTiles.length; ++i) {
      this.subTiles[i].moved();
    }
  }

  this.bMovedThisFrame = true;
};

tj.MetaBlocks.Tile.prototype.speedFromPath = function() {
  if (this.path && this.pathIndex >= 0) {
    this.speed = this.path.speedAtCell(this.pathIndex);
  }
};

tj.MetaBlocks.Tile.prototype.dirFromPath = function() {
  var newDirX = 0,
      newDirY = 0;

  if (this.path && this.pathIndex >= 0) {
    newDirX = this.path.xDirAtCell(this.pathIndex);
    newDirY = this.path.yDirAtCell(this.pathIndex);

    if (newDirX != tj.MB.constants.DIR.UNKNOWN) {
      this.dirX = newDirX;
    }

    if (newDirY != tj.MB.constants.DIR.UNKNOWN) {
      this.dirY = newDirY;
    }
  }
};

tj.MetaBlocks.Tile.prototype.onPath = function() {
  return this.path != null;
};

tj.MetaBlocks.Tile.prototype.draw = function(gfx, x, y, dx, dy) {
  gfx.beginPath();
  if (this.bGoal) {
    if (this.bRoot) {
      gfx.fillStyle = "white";
      gfx.rect(x, y - dy - tj.MB.constants.BORDER_WIDTH, 2 * dx + tj.MB.constants.BORDER_WIDTH, 2 * dy + tj.MB.constants.BORDER_WIDTH);
      gfx.fill();
    }
  }
  else {
    gfx.fillStyle = this.DEBUGcolorsByType[this.type];
    gfx.rect(x, y, dx, dy);
    gfx.fill();
  }
  gfx.closePath();
};

