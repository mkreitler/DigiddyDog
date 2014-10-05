tj.DigiddyDog.Path = function(colorIn) {
  var cells = [],
      color = colorIn,
      nCells = 0,
      active = false,

      // Rotation matrix is used to rotate the canvas when drawing the direction arrows
      // [[0,       vy = -1, 0      ],  // 
      //  [vx = -1, 0,       vx = +1],
      //  [0,       vy = +1, 0      ]]
      rotation = [[0,              0,       0],
                  [-Math.PI * 0.5, 0,       Math.PI * 0.5],
                  [0,              Math.PI, 0]           ];

      // Constants
      RADIUS_FACTOR = 0.33;

  this.isActive = function() {
    return active;
  };

  this.length = function() {
    return nCells;
  };

  this.rowAt = function(index) {
    return index >= 0 && index < nCells ? cells[index].row : -1;
  };

  this.colAt = function(index) {
    return index >= 0 && index < nCells ? cells[index].col : -1;
  };

  this.onCreate = function() {
    var i = 0;

    for (i=0; i<tj.DD.constants.MAX_CELLS_PER_PATH; ++i) {
      cells.push({row:-1, col:-1, dirX: tj.DD.constants.DIR.UNKNOWN, dirY: tj.DD.constants.DIR.UNKNOWN, speed: 1, bCollect: false});
    }
  };
  this.onCreate();

  this.indexOf = function(row, col) {
    var i = 0,
        index = -1;

    for (i=0; i<nCells; ++i) {
      if (cells[i].row === row && cells[i].col === col) {
        index = i;
        break;
      }
    }

    return i;
  };

  this.speedAtCell = function(iCell) {
    var newSpeed = 1;

    if (iCell >= 0 && iCell < nCells) {
      newSpeed = cells[iCell].speed;
    }

    return newSpeed;
  };

  this.xDirAtCell = function(iCell) {
    var newDir = tj.DD.constants.DIR.UNKNOWN;

    if (iCell >= 0 && iCell < nCells) {
      newDir = cells[iCell].dirX;
    }

    return newDir;
  };

  this.yDirAtCell = function(iCell) {
    var newDir = tj.DD.constants.DIR.UNKNOWN;
    
    if (iCell >= 0 && iCell < nCells) {
      newDir = cells[iCell].dirY;
    }

    return newDir;
  };

  this.reset = function() {
    var i = 0;

    for (i=0; i<cells.length; ++i) {
      cells[i].x = -1;
      cells[i].y = -1;
      cells[i].bCollect = false;
    }

    nCells = 0;
    active = false;
  };

  this.activate = function() {
    active = true;
  };

  this.deactivate = function() {
    active = false;
  };

  // Functions ////////////////////////////////////////////////////////////////
  this.truncateAtDuplicateCell = function(row, col) {
    var i = 0,
        bTruncated = false;

    for (i=0; i<nCells; ++i) {
      if (cells[i].row === row && cells[i].col === col) {
        nCells = i;

        // Reset remaining cells.
        for (i=i+1; i<cells.length; ++i) {
          cells[i].col = -1;
          cells[i].row = -1;
        }

        bTruncated = true;

        if (nCells === 0) {
          // Set semaphone indicated fully truncated path.
          nCells = -1;
        }
        break;
      }
    }

    return bTruncated;
  };

  this.truncateIfDuplicate = function(row, col) {
    // Look for an identical row/col entry at earlier points in the
    // cell. If found, delete all cells up to this one.
    var i=0;

    for (i=nCells - 1; i>=1; --i) {
      if (cells[i].row === row && cells[i].col === col) {
        cells[0].row = cells[nCells].row;
        cells[0].col = cells[nCells].col;
        cells[0].dirX = cells[nCells].dirX;
        cells[0].dirY = cells[nCells].dirY;
        nCells = 0;
        break;
      }
    }
  };

  this.rowAt = function(index) {
    var row = -1;

    if (index >= 0 && index < nCells) {
      row = cells[index].row;
    }

    return row;
  };

  this.colAt = function(index) {
    var col = -1;

    if (index >= 0 && index < nCells) {
      col = cells[index].col;
    }

    return col;
  };

  this.hasEntry = function(row, col) {
    var i = 0,
        bHasEntry = false;

    for (i=0; i<nCells; ++i) {
      if (cells[i].row === row && cells[i].col === col) {
        bHasEntry = true;
        break;
      }
    }

    return bHasEntry;
  };

  this.addCellRowCol = function(row, col, dirX, dirY) {
    var bAdded = false,
        bTruncated = false,
        i = 0,
        cellSpeed = 0;

    bTruncated = this.truncateAtDuplicateCell(row, col);
    if (!bAdded) {
      if (nCells < tj.DD.constants.MAX_CELLS_PER_PATH || bTruncated) {
        if (nCells >= 0) {
          cells[nCells].col = col;
          cells[nCells].row = row;

          if (dirX || dirY) {
            cells[nCells].dirX = dirX;
            cells[nCells].dirY = dirY;
          }
          else if (nCells > 0) {
            // Provide a default direction that points from the previous
            // cell to this one.
            cells[nCells].dirX = cells[nCells].col - cells[nCells - 1].col;
            cells[nCells].dirY = cells[nCells].row - cells[nCells - 1].row;
          }

          if (nCells > 0) {
            // Overwrite the default direction in the earlier cell so that
            // it points to this cell.
            cells[nCells - 1].dirX = cells[nCells].col - cells[nCells - 1].col;
            cells[nCells - 1].dirY = cells[nCells].row - cells[nCells - 1].row;

            cellSpeed = 0;
            for (i=nCells; i>0; --i) {
              if (cells[i - 1].dirX === cells[i].dirX &&
                  cells[i - 1].dirY === cells[i].dirY) {
                cellSpeed += 1;
              }
              else {
                break;
              }
            }

            cells[nCells].speed = Math.max(cellSpeed, 1);
            //    this.truncateIfDuplicate(row, col);
          }
          else {
            cells[nCells].speed = 1;
          }

          ++nCells;
          bAdded = true;
        }
        else {
          // The user has truncated the cell back to its root.
          // TODO: return a status code to reflect this?
          // Clear semaphore indicating complete truncation.
          nCells = 0;
        }
      }
    }

    return bAdded;
  };

  this.draw = function(gfx, cellIndex, cellSize) {
    var i = 0,
        x = 0,
        y = 0,
        cellDx = cellSize + tj.DD.constants.BORDER_WIDTH,
        cellDy = cellSize + tj.DD.constants.BORDER_WIDTH,
        halfSize = 0,
        fifthSize = 0,
        rot = 0,
        bDraw = active;

    if (active && cellIndex < nCells) {
      halfSize = Math.floor(cellDx - tj.DD.constants.BORDER_WIDTH) * 0.5;
      fifthSize = Math.round(halfSize * 2.0 / 5.0);

      gfx.save();
      gfx.globalAlpha = 0.5;

      gfx.fillStyle = color;
      i = cellIndex;
      x = Math.floor(cells[i].col * cellDx + cellDx * 0.5 + tj.DD.constants.BORDER_WIDTH * 0.5);
      y = Math.floor(cells[i].row * cellDy + cellDy * 0.5 + tj.DD.constants.BORDER_WIDTH * 0.5);

      rot = rotation[cells[i].dirY + 1][cells[i].dirX + 1];

      gfx.transform(1, 0, 0, 1, x, y);
      gfx.rotate(rot);

      gfx.beginPath();
      gfx.moveTo(0, -halfSize + fifthSize);
      gfx.lineTo(fifthSize, 2 * fifthSize);
      gfx.lineTo(-fifthSize, 2 * fifthSize);
      gfx.closePath();
      gfx.fill();

      gfx.rotate(-rot);
      gfx.transform(1, 0, 0, 1, -x, -y);

      gfx.restore();
    }
  }
};

