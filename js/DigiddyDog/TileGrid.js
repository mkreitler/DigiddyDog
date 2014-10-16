// Represents a grid of tiles.
tj.DigiddyDog.TileGrid = function(levelInfo) {
  var i = 0;

  this.rows = [];
  this.swapRows = [];
  this.cellSize = 0;
  this.gridBuffer = null;
  this.levelInfo = levelInfo;
  this.levelStatusIndex = 0;
  this.secondaryMessageIndex = -1;
  this.origin = {x: 0, y: 0, width: 0, height: 0};
  this.gravity = {x: 0, y: 1};
  this.pattern = null;
  this.patternStamp = new tj.DigiddyDog.Tile(tj.DD.constants.TYPE.GEM, 0, 0, 0, 0, 'r');
  this.moveInfo = {fromTile: null, toTile: null, elapsedTime: 0, leg: -1, path: null};
  this.rotInfo = {bWantsRotate: false, elapsedTime: 0, rotGoal: 0, rotAngle: 0};
  this.workTiles = [];
  this.bLevelComplete = false;
  this.nextToInfo = {row: -1, col: -1, x: 0, y: 0};
  this.pathCells = [];
  this.nRows = 0;
  this.nCols = 0;
  this.bPlayCollapseSound = true;
  this.bPlayerKilled = true;
  this.drawMetrics = {x:0, y:0, w:0, h:0, cellSize: 0, top: 0};

  // setUpdate must precede buildLevel because build level causes a
  // context shift in the main state that setUpdate undoes.
  this.setUpdate(this.updateDefault);

  this.buildLevel(levelInfo);

  for (i=0; i<tj.DD.constants.MAX_CELLS_PER_PATH; ++i) {
    this.pathCells.push({path: null, pathIndex: -1});
  }

  tj.Game.addListener(this, tj.DD.strings.MSG.STATUS_MESSAGE_DISMISSED);
};

// Prototype Functions ////////////////////////////////////////////////////////
tj.DigiddyDog.TileGrid.prototype.statusMessageDismissed = function(oldMsg) {
  if (this.levelInfo) {
    if (this.levelInfo.secondaryMessageKey && this.secondaryMessageIndex >= 0 && tj.DD.levelMessagesAlt[this.levelInfo.secondaryMessageKey].length > this.secondaryMessageIndex) {
      tj.Game.sendMessage(tj.DD.strings.MSG.ADD_STATUS_MESSAGE, tj.DD.levelMessagesAlt[this.levelInfo.secondaryMessageKey][this.secondaryMessageIndex]);
      this.secondaryMessageIndex += 1;
    }
    else if (this.levelInfo.messageKey && tj.DD.levelMessages[this.levelInfo.messageKey].length > this.levelStatusIndex) {
      tj.Game.sendMessage(tj.DD.strings.MSG.ADD_STATUS_MESSAGE, tj.DD.levelMessages[this.levelInfo.messageKey][this.levelStatusIndex]);
      this.levelStatusIndex += 1;
    }
    else {
      tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_INFO_CLOSE);
    }
  }
};

tj.DigiddyDog.TileGrid.prototype.setOrigin = function(x, y) {
  this.origin.x = x;
  this.origin.y = y;
};

tj.DigiddyDog.TileGrid.prototype.setUpdate = function(nextUpdate) {
  if (nextUpdate === this.updateDefault) {
    this.bPlayCollapseSound = true;
    tj.Game.sendMessage(tj.DD.strings.MSG.RESUME_PLAY, null);
  }

  this.update = nextUpdate;
};

tj.DigiddyDog.TileGrid.prototype.rotateBoard = function(rotDir) {
  this.rotInfo.elapsedTime = 0;
  this.rotInfo.rotGoal = rotDir === tj.DD.constants.ROTDIR.CW ? Math.PI * 0.5 : -Math.PI * 0.5;
  this.rotInfo.rotAngle = 0;
  this.rotInfo.bWantsRotate = true;
};

tj.DigiddyDog.TileGrid.prototype.consumeGems = function(path) {
  // Set up the structures that will move the player through
  // the path, collecting gems along the way.

  // This routine is called with a valid path, populated with
  // collectible tiles in the proper pattern, so we don't need
  // to verify any of that.
  this.moveInfo.path = path;
  this.moveInfo.leg = -1;

  this.setUpdate(this.nextLeg());
};

