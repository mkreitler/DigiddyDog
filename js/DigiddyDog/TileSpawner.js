// Drops Tiles into the game world.
tj.DigiddyDog.TileSpawner = function(tileGridIn, colIn, widthIn, gridWidthIn, periodIn, distributionIn, updateFnIn) {
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

  tj.DigiddyDog.TileSpawner.addSpawner(this);
};

tj.DigiddyDog.TileSpawner.prototype.activate = function(bReset) {
  this.bActive = true;

  if (bReset) {
    this.reset();
  }
};

tj.DigiddyDog.TileSpawner.prototype.setMaxType = function(newMaxType) {
  this.maxType = newMaxType;
};

tj.DigiddyDog.TileSpawner.prototype.deactivate = function() {
  this.bActive = false;
};

tj.DigiddyDog.TileSpawner.prototype.reset = function() {
  this.spawnTimer = this.period;
};

tj.DigiddyDog.TileSpawner.prototype.update = function(dt) {
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

tj.DigiddyDog.TileSpawner.prototype.spawnTile = function() {
  var spawnCol = this.col + Math.floor(Math.random() * this.width),
      type = Math.floor(Math.random() * this.maxType),    // TODO: determine type of new block
      bMeta = false;  // TODO: determine bMeta of new block

  this.tileGrid.spawnTile(0, spawnCol, type, bMeta, false);
  this.flashTimer = this.SPAWN_FLASH_DURATION;
};

tj.DigiddyDog.TileSpawner.prototype.draw = function(gfx) {
  var colWidth = Math.floor((this.gridWidth - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.COLS),
      y = tj.DigiddyDog.TileSpawner.top,
      x = tj.DigiddyDog.TileSpawner.left + this.col * colWidth;

    gfx.strokeStyle = this.flashTimer > 0 ? "ffffff" : "#aaaaaa";
    gfx.fillStyle = this.flashTimer > 0 ? "#ffff00" : "#444444";
    gfx.beginPath();
    gfx.rect(x, y - colWidth, this.width * colWidth + tj.MB.constants.BORDER_WIDTH, colWidth + tj.MB.constants.BORDER_WIDTH);
    gfx.fill();
    gfx.stroke();
    gfx.closePath();
};

// Static Interface ///////////////////////////////////////////////////////////
tj.DigiddyDog.TileSpawner.spawners = [];
tj.DigiddyDog.TileSpawner.iSpawner = -1;
tj.DigiddyDog.TileSpawner.top = 0;
tj.DigiddyDog.TileSpawner.left = 0;

tj.DigiddyDog.TileSpawner.setTopLeft = function(top, left) {
  tj.DigiddyDog.TileSpawner.top = top;
  tj.DigiddyDog.TileSpawner.left = left;
};

tj.DigiddyDog.TileSpawner.addSpawner = function(newSpawner) {
  tj.DigiddyDog.TileSpawner.spawners.push(newSpawner);
};

tj.DigiddyDog.TileSpawner.removeSpawner = function(delSpawner) {
  tj.Utility.erase(tj.DigiddyDog.TileSpawner.spawners, delSpawner);
};

tj.DigiddyDog.TileSpawner.update = function(dt) {
  var spawner = null;

  for (spawner = tj.DigiddyDog.TileSpawner.getFirst(); spawner != null; spawner = tj.DigiddyDog.TileSpawner.getNext()) {
    spawner.update(dt);
  }
};

tj.DigiddyDog.TileSpawner.draw = function(gfx) {
  var spawner = null;

  for (spawner = tj.DigiddyDog.TileSpawner.getFirst(); spawner != null; spawner = tj.DigiddyDog.TileSpawner.getNext()) {
    spawner.draw(gfx);
  }
};

tj.DigiddyDog.TileSpawner.getFirst = function() {
  tj.DigiddyDog.TileSpawner.iSpawner = tj.DigiddyDog.TileSpawner.spawners.length > 0 ? 0 : -1;

  return tj.DigiddyDog.TileSpawner.iSpawner >= 0 ? tj.DigiddyDog.TileSpawner.spawners[tj.DigiddyDog.TileSpawner.iSpawner] : null;
};

tj.DigiddyDog.TileSpawner.getNext = function() {
  var next = null;

  if (tj.DigiddyDog.TileSpawner.iSpawner < tj.DigiddyDog.TileSpawner.spawners.length - 1) {
    tj.DigiddyDog.TileSpawner.iSpawner += 1;
    next = tj.DigiddyDog.TileSpawner.spawners[tj.DigiddyDog.TileSpawner.iSpawner];
  }

  return next;
};

tj.DigiddyDog.TileSpawner.flush = function() {
  tj.DigiddyDog.TileSpawner.spawners.length = 0;
}