if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
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

  var empty = 0;
  var cross = 1;
  var circle = 2;

  var started = false;
  var gameOver = false;

  var nextMove = cross;
  var lastMove = {
    x: null,
    y: null,
    type: null
  };
  var lastPosition = {
    x: null,
    y: null
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

  var inBoard = function (x, y) {
    return x > 0 && x <= width && y > 0 && y <= height;
  };

  var checkInBoard = function (x, y) {
    if (!inBoard(x, y)) {
      throw new Error("Not in board: ({0}, {1})".format(x, y));
    }
  };

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
    var x, y;

    x = lastMove.x * gridSize;
    y = lastMove.y * gridSize;

    context.beginPath();
    context.strokeStyle = lastMoveColor;
    context.fillRect(x + lastMovePadding, y + lastMovePadding, gridSize - lastMovePadding * 2, gridSize - lastMovePadding * 2);
    context.stroke();
    context.closePath();
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
    var x, y;

    x = lastPosition.x * gridSize;
    y = lastPosition.y * gridSize;

    context.beginPath();
    context.strokeStyle = hoverColor;
    context.strokeRect(x, y, gridSize, gridSize);
    context.stroke();
    context.closePath();
  }

  var getMove = function (x, y) {
    checkInBoard(x, y);

    return board[x][y];
  };

  var isExist = function (x, y) {
    checkInBoard(x, y);

    return board[x][y] !== empty;
  };

  var redraw = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawLastMove();
    drawMoves();
    drawHover();
  };

  var getPosition = function (e) {
    var mx, my, x, y;

    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
    x = Math.floor(mx / gridSize);
    y = Math.floor(my / gridSize);

    if (lastPosition.x !== x) {
      lastPosition.x = x;
    }

    if (lastPosition.y !== y) {
      lastPosition.y = y;
    }

    return {
      x: x,
      y: y
    };
  };

  var addMoveHandler = function (e) {
    if (gameOver) {
      // Do nothing
      return;
    }

    var mousePosition = getPosition(e);
    var i = mousePosition.x,
      j = mousePosition.y;
    var existed = false;
    if (board.hasOwnProperty(i) && board[i].hasOwnProperty(j)) {
      existed = true;
    }
    if (!existed) {
      moves.push({i: i, j: j});
      lastMoveX = i;
      lastMoveY = j;
      if (!board.hasOwnProperty(i)) {
        board[i] = {};
      }
      if (!board[i].hasOwnProperty(j)) {
        board[i][j] = nextMove;
      }
      console.log(board);
      redraw();
      drawSquare(i, j);
      detemineWinner();
    }
  };

  var hoverHandler = function (e) {
    var pos = getPosition(e);
    if (pos.i !== lastI || pos.j !== lastJ) {
      lastI = pos.i;
      lastJ = pos.j;
      redraw();
      drawSquare(pos.i, pos.j);
    }
  };

  return {
    initialize: function () {
      initBoard();
      canvas.width = gridSize * width;
      canvas.height = gridSize * height;
      canvas.addEventListener("mousedown", addMoveHandler, false);
      canvas.addEventListener("mousemove", hoverHandler, false);
    }
  };
};

// -----------------------------------------------------------------------------

Meteor.startup(function () {

  var gridSize, width, height, canvas;

  gridSize = 32;
  width = 24;
  height = 20;
  canvas = document.getElementById('board');

  var board = new Board(width, height, gridSize, canvas);

  function drawRect(i, j, color) {
    color = typeof color !== 'undefined' ? color : '#ff0';
    var x = i * gridSize;
    var y = j * gridSize;
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
    context.stroke();
    context.closePath();
  }

  function drawSquare(i, j, color) {
    color = typeof color !== 'undefined' ? color : '#000';
    var x = i * gridSize;
    var y = j * gridSize;
    context.beginPath();
    context.strokeStyle = color;
    context.strokeRect(x, y, gridSize, gridSize);
    context.stroke();
    context.closePath();
  }

  var count = function (i, j, advance) {
    var move, count, x, y, k;

    if (!board.hasOwnProperty(i) || !board[i].hasOwnProperty(j)) {
      return 0;
    }

    move = board[i][j];

    x = i;
    y = j;
    count = 0;
    for (k = 0; k < winCondition; k++) {
      x = advance.i(x);
      y = advance.j(y);
      if (!board.hasOwnProperty(x) || !board[x].hasOwnProperty(y) || board[x][y] !== move) {
        return count;
      }
    }
  };

  var detemineWinner = function () {
    // Vertical
    var straight;

    var left = count(lastI, lastJ, {
      i: function (i) {
        return i;
      },
      j: function (j) {
        return j - 1;
      }
    });

    var right = count(lastI, lastJ, {
      i: function (i) {
        return i;
      },
      j: function (j) {
        return j + 1;
      }
    });

    console.log(left, right);
  };

  // redraw();

});
