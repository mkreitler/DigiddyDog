var CanvasTest = function() {
	var // Constants
		
		  // Variables
		game = null;

  //  stateMainMap = null,
  //  stateHeartRate = null,
  //  stateWindTurbine = null,
  //  stateCombatTest = null,
  //  stateFactorFarm = null;

	// Initialization /////////////////////////////////////////////////////////
	game = new tj.Game(this);

	// stateMainMap = new StateMainMap(game);
 //  stateHeartRate = new StateHeartRate(game);
 //  stateWindTurbine = new StateWindTurbine(game);
 //  stateCombatTest = new StateCombatTest(game);
 //  stateFactorFarm = new StateFactorFarm(game);
  tj.Game.addListener(this, tj.Game.MESSAGES.START_GAME);
  tj.Game.addListener(this, tj.Game.MESSAGES.ABORT_GAME);

  game.setState(new StateResourceLoad(this));
  game.start();

  this.startGame = function() {
    game.setState(new StateLevelTest(this));
  };

  this.abortGame = function(errMsg) {
    game.setState(new StateGameError(this, errMsg));
  };
};