tj.DigiddyDog.TileGrid.prototype.nextLeg = function() {
  var nextUpdate = this.updateDefault,
      path = this.moveInfo.path,
      tile = null;

  if (path && this.moveInfo.leg < this.pattern.length - 1) {
    this.moveInfo.leg += 1;
    tile = this.rows[path.rowAt(this.moveInfo.leg)][path.colAt(this.moveInfo.leg)].tile;

    tj.assert(tile, "Can't find tile during nextLeg()!");

    tile.setGridDest(path.rowAt(this.moveInfo.leg + 1), path.colAt(this.moveInfo.leg + 1));
    this.moveInfo.fromTile = tile;
    this.moveInfo.elapsedTime = 0;

    nextUpdate = this.updateConsumeGems;

    tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_COLLECT);
  }
  else {
    // All legs complete.
    nextUpdate = this.collapse();
  }

  return nextUpdate;
};

tj.DigiddyDog.TileGrid.prototype.collapse = function() {
  var iRow = 0,
      iCol = 0,
      tile = null,
      bColCollapsing = false;
      bCollapsing = false,
      nGems = 0;

  // Check each column for collapse, and resolve if any collapse is found.
  for (iCol=0; iCol<this.rows[0].length; ++iCol) {
    // Check each column from the bottom up. If we find any spaces,
    // mark all objects above that point as wanting to collapse.
    bColCollapsing = false;
    for (iRow=this.rows.length - 1; iRow>=0; --iRow) {
      // If there is no tile, this column wants to collapse.
      tile = this.rows[iRow][iCol].tile;

      if (!tile) {
        bColCollapsing = true;
      }
      else {
        if (tile.getType() === tj.DD.constants.TYPE.GEM) {
          ++nGems;
        }

        // If the column wants to collapse...
        if (bColCollapsing) {
          // ...if there is a tile that wants to collapse...
          if (tile.wantsCollapse()) {
            // ...collapse it.
            bCollapsing = true;
            tile.setGridDest(tile.getRow() + 1, tile.getCol());
          }
          // ...if there is a tile that doesn't want to collapse,
          // prevent further collapse above it...
          else if (!tile.wantsCollapse()) {
            bColCollapsing = false;
          }
        }
      }
    }
  }

  this.moveInfo.elapsedTime = 0;
  this.bLevelComplete = nGems === 0;

  if (!bCollapsing) {
    this.sendSecondaryMessage();
  }
  else if (this.bPlayCollapseSound) {
    this.bPlayCollapseSound = false;
    tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_FALL);
  }

  return bCollapsing ? this.updateCollapse : this.updateDefault;
};

tj.DigiddyDog.TileGrid.prototype.movePlayer = function(fromRow, fromCol, toRow, toCol) {
  var fromTile = null,
      toTile = null;

  if (this.isValid(fromRow, fromCol) && this.isValid(toRow, toCol)) {
    fromTile = this.rows[fromRow][fromCol].tile;

    if (fromTile && fromTile.getType() === tj.DD.constants.TYPE.PLAYER) {
      fromTile.setGridDest(toRow, toCol);

      // toTile may be null if player is moving to
      // an unoccupied, adjacent square.
      toTile = this.rows[toRow][toCol].tile;
      if (toTile) {
        toTile.setGridDest(fromRow, fromCol);
      }

      this.moveInfo.fromTile = fromTile;
      this.moveInfo.toTile = toTile;
      this.moveInfo.elapsedTime = 0;
      this.setUpdate(this.updateSwapPlayerPosition);

      tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_MOVE);
    }
  }
};

tj.DigiddyDog.TileGrid.prototype.moveTile = function(tile, param, bReplace) {
  var xFrom = 0,
      yFrom = 0,
      xTo = 0,
      yTo = 0,
      x = 0,
      y = 0;

  if (tile) {
    xFrom = this.xLocalFromCol(tile.getCol());
    yFrom = this.yLocalFromRow(tile.getRow());
    xTo = this.xLocalFromCol(tile.getDestCol());
    yTo = this.yLocalFromRow(tile.getDestRow());

    x = xTo * param + xFrom * (1.0 - param);
    y = yTo * param + yFrom * (1.0 - param);

    tile.setPos(x, y);

    if (param >= 1.0 && bReplace) {
      tile.setGridPos(tile.getDestRow(), tile.getDestCol());
      this.rows[tile.getDestRow()][tile.getDestCol()].tile = tile;
    }
  }
};

tj.DigiddyDog.TileGrid.prototype.isPlayer = function(row, col) {
  var bIsPlayer = false;

  if (this.isValid(row, col)) {
    bIsPlayer = this.rows[row][col].tile && this.rows[row][col].tile.getType() === tj.DD.constants.TYPE.PLAYER;
  }

  return bIsPlayer;
};

