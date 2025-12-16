(function () {
  if (typeof TRON === "undefined") {
    window.TRON = {};
  }

  var TronView = TRON.TronView = function (board, $el) {
    this.board = board;
    this.$el = $el;
    this.setupBoard();
    this.bindEvents();

    this.intervalId = window.setInterval(
      this.step.bind(this),
      TronView.STEP_MILLIS
    );
  };

  TronView.KEYS = {
    37: "37",
    38: "38",
    39: "39",
    40: "40",
    65: "65",
    83: "83",
    87: "87",
    68: "68"
  };

  TronView.STEP_MILLIS = 100;

  TronView.prototype.bindEvents = function () {
    $(window).on("keydown", this.handleKeyEvent.bind(this));
  };

  TronView.prototype.handleKeyEvent = function (event) {
    if (TronView.KEYS[event.keyCode]) {
      this.board.player1.turn(TronView.KEYS[event.keyCode]);
      this.board.player2.turn(TronView.KEYS[event.keyCode]);
    } else {
      // ignore other keys
    }
  };

  TronView.prototype.render = function () {
    this.updateClasses(this.board.player1.seg, "bike1");
    this.updateClasses(this.board.player2.seg, "bike2");
  };

  TronView.prototype.updateClasses = function(coords, className) {
    // console.log(this.$li.eq(10));
    // console.log(coords[coords.length - 1]);
    var coord = coords[coords.length - 1];
    var flatCoord = (coord.pos[0] * TRON.DIM_X) + coord.pos[1];
    this.$li.eq(flatCoord).addClass(className);
  };

  TronView.prototype.setupBoard = function () {
    var $ul = $("<ul>");
    $ul.addClass("group");
    this.$el.empty().append($ul);  // ← ADDED: Clears old grid!!!

    for (var i = 0; i < TRON.DIM_Y; i++) {
      for (var j = 0; j < TRON.DIM_X; j++) {
        var $li = $("<li>");
        $li.addClass("tile");
        $ul.append($li);
      }
    }
    this.$li = this.$el.find("li");
  };

  TronView.prototype.step = function () {
    this.board.player1.move();
    this.board.player2.move();
    if (!this.board.player1.alive && !this.board.player2.alive) {
      this.winner("tie");
    } else if (!this.board.player1.alive) {
      this.winner("player2");
    } else if (!this.board.player2.alive) {
      this.winner("player1");
    } else {
      this.render();
    }
  };

  TronView.prototype.winner = function (player) {
    window.clearInterval(this.intervalId);
    $(window).off();
    if (player === "tie") {
      $('#tie').show();
    } else if (player === "player1") {
      $('#player1wins').show();
    } else if (this.board.player2.name === "Player 2") {
      $('#player2wins').show();
    } else {
      $('#computerwins').show();
    }
    $('#replay').show();
    $('#reload').show();
  };

})();
