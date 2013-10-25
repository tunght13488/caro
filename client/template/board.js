if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
  };
}

var Board = function (width, height, gridSize, canvas) {
  var context = canvas.getContext('2d');
  var board = [];
  var moves = [];

  // Move type
  var empty = 0;
  var cross = 1;
  var circle = 2;

  // Condition
  var started = false;
  var gameOver = false;
  var winCondition = 5;
  var winner = empty;

  // Last
  var lastMove = {
    i: null,
    j: null,
    type: null
  };
  var lastPosition = {
    i: null,
    j: null
  };

  // Color
  var gridColor = "#aaa";
  var hoverColor = "#000";
  var crossColor = "#f00";
  var circleColor = "#0a0";
  var lastMoveColor = "#ccc";

  // Padding
  var lastMovePadding = 1;
  var crossPadding = 6;

  /*
   * Board functions
   */
  var initBoard = function () {
    // Empty board
    var i, j;
    for (i = 0; i < width; i++) {
      board[i] = [];
      for (j = 0; j < height; j++) {
        board[i][j] = empty;
      }
    }
  };

  var inBoard = function (i, j) {
    return i >= 0 && i < width && j >= 0 && j < height;
  };

  var checkInBoard = function (i, j) {
    if (!inBoard(i, j)) {
      throw new Error("Not in board: ({0}, {1})".format(i, j));
    }
  };

  var getMove = function (i, j) {
    checkInBoard(i, j);

    return board[i][j];
  };

  var isExist = function (i, j) {
    checkInBoard(i, j);

    return board[i][j] !== empty;
  };

  /*
   * Draw
   */
  var drawGrid = function () {
    var x, y;

    context.beginPath();
    context.strokeStyle = gridColor;

    for (x = 0; x <= gridSize * width; x += gridSize) {
      context.moveTo(x, 0);
      context.lineTo(x, gridSize * height);
    }

    for (y = 0; y <= gridSize * height; y += gridSize) {
      context.moveTo(0, y);
      context.lineTo(gridSize * width, y);
    }

    context.stroke();
    context.closePath();
  };

  var drawLastMove = function () {
    if (lastMove.i !== null && lastMove.j !== null) {
      var x, y;

      x = lastMove.i * gridSize;
      y = lastMove.j * gridSize;

      context.beginPath();
      context.fillStyle = lastMoveColor;
      context.fillRect(x + lastMovePadding, y + lastMovePadding, gridSize - lastMovePadding * 2, gridSize - lastMovePadding * 2);
      context.closePath();
    }
  };

  var drawCircle = function (i, j) {
    var x, y, r;

    x = i * gridSize + gridSize / 2;
    y = j * gridSize + gridSize / 2;
    r = 11;

    context.beginPath();
    context.strokeStyle = circleColor;
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
  };

  var drawCross = function (i, j) {
    var x1, y1, x2, y2;

    x1 = i * gridSize + crossPadding;
    y1 = j * gridSize + crossPadding;
    x2 = (i + 1) * gridSize - crossPadding;
    y2 = (j + 1) * gridSize - crossPadding;

    context.beginPath();
    context.strokeStyle = crossColor;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.moveTo(x1, y2);
    context.lineTo(x2, y1);
    context.stroke();
    context.closePath();
  };

  var drawMoves = function () {
    var i, move;

    for (i = 0; i < moves.length; i++) {
      move = moves[i];
      if (move.type === cross) {
        drawCross(move.i, move.j);
      } else {
        drawCircle(move.i, move.j);
      }
    }
  };

  var drawHover = function () {
    if (lastPosition.i !== null && lastPosition.j !== null) {
      var x, y;

      x = lastPosition.i * gridSize;
      y = lastPosition.j * gridSize;

      context.beginPath();
      context.strokeStyle = hoverColor;
      context.strokeRect(x, y, gridSize, gridSize);
      context.stroke();
      context.closePath();
    }
  };

  var redraw = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawLastMove();
    drawMoves();
    drawHover();
  };

  var getPosition = function (e) {
    var mx, my, i, j;

    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
    i = Math.floor(mx / gridSize);
    j = Math.floor(my / gridSize);

    return {
      i: i,
      j: j
    };
  };

  var addMove = function (i, j) {
    if (!isExist(i, j)) {
      started = true;
      var type, move;

      type = lastMove.type === cross ? circle : cross;
      move = {
        i: i,
        j: j,
        type: type
      };

      moves.push(move);
      board[i][j] = type;
      lastMove = move;
    }
  };

  var determineWinner = function () {
    var count = function (advI, advJ) {
      var count = 0;

      if (started) {
        var move, ii, jj, k;

        move = getMove(lastMove.i, lastMove.j);

        ii = lastMove.i;
        jj = lastMove.j;
        for (k = 1; k < winCondition; k++) {
          ii = advI(ii);
          jj = advJ(jj);
          if (!inBoard(ii, jj)) {
            break;
          }
          if (getMove(ii, jj) !== move) {
            break;
          }
          count++;
        }
      }

      return count;
    };

    var dec = function (x) {
      return x - 1;
    };

    var inc = function (x) {
      return x + 1;
    };

    var stay = function (x) {
      return x;
    };

    // Horizontal
    var countLeft = count(dec, stay);
    var countRight = count(inc, stay);
    if (countLeft + countRight + 1 >= winCondition) {
      winner = lastMove.type;
      gameOver = true;
      return;
    }

    // Vertical
    var countUp = count(stay, dec);
    var countDown = count(stay, inc);
    if (countUp + countDown + 1 >= winCondition) {
      winner = lastMove.type;
      gameOver = true;
      return;
    }

    // TopLeft to BottomRight
    var countTopLeft = count(dec, dec);
    var countBottomRight = count(inc, inc);
    if (countTopLeft + countBottomRight + 1 >= winCondition) {
      winner = lastMove.type;
      gameOver = true;
      return;
    }

    // BottomLeft to TopRight
    var countTopRight = count(inc, dec);
    var countBottomLeft = count(dec, inc);
    if (countTopRight + countBottomLeft + 1 >= winCondition) {
      winner = lastMove.type;
      gameOver = true;
    }
  };

  var congratulate = function (winner) {
    var winnerMsg;
    if (winner == cross) {
      winnerMsg = 'Cross';
    } else {
      winnerMsg = 'Circle';
    }

    alert("Congratulation! {0} won!".format(winnerMsg));
  };

  var addMoveHandler = function (e) {
    if (!gameOver) {
      var mousePosition, i, j;

      mousePosition = getPosition(e);
      i = mousePosition.i;
      j = mousePosition.j;

      if (inBoard(i, j) && !isExist(i, j)) {
        addMove(i, j);
        determineWinner();
        redraw();
      }

      if (gameOver) {
        congratulate(winner);
      }
    }
  };

  var hoverHandler = function (e) {
    var mousePosition, changed;

    mousePosition = getPosition(e);
    changed = false;

    if (lastPosition.i !== mousePosition.i || lastPosition.j !== mousePosition.j) {
      lastPosition = mousePosition;
      changed = true;
    }

    if (changed) {
      redraw();
    }
  };

  var initialize = function () {
    initBoard();
    canvas.width = gridSize * width;
    canvas.height = gridSize * height;
    canvas.addEventListener("mousedown", addMoveHandler, false);
    canvas.addEventListener("mousemove", hoverHandler, false);
    redraw();
  };

  var reset = function () {
    board = [];
    moves = [];
    winner = empty;
    started = false;
    gameOver = false;
    lastMove = {
      i: null,
      j: null,
      type: null
    };
    lastPosition = {
      i: null,
      j: null
    };

    initialize();
  };

  return {
    initialize: initialize,
    reset: reset
  };
};

// -----------------------------------------------------------------------------

var board;

Meteor.startup(function () {

  var gridSize, width, height, canvas;

  gridSize = 32;
  width = 32;
  height = 16;
  canvas = document.getElementById('board');

  board = new Board(width, height, gridSize, canvas);
  board.initialize();

});

Template.board.events({
  'click #btnReset': function () {
    board.reset();
  }
});
