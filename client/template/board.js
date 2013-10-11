var moves = [];
var board = {};

Session.set('moves', moves);

Meteor.startup(function () {

  var gridSize = 32;

  var canvas       = document.getElementById('board');
  var context      = canvas.getContext('2d');
  var canvasWidth  = canvas.width;
  var canvasHeight = canvas.height;
  var nextMove     = 1; // 1 for cross, 2 for circle

  function drawGrid() {
    context.beginPath();
    context.strokeStyle = "#aaa";

    for (var x = 0; x <= gridSize * 20; x += gridSize) {
      context.moveTo(x, 0);
      context.lineTo(x, gridSize * 20);
    }

    for (var y = 0; y <= gridSize * 20; y += gridSize) {
      context.moveTo(0, y);
      context.lineTo(gridSize * 20, y);
    }

    context.stroke();
    context.closePath();
  }

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

  function drawMoves() {
    var count = 0;
    for (var i in moves) {
      var move = moves[i];
      count++;
      if (move.i === lastMoveX && move.j === lastMoveY) {
        drawRect(move.i, move.j, '#ccc');
      }
      if (count % 2 == 1) {
        drawCross(move.i, move.j);
      } else {
        drawCircle(move.i, move.j);
      }
    }
    nextMove = count % 2 == 0 ? 1 : 2;
  }

  function drawCircle(i, j) {
    // 1 => 0
    // 2 => 32
    var x = i * gridSize + gridSize / 2;
    var y = j * gridSize + gridSize / 2;
    var radius = 11;
    context.beginPath();
    context.strokeStyle = "#0a0";
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
  }

  function drawCross(i, j) {
    var space = 6;
    var x1 = i * gridSize + space;
    var y1 = j * gridSize + space;
    var x2 = (i + 1) * gridSize - space;
    var y2 = (j + 1) * gridSize - space;
    context.beginPath();
    context.strokeStyle = "#f00";
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.moveTo(x1, y2);
    context.lineTo(x2, y1);
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

  function getPosition(e) {
    var mx = e.pageX - canvas.offsetLeft;
    var my = e.pageY - canvas.offsetTop;
    var i = Math.floor(mx / gridSize);
    var j = Math.floor(my / gridSize);
    return {
      i: i,
      j: j
    };
  }

  var lastMoveX, lastMoveY;
  var addMove = function (e) {
    var pos = getPosition(e);
    var i = pos.i,
      j = pos.j;
    var existed = false;
    if (i in board && j in board[i]) {
      existed = true;
    }
    if (!existed) {
      moves.push({i: i, j: j});
      lastMoveX = i;
      lastMoveY = j;
      if (!(i in board)) {
        board[i] = {};
      }
      if (!(j in board[i])) {
        board[i][j] = true;
      }
      redraw();
      drawSquare(i, j);
    }
  };

  var lastI, lastJ;
  var hover = function (e) {
    var pos = getPosition(e);
    if (pos.i != lastI || pos.j != lastJ) {
      lastI = pos.i;
      lastJ = pos.j;
      redraw();
      drawSquare(pos.i, pos.j);
    }
  };

  canvas.addEventListener("mousedown", addMove, false);

  canvas.addEventListener("mousemove", hover, false);

  function redraw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid();
    drawMoves();
  }

  redraw();

});