tj.DigiddyDog.TileGrid.prototype.isNextToPlayer = function(row, col) {
  var result = null,
      iRow = 0,
      iCol = 0;

  for (iRow=row-1; iRow<=row+1; ++iRow) {
    for (iCol=col-1; iCol<=col+1; ++iCol) {
      if (Math.abs(iRow - row) + Math.abs(iCol - col) === 1 && this.isValid(iRow, iCol)) {
        if (this.isPlayer(iRow, iCol)) {
          this.nextToInfo.row = iRow;
          this.nextToInfo.col = iCol;
          this.nextToInfo.x = this.xLocalFromCol(iCol);
          this.nextToInfo.y = this.yLocalFromRow(iRow);
          result = this.nextToInfo;

          iRow = this.rows.length + 1;
          break;
        }
      }
    }
  }

  return result;
};

tj.DigiddyDog.TileGrid.prototype.draw = function(gfx) {
  if (gfx && this.gridBuffer) {
    this.drawGridBuffer();

    gfx.translate(this.origin.x, this.origin.y);
    if (this.rotInfo.bWantsRotate) {
      gfx.rotate(this.rotInfo.rotAngle);
    }

    gfx.drawImage(this.gridBuffer, -Math.round(this.gridBuffer.width * 0.5), -Math.round(this.gridBuffer.height * 0.5));

    if (this.rotInfo.bWantsRotate) {
      gfx.rotate(-this.rotInfo.rotAngle);
    }
    gfx.translate(-this.origin.x, -this.origin.y);
  }
};

tj.DigiddyDog.TileGrid.prototype.drawRightGUI = function(gfx, right, top) {
  var metrics = null;

  metrics = this.drawPattern(gfx, right, top);

  metrics = this.drawScore(gfx, metrics);

  metrics = this.drawCombo(gfx, metrics);
};

tj.DigiddyDog.TileGrid.prototype.drawCombo = function(gfx, metrics) {
  metrics.y = Math.round(metrics.top + 2 * tj.DD.constants.RIGHT_GUI_SPACING * metrics.cellSize);
  
  gfx.fillStyle = tj.DD.constants.ALPHA_BLACK;
  gfx.strokeStyle = "white";
  gfx.lineWidth = Math.round(tj.DD.constants.BORDER_WIDTH * 0.5);
  gfx.beginPath();
  gfx.rect(metrics.x, metrics.y, metrics.w, metrics.h);
  gfx.closePath();
  gfx.fill();
  gfx.stroke();

  tj.DD.printMedium(gfx,
                    tj.DD.strings.COMBO,
                    Math.round(metrics.x + metrics.w * 0.5),
                    Math.round(metrics.y + metrics.cellSize * 0.5));

  tj.DD.printMedium(gfx,
                    "x" + tj.DD.gameInfo.comboMultiplier,
                    Math.round(metrics.x + metrics.w * 0.5),
                    Math.round(metrics.y + metrics.cellSize * 1.5));

  return this.drawMetrics;
};

tj.DigiddyDog.TileGrid.prototype.drawScore = function(gfx, metrics) {
  metrics.y = Math.round(metrics.top + 0 * tj.DD.constants.RIGHT_GUI_SPACING * metrics.cellSize);

  gfx.fillStyle = tj.DD.constants.ALPHA_BLACK;
  gfx.strokeStyle = "white";
  gfx.lineWidth = Math.round(tj.DD.constants.BORDER_WIDTH * 0.5);
  gfx.beginPath();
  gfx.rect(metrics.x, metrics.y, metrics.w, metrics.h);
  gfx.closePath();
  gfx.fill();
  gfx.stroke();

  tj.DD.printMedium(gfx,
                    tj.DD.strings.SCORE,
                    Math.round(metrics.x + metrics.w * 0.5),
                    Math.round(metrics.y + metrics.cellSize * 0.5));

  tj.DD.printMedium(gfx,
                    "" + tj.DD.gameInfo.score,
                    Math.round(metrics.x + metrics.w * 0.5),
                    Math.round(metrics.y + metrics.cellSize * 1.5));

  return this.drawMetrics;
};

tj.DigiddyDog.TileGrid.prototype.drawPattern = function(gfx, right, top) {
  var i = 0,
      x = right,
      y = top,
      width = tj.Graphics.width() - this.origin.x + Math.round(this.origin.width * 0.5),
      cellSize = this.computeCellSize(width / this.pattern.length),
      left = right - width;

  y = Math.round(top + 1 * tj.DD.constants.RIGHT_GUI_SPACING * cellSize);
  x -= Math.round(cellSize * this.pattern.length + tj.DD.constants.BORDER_WIDTH);
  width = cellSize * this.pattern.length;

  this.drawMetrics.cellSize = cellSize;

  if (gfx && this.pattern) {
    gfx.fillStyle = tj.DD.constants.ALPHA_BLACK;
    gfx.strokeStyle = "white";
    gfx.lineWidth = Math.round(tj.DD.constants.BORDER_WIDTH * 0.5);
    gfx.beginPath();
    gfx.rect(x, y, width, 2 * cellSize);
    gfx.closePath();
    gfx.fill();
    gfx.stroke();

    this.drawMetrics.x = x;
    this.drawMetrics.w = width;
    this.drawMetrics.h = 2 * cellSize;

    y += Math.round(cellSize * 0.33);
//    tj.Graphics.print(gfx, tj.DD.strings.PATTERN, x + Math.round(width * 0.5), y, "white", tj.DD.constants.DROP_TEXT_OFFSET);
    tj.DD.printMedium(gfx, tj.DD.strings.PATTERN, x + Math.round(width * 0.5), y);
    y += cellSize;
    x += Math.round(cellSize * 0.5);

    for (i=0; i<this.pattern.length; ++i) {
      this.patternStamp.setPos(x, y);
      this.patternStamp.setColor(this.pattern.charAt(i));
      this.patternStamp.draw(gfx, cellSize);
      x += cellSize;
    }

    this.drawMetrics.top = top;
  }

  return this.drawMetrics;
};

tj.DigiddyDog.TileGrid.prototype.drawGridBuffer = function() {
  var gfx = this.gridBuffer.getContext('2d'),
      iRow = 0,
      iCol = 0,
      playerTile = null,
      nPathCells = 0;

  if (gfx) {
    // Draw background.
    gfx.clearRect(0, 0, this.gridBuffer.width, this.gridBuffer.height);
    gfx.beginPath();
    gfx.fillStyle = "rgba(0, 0, 0, 0.5)";
    gfx.fillRect(0, 0, this.gridBuffer.width, this.gridBuffer.height);
    gfx.closePath();

    // Draw gems, and rocks.
    for (iRow=0; iRow<this.rows.length; ++iRow) {
      for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
        if (this.rows[iRow][iCol].tile) {
          if (this.rows[iRow][iCol].tile.getType() === tj.DD.constants.TYPE.PLAYER) {
            playerTile = this.rows[iRow][iCol].tile;
          }
          else {
            this.rows[iRow][iCol].tile.draw(gfx, this.cellSize);
          }
        }

        if (this.rows[iRow][iCol].path && this.rows[iRow][iCol].path.isActive()) {
          this.pathCells[nPathCells].path = this.rows[iRow][iCol].path;
          this.pathCells[nPathCells++].pathIndex = this.rows[iRow][iCol].pathIndex;
        }
      }
    }

    // Draw the player.
    if (playerTile) {
      playerTile.draw(gfx, this.cellSize);
    }

    // Draw the path.
    for (i=0; i<nPathCells; ++i) {
      this.pathCells[i].path.draw(gfx, this.pathCells[i].pathIndex, this.cellSize);
    }

    // Draw frame.
    gfx.beginPath();
    gfx.strokeStyle = "white";
    gfx.lineWidth = tj.DD.constants.BORDER_WIDTH;
    gfx.rect(0, 0, this.gridBuffer.width, this.gridBuffer.height);
    gfx.closePath();
    gfx.stroke();
  }
};

tj.DigiddyDog.TileGrid.prototype.buildLevel = function(levelInfo) {
  var rows = 3,
      cols = 3,
      pattern = "rrrr",
      playerStart = {row: 1, col: 1},
      width = 0,
      height = 0,
      iRow = 0,
      iCol = 0,
      cells = [],
      i = 0,
      iCell = 0,
      nGems = 0,
      nRocks = 0,
      nSolidRocks = 0,
      cell = null,
      bRandomLevel = true,
      statusMessage = null;

  rows = this.levelInfo ? this.levelInfo.rows || rows : rows;
  cols = this.levelInfo ? this.levelInfo.cols || cols : cols;
  pattern = this.levelInfo ? this.levelInfo.pattern || pattern : pattern;
  bRandomLevel = this.levelInfo ? this.levelInfo.bRandomLevel || false : true;
  nSolidRocks = this.levelInfo ? this.levelInfo.solidRocks || 0 : 0;

  if (this.levelInfo && this.levelInfo.messageKey) {
    this.levelStatusIndex = 1;
    statusMessage = tj.DD.levelMessages[levelInfo.messageKey][0];
  }
  else {
    statusNessage = null;
  }

  tj.Game.sendMessage(tj.DD.strings.MSG.ADD_STATUS_MESSAGE, statusMessage);

  this.createGridBuffer(rows, cols);

  this.pattern = pattern;

  if (bRandomLevel) {
    this.buildGrid(rows, cols);

    // Build a list of cells.
    for (iRow=0; iRow<rows; ++iRow) {
      for (iCol=0; iCol<cols; ++iCol) {
        cells.push({row: iRow, col:iCol});
      }
    }

    // Randomly distribute items throughout the cells.
    nGems = Math.floor(rows * cols / pattern.length) * pattern.length;
    if ((rows * cols) % pattern.length === 0) {
      nGems = Math.max(nGems - pattern.length, pattern.length);
    }
    nRocks = Math.max(0, rows * cols - nGems - nSolidRocks - 1);
    nSolidRocks = Math.max(0, rows * cols - nGems - nRocks - 1);

    for (i=0; i<nGems; ++i) {
      iCell = Math.floor(Math.random() * cells.length);
      cell = cells[iCell];
      x = this.xLocalFromCol(cell.col);
      y = this.yLocalFromRow(cell.row);

      this.rows[cell.row][cell.col].tile = new tj.DigiddyDog.Tile(tj.DD.constants.TYPE.GEM, cell.row, cell.col, x, y, pattern[i % pattern.length]);
      tj.Utility.fastErase(cells, cell);
    }

    // Add rocks, if any.
    for (i=0; i<nRocks; ++i) {
      iCell = Math.floor(Math.random() * cells.length);
      cell = cells[iCell];
      x = this.xLocalFromCol(cell.col);
      y = this.yLocalFromRow(cell.row);

      this.rows[cell.row][cell.col].tile = new tj.DigiddyDog.Tile(tj.DD.constants.TYPE.ROCK, cell.row, cell.col, x, y, "e");
      tj.Utility.fastErase(cells, cell);
    }

    for (i=0; i<nSolidRocks; ++i) {
      iCell = Math.floor(Math.random() * cells.length);
      cell = cells[iCell];
      x = this.xLocalFromCol(cell.col);
      y = this.yLocalFromRow(cell.row);

      this.rows[cell.row][cell.col].tile = new tj.DigiddyDog.Tile(tj.DD.constants.TYPE.SLAB, cell.row, cell.col, x, y, "l");
      tj.Utility.fastErase(cells, cell);
    }

    // Place player.
    cell = cells[0];
    x = this.xLocalFromCol(cell.col);
    y = this.yLocalFromRow(cell.row);
    this.rows[cell.row][cell.col].tile = new tj.DigiddyDog.Tile(tj.DD.constants.TYPE.PLAYER, cell.row, cell.col, x, y, "w");
  }

  this.bLevelComplete = false;
  this.bPlayerKilled = false;
  this.rotInfo.bWantsRotate = false;
  this.secondaryMessageIndex = -1;
  this.bPlayCollapseSound = true;
};

tj.DigiddyDog.TileGrid.prototype.updateDefault = function(dt) {
  if (this.bPlayerKilled) {
    tj.Game.sendMessage(tj.Game.MESSAGES.PLAYER_DIED);
  }
  else if (this.rotInfo.bWantsRotate) {
    tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_ROTATE);
    this.setUpdate(this.updateRotateBoard);
  }
  else if (this.bLevelComplete) {
    // TODO: signal end of level.
    tj.Game.sendMessage(tj.Game.MESSAGES.LEVEL_COMPLETE);
  }
};

tj.DigiddyDog.TileGrid.prototype.updateSwapPlayerPosition = function(dt) {
  var moveParam = 0,
      i = 0,
      tile = null;

  // Move the player to the adjacent space, swapping with the object that
  // occupies that space, if necessary.
  this.moveInfo.elapsedTime += dt;
  moveParam = tj.MathEx.trigTransition(Math.min(this.moveInfo.elapsedTime / tj.DD.constants.SWAP_TIME, 1.0));

  for (i=0; i<2; ++i) {
    if (i === 0) {
      tile = this.moveInfo.fromTile;
    }
    else {
      tile = this.moveInfo.toTile;
    }

    this.moveTile(tile, moveParam, false);
  }

  if (this.moveInfo.elapsedTime >= tj.DD.constants.SWAP_TIME) {
    // Collapse or resume normal updates.
    if (this.moveInfo.toTile) {
      this.moveInfo.toTile.setGridPos(this.moveInfo.toTile.getDestRow(), this.moveInfo.toTile.getDestCol());
      this.rows[this.moveInfo.toTile.getRow()][this.moveInfo.toTile.getCol()].tile = this.moveInfo.toTile;
    }
    else {
      this.rows[this.moveInfo.fromTile.getRow()][this.moveInfo.fromTile.getCol()].tile = null;
    }

    this.moveInfo.fromTile.setGridPos(this.moveInfo.fromTile.getDestRow(), this.moveInfo.fromTile.getDestCol());
    this.rows[this.moveInfo.fromTile.getRow()][this.moveInfo.fromTile.getCol()].tile = this.moveInfo.fromTile;

    this.setUpdate(this.collapse());
  }
};

tj.DigiddyDog.TileGrid.prototype.updateConsumeGems = function(dt) {
  var moveParam = 0,
      tile = null;

  // Move the player along the full path, consuming gems along the way.
  this.moveInfo.elapsedTime += dt;
  moveParam = tj.MathEx.trigTransition(Math.min(this.moveInfo.elapsedTime / tj.DD.constants.SWAP_TIME, 1.0));
  tile = this.moveInfo.fromTile;

  tj.assert(tile, "Invalid tile in updateConsumeGems!");

  this.moveTile(tile, moveParam, false);

  if (this.moveInfo.elapsedTime >= tj.DD.constants.SWAP_TIME) {
    // TODO: something when a gem is consumed?
    this.rows[tile.getRow()][tile.getCol()].tile = null;
    this.rows[tile.getDestRow()][tile.getDestCol()].tile = tile;
    tile.setGridPos(tile.getDestRow(), tile.getDestCol());

    this.setUpdate(this.nextLeg());
  };
};

tj.DigiddyDog.TileGrid.prototype.updateRotateBoard = function(dt) {
  var param = 0,
      iRow = 0,
      iCol = 0,
      tile = null;

  // Rotate the board.
  this.rotInfo.elapsedTime += dt;
  param = tj.MathEx.trigTransition(Math.min(this.rotInfo.elapsedTime / tj.DD.constants.ROT_TIME, 1.0));

  this.rotInfo.rotAngle = this.rotInfo.rotGoal * param;

  if (this.rotInfo.elapsedTime >= tj.DD.constants.ROT_TIME) {
    // Reposition board elements based on rotation.
    if (this.rotInfo.rotGoal < 0) {
      // Counter-clockwise rotation.
      // Mapping: (row, col) -> (ROW_MAX - col, row)

      for (iRow=0; iRow<this.rows.length; ++iRow) {
        for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
          this.swapRows[this.swapRows.length - 1 - iCol][iRow] = this.rows[iRow][iCol];
        }
      }
    }
    else {
      // Clockwise rotation.
      // Mapping: (row, col) -> (col, COL_MAX - row)

      for (iRow=0; iRow<this.rows.length; ++iRow) {
        for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
          this.swapRows[iCol][this.swapRows[iRow].length - 1 - iRow] = this.rows[iRow][iCol];
        }
      }
    }

    // Copy cell configuration back into the grid.
    for (iRow=0; iRow<this.rows.length; ++iRow) {
      for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
        this.rows[iRow][iCol] = this.swapRows[iRow][iCol];
        if (this.rows[iRow][iCol].tile) {
          tile = this.rows[iRow][iCol].tile;
          tile.setGridPos(iRow, iCol);
          tile.setPos(this.xLocalFromCol(iCol), this.yLocalFromRow(iRow));
        }
      }
    }

    // TODO(?): set bWantsRotate = false in the draw routine after
    // the grid has rendered at least once at full rotation.

    // Reset rotation parameters.
    this.rotInfo.bWantsRotate = false;
    this.rotInfo.rotGoal = 0;
    this.rotAngle = 0;
    this.rotInfo.bWantsRotate = false;

    // Resolve resulting collapse.
    this.setUpdate(this.collapse());
  }
};

tj.DigiddyDog.TileGrid.prototype.updateCollapse = function(dt) {
  var iRow = 0,
      iCol = 0,
      i = 0,
      tile = null,
      param = 0,
      playerTile = null;

  // Make everything fall.
  this.moveInfo.elapsedTime += dt;
  param = Math.min(this.moveInfo.elapsedTime / tj.DD.constants.FALL_TIME, 1.0);

  for (iRow=this.rows.length - 1; iRow >= 0; --iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      tile = this.rows[iRow][iCol].tile;
      if (tile && tile.isDisplaced()) {
        this.moveTile(tile, param, false);
        tile.setFalling();
      }

      // Mark the player tile.
      if (!playerTile && tile && tile.getType() === tj.DD.constants.TYPE.PLAYER) {
        playerTile = tile;
      }
    }
  }

  if (this.moveInfo.elapsedTime >= tj.DD.constants.FALL_TIME) {
    // Start by emptying the grid.
    for (iRow=this.rows.length - 1; iRow >= 0; --iRow) {
      for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
        tile = this.rows[iRow][iCol].tile;
        if (tile) {
          this.workTiles.push(tile);
          this.rows[iRow][iCol].tile = null;
        }
      }
    }

    // Then update their positions and rebuild the grid.
    for (i=0; i<this.workTiles.length; ++i) {
      tile = this.workTiles[i];
      tile.setGridPos(tile.getDestRow(), tile.getDestCol());
      this.rows[tile.getRow()][tile.getCol()].tile = tile;
    }

    // Regenerate the grid with the tiles in their new positions.
    this.checkForPlayerDeath(playerTile);

    // Clear the 'falling' state for all tiles.
    for (iRow=this.rows.length - 1; iRow >= 0; --iRow) {
      for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
        tile = this.rows[iRow][iCol].tile;
        if (tile) {
          tile.clearFalling();
        }
      }
    }

    this.workTiles.length = 0;

    this.sendSecondaryMessage();

    // See if anything still needs to collapse.
    this.setUpdate(this.collapse());
  }
};

tj.DigiddyDog.TileGrid.prototype.sendSecondaryMessage = function() {
  if (this.levelInfo &&
      this.levelInfo.secondaryMessageKey &&
      this.secondaryMessageIndex < 0 &&
      tj.DD.levelMessagesAlt[this.levelInfo.secondaryMessageKey].length > 0) {
    tj.Game.sendMessage(tj.DD.strings.MSG.ADD_STATUS_MESSAGE, tj.DD.levelMessagesAlt[this.levelInfo.secondaryMessageKey][0]);
    this.secondaryMessageIndex = 1;
  }
};

tj.DigiddyDog.TileGrid.prototype.checkForPlayerDeath = function(playerTile) {
  var playerRow = 0,
      playerCol = 0,
      tileAbove = null;

  if (playerTile) {
    playerRow = playerTile.getRow();
    playerCol = playerTile.getCol();

    if (this.isValid(playerRow - 1, playerCol)) {
      tileAbove = this.rows[playerRow - 1][playerCol].tile;
      if (tileAbove && tileAbove.squishesPlayer() && tileAbove.isFalling()) {
        if (!this.bPlayerKilled) {
          tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_SQUISH);
        }

        // Player was hit from above by a rock.
        this.bPlayerKilled = true;
      }
    }
  }
};

tj.DigiddyDog.TileGrid.prototype.isValid = function(row, col) {
  return row >= 0 && row < this.rows.length &&
         col >= 0 && col < this.rows[row].length;
};

tj.DigiddyDog.TileGrid.prototype.addPathToCell = function(row, col, path, pathIndex) {
  if (this.isValid(row, col)) {
    this.rows[row][col].path = path;
    this.rows[row][col].pathIndex = pathIndex;
  }
};

tj.DigiddyDog.TileGrid.prototype.xLeft = function() {
  return Math.round(this.origin.x - this.origin.width * 0.5);
};

tj.DigiddyDog.TileGrid.prototype.yTop = function() {
  return Math.round(this.origin.y - this.origin.height * 0.5);
};

tj.DigiddyDog.TileGrid.prototype.origin = function() {
  return this.origin;
};

tj.DigiddyDog.TileGrid.prototype.removePath = function() {
  var iRow = 0,
      iCol = 0;

  for (iRow=0; iRow<this.rows.length; ++iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      this.rows[iRow][iCol].path = null;
      this.rows[iRow][iCol].pathIndex = -1;
    }
  }
};

tj.DigiddyDog.TileGrid.prototype.patternLength = function() {
  return this.pattern.length;
};

tj.DigiddyDog.TileGrid.prototype.isCellPathable = function(row, col, pathIndex) {
  // TODO: implment this as follows:
  // Cell is pathable if it a) falls within the grid,
  //                        b) Contains a gem
  //                        c) Contained gem is proper color

  // FORNOW: allowing pathing through all cells.
  var tile = this.isValid(row, col) ? this.rows[row][col].tile : null,
      patternIndex = Math.max(0, pathIndex - 1);

  return pathIndex === 0 ||
         (pathIndex === 1 && (!tile || tile.isPassable())) ||
         (tile && tile.isPassable() && patternIndex < this.pattern.length && tile.getType() === tj.DD.constants.TYPE.GEM && tile.getColor() === this.pattern.charAt(patternIndex));
};

tj.DigiddyDog.TileGrid.prototype.getOrigin = function() {
  return this.origin;
};

tj.DigiddyDog.TileGrid.prototype.xLocalFromCol = function(col) {
  return Math.round(tj.DD.constants.BORDER_WIDTH + this.cellSize * 0.5) +
         col * (tj.DD.constants.BORDER_WIDTH + this.cellSize);
};

tj.DigiddyDog.TileGrid.prototype.yLocalFromRow = function(row) {
  return Math.round(tj.DD.constants.BORDER_WIDTH + this.cellSize * 0.5) +
         row * (tj.DD.constants.BORDER_WIDTH + this.cellSize);
};

tj.DigiddyDog.TileGrid.prototype.xFromCol = function(col) {
  return this.origin.x - Math.round(this.origin.width * 0.5) +
         Math.round(tj.DD.constants.BORDER_WIDTH + this.cellSize * 0.5) +
         col * (tj.DD.constants.BORDER_WIDTH + this.cellSize);
};

tj.DigiddyDog.TileGrid.prototype.yFromRow = function(row) {
  return this.origin.y - Math.round(this.origin.height * 0.5) +
         Math.round(tj.DD.constants.BORDER_WIDTH + this.cellSize * 0.5) +
         row * (tj.DD.constants.BORDER_WIDTH + this.cellSize);
};

tj.DigiddyDog.TileGrid.prototype.getCellSize = function() {
  return this.cellSize;
};

tj.DigiddyDog.TileGrid.prototype.computeCellSize = function(desiredSize) {
  var cellSize = desiredSize;

  if (cellSize >= tj.DD.constants.CELL_SIZE_PX.DESIRED) {
    cellSize = tj.DD.constants.CELL_SIZE_PX.DESIRED;
  }
  else if (cellSize >= tj.DD.constants.CELL_SIZE_PX.LARGE) {
    cellSize = tj.DD.constants.CELL_SIZE_PX.LARGE;
  }
  else if (cellSize > tj.DD.constants.CELL_SIZE_PX.MEDIUM) {
    cellSize = tj.DD.constants.CELL_SIZE_PX.MEDIUM;
  }
  else {
    cellSize = tj.DD.constants.CELL_SIZE_PX.SMALL;
  }

  return cellSize;
};

tj.DigiddyDog.TileGrid.prototype.createGridBuffer = function(rows, cols) {
  var xScale = 1,
      yScale = 1,
      cellSize = 1,
      scale = 1;

  this.origin.width = cols * (tj.DD.constants.CELL_SIZE_PX.DESIRED + tj.DD.constants.BORDER_WIDTH) + tj.DD.constants.BORDER_WIDTH;
  this.origin.height = rows * (tj.DD.constants.CELL_SIZE_PX.DESIRED + tj.DD.constants.BORDER_WIDTH) + tj.DD.constants.BORDER_WIDTH;

  xScale = tj.Graphics.width() * tj.DD.constants.MARGIN_SCALE / this.origin.width;
  yScale = tj.Graphics.height() * tj.DD.constants.MARGIN_SCALE / this.origin.height;

  scale = Math.min(xScale, yScale);
  scale = Math.min(scale, 1.0);

  this.cellSize = this.computeCellSize(tj.DD.constants.CELL_SIZE_PX.DESIRED * scale);
  
  this.origin.width = cols * (this.cellSize + tj.DD.constants.BORDER_WIDTH) + tj.DD.constants.BORDER_WIDTH;
  this.origin.height = rows * (this.cellSize + tj.DD.constants.BORDER_WIDTH) + tj.DD.constants.BORDER_WIDTH;

  this.gridBuffer = tj.Graphics.newBuffer(this.origin.width, this.origin.height);
};

tj.DigiddyDog.TileGrid.prototype.width = function() {
  return this.gridBuffer ? this.gridBuffer.width : 0;
};

tj.DigiddyDog.TileGrid.prototype.height = function() {
  return this.gridBuffer ? this.gridBuffer.height : 0;
};

tj.DigiddyDog.TileGrid.prototype.getNumRows = function() {
  return this.nRows;
};

tj.DigiddyDog.TileGrid.prototype.getNumCols = function() {
  return this.nCols;
};

tj.DigiddyDog.TileGrid.prototype.buildGrid = function(rows, cols) {
  var iRows = 0,
      iCols = 0;

  tj.assert(rows <= tj.DD.constants.ROWS, "Too many rows in buildGrid!");
  tj.assert(cols <= tj.DD.constants.COLS, "Too many columns in buildGrid!");

  this.nRows = rows;
  this.nCols = cols;

  for (iRows=0; iRows<rows; ++iRows) {
    this.rows.push([]);
    this.swapRows.push([]);

    for (iCols=0; iCols<cols; ++iCols) {
      // Create a structure to track the tiles on the grid.
      this.rows[iRows].push({tile: null, path: null});
      this.swapRows[iRows].push(null);
    }
  }
};
