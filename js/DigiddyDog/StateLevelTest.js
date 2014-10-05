tj.DigiddyDog.StateLevelTest = function(gameIn) {
  var // Constants

      // Variables
      game = gameIn,
      backBufferTop = 0,
      backBufferLeft = 0,
      backBuffer = null,
      tileGrid = null;
      focusCell = {bActive: false, row: -1, col: -1},
      gridTopLeft = {x:0, y:0},
      bDrawingPath = false,
      bDragged = false,
      lastPos = {x: 0, y: 0},
      pathStart = {row: -1, col: -1},
      lastCell = {row: -1, col: -1},
      bWantsPath = false,
      rotInfo = {bWantsRot: false, bBottomRot: false},
      bWillRot = false,
      willRotDir = null,
      rotIconPos = {x:0, y:0},
      playerPath = new tj.DigiddyDog.Path("#ffffff"),
      rotDirs = [
        [tj.DD.constants.ROTDIR.CCW, tj.DD.constants.ROTDIR.CW],
        [tj.DD.constants.ROTDIR.CW, tj.DD.constants.ROTDIR.CCW],
      ],
      statusMessage = null,
      levelInfo = [
        {rows: 10, cols: 10, pattern: "rgbypo", solidRocks: 0, bRandomLevel: true},
        {rows: 3, cols: 3, pattern: "rrrr", solidRocks: 0, bRandomLevel: true},
        {rows: 3, cols: 3, pattern: "rggr", solidRocks: 0, bRandomLevel: true},
        {rows: 3, cols: 3, pattern: "gbrr", solidRocks: 0, bRandomLevel: true},
        {rows: 3, cols: 3, pattern: "ygbr", solidRocks: 0, bRandomLevel: true},
        {rows: 6, cols: 6, pattern: "rgby", solidRocks: 0, bRandomLevel: true},
        {rows: 6, cols: 6, pattern: "bgry", solidRocks: 1, bRandomLevel: true},
        {rows: 10, cols: 10, pattern: "bgry", solidRocks: 2, bRandomLevel: true},
      ];
      levelIndex = 0;

      tj.Game.addListener(this, tj.Game.MESSAGES.LEVEL_COMPLETE);
      tj.Game.addListener(this, tj.Game.MESSAGES.PLAYER_DIED);

  this.levelComplete = function(dataObj) {
    levelIndex = (levelIndex + 1) % levelInfo.length;
    this.exit();
    this.enter();

    return true;
  };

  this.playerDied = function(dataObj) {
    this.exit();
     this.enter();
    statusMessage = tj.DD.strings.YOU_DIED;
  };

  this.enter = function() {
    tileGrid = new tj.DigiddyDog.TileGrid(levelInfo[levelIndex]);

    if (!backBuffer) {
      backBuffer = gameIn.createBackBuffer();
      tj.Game.sendMessage(tj.Game.MESSAGES.CREATE_BACKGROUND, tileGrid.getCellSize());

      backBufferLeft = 0;
      backBufferTop = Math.round(tj.Graphics.height() * 0.5 - backBuffer.height * 0.5);
    }

    tileGrid.setOrigin(backBufferLeft + Math.round(backBuffer.width * 0.5),
                       backBufferTop + Math.round(backBuffer.height * 0.5));

    statusMessage = tj.DD.strings.LEVEL_PREFIX + " " + (levelIndex + 1) + " " + tj.DD.strings.READY + "!";

    gridTopLeft.x = tileGrid.xLeft();
    gridTopLeft.y = tileGrid.yTop();

    if (!tj.MusicMixer.isPlaying()) {
      tj.MusicMixer.randomize(true);
      // tj.MusicMixer.start();
    }
  };

  this.exit = function() {
    // tj.MusicMixer.stop();
  };

  this.draw = function(gfx) {
    tj.Graphics.clearToColor(tj.DD.constants.BACK_COLOR);

    if (gfx && backBuffer && tileGrid) {
      this.drawGrid(gfx, backBuffer);
      tileGrid.draw(gfx);

      this.drawPattern(gfx);

      if (focusCell.bActive) {
        this.drawFocusCell(gfx);
      }

      if (bWillRot) {
        this.drawRotIcon(gfx);
      }

      if (statusMessage) {
        this.showStatusMessage(gfx);
      }
    }
  };

  this.showStatusMessage = function(gfx) {
    var origin = tileGrid ? tileGrid.getOrigin() : null;

    if (origin) {
      tj.Graphics.print(gfx, statusMessage, origin.x, origin.y, "white", tj.DD.constants.DROP_TEXT_OFFSET);
    }
  };

  this.drawRotIcon = function(gfx) {
    var delta = tj.DD.constants.ROT_THRESH_PX;

    if (gfx) {
      gfx.lineWidth = 2;
      gfx.strokeStyle = "white"
      gfx.beginPath();

      gfx.translate(rotIconPos.x, rotIconPos.y);

      if (!rotInfo.bBottomRot && !(rotIconPos.x < gridTopLeft.x)) {
        // Flip x.
        gfx.scale(-1.0, -1.0);
      }
      else if (rotInfo.bBottomRot) {
        if (willRotDir === tj.DD.constants.ROTDIR.CW) {
          gfx.scale(-1.0, -1.0);
          gfx.rotate(Math.PI * 0.5);
        }
        else {
          gfx.scale(1.0, 1.0);
          gfx.rotate(-Math.PI * 0.5);
        }
      }

      if (willRotDir === tj.DD.constants.ROTDIR.CW) {
        gfx.moveTo(0, 0);
        gfx.lineTo(0, 0 - delta);
        gfx.lineTo(0 + delta, 0 - delta);
        gfx.lineTo(0 + Math.round(delta * 0.67), 0 - delta - Math.round(delta * 0.33));
        gfx.moveTo(0 + delta, 0 - delta);
        gfx.lineTo(0 + Math.round(delta * 0.67), 0 - delta + Math.round(delta * 0.33));
      }
      else {
        gfx.moveTo(0, 0 - delta);
        gfx.lineTo(0, 0);
        gfx.lineTo(0 + delta, 0);
        gfx.lineTo(0 + Math.round(delta * 0.67), 0 - Math.round(delta * 0.33));
        gfx.moveTo(0 + delta, 0);
        gfx.lineTo(0 + Math.round(delta * 0.67), 0 + Math.round(delta * 0.33));
      }

      gfx.closePath();
      gfx.stroke();

      if (rotInfo.bBottomRot) {
        if (willRotDir === tj.DD.constants.ROTDIR.CW) {
          gfx.rotate(Math.PI * 0.5);
        }
        else {
          gfx.rotate(-Math.PI * 0.5);
        }
      }
      gfx.scale(1.0, 1.0);
      gfx.translate(-rotIconPos.x, -rotIconPos.y);
    }
  };

  this.drawPattern = function(gfx) {
    if (tileGrid && gfx) {
      tileGrid.drawPattern(gfx, gridTopLeft.x, gridTopLeft.y);
    }
  };

  this.drawFocusCell = function(gfx) {
    gfx.lineWidth = tj.DD.constants.BORDER_WIDTH / 2;
    gfx.strokeStyle = tj.DD.constants.FOCUS_CELL_COLOR;
    gfx.beginPath();
    gfx.rect(gridTopLeft.x + tj.DD.constants.BORDER_WIDTH / 2 + focusCell.col * (tj.DD.constants.BORDER_WIDTH + tileGrid.getCellSize()),
             gridTopLeft.y + tj.DD.constants.BORDER_WIDTH / 2 + focusCell.row * (tj.DD.constants.BORDER_WIDTH + tileGrid.getCellSize()),
             tileGrid.getCellSize() + tj.DD.constants.BORDER_WIDTH,
             tileGrid.getCellSize() + tj.DD.constants.BORDER_WIDTH);
    gfx.closePath();
    gfx.stroke();
  }

  this.update = function(dt) {
    if (tileGrid) {
      tileGrid.update(dt);
    }
  };

  // Drawing Routines /////////////////////////////////////////////////////////
  this.drawGrid = function(gfx, backBuffer) {
    var gbGfx = backBuffer.getContext('2d'),
        x = backBufferLeft,
        y = backBufferTop,
        cellDx = 0,
        cellDy = 0;

    if (gbGfx) {
      gfx.drawImage(backBuffer, x, y);
    }
  };

  this.endPath = function() {
    bDrawingPath = false;
    bWantsPath = false;
    playerPath.deactivate();
  };

  this.startPath = function(row, col, bResolveJump, pos) {
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

    if (tileGrid.isCellPathable(row, col, 1)) {
      tileGrid.removePath();
      playerPath.reset();
      playerPath.addCellRowCol(pathStart.row, pathStart.col, col - pathStart.col, row - pathStart.row);
      playerPath.addCellRowCol(row, col);

      tileGrid.addPathToCell(playerPath.rowAt(0), playerPath.colAt(0), playerPath, 0);
      tileGrid.addPathToCell(playerPath.rowAt(1), playerPath.colAt(1), playerPath, 1);

      lastCell.row = row;
      lastCell.col = col;
      lastPos.x = pos.x;
      lastPos.y = pos.y;

      playerPath.activate();
    }
    else {
      bDrawingPath = false;
      bWantsPath = true;
    }
  };

  this.extendPath = function(row, col, bResolveJump, pos) {
    var bAdded = false,
        i = 0;

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

    if (playerPath.hasEntry(row, col) || tileGrid.isCellPathable(row, col, playerPath.length())) {
      if (playerPath) {
        bAdded = playerPath.addCellRowCol(row, col);

        tileGrid.removePath();
        for (i=0; i<playerPath.length(); ++i) {
          tileGrid.addPathToCell(playerPath.rowAt(i), playerPath.colAt(i), playerPath, i);
        }

        if (playerPath.length() === 0) {
          // User has truncated the path back to nothing.
          // Reset parameters such that we'll re-start a path
          // on the next valid drag.
          bDrawingPath = false;
          bWantsPath = true;
          pathStart.x = pos.x;
          pathStart.y = pos.y;
          bAdded = true;  // Prevents call to endPath()
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
    var dy = 0;

    if (tileGrid.isAcceptingUserInput()) {
      // End any paths.
      if (bWillRot) {
        tileGrid.rotateBoard(willRotDir);
      }
      else if (tileGrid && playerPath.isActive()) {
        if (playerPath.length() === 2) {
          // Move the player.
          tileGrid.movePlayer(playerPath.rowAt(0), playerPath.colAt(0), playerPath.rowAt(1), playerPath.colAt(1));
        }
        else if (playerPath.length() === tileGrid.patternLength() + 1) {
          tileGrid.consumeGems(playerPath);
        }
      }

      this.endPath();
    }
    
    focusCell.bActive = false;
    rotInfo.bWantsRot = false;
    bWillRot = false;
    willRotDir = null;

    return true;
  };

  this.onMouseDown = function(pos) {
    var nextToInfo = null;

    statusMessage = null;

    rotInfo.bWantsRot = false;
    bWillRot = false;
    willRotDir = null;

    if (tileGrid.isAcceptingUserInput) {
      // TODO: check that the player hasn't selected an occupied spot.
      if (pos.x < gridTopLeft.x) {
        lastPos.x = pos.x;
        lastPos.y = pos.y;
        rotInfo.bWantsRot = true;
        rotInfo.bBottomRot = false;
      }
      else if (pos.x > gridTopLeft.x + tileGrid.width()) {
        lastPos.x = pos.x;
        lastPos.y = pos.y;
        rotInfo.bBottomRot = false;
        rotInfo.bWantsRot = true;
      }
      else if (pos.y > gridTopLeft. y + tileGrid.height()) {
        lastPos.x = pos.x;
        lastPos.y = pos.y;
        rotInfo.bBottomRot = true;
        rotInfo.bWantsRot = true;
      }
      else if (pos.x >= gridTopLeft.x && pos.x < gridTopLeft.x + tileGrid.width() &&
          pos.y >= gridTopLeft.y && pos.y < gridTopLeft.y + tileGrid.height()) {

        // Lay a path start marker.
        pathStart.row = tj.DD.yToRow(pos.y, gridTopLeft.y);
        pathStart.col = tj.DD.xToCol(pos.x, gridTopLeft.x);

        if (tileGrid.isPlayer(pathStart.row, pathStart.col)) {
          lastPos.x = pos.x;
          lastPos.y = pos.y;

          // FORNOW: assume the player has selected a valid starting spot.
          bWantsPath = true;
          bDragged = false;

          focusCell.bActive = true; 
          focusCell.row = pathStart.row;
          focusCell.col = pathStart.col;
        }
        else {
          nextToInfo = tileGrid.isNextToPlayer(pathStart.row, pathStart.col);
          if (nextToInfo) {
            // Clicked next to player. Start a path.
            lastPos.x = pos.x;
            lastPos.y = pos.y;

            bWantsPath = true;
            bDragged = true;

            focusCell.bActive = true;
            focusCell.row = pathStart.row;
            focusCell.col = pathStart.col;

            pathStart.row = nextToInfo.row;
            pathStart.col = nextToInfo.col;

            this.startPath(focusCell.row, focusCell.col, false, pos);
          }
        }
      }
    }

    return true;
  };

  this.onMouseDrag = function(pos) {
    // Start (or continue) a path.
    var row = tj.DD.yToRow(pos.y, gridTopLeft.y),
        col = tj.DD.xToCol(pos.x, gridTopLeft.x);

    if (tileGrid.isAcceptingUserInput()) {
      focusCell.row = row;
      focusCell.col = col;
   
      if (rotInfo.bWantsRot) {
        if (rotInfo.bBottomRot) {
          if (!bWillRot && Math.abs(pos.x - lastPos.x) > tj.DD.constants.ROT_THRESH_PX) {
            bWillRot = true;
          }

          if (bWillRot) {
            willRotDir = pos.x < lastPos.x ? tj.DD.constants.ROTDIR.CW : tj.DD.constants.ROTDIR.CCW;
            rotIconPos.x = pos.x;
            rotIconPos.y = pos.y - tj.DD.constants.ROT_THRESH_PX;
          }
        }
        else {
          if (!bWillRot && Math.abs(pos.y - lastPos.y) > tj.DD.constants.ROT_THRESH_PX) {
            bWillRot = true;
          }

          if (bWillRot) {
            willRotDir = rotDirs[lastPos.x < gridTopLeft.x ? 0 : 1][pos.y - lastPos.y > 0 ? 0 : 1];
            rotIconPos.x = pos.x;
            rotIconPos.y = pos.y - tj.DD.constants.ROT_THRESH_PX;
          }
        }
      }
      else if (bDrawingPath && Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col) === 1) {
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
    }

    return true;
  };

  this.onMouseOver = function(pos) {
    return true;
  };

  this.onMouseOut = function(pos) {
    // End any paths.
    return this.onMouseUp(pos);
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

