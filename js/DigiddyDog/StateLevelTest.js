tj.DigiddyDog.StateLevelTest = function(gameIn, statusMsgAnchorIn) {
  // Variables
  this.game = gameIn;
  this.backBufferTop = 0;
  this.backBufferLeft = 0;
  this.backBuffer = null;
  this.tileGrid = null;
  this.focusCell = {bActive: false, row: -1, col: -1};
  this.gridTopLeft = {x:0, y:0};
  this.statusBoxBounds = {x:0, y:0, w:0, h:0};
  this.bDrawingPath = false;
  this.bDragged = false;
  this.lastPos = {x: 0, y: 0};
  this.pathStart = {row: -1, col: -1};
  this.lastCell = {row: -1, col: -1};
  this.bWantsPath = false;
  this.bWantsStatusExit = false;
  this.rotInfo = {bWantsRot: false, willRotDir: 0};
  this.bWillRot = false;
  this.rotIconPos = {x:0, y:0};
  this.statusMsgAnchor = statusMsgAnchorIn;
  this.playerPath = new tj.DigiddyDog.Path("#ffffff");
  this.gridRadius = 0;
  this.statusMessage = [];
  this.lastTapTime = -1;
  this.tapCount = 0;

  this.levelInfo = [
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
    {rows: 8, cols: 8, pattern: "rgbyo", solidRocks: 0, bRandomLevel: true}, 
    {rows: 8, cols: 8, pattern: "rgrgy", solidRocks: 0, bRandomLevel: true}, 
    {rows: 10, cols: 10, pattern: "bgry", solidRocks: 2, bRandomLevel: true},
    {rows: 10, cols: 10, pattern: "rgbypo", solidRocks: 0, bRandomLevel: true},
  ];

  this.levelIndex = 0;

  tj.Game.addListener(this, tj.Game.MESSAGES.LEVEL_COMPLETE);
  tj.Game.addListener(this, tj.Game.MESSAGES.PLAYER_DIED);
  tj.Game.addListener(this, tj.DD.strings.MSG.RESUME_PLAY);
  tj.Game.addListener(this, tj.DD.strings.MSG.ADD_STATUS_MESSAGE);

  this.resumePlay = function(dataObj) {
    if (this.statusMessage.length === 0) {
      this.switchToPlayingHandlers();
    }
  };

  this.levelComplete = function(dataObj) {
    this.levelIndex = (this.levelIndex + 1) % this.levelInfo.length;
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
      newMessage = tj.DD.strings.LEVEL_PREFIX + " " + (this.levelIndex + 1) + " " + tj.DD.strings.READY + "!";
    }

    this.statusMessage.unshift(newMessage);
    this.switchToStatusHandlers();

    if (this.statusMessage.length === 1) {
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
    this.bDragged = false;
    this.resetDoubleTap();
    
    this.onMouseUp = this.onMouseUpPlaying;
    this.onMouseDown = this.onMouseDownPlaying;
    this.onMouseDrag = this.onMouseDragPlaying;
    this.onMouseOut = this.onMouseOutPlaying;
  };

  this.getDimensions = function() {
    return {rows: this.tileGrid.getNumRows(), cols: this.tileGrid.getNumCols(), cellSize: this.tileGrid.getCellSize()};
  }

  this.enter = function() {
    this.tileGrid = new tj.DigiddyDog.TileGrid(this.levelInfo[this.levelIndex]);

    if (!this.backBuffer) {
      this.backBuffer = gameIn.createBackBuffer();
      this.backBufferLeft = 0;
      this.backBufferTop = Math.round(tj.Graphics.height() * 0.5 - this.backBuffer.height * 0.5);
    }

    tj.Game.sendMessage(tj.DD.strings.MSG.RENDER_BACKGROUND, this.getDimensions());

    this.tileGrid.setOrigin(this.backBufferLeft + Math.round(this.backBuffer.width * 0.5),
                       this.backBufferTop + Math.round(this.backBuffer.height * 0.5));

    this.gridTopLeft.x = this.tileGrid.xLeft();
    this.gridTopLeft.y = this.tileGrid.yTop();

    this.gridRadius = Math.round(Math.max(this.tileGrid.getNumRows(), this.tileGrid.getNumCols()) * 0.5 * this.tileGrid.getCellSize() * Math.sqrt(2));

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

    if (gfx && this.backBuffer && this.tileGrid) {
      this.drawGrid(gfx, this.backBuffer);
      this.tileGrid.draw(gfx);

      this.drawPattern(gfx);

      if (this.focusCell.bActive) {
        this.drawFocusCell(gfx);
      }

      if (this.bWillRot) {
        this.drawRotIcon(gfx);
      }

      if (this.statusMessage.length > 0) {
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

    this.statusBoxBounds.x = x;
    this.statusBoxBounds.y = y;
    this.statusBoxBounds.w = w;
    this.statusBoxBounds.h = h;

    return this.statusBoxBounds;
  };

  this.showStatusMessage = function(gfx) {
    var origin = this.tileGrid ? this.tileGrid.getOrigin() : null,
        msgBoxBounds = this.getStatusBoxBounds(),
        x = msgBoxBounds.x,
        y = msgBoxBounds.y,
        w = msgBoxBounds.w,
        h = msgBoxBounds.h;

    if (gfx && origin && this.statusMessage.length) {
      gfx.lineWidth = Math.round(tj.DD.constants.BORDER_WIDTH * 0.5);
      gfx.fillStyle = tj.DD.constants.STATUS_BLACK;
      gfx.strokeStyle = "white";
      gfx.beginPath();
      gfx.moveTo(x, y);
      gfx.lineTo(x + w, y);
      gfx.lineTo(x + w, y + h);
      gfx.lineTo(x + Math.round((this.statusMsgAnchor.y - (y + h)) * 0.5), y + h);
      gfx.lineTo(x, this.statusMsgAnchor.y);
      gfx.closePath();
      gfx.fill();
      gfx.stroke();

      tj.Graphics.print(gfx, this.statusMessage[0], origin.x, y + Math.round(h * 0.5), "white", tj.DD.constants.DROP_TEXT_OFFSET);
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

      gfx.translate(this.rotIconPos.x, this.rotIconPos.y);

      bOnRight = this.lastPos.x > this.gridTopLeft.x + Math.round(this.tileGrid.getNumCols() * 0.5 * this.tileGrid.getCellSize());
      if (bOnRight) {
         gfx.scale(-1.0, -1.0);
      }

      if (this.rotInfo.willRotDir === tj.DD.constants.ROTDIR.CW) {
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
      gfx.translate(-this.rotIconPos.x, -this.rotIconPos.y);
      gfx.restore();
    }
  };

  this.drawPattern = function(gfx) {
    if (this.tileGrid && gfx) {
      this.tileGrid.drawPattern(gfx, Math.round(tj.Graphics.width() * tj.DD.constants.MARGIN_SCALE), Math.round(tj.Graphics.height() * (1.0 - tj.DD.constants.MARGIN_SCALE)));
    }
  };

  this.drawFocusCell = function(gfx) {
    gfx.lineWidth = tj.DD.constants.BORDER_WIDTH / 2;
    gfx.strokeStyle = tj.DD.constants.FOCUS_CELL_COLOR;
    gfx.beginPath();
    gfx.rect(this.gridTopLeft.x + tj.DD.constants.BORDER_WIDTH / 2 + this.focusCell.col * (tj.DD.constants.BORDER_WIDTH + this.tileGrid.getCellSize()),
             this.gridTopLeft.y + tj.DD.constants.BORDER_WIDTH / 2 + this.focusCell.row * (tj.DD.constants.BORDER_WIDTH + this.tileGrid.getCellSize()),
             this.tileGrid.getCellSize() + tj.DD.constants.BORDER_WIDTH,
             this.tileGrid.getCellSize() + tj.DD.constants.BORDER_WIDTH);
    gfx.closePath();
    gfx.stroke();
  }

  this.update = function(dt) {
    var curTime = 0;

    if (this.tapCount === 1) {
      curTime = Date.now();
      if (curTime - this.lastTapTime > tj.DD.constants.DOUBLE_TAP_INTERVAL) {
        this.resetDoubleTap();
        this.onSingleTap(this.pathStart.row, this.pathStart.col);
      }
    }

    if (this.tileGrid) {
      this.tileGrid.update(dt);
    }
  };

  // Drawing Routines /////////////////////////////////////////////////////////
  this.drawGrid = function(gfx, backBuffer) {
    var gbGfx = this.backBuffer.getContext('2d'),
        x = this.backBufferLeft,
        y = this.backBufferTop,
        cellDx = 0,
        cellDy = 0;

    if (gbGfx) {
      gfx.drawImage(this.backBuffer, x, y);
    }
  };

  this.endPath = function() {
    this.bDrawingPath = false;
    this.bWantsPath = false;
    this.playerPath.deactivate();
  };

  this.startPath = function(row, col, bResolveJump, pos) {
    if (bResolveJump) {
      if (Math.abs(pos.x - this.lastPos.x) > Math.abs(pos.y - this.lastPos.y)) {
        // Move horizontally.
        col = this.pathStart.col + (pos.x - this.lastPos.x > 0 ? 1 : -1);
        row = this.pathStart.row;
      }
      else {
        // Move verically.
        col = this.pathStart.col;
        row = this.pathStart.row + (pos.y - this.lastPos.y > 0 ? 1 : -1);
      }
    }

    if (this.tileGrid.isCellPathable(row, col, 1)) {
      this.tileGrid.removePath();
      this.playerPath.reset();
      this.playerPath.addCellRowCol(this.pathStart.row, this.pathStart.col, col - this.pathStart.col, row - this.pathStart.row);
      this.playerPath.addCellRowCol(row, col);

      this.tileGrid.addPathToCell(this.playerPath.rowAt(0), this.playerPath.colAt(0), this.playerPath, 0);
      this.tileGrid.addPathToCell(this.playerPath.rowAt(1), this.playerPath.colAt(1), this.playerPath, 1);

      this.lastCell.row = row;
      this.lastCell.col = col;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      this.playerPath.activate();
    }
    else {
      this.bDrawingPath = false;
      this.bWantsPath = true;
    }
  };

  this.extendPath = function(row, col, bResolveJump, pos) {
    var bAdded = false,
        i = 0;

    if (bResolveJump) {
      if (Math.abs(pos.x - this.lastPos.x) > Math.abs(pos.y - this.lastPos.y)) {
        // Move horizontally.
        col = this.lastCell.col + (pos.x - this.lastPos.x > 0 ? 1 : -1);
        row = this.lastCell.row;
      }
      else {
        // Move verically.
        col = this.lastCell.col;
        row = this.lastCell.row + (pos.y - this.lastPos.y > 0 ? 1 : -1);
      }
    }

    if (this.playerPath.hasEntry(row, col) || this.tileGrid.isCellPathable(row, col, this.playerPath.length())) {
      if (this.playerPath) {
        bAdded = this.playerPath.addCellRowCol(row, col);

        this.tileGrid.removePath();
        for (i=0; i<this.playerPath.length(); ++i) {
          this.tileGrid.addPathToCell(this.playerPath.rowAt(i), this.playerPath.colAt(i), this.playerPath, i);
        }

        if (this.playerPath.length() === 0) {
          // User has truncated the path back to nothing.
          // Reset parameters such that we'll re-start a path
          // on the next valid drag.
          this.bDrawingPath = false;
          this.bWantsPath = true;
          this.pathStart.x = pos.x;
          this.pathStart.y = pos.y;
          bAdded = true;  // Prevents call to endPath()
        }
      }

      this.lastCell.row = row;
      this.lastCell.col = col;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;
    }
  };

  // IO Handlers //////////////////////////////////////////////////////////////
  this.onSingleTap = function(row, col) {
    if (this.tileGrid.spinTiles(row, col, true)) {
      this.switchToDefaultHandlers();
    }
  };

  this.onDoubleTap = function(row, col) {
    if (this.tileGrid.spinTiles(row, col, false)) {
      this.switchToDefaultHandlers();
    }
  };

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

    if (this.bWantsStatusExit && tj.MathEx.rectContainsPoint(this.statusBoxBounds, pos.x, pos.y)) {
      tj.Game.sendMessage(tj.DD.strings.MSG.STATUS_MESSAGE_DISMISSED, this.statusMessage.shift());

      if (this.statusMessage.length === 0) {
        this.switchToPlayingHandlers();
      }
    }
    return true;
  };

  this.onMouseDownStatus = function(pos) {
    this.bWantsStatusExit = false;

    this.getStatusBoxBounds();

    if (tj.MathEx.rectContainsPoint(this.statusBoxBounds, pos.x, pos.y)) {
      this.bWantsStatusExit = true;
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
    var dy = 0,
        tapTime = Date.now();

    if (!this.bDragged) {
      // Check for tap/double-tap on Digiddy.
      if (this.lastTapTime < 0 || tapTime - this.lastTapTime < tj.DD.constants.DOUBLE_TAP_INTERVAL) {
        this.tapCount += 1;
        this.lastTapTime = tapTime;
      }
    }

    // End any paths.
    if (this.tapCount >= 2) {
      this.resetDoubleTap();
      this.onDoubleTap(this.pathStart.row, this.pathStart.col);
    }
    else if (this.bWillRot) {
      this.switchToDefaultHandlers();
      this.tileGrid.rotateBoard(this.rotInfo.willRotDir);
    }
    else if (this.tileGrid && this.playerPath.isActive()) {
      if (this.playerPath.length() === 2) {
        // Move the player.
        this.switchToDefaultHandlers();
        this.tileGrid.movePlayer(this.playerPath.rowAt(0), this.playerPath.colAt(0), this.playerPath.rowAt(1), this.playerPath.colAt(1));
      }
      else if (this.playerPath.length() === this.tileGrid.patternLength() + 1) {
        this.switchToDefaultHandlers();
        this.tileGrid.consumeGems(this.playerPath);
      }
    }

    this.endPath();
    
    this.focusCell.bActive = false;
    this.rotInfo.bWantsRot = false;
    this.bWillRot = false;
    this.rotInfo.willRotDir = null;

    return true;
  };

  this.onMouseDownPlaying = function(pos) {
    var nextToInfo = null,
        dx = 0,
        dy = 0,
        centerX = 0,
        centerY = 0,
        rSquared = 0,
        cellSize = this.tileGrid ? this.tileGrid.getCellSize() : tj.DD.constants.CELL_SIZE_PX.DESIRED;

    this.rotInfo.bWantsRot = false;
    this.bWillRot = false;
    this.rotInfo.willRotDir = null;

    // TODO: check that the player hasn't selected an occupied spot.
    centerX = this.gridTopLeft.x + cellSize * this.tileGrid.getNumCols() * 0.5;
    centerY = this.gridTopLeft.y + cellSize * this.tileGrid.getNumRows() * 0.5;
    dx = centerX - pos.x;
    dy = centerY - pos.y;
    rSquared = dx * dx + dy * dy;

    if (rSquared >= this.gridRadius * this.gridRadius && rSquared < (this.gridRadius + tj.DD.constants.ROT_CIRCLE_WIDTH) * (this.gridRadius + tj.DD.constants.ROT_CIRCLE_WIDTH)) {
      // Player has touched the rotation circle.
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;
      this.rotInfo.bWantsRot = true;
      this.resetDoubleTap();
    }
    else if (pos.x >= this.gridTopLeft.x && pos.x < this.gridTopLeft.x + this.tileGrid.width() &&
        pos.y >= this.gridTopLeft.y && pos.y < this.gridTopLeft.y + this.tileGrid.height()) {

      // Lay a path start marker.
      this.pathStart.row = tj.DD.yToRow(pos.y, this.gridTopLeft.y);
      this.pathStart.col = tj.DD.xToCol(pos.x, this.gridTopLeft.x);

      if (this.tileGrid.isPlayer(this.pathStart.row, this.pathStart.col)) {
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;

        this.bWantsPath = true;
        this.bDragged = false;

        this.focusCell.bActive = true; 
        this.focusCell.row = this.pathStart.row;
        this.focusCell.col = this.pathStart.col;

        // TODO: play a sound.
      }
      else {
        this.resetDoubleTap();

        nextToInfo = this.tileGrid.isNextToPlayer(this.pathStart.row, this.pathStart.col);
        if (nextToInfo) {
          // Clicked next to player. Start a path.
          this.lastPos.x = pos.x;
          this.lastPos.y = pos.y;

          this.bWantsPath = true;
          this.bDragged = true;

          this.focusCell.bActive = true;
          this.focusCell.row = this.pathStart.row;
          this.focusCell.col = this.pathStart.col;

          this.pathStart.row = nextToInfo.row;
          this.pathStart.col = nextToInfo.col;

          this.startPath(this.focusCell.row, this.focusCell.col, false, pos);

          // TODO: play a sound.
        }
      }
    }

    return true;
  };

  this.resetDoubleTap = function() {
    this.lastTapTime = -1;
    this.tapCount = 0;
  };

  this.onMouseDragPlaying = function(pos) {
    // Start (or continue) a path.
    var row = tj.DD.yToRow(pos.y, this.gridTopLeft.y),
        col = tj.DD.xToCol(pos.x, this.gridTopLeft.x),
        centerX = 0,
        centerY = 0,
        dx = 0,
        dy = 0,
        dxLast = 0,
        dyLast = 0,
        cellSize = this.tileGrid ? this.tileGrid.getCellSize() : tj.DD.constants.CELL_SIZE_PX.DESIRED;

    this.focusCell.row = row;
    this.focusCell.col = col;
 
    if (this.rotInfo.bWantsRot) {
      centerX = this.gridTopLeft.x + cellSize * this.tileGrid.getNumCols() * 0.5;
      centerY = this.gridTopLeft.y + cellSize * this.tileGrid.getNumRows() * 0.5;
      dxLast = this.lastPos.x - centerX;
      dyLast = this.lastPos.y - centerY;
      dx = pos.x - centerX;
      dy = pos.y - centerY;

      this.bWillRot = (dx * dxLast + dy * dyLast) / (Math.sqrt(dx * dx + dy * dy) * Math.sqrt(dxLast * dxLast + dyLast * dyLast)) < tj.DD.constants.ROT_THRESH_DOT;

      if (this.bWillRot) {
        // Cross the this.lastPos into the currentPos to find willRotDir.
        this.rotInfo.willRotDir = dx * dyLast - dy * dxLast > 0.0 ? tj.DD.constants.ROTDIR.CCW : tj.DD.constants.ROTDIR.CW;

        this.rotIconPos.x = pos.x;
        this.rotIconPos.y = pos.y - tj.DD.constants.ROT_THRESH_PX;
        this.resetDoubleTap();
      }
    }
    else if (this.bDrawingPath && Math.abs(row - this.lastCell.row) + Math.abs(col - this.lastCell.col) === 1) {
      this.extendPath(row, col, false, pos);
      this.resetDoubleTap();
    }
    else if (this.bDrawingPath && Math.abs(row - this.lastCell.row) + Math.abs(col - this.lastCell.col) > 1) {
      this.extendPath(row, col, true, pos);
      this.resetDoubleTap();
    }
    else if (this.bWantsPath && Math.abs(row - this.pathStart.row) + Math.abs(col - this.pathStart.col) >= 1) {
      // TODO: make sure player has dragged onto a valid cell.
      // FORNOW: assume player has dragged onto a valid cell. 
      this.startPath(row, col, Math.abs(row - this.pathStart.row) + Math.abs(col - this.pathStart.col) > 1, pos);
      this.resetDoubleTap();
      this.bWantsPath = false;
      this.bDrawingPath = true;
      this.bDragged = true;
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

