tj.DigiddyDog.StateLevelTest = function(gameIn, statusMsgAnchorIn) {
  var // Constants

      // Variables
      game = gameIn,
      backBufferTop = 0,
      backBufferLeft = 0,
      backBuffer = null,
      tileGrid = null;
      focusCell = {bActive: false, row: -1, col: -1},
      gridTopLeft = {x:0, y:0},
      statusBoxBounds = {x:0, y:0, w:0, h:0},
      bDrawingPath = false,
      bDragged = false,
      lastPos = {x: 0, y: 0},
      pathStart = {row: -1, col: -1},
      lastCell = {row: -1, col: -1},
      bWantsPath = false,
      bWantsStatusExit = false,
      rotInfo = {bWantsRot: false, willRotDir: 0},
      bWillRot = false,
      rotIconPos = {x:0, y:0},
      statusMsgAnchor = statusMsgAnchorIn,
      playerPath = new tj.DigiddyDog.Path("#ffffff"),
      gridRadius = 0,
      statusMessage = [],

      levelInfo = [
        {rows: 3, cols: 3, pattern: "rrrr", solidRocks: 0, bRandomLevel: true, messages: tj.DD.strings.LEVEL_MSG.LEVEL_ONE, secondaryMessages: tj.DD.strings.LEVEL_MSG_ALT.LEVEL_ONE},
        {rows: 3, cols: 3, pattern: "rggr", solidRocks: 0, bRandomLevel: true, messages: tj.DD.strings.LEVEL_MSG.LEVEL_TWO},
        {rows: 3, cols: 3, pattern: "gbrr", solidRocks: 0, bRandomLevel: true},
        {rows: 3, cols: 3, pattern: "ygbr", solidRocks: 0, bRandomLevel: true},

        {rows: 4, cols: 4, pattern: "rryr", solidRocks: 0, bRandomLevel: true, messages: tj.DD.strings.LEVEL_MSG.LEVEL_FIVE},
        {rows: 4, cols: 4, pattern: "bbgg", solidRocks: 0, bRandomLevel: true},
        {rows: 4, cols: 4, pattern: "ybyg", solidRocks: 0, bRandomLevel: true},
        {rows: 4, cols: 4, pattern: "rgby", solidRocks: 0, bRandomLevel: true},
        {rows: 4, cols: 4, pattern: "bryg", solidRocks: 1, bRandomLevel: true, messages: tj.DD.strings.LEVEL_MSG.LEVEL_NINE},
        {rows: 4, cols: 4, pattern: "gybr", solidRocks: 2, bRandomLevel: true},
        
        {rows: 5, cols: 5, pattern: "brrr", solidRocks: 0, bRandomLevel: true},
        {rows: 5, cols: 5, pattern: "ygyg", solidRocks: 0, bRandomLevel: true},
        {rows: 5, cols: 5, pattern: "byyr", solidRocks: 0, bRandomLevel: true},
        {rows: 5, cols: 5, pattern: "gyrb", solidRocks: 0, bRandomLevel: true},
        {rows: 5, cols: 5, pattern: "ybgr", solidRocks: 1, bRandomLevel: true},
        {rows: 5, cols: 5, pattern: "rbgy", solidRocks: 2, bRandomLevel: true},

        {rows: 6, cols: 6, pattern: "rgby", solidRocks: 0, bRandomLevel: true}, 
        {rows: 6, cols: 6, pattern: "bgry", solidRocks: 1, bRandomLevel: true},
        {rows: 10, cols: 10, pattern: "bgry", solidRocks: 2, bRandomLevel: true},
        {rows: 10, cols: 10, pattern: "rgbypo", solidRocks: 0, bRandomLevel: true},
      ];
      levelIndex = 0;

  tj.Game.addListener(this, tj.Game.MESSAGES.LEVEL_COMPLETE);
  tj.Game.addListener(this, tj.Game.MESSAGES.PLAYER_DIED);
  tj.Game.addListener(this, tj.DD.strings.MSG.RESUME_PLAY);
  tj.Game.addListener(this, tj.DD.strings.MSG.ADD_STATUS_MESSAGE);

  this.resumePlay = function(dataObj) {
    if (statusMessage.length === 0) {
      this.switchToPlayingHandlers();
    }
  };

  this.levelComplete = function(dataObj) {
    levelIndex = (levelIndex + 1) % levelInfo.length;
    this.exit();
    this.enter();

    return true;
  };

  this.playerDied = function(dataObj) {
    this.exit();
    this.enter();

    this.addStatusMessage(tj.DD.strings.YOU_DIED);
  };

  this.addStatusMessage = function(newMessage) {
    if (!newMessage) {
      newMessage = tj.DD.strings.LEVEL_PREFIX + " " + (levelIndex + 1) + " " + tj.DD.strings.READY + "!";
    }

    statusMessage.unshift(newMessage);
    this.switchToStatusHandlers();

    if (statusMessage.length === 1) {
      tj.Game.sendMessage(tj.DD.strings.MSG.PLAY_SOUND_INFO_CLOSE);
    }
  };

  this.switchToDefaultHandlers = function() {
    this.onMouseUp = this.onMouseUpDefault;
    this.onMouseDown = this.onMouseDownDefault;
    this.onMouseDrag = this.onMouseDragDefault;
    this.onMouseOut = this.onMouseOutDefault;
  };

  this.switchToStatusHandlers = function() {
    this.onMouseUp = this.onMouseUpStatus;
    this.onMouseDown = this.onMouseDownStatus;
    this.onMouseDrag = this.onMouseDragStatus;
    this.onMouseOut = this.onMouseOutStatus;
  };

  this.switchToPlayingHandlers = function() {
    this.onMouseUp = this.onMouseUpPlaying;
    this.onMouseDown = this.onMouseDownPlaying;
    this.onMouseDrag = this.onMouseDragPlaying;
    this.onMouseOut = this.onMouseOutPlaying;
  };

  this.getDimensions = function() {
    return {rows: tileGrid.getNumRows(), cols: tileGrid.getNumCols(), cellSize: tileGrid.getCellSize()};
  }

  this.enter = function() {
    tileGrid = new tj.DigiddyDog.TileGrid(levelInfo[levelIndex]);

    if (!backBuffer) {
      backBuffer = gameIn.createBackBuffer();
      backBufferLeft = 0;
      backBufferTop = Math.round(tj.Graphics.height() * 0.5 - backBuffer.height * 0.5);
    }

    tj.Game.sendMessage(tj.DD.strings.MSG.RENDER_BACKGROUND, this.getDimensions());

    tileGrid.setOrigin(backBufferLeft + Math.round(backBuffer.width * 0.5),
                       backBufferTop + Math.round(backBuffer.height * 0.5));

    gridTopLeft.x = tileGrid.xLeft();
    gridTopLeft.y = tileGrid.yTop();

    gridRadius = Math.round(Math.max(tileGrid.getNumRows(), tileGrid.getNumCols()) * 0.5 * tileGrid.getCellSize() * Math.sqrt(2));

    if (!tj.MusicMixer.isPlaying()) {
      tj.MusicMixer.randomize(true);
      tj.MusicMixer.start();
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

      if (statusMessage.length > 0) {
        this.showStatusMessage(gfx);
      }

      tj.Game.sendMessage(tj.DD.strings.MSG.DRAW_LOGO, gfx);
    }
  };

  this.getStatusBoxBounds = function() {
    var w = Math.round(tj.Graphics.width() * tj.DD.constants.MESSAGE_WINDOW_WIDTH_FACTOR);
        h = Math.round(w * tj.DD.constants.MESSAGE_WINDOW_HEIGHT_FACTOR),
        x = Math.round(tj.Graphics.width() * 0.5 - w * 0.5),
        y = Math.round(tj.Graphics.height() * 0.5 - h * tj.DD.constants.MESSAGE_WINDOW_HEIGHT_OFFSET);

    statusBoxBounds.x = x;
    statusBoxBounds.y = y;
    statusBoxBounds.w = w;
    statusBoxBounds.h = h;

    return statusBoxBounds;
  };

  this.showStatusMessage = function(gfx) {
    var origin = tileGrid ? tileGrid.getOrigin() : null,
        msgBoxBounds = this.getStatusBoxBounds(),
        x = msgBoxBounds.x,
        y = msgBoxBounds.y,
        w = msgBoxBounds.w,
        h = msgBoxBounds.h;

    if (gfx && origin && statusMessage.length) {
      gfx.lineWidth = Math.round(tj.DD.constants.BORDER_WIDTH * 0.5);
      gfx.fillStyle = tj.DD.constants.STATUS_BLACK;
      gfx.strokeStyle = "white";
      gfx.beginPath();
      gfx.moveTo(x, y);
      gfx.lineTo(x + w, y);
      gfx.lineTo(x + w, y + h);
      gfx.lineTo(x + Math.round((statusMsgAnchor.y - (y + h)) * 0.5), y + h);
      gfx.lineTo(x, statusMsgAnchor.y);
      gfx.closePath();
      gfx.fill();
      gfx.stroke();

      tj.Graphics.print(gfx, statusMessage[0], origin.x, y + Math.round(h * 0.5), "white", tj.DD.constants.DROP_TEXT_OFFSET);
    }
  };

  this.drawRotIcon = function(gfx) {
    var delta = tj.DD.constants.ROT_THRESH_PX,
        bOnRight = false;

    if (gfx) {
      gfx.save();

      gfx.lineWidth = 2;
      gfx.strokeStyle = "white"
      gfx.beginPath();

      gfx.translate(rotIconPos.x, rotIconPos.y);

      bOnRight = lastPos.x > gridTopLeft.x + Math.round(tileGrid.getNumCols() * 0.5 * tileGrid.getCellSize());
      if (bOnRight) {
         gfx.scale(-1.0, -1.0);
      }

      if (rotInfo.willRotDir === tj.DD.constants.ROTDIR.CW) {
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

      gfx.scale(1.0, 1.0);
      gfx.translate(-rotIconPos.x, -rotIconPos.y);
      gfx.restore();
    }
  };

  this.drawPattern = function(gfx) {
    if (tileGrid && gfx) {
      tileGrid.drawPattern(gfx, Math.round(tj.Graphics.width() * tj.DD.constants.MARGIN_SCALE), Math.round(tj.Graphics.height() * (1.0 - tj.DD.constants.MARGIN_SCALE)));
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
  // Default Handlers ---------------------------------------------------------
  this.onMouseUpDefault = function(pos) {
    return true;
  };

  this.onMouseDownDefault = function(pos) {
    return true;
  };

  this.onMouseDragDefault = function(pos) {
    return true;
  };

  this.onMouseOutDefault = function(pos) {
    return true;
  };

  // Status Message Handlers --------------------------------------------------
  this.onMouseUpStatus = function(pos) {
    this.getStatusBoxBounds();

    if (bWantsStatusExit && tj.MathEx.rectContainsPoint(statusBoxBounds, pos.x, pos.y)) {
      tj.Game.sendMessage(tj.DD.strings.MSG.STATUS_MESSAGE_DISMISSED, statusMessage.shift());

      if (statusMessage.length === 0) {
        this.switchToPlayingHandlers();
      }
    }
    return true;
  };

  this.onMouseDownStatus = function(pos) {
    bWantsStatusExit = false;

    this.getStatusBoxBounds();

    if (tj.MathEx.rectContainsPoint(statusBoxBounds, pos.x, pos.y)) {
      bWantsStatusExit = true;
    }
    return true;
  };

  this.onMouseDragStatus = function(pos) {
    return true;
  };

  this.onMouseOutStatus = function(pos) {
    return true;
  };

  this.onMouseUpPlaying = function(pos) {
    var dy = 0;

    // End any paths.
    if (bWillRot) {
      this.switchToDefaultHandlers();
      tileGrid.rotateBoard(rotInfo.willRotDir);
    }
    else if (tileGrid && playerPath.isActive()) {
      if (playerPath.length() === 2) {
        // Move the player.
        this.switchToDefaultHandlers();
        tileGrid.movePlayer(playerPath.rowAt(0), playerPath.colAt(0), playerPath.rowAt(1), playerPath.colAt(1));
      }
      else if (playerPath.length() === tileGrid.patternLength() + 1) {
        this.switchToDefaultHandlers();
        tileGrid.consumeGems(playerPath);
      }
    }

    this.endPath();
    
    focusCell.bActive = false;
    rotInfo.bWantsRot = false;
    bWillRot = false;
    rotInfo.willRotDir = null;

    return true;
  };

  this.onMouseDownPlaying = function(pos) {
    var nextToInfo = null,
        dx = 0,
        dy = 0,
        centerX = 0,
        centerY = 0,
        rSquared = 0,
        cellSize = tileGrid ? tileGrid.getCellSize() : tj.DD.constants.CELL_SIZE_PX.DESIRED;

    rotInfo.bWantsRot = false;
    bWillRot = false;
    rotInfo.willRotDir = null;

    // TODO: check that the player hasn't selected an occupied spot.
    centerX = gridTopLeft.x + cellSize * tileGrid.getNumCols() * 0.5;
    centerY = gridTopLeft.y + cellSize * tileGrid.getNumRows() * 0.5;
    dx = centerX - pos.x;
    dy = centerY - pos.y;
    rSquared = dx * dx + dy * dy;

    if (rSquared >= gridRadius * gridRadius && rSquared < (gridRadius + tj.DD.constants.ROT_CIRCLE_WIDTH) * (gridRadius + tj.DD.constants.ROT_CIRCLE_WIDTH)) {
      // Player has touched the rotation circle.
      lastPos.x = pos.x;
      lastPos.y = pos.y;
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

        bWantsPath = true;
        bDragged = false;

        focusCell.bActive = true; 
        focusCell.row = pathStart.row;
        focusCell.col = pathStart.col;

        // TODO: play a sound.
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

          // TODO: play a sound.
        }
      }
    }

    return true;
  };

  this.onMouseDragPlaying = function(pos) {
    // Start (or continue) a path.
    var row = tj.DD.yToRow(pos.y, gridTopLeft.y),
        col = tj.DD.xToCol(pos.x, gridTopLeft.x),
        centerX = 0,
        centerY = 0,
        dx = 0,
        dy = 0,
        dxLast = 0,
        dyLast = 0,
        cellSize = tileGrid ? tileGrid.getCellSize() : tj.DD.constants.CELL_SIZE_PX.DESIRED;

    focusCell.row = row;
    focusCell.col = col;
 
    if (rotInfo.bWantsRot) {
      centerX = gridTopLeft.x + cellSize * tileGrid.getNumCols() * 0.5;
      centerY = gridTopLeft.y + cellSize * tileGrid.getNumRows() * 0.5;
      dxLast = lastPos.x - centerX;
      dyLast = lastPos.y - centerY;
      dx = pos.x - centerX;
      dy = pos.y - centerY;

      bWillRot = (dx * dxLast + dy * dyLast) / (Math.sqrt(dx * dx + dy * dy) * Math.sqrt(dxLast * dxLast + dyLast * dyLast)) < tj.DD.constants.ROT_THRESH_DOT;

      if (bWillRot) {
        // Cross the lastPos into the currentPos to find willRotDir.
        rotInfo.willRotDir = dx * dyLast - dy * dxLast > 0.0 ? tj.DD.constants.ROTDIR.CCW : tj.DD.constants.ROTDIR.CW;

        rotIconPos.x = pos.x;
        rotIconPos.y = pos.y - tj.DD.constants.ROT_THRESH_PX;
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

    return true;
  };

  this.onMouseOverPlaying = function(pos) {
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

