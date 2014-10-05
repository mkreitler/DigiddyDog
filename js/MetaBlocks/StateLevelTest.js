tj.MetaBlocks.StateLevelTest = function(gameIn) {
  var game = gameIn,
      gridImage = gameIn.getGridImage(),
      gridBuffer = null,
      paths = null,
      pathStart = {row:0, col:0},
      lastCell = {row:0, col:0},
      gridTopLeft = {x:0, y:0},
      curPath = null,
      bDrawingPath = false,
      bWantsPath = false,
      pathsCreated = 0,
      testSpawner = null,
      tileGrid = null,
      bDragged = false,
      lastPos = {x:0, y:0},
      inputStartTime = 0,
      focusCell = {bActive: false, row: -1, col: -1};

      // Constants
      NUM_PATHS = 3,
      PATH_COLORS = "5af",
      TEST_LEVEL = [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".......0*.......",
        ".......**.......",
        "......bacb......",
        "......bacb......",
        "......ddbb......",
        "......ddbb......",
      ];      
      // TEST_LEVEL = [
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   "................",
      //   ".......0*.......",
      //   ".......**.......",
      //   "......abcd......",
      //   "......bcda......",
      //   "......cdab......",
      //   "......dabc......",
      // ];      

  this.enter = function() {
    if (!gridBuffer) {
      gridBuffer = gameIn.createGridBuffer();

      gridTopLeft.x = Math.round(tj.Graphics.width() * 0.5 - gridBuffer.width * 0.5);
      gridTopLeft.y = Math.round(tj.Graphics.height() * 0.5 - gridBuffer.height * 0.5);
    }

    if (!tileGrid) {
      tileGrid = new tj.MetaBlocks.TileGrid(Math.floor((gridBuffer.width - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.COLS),
                                            Math.floor((gridBuffer.height - tj.MB.constants.BORDER_WIDTH) / tj.MB.constants.ROWS));
      tileGrid.start(TEST_LEVEL);
    }

    if (!testSpawner) {
      testSpawner = new tj.MetaBlocks.TileSpawner(tileGrid, 0, tj.MB.constants.COLS, gridBuffer.width, tj.MB.constants.DEFAULT_SPAWN_INTERVAL, {1: {weight: 1, block: null}}, null);
      tj.MetaBlocks.TileSpawner.setTopLeft(gridTopLeft.y, gridTopLeft.x);
      testSpawner.activate();
    }

    tj.MusicMixer.randomize(true);
    tj.MusicMixer.start();

    this.createPaths();
  };

  this.createPaths = function() {
    var i = 0,
        j = 0,
        color = null;

    paths = [];
    pathsCreated = 0;

    for (i=0; i<NUM_PATHS; ++i) {
      color = PATH_COLORS[i];
      color = "#" + color + color + color + color + color + color;
      paths.push(new tj.MetaBlocks.Path(color));

      // DEBUGbuildTestPaths(x, y);
    }
  };

  this.exit = function() {
    tj.MusicMixer.stop();
  };

  this.draw = function(gfx) {
    tj.Graphics.clearToColor("#000000");

    if (gfx && gridBuffer) {
      this.drawGrid(gfx, gridBuffer);
      tj.MetaBlocks.TileSpawner.draw(gfx);
    }
  };

  this.update = function(dt) {
    tileGrid.update(dt);
  };

  // Drawing Routines /////////////////////////////////////////////////////////
  this.drawGrid = function(gfx, gridBuffer) {
    var gbGfx = gridBuffer.getContext('2d'),
        x = 0,
        y = 0,
        cellDx = 0,
        cellDy = 0;

    if (gbGfx) {
      // Draw the grid image into the buffer...
      gbGfx.clearRect (0, 0, gridBuffer.width, gridBuffer.height);
      gbGfx.drawImage(gridImage.image, 0, 0);

      // ...draw the paths into the grid buffer...
      cellDx = Math.floor(gridBuffer.width / tj.MB.constants.COLS);
      cellDy = Math.floor(gridBuffer.height / tj.MB.constants.ROWS);

      // ...and draw the buffer into the background.
      x = gridTopLeft.x;
      y = gridTopLeft.y;

      tileGrid.draw(gbGfx, focusCell.bActive, focusCell.row, focusCell.col);
      this.drawPaths(gbGfx, cellDx, cellDy);

      gfx.drawImage(gridBuffer, x, y);
    }
  };

  this.drawPaths = function(gfx, cellDx, cellDy) {
    var i = 0;

    for (i=0; i<paths.length; ++i) {
      paths[i].draw(gfx, cellDx, cellDy);
    }
  };

  this.endPath = function() {
    if (curPath && curPath.length() > 0) {
      tileGrid.addPathToBoard(curPath);
    }

    bDrawingPath = false;
    bWantsPath = false;
    curPath = null;
  };

  this.startPath = function(row, col, bResolveJump, pos) {
    var iPath = pathsCreated % paths.length;

    if (bResolveJump) {
      if (Math.abs(pos.x - lastPos.x) > Math.abs(pos.y - lastPos.y)) {
        // Move horizontally.
        col = pathStart.col + (pos.x - lastPos.x > 0 ? 1 : -1);
        row = pathStart.row;
      }
      else {
        // Move verically.
        col = pathStart.col;
        row = pathStart.row + (pos.y - lastPos.y > 0 ? 1 : -1);
      }
    }

    if (tileGrid.isCellPathable(row, col)) {
      curPath = paths[iPath];

      tileGrid.removePath(curPath);
      curPath.reset();
      curPath.addCellRowCol(pathStart.row, pathStart.col, col - pathStart.col, row - pathStart.row);
      curPath.addCellRowCol(row, col);

//      tileGrid.addPathToCell(curPath, pathStart.row, pathStart.col);
//      tileGrid.addPathToCell(curPath, row, col);

      lastCell.row = row;
      lastCell.col = col;
      lastPos.x = pos.x;
      lastPos.y = pos.y;

      curPath.activate();

      ++pathsCreated;
    }
    else {
      bDrawingPath = false;
      bWantsPath = true;
    }
  };

  this.extendPath = function(row, col, bResolveJump, pos) {
    var bAdded = false;

    if (bResolveJump) {
      if (Math.abs(pos.x - lastPos.x) > Math.abs(pos.y - lastPos.y)) {
        // Move horizontally.
        col = lastCell.col + (pos.x - lastPos.x > 0 ? 1 : -1);
        row = lastCell.row;
      }
      else {
        // Move verically.
        col = lastCell.col;
        row = lastCell.row + (pos.y - lastPos.y > 0 ? 1 : -1);
      }
    }

    if (tileGrid.isCellPathable(row, col)) {
      if (curPath) {
        bAdded = curPath.addCellRowCol(row, col);

        if (curPath.length() === 0) {
          // User has truncated the path back to nothing.
          // Reset parameters such that we'll re-start a path
          // on the next valid drag.
          bDrawingPath = false;
          bWantsPath = true;
          --pathsCreated;
          pathStart.x = pos.x;
          pathStart.y = pos.y;
          bAdded = true;  // Prevents call to endPath()
          curPath = null;
        }
      }

      lastCell.row = row;
      lastCell.col = col;
      lastPos.x = pos.x;
      lastPos.y = pos.y;
    }
  };

  // IO Handlers //////////////////////////////////////////////////////////////
  this.onMouseUp = function(pos) {
    // End any paths.
    this.endPath();
    focusCell.bActive = false;

    if (!bDragged || Date.now() - inputStartTime < tj.MB.constants.MIN_DRAG_TIME_MS) {
      tileGrid.cancelPath(pathStart.row, pathStart.col);
    }

    tileGrid.resume();

    return true;
  };

  this.onMouseDown = function(pos) {
    // TODO: check that the player hasn't selected an occupied spot.
    inputStartTime = Date.now();

    // Lay a path start marker.
    pathStart.row = tj.MB.yToRow(pos.y, gridTopLeft.y);
    pathStart.col = tj.MB.xToCol(pos.x, gridTopLeft.x);

    lastPos.x = pos.x;
    lastPos.y = pos.y;

    // FORNOW: assume the player has selected a valid starting spot.
    bWantsPath = true;
    bDragged = false;

    focusCell.bActive = true;
    focusCell.row = pathStart.row;
    focusCell.col = pathStart.col;

    tileGrid.suspend();

    return true;
  };

  this.onMouseDrag = function(pos) {
    // Start (or continue) a path.
    var row = tj.MB.yToRow(pos.y, gridTopLeft.y),
        col = tj.MB.xToCol(pos.x, gridTopLeft.x);

    focusCell.row = row;
    focusCell.col = col;
 
    if (bDrawingPath && Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col) === 1) {
      this.extendPath(row, col, false, pos);
    }
    else if (bDrawingPath && Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col) > 1) {
      this.extendPath(row, col, true, pos);
    }
    else if (bWantsPath && Math.abs(row - pathStart.row) + Math.abs(col - pathStart.col) >= 1) {
      // TODO: make sure player has dragged onto a valid cell.
      // FORNOW: assume player has dragged onto a valid cell. 
      this.startPath(row, col, Math.abs(row - pathStart.row) + Math.abs(col - pathStart.col) > 1, pos);
      bWantsPath = false;
      bDrawingPath = true;
      bDragged = true;
    }

    return true;
  };

  this.onMouseOver = function(pos) {
    return true;
  };

  this.onMouseOut = function(pos) {
    // End any paths.
    this.endPath();
    bDragged = false;

    return true;
  };

  this.onTouchStart = function(pos) {
    this.onMouseDown(pos);
    return true;
  };

  this.onTouchEnd = function(pos) {
    this.onMouseUp(pos);
    return true;
  };

  this.onTouchMove = function(pos) {
    this.onMouseDrag(pos);
    return true;
  };

  this.onTouchCancel = function(pos) {
    this.onMouseOut(pos);
    return true;
  };

  // DEBUG routines ///////////////////////////////////////////////////////////
};

