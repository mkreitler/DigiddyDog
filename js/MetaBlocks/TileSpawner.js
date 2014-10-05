// Drops Tiles into the game world.
tj.MetaBlocks.TileSpawner = function(tileGridIn, colIn, widthIn, gridWidthIn, periodIn, distributionIn, updateFnIn) {
  var key = null;

  this.tileGrid = tileGridIn;
  this.col = colIn;
  this.width = widthIn;
  this.gridWidth = gridWidthIn;
  this.period = periodIn;
  this.distribution = distributionIn;
  this.spawnTimer = periodIn;
  this.bActive = false;
  this.totalWeight = 0;
  this.updateFn = updateFnIn,
  this.flashTimer = 0,
  this.maxType = tj.MB.constants.DEFAULT_MAX_TYPE;

  // Constants
  this.SPAWN_FLASH_DURATION = 0.1;

  if (distributionIn) {
    for (key in this.distribution) {
      this.totalWeight += key.weight || 0;
    }
  }

  tj.MetaBlocks.TileSpawner.addSpawner(this);
};

tj.MetaBlocks.TileSpawner.prototype.activate = function(bReset) {
  this.bActive = true;

  if (bReset) {
    this.reset();
  }
};

tj.MetaBlocks.TileSpawner.prototype.setMaxType = function(newMaxType) {
  this.maxType = newMaxType;
};

tj.MetaBlocks.TileSpawner.prototype.deactivate = function() {
  this.bActive = false;
};

tj.MetaBlocks.TileSpawner.prototype.reset = function() {
  this.spawnTimer = this.period;
};

tj.MetaBlocks.TileSpawner.prototype.update = function(dt) {
  var bDoSpawn = false,
      key = null,
      spawnWhich = 0;

  if (this.bActive) {
    // Perform custom update.
    if (this.updateFn) {
      this.updateFn(dt);
    }

    this.flashTimer = Math.max(0, this.flashTimer - dt);

    // Try to spawn.
    this.spawnTimer -= dt;
    bDoSpawn = this.spawnTimer <= 0;

    if (bDoSpawn) {
      spawnWhich = Math.floor(Math.random() * this.totalWeight);
      for (key in this.distribution) {
        spawnWhich -= key.weight || 0;
        if (spawnWhich <= 0) {
          this.spawnTile();
          break;
        }
      }
    }

    while (this.spawnTimer <= 0) {
      this.spawnTimer += this.period;
    }
  }
};

tj.MetaBlocks.TileSpawner.prototype.spawnTile = function() {
  var spawnCol = this.col + Math.floor(Math.random() * this.width),
      type = Math.floor(Math.random() * this.maxType),    // TODO: determine type of new block
      bMeta = false;  // TODO: determine bMeta of new block

  this.tileGrid.spawnTile(0, spawnCol, type, bMeta, false);
  this.flashTimer = this.SPAWN_FLASH_DURATION;
};

tj.MetaBlocks.TileSpawner.prototype.draw = function(gfx) {
  var colWidth = Math.floor((this.gridWidth - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.COLS),
      y = tj.MetaBlocks.TileSpawner.top,
      x = tj.MetaBlocks.TileSpawner.left + this.col * colWidth;

    gfx.strokeStyle = this.flashTimer > 0 ? "ffffff" : "#aaaaaa";
    gfx.fillStyle = this.flashTimer > 0 ? "#ffff00" : "#444444";
    gfx.beginPath();
    gfx.rect(x, y - colWidth, this.width * colWidth + tj.MB.constants.BORDER_WIDTH, colWidth + tj.MB.constants.BORDER_WIDTH);
    gfx.fill();
    gfx.stroke();
    gfx.closePath();
};

// Static Interface ///////////////////////////////////////////////////////////
tj.MetaBlocks.TileSpawner.spawners = [];
tj.MetaBlocks.TileSpawner.iSpawner = -1;
tj.MetaBlocks.TileSpawner.top = 0;
tj.MetaBlocks.TileSpawner.left = 0;

tj.MetaBlocks.TileSpawner.setTopLeft = function(top, left) {
  tj.MetaBlocks.TileSpawner.top = top;
  tj.MetaBlocks.TileSpawner.left = left;
};

tj.MetaBlocks.TileSpawner.addSpawner = function(newSpawner) {
  tj.MetaBlocks.TileSpawner.spawners.push(newSpawner);
};

tj.MetaBlocks.TileSpawner.removeSpawner = function(delSpawner) {
  tj.Utility.erase(tj.MetaBlocks.TileSpawner.spawners, delSpawner);
};

tj.MetaBlocks.TileSpawner.update = function(dt) {
  var spawner = null;

  for (spawner = tj.MetaBlocks.TileSpawner.getFirst(); spawner != null; spawner = tj.MetaBlocks.TileSpawner.getNext()) {
    spawner.update(dt);
  }
};

tj.MetaBlocks.TileSpawner.draw = function(gfx) {
  var spawner = null;

  for (spawner = tj.MetaBlocks.TileSpawner.getFirst(); spawner != null; spawner = tj.MetaBlocks.TileSpawner.getNext()) {
    spawner.draw(gfx);
  }
};

tj.MetaBlocks.TileSpawner.getFirst = function() {
  tj.MetaBlocks.TileSpawner.iSpawner = tj.MetaBlocks.TileSpawner.spawners.length > 0 ? 0 : -1;

  return tj.MetaBlocks.TileSpawner.iSpawner >= 0 ? tj.MetaBlocks.TileSpawner.spawners[tj.MetaBlocks.TileSpawner.iSpawner] : null;
};

tj.MetaBlocks.TileSpawner.getNext = function() {
  var next = null;

  if (tj.MetaBlocks.TileSpawner.iSpawner < tj.MetaBlocks.TileSpawner.spawners.length - 1) {
    tj.MetaBlocks.TileSpawner.iSpawner += 1;
    next = tj.MetaBlocks.TileSpawner.spawners[tj.MetaBlocks.TileSpawner.iSpawner];
  }

  return next;
};

tj.MetaBlocks.TileSpawner.flush = function() {
  tj.MetaBlocks.TileSpawner.spawners.length = 0;
}