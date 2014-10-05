// Represents a grid of tiles.
tj.MetaBlocks.TileGrid = function(cellWidth, cellHeight) {
  var i = 0;

  this.rows = [];
  this.freeTiles = [];
  this.goalTiles = null;
  this.tilesInPlay = null;
  this.bigTiles = null;
  this.tick = [];
  this.cellWidth = cellWidth;
  this.cellHeight = cellHeight;
  this.updateState = this.updateTiles;
  this.collapseTick = 0;
  this.lastUpdate = null;

  this.buildGrid();

  for (i=0; i<tj.MB.constants.MAX_SPEED; ++i) {
    this.tick.push(0);
  }
};

// Prototype Functions ////////////////////////////////////////////////////////
tj.MetaBlocks.TileGrid.prototype.spawnTile = function(row, col, TODO_type, TODO_bMeta, bGoal) {
  var newTile = null;

  if (this.rows[row][col].tile) {
    // TODO: *** End Game ***
  }
  else {
    newTile = this.freeTiles.pop();
    if (newTile) {
      newTile.spawn(TODO_type, TODO_bMeta, tj.MB.colToX(col, 0), tj.MB.rowToY(row, 0), tj.MB.constants.DIR.NONE, tj.MB.constants.DIR.DOWN, 1, bGoal);
      this.rows[row][col].tile = newTile;      
      this.tilesInPlay.push(newTile);
    }
    else {
      // TODO: *** End Game *** (should never happen this way, though).
    }
  }

  return newTile;
};

tj.MetaBlocks.TileGrid.prototype.start = function(levelLayout) {
  var i = 0,
      goalTile = null,
      iRow = 0,
      iCol = 0;

  this.tilesInPlay = [];
  this.bigTiles = [];
  this.goalTiles = [];

  this.createLevel(levelLayout);

  for (i=0; i<this.tick.length; ++i) {
    this.tick[i] = 0;
  }
};

tj.MetaBlocks.TileGrid.prototype.createLevel = function(level) {
  var decoder = {a:0, b:1, c:2, d:3, e:4, f:5},
      rootTile = null;
  // TODO: read in a level layout and create the starting block configuration.
  for(iRow=0; iRow<level.length; ++iRow) {
    for(iCol=0; iCol<level[iRow].length; ++iCol) {
      switch(level[iRow][iCol]) {
        case '.': case '*':
          // Skip
        break;

        case 'a': case 'b':
        case 'c': case 'd':
        case 'e': case 'f':
          // Normal tile.
          this.spawnTile(iRow, iCol, decoder[level[iRow][iCol]], false, false);
        break;

        case '0': case '1':
        case '2': case '3':
          // Goal tile.
          if (iRow < this.rows.length - 1 && iCol < this.rows[iRow].length - 1) {
            rootTile = this.spawnTile(iRow + 1, iCol, tj.MB.constants.BIG_TILE_STYLE + level[iRow][iCol], false, true);
            this.rows[iRow + 1][iCol].tile.markAsRoot(true);

            rootTile.addSubTile(this.spawnTile(iRow, iCol, tj.MB.constants.BIG_TILE_STYLE + level[iRow][iCol], false, true));
            rootTile.addSubTile(this.spawnTile(iRow, iCol + 1, tj.MB.constants.BIG_TILE_STYLE + level[iRow][iCol], false, true));
            rootTile.addSubTile(this.spawnTile(iRow + 1, iCol + 1, tj.MB.constants.BIG_TILE_STYLE + level[iRow][iCol], false, true));

            this.goalTiles.push(this.rows[iRow][iCol].tile);
          }
        break;

        case 'A': case 'B':
        case 'C': case 'D':
        case 'E': case 'F':
          // Crested tile.
        break;

        default:
          // Do nothing.
        break;
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.suspend = function() {
  this.lastUpdate = this.update;
  this.update = this.updateSuspend;
};

tj.MetaBlocks.TileGrid.prototype.resume = function() {
  this.update = this.lastUpdate;
};

tj.MetaBlocks.TileGrid.prototype.update = function(dt) {
  this.updateState(dt);
};

tj.MetaBlocks.TileGrid.prototype.updateSuspend = function(dt) {
  return;
};

tj.MetaBlocks.TileGrid.prototype.updateCollapse = function(dt) {
  var tickThresh = 0,
      i = 0,
      bTicked = false,
      nTilesMoved = 0;

  bTicked = false;

  this.collapseTick += Math.round(dt * 1000);

  tickThresh = Math.round(tj.MB.constants.DEFAULT_MOVE_TIME_MS / tj.MB.constants.MAX_SPEED);
  while (this.collapseTick >= tickThresh) {
    nTilesMoved = this.moveFallingBlocks();
    bTicked = true;
    this.collapseTick -= tickThresh;
  } 

  if (bTicked) {
    if (nTilesMoved === 0) {
      if (this.checkCollapse()) {
        this.collapseTick = 0;
        this.update = this.updateCollapse;
        this.deleteBlocks();
      }
      else {
        this.update = this.updateTiles;
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.updateTiles = function(dt) {
  var tickThresh = 0,
      i = 0,
      bTicked = false,
      bAnyTick = false;

  tj.MetaBlocks.TileSpawner.update(dt);

  for (i=tj.MB.constants.MAX_SPEED - 1; i>=0; --i) {
    bTicked = false;

    this.tick[i] += Math.round(dt * 1000);

    tickThresh = Math.round(tj.MB.constants.DEFAULT_MOVE_TIME_MS / (i + 1));
    while (this.tick[i] >= tickThresh) {
      this.prepBlocksForMove();
      this.moveBlocks(i + 1);
      bTicked = true;
      bAnyTick = true;
      this.tick[i] -= tickThresh;
    } 

    if (bTicked) {
      if (this.checkCollapse()) {
        this.update = this.updateCollapse;
      }
      this.deleteBlocks();
    }
  }

  if (!bAnyTick) {
    this.assignPaths();
  }
};

tj.MetaBlocks.TileGrid.prototype.assignPaths = function() {
  var iRow = 0,
      iCol = 0,
      tile = null;

  for (iRow=0; iRow<this.rows.length; ++iRow) {
    for(iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      if (this.rows[iRow][iCol].tile && this.rows[iRow][iCol].tile && this.rows[iRow][iCol].tile.path === null) {
        this.rows[iRow][iCol].tile.setPath(this.rows[iRow][iCol].path, iRow, iCol);
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.checkCollapse = function() {
  var iRow = 0,
      iCol = 0,
      iSubRow = 0,
      iSubCol = 0,
      tile = null,
      bCheck = false,
      subTile = null,
      bFoundCollapseBlock = false,
      bWasCollapse = false,
      maxSize = 0,
      collapsed = [];

  for (iRow=0; iRow<this.rows.length - 1; ++iRow) {
    for (iCol=0; iCol<this.rows[iRow].length - 1; ++iCol) {
      tile = this.rows[iRow][iCol].tile;
      if (tile && tile.bRooted && !tile.bWantsDelete && !tile.bGoal) {
        // Check for sections of nxn like blocks.
        bCheck = true;
        bFoundCollapseBlock = false;
        bCheck = bCheck && (this.rows[iRow][iCol + 1].tile && this.rows[iRow][iCol + 1].tile.checkCollapse(tile.type));
        bCheck = bCheck && (this.rows[iRow + 1][iCol].tile && this.rows[iRow + 1][iCol].tile.checkCollapse(tile.type));
        bCheck = bCheck && (this.rows[iRow + 1][iCol + 1].tile && this.rows[iRow + 1][iCol + 1].tile.checkCollapse(tile.type));

        maxSize = 1;

        if (bCheck) {
          // We have at least a 2x2 square. Collapse it and all adjacent tiles of matching type.
          // this.collapseAdjacent(this.rows[iRow][iCol], collapsed);
          // this.dropNormal(collapsed);
          // this.dropGoals();
          // collapsed.length = 0;

          maxSize += 1;
          bCheck = false;

          if (iCol + maxSize < tj.MB.constants.COLS &&
              iRow + maxSize < tj.MB.constants.ROWS) {
            // Check outer column.
            iSubCol = iCol + maxSize;
            for (iSubRow=iRow; bCheck && iSubRow<=iRow+maxSize; ++iSubRow) {
              bCheck = bCheck && (this.rows[iSubRow][iSubCol].tile && this.rows[iSubRow][iSubCol].tile.type === tile.type);
            }

            // Check outer row.
            iSubRow = iRow + maxSize;
            for (iSubCol=iCol; bCheck && iSubCol<=iCol+maxSize; ++iSubCol) {
              bCheck = bCheck && (this.rows[iSubRow][iSubCol].tile && this.rows[iSubRow][iSubCol].tile.type === tile.type);
            }
          }
          else {
            // Exceeded grid size.
            break;
          }
        }

        if (bFoundCollapseBlock) {
          // We have found the largest homogeneous square with the tile as its upper left
          // corner. Tag everything inside it as awaiting deletion, and everything above
          // it as wanting to fall.
          for (iSubRow=iRow; iSubRow<iRow+maxSize; ++iSubRow) {
            for (iSubCol=iCol; iSubCol<iCol+maxSize; ++iSubCol) {
              this.rows[iSubRow][iSubCol].tile.collapse();
            }
          }

          for (iSubCol=iCol; iSubCol<iCol+maxSize; ++iSubCol) {
            // Set unsupported tiles above to fall.
            iSubRow = iRow - 1;
            while (iSubRow >= 0) {
              subTile = this.rows[iSubRow][iSubCol].tile;
              if (subTile && subTile.bRooted && !subTile.bWantsDelete) {
                if (subTile.bGoal) {
                  if (subTile.bRoot) {
                    if (iCol < iSubCol + maxSize - 1) {
                      subTile.startFall();
                      this.rows[iSubRow - 1][iSubCol].tile.startFall();
                      this.rows[iSubRow][iSubCol + 1].tile.startFall();
                      this.rows[iSubRow - 1][iSubCol + 1].tile.startFall();
                    }
                  }
                  else if (!subTile.bWantsFall) {
                    break;
                  }
                }
                subTile.startFall();
                iSubRow -= 1;
              }
              else {
                break;
              }
            }

            // Set unrooted tiles below to fall as well.
            iSubRow = iRow + 1;
            while (iSubRow < tj.MB.constants.ROWS) {
              subTile = this.rows[iSubRow][iSubCol].tile;
              if (subTile && !subTile.bRooted && !subTile.bWantsDelete) {
                if (subTile.bGoal) {
                  // Goal tiles are always rooted, unless collapsing, so
                  // we should never get here.
                  debugger;
                }
                else {
                  subTile.startFall();
                  iSubRow += 1;
                }
              }
              else {
                break;
              }
            }
          }


        }
      }

      // Skip past blocks already marked for collapse.
      if (bFoundCollapseBlock) {
        iCol += maxSize - 1;
      }
    }
  }

  return bWasCollapse;
};

tj.MetaBlocks.TileGrid.prototype.prepBlocksForMove = function() {
  var iBlock = 0;

  for (iBlock=0; iBlock<this.tilesInPlay.length; ++iBlock) {
    this.tilesInPlay[iBlock].prepForMove();
  }
};

tj.MetaBlocks.TileGrid.prototype.cancelPath = function(row, col) {
  var iRow = 0,
      iCol = 0,
      path = null;

  if (this.isValid(row, col) && this.rows[row][col].path) {
    path = this.rows[row][col].path;
    for (iRow = row - tj.MB.constants.MAX_CELLS_PER_PATH; iRow <= row + tj.MB.constants.MAX_CELLS_PER_PATH; ++iRow) {
      for (iCol = col - tj.MB.constants.MAX_CELLS_PER_PATH; iCol <= col + tj.MB.constants.MAX_CELLS_PER_PATH; ++iCol) {
        if (this.isValid(iRow, iCol) && this.rows[iRow][iCol].path === path) {
          this.rows[iRow][iCol].path = null;
          this.rows[iRow][iCol].pathIndex = -1;
        }
      }
    }

    path.deactivate();
  }
};

tj.MetaBlocks.TileGrid.prototype.draw = function(gfx, bShowFocus, focusRow, focusCol) {
  var x = 0,
      y = 0;

  for (iRow=this.rows.length - 1; iRow>=0; --iRow) {
    y = tj.MB.constants.BORDER_WIDTH + Math.floor(this.cellHeight * iRow);

    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      // DEBUG: draw path cells.
      // if (this.rows[iRow][iCol].path) {
      //   x = tj.MB.constants.BORDER_WIDTH + Math.floor(this.cellWidth * iCol);

      //   var color = this.rows[iRow][iCol].pathIndex === 0 ? "red" : (this.rows[iRow][iCol].pathIndex === 1 ? "green" : "blue");
      //   gfx.strokeStyle = color;
      //   gfx.lineWidth = 4;
      //   gfx.beginPath();
      //   gfx.rect(x, y, this.cellWidth - tj.MB.constants.BORDER_WIDTH, this.cellHeight - tj.MB.constants.BORDER_WIDTH);
      //   gfx.stroke();
      //   gfx.closePath();
      // }

      tile = this.rows[iRow][iCol].tile;

      if (tile) {
        x = tj.MB.constants.BORDER_WIDTH + Math.floor(this.cellWidth * iCol);
        tile.draw(gfx, x, y, this.cellWidth - tj.MB.constants.BORDER_WIDTH, this.cellHeight - tj.MB.constants.BORDER_WIDTH);
      }
    }
  }

  if (bShowFocus) {
    gfx.strokeStyle = "white";
    gfx.lineWidth = 4;
    gfx.beginPath();
    x = tj.MB.constants.BORDER_WIDTH + Math.floor(this.cellWidth * focusCol);
    y = tj.MB.constants.BORDER_WIDTH + Math.floor(this.cellHeight * focusRow);
    gfx.rect(x, y, this.cellWidth - tj.MB.constants.BORDER_WIDTH, this.cellHeight - tj.MB.constants.BORDER_WIDTH);
    gfx.stroke();
    gfx.closePath();
  }
};

tj.MetaBlocks.TileGrid.prototype.deleteBlocks = function() {
  for (iRow=this.rows.length - 1; iRow>=0; --iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      tile = this.rows[iRow][iCol].tile;
      if (tile && tile.bWantsDelete) {
        this.rows[iRow][iCol].tile = null;
        this.freeTiles.push(tile);
        tj.Utility.fastErase(this.tilesInPlay, tile);
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.moveFallingBlocks = function() {
  var nTilesMoved = 0;

  for (iRow=this.rows.length - 1; iRow>=0; --iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      tile = this.rows[iRow][iCol].tile;
      if (tile && tile.bWantsFall) {
        this.moveTile(0, tile, iRow, iCol);
        ++nTilesMoved;
      }
    }
  }

  return nTilesMoved;
};

tj.MetaBlocks.TileGrid.prototype.moveBlocks = function(speed) {
  for (iRow=this.rows.length - 1; iRow>=0; --iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      tile = this.rows[iRow][iCol].tile;
      if (tile && !tile.bRooted && !tile.bMovedThisFrame && !tile.bWantsDelete && tile.speed === speed) {
        this.moveTile(0, tile, iRow, iCol);
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.moveGoalTile = function(depth, rootTile, iRow, iCol) {
  var newRow = -1,
      newCol = -1,
      newRowPrime = -1,
      newColPrime = -1,
      newDirX = tj.MB.constants.DIR.NONE,
      newDirY = tj.MB.constants.DIR.NONE,
      otherTileLeft = null,
      otherTileRight = null,
      i = 0,
      bMoveSucceeded = false;

  depth += 1;
  if (depth > 10) {
    debugger;
  }

  newRow = iRow + tile.dirY;
  newCol = iCol + tile.dirX;

  tile.moved();

  if (newRow < 0 || newRow >= tj.MB.constants.ROWS ||
      newCol < 0 || newCol >= tj.MB.constants.COLS ||
      newCol + 1 >= tj.MB.constants.COLS) {
    // Stick at the edges of the play field.
    if (tile.dirX === tj.MB.constants.DIR.NONE && tile.dirY === tj.MB.constants.DIR.DOWN) {
      tile.stick();
    }
    else {
      newRow = iRow;
      newCol = iCol;
      tile.drop();
      this.moveTile(depth, tile, iRow, iCol);
    }
  }
  else if (this.rows[newRow][newCol].tile != null ||
           this.rows[newRow][newCol + 1].tile != null) {
    otherTileLeft = this.rows[newRow][newCol].tile;
    otherTileRight = this.rows[newRow][newCol + 1].tile;

    // When colliding with tiles...
    if (otherTileLeft.bRooted || otherTileRight.bRooted) {
      // ...stick, if either tile is stationary
      // (goal tiles only move down, so there's no need
      // to check drop cases)...
      tile.stick();
    }
    else if (otherTileLeft.bMovedThisFrame || otherTileRight.bMovedThisFrame) {
      // ...or either tile has already moved...
        tile.stick();
    }
    else {
      if (!otherTileLeft.bMovedThisFrame) {
        // Force the other tile to update.
        // What could possibly go wrong???
        this.moveTile(0, otherTileLeft, newRow, newCol);
      }

      if (!otherTileRight.bMovedThisFrame) {
        // Force the other tile to update.
        // What could possibly go wrong???
        this.moveTile(0, otherTileRight, newRow, newCol + 1);
      }

      // Then, try to move back into this space.
      this.moveTile(depth, tile, iRow, iCol);
    }
  }
  else {
    bMoveSucceeded = true;
  }

  if (bMoveSucceeded) {
    // Move into the next space.
    this.rows[newRow][newCol].tile = this.rows[iRow][iCol].tile;
    this.rows[newRow][newCol + 1].tile = this.rows[iRow][iCol + 1].tile;

    this.rows[iRow][newCol].tile = this.rows[iRow - 1][iCol].tile;
    this.rows[iRow][newCol + 1].tile = this.rows[iRow - 1][iCol + 1].tile;

    this.rows[iRow - 1][iCol].tile = null;
    this.rows[iRow - 1][iCol + 1].tile = null;
  }
};

tj.MetaBlocks.TileGrid.prototype.moveTile = function(depth, tile, iRow, iCol) {
  var newRow = -1,
      newCol = -1,
      newDirX = tj.MB.constants.DIR.NONE,
      newDirY = tj.MB.constants.DIR.NONE,
      otherTile = null,
      bMoveSucceeded = false;

  depth += 1;
  if (depth > 10) {
    debugger;
  }

  if (tile.bGoal) {
    if (tile.bRoot) {
      this.moveGoalTile(depth, tile, iRow, iCol);
    }
  }
  else {
    if (tile.path) {
      // Pathing, so take the direction from the path.
      tile.dirFromPath();
      tile.speedFromPath();
    }

    newRow = iRow + tile.dirY;
    newCol = iCol + tile.dirX;

    tile.moved();

    if (newRow < 0 || newRow >= tj.MB.constants.ROWS ||
        newCol < 0 || newCol >= tj.MB.constants.COLS) {
      // Stick at the edges of the play field.
      if (tile.dirX === tj.MB.constants.DIR.NONE && tile.dirY === tj.MB.constants.DIR.DOWN) {
        tile.stick();
      }
      else {
        newRow = iRow;
        newCol = iCol;
        tile.drop();
        this.moveTile(depth, tile, iRow, iCol);
      }
    }
    else if (this.rows[newRow][newCol].tile != null) {
      otherTile = this.rows[newRow][newCol].tile;

      // When colliding with a stationary tile...
      if (otherTile.bRooted) {
        if (tile.dirX === tj.MB.constants.DIR.NONE && tile.dirY === tj.MB.constants.DIR.DOWN) {
          // ...stick if we're falling...
          tile.stick();
        }
        else {
          // ...otherwise, start falling.
          newRow = iRow;
          newCol = iCol;
          tile.drop();
          this.moveTile(depth, tile, iRow, iCol);
        }
      }
      else {
        // ...compare speeds to see if we can avoid the collision.
        if (otherTile.bMovedThisFrame) {
          otherTile.wantsDelete();
          tile.wantsDelete();
        }
        else {
          // Force the other tile to update.
          // What could possibly go wrong???
          this.moveTile(0, otherTile, newRow, newCol);

          // Then, try to move back into this space.
          this.moveTile(depth, tile, iRow, iCol);
        }
      }
    }
    else {
      bMoveSucceeded = true;
    }

    if (bMoveSucceeded) {
      // Move into the next space.
      this.rows[iRow][iCol].tile = null;
      this.rows[newRow][newCol].tile = tile;

      // If the space contains a path, start following it.
      if (this.rows[newRow][newCol].path) {
        tile.setPath(this.rows[newRow][newCol].path, newRow, newCol);
      }
      else {
        tile.setPath(null);
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.removePath = function(path) {
  var iRow = 0,
      iCol = 0,
      nCells = 0;

  for (iRow=0; iRow<this.rows.length; ++iRow) {
    for (iCol=0; iCol<this.rows[iRow].length; ++iCol) {
      if (this.rows[iRow][iCol].path === path) {
        this.rows[iRow][iCol].path = null;
        this.rows[iRow][iCol].pathIndex = -1;
        ++nCells;

        if (nCells === tj.MB.constants.MAX_CELLS_PER_PATH) {
          iRow = this.rows.length;
          break;
        }
      }
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.tileAt = function(row, col) {
  var tile = null;

  if (this.isValid(row, col)) {
    tile = this.rows[row][col].tile;
  }

  return tile;
};

tj.MetaBlocks.TileGrid.prototype.isValid = function(row, col) {
  return row >= 0 && row < this.rows.length &&
         col >= 0 && col < this.rows[row].length;
};

tj.MetaBlocks.TileGrid.prototype.insertTile = function(tile) {
  var row = 0;
      col = 0,
      bInserted = false;

  if (tile) {
    row = tile.getRow();
    col = tile.getCol();

    if (this.isValid(row, col) && !this.rows[row][col].tile) {
      this.rows[row][col].tile = tile;
      bInserted = true;
    }
  }

  return bInserted;
};

tj.MetaBlocks.TileGrid.prototype.removeTile = function(tile) {
  var row = 0,
      col = 0,
      bRemoved = false;

  if (tile) {
    row = tile.getRow();
    col = tile.getCol();

    if (this.isValid(row, col) && this.rows[row][col].tile === tile) {
      this.rows[row][col].tile = null;
      bRemoved = true;
    }
  }
};

tj.MetaBlocks.TileGrid.prototype.isCellPathable = function(row, col) {
  // var bPathable = false;

  if (this.isValid(row, col)) {
//    bPathable = this.rows[row][col].tile === null;
    if (this.rows[row][col].tile) {
      this.rows[row][col].tile.unpath();
    }
  }

  // return bPathable;

  return true;
};

tj.MetaBlocks.TileGrid.prototype.addPathToBoard = function(path) {
  var i = 0,
      row = -1,
      col = -1,
      nCells = path.length();

  for (i=0; i<nCells; ++i) {
    row = path.rowAt(i);
    col = path.colAt(i);
    if (this.isValid(row, col)) {
      // Cancel any existing path.
      if (this.rows[row][col].path) {
        this.cancelPath(row, col);
      }

      // Put the new path into the cell.
      this.rows[row][col].path = path;
      this.rows[row][col].pathIndex = i;
    }
  }
}

tj.MetaBlocks.TileGrid.prototype.addPathToCell = function(path, row, col) {
  if (this.isValid(row, col)) {
    if (this.rows[row][col].path !== path) {
      this.cancelPath(row, col);
    }

    this.rows[row][col].path = path;
  }
};

tj.MetaBlocks.TileGrid.prototype.buildGrid = function() {
  var iRows = 0,
      iCols = 0;

  for (iRows=0; iRows<tj.MB.constants.ROWS; ++iRows) {
    this.rows.push([]);

    for (iCols=0; iCols<tj.MB.constants.COLS; ++iCols) {
      // Create a structure to track the tiles on the grid.
      this.rows[iRows].push({tile: null, path: null});

      // Create a free tile for placement into the grid.
      this.freeTiles.push(new tj.MetaBlocks.Tile());
    }
  }
};
