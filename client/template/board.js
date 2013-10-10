Meteor.startup(function () {

  var gridSize = 32;

  var canvas = document.getElementById('board');
  var context = canvas.getContext('2d');

  function drawGrid() {
    context.beginPath();
    context.strokeStyle = "#ccc";

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

  function drawCircle(i, j) {
    // 1 => 0
    // 2 => 32
    var x = i * gridSize + gridSize / 2;
    var y = j * gridSize + gridSize / 2;
    var radius = 11;
    context.beginPath();
    context.strokeStyle = "#00f";
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

  function drawSquare(i, j) {
    // 1 => 0
    // 2 => 32
    var x = (i - 1) * gridSize;
    var y = (j - 1) * gridSize;
    context.beginPath();
    context.strokeStyle = "#000";
    context.strokeRect(x, y, gridSize, gridSize);
    context.stroke();
    context.closePath();
  }

  var isCross = true;

  canvas.addEventListener("mousedown", function (e) {
    var mx = e.clientX - canvas.clientLeft;
    var my = e.clientY - canvas.clientTop;
    var i = Math.floor(mx / gridSize);
    var j = Math.floor(my / gridSize);
    if (isCross) {
      drawCross(i, j);
      isCross = false;
    } else {
      drawCircle(i, j);
      isCross = true;
    }
  }, false);

  drawGrid();
  // drawCircle(2, 3);
  // drawCross(4, 9);
  // drawSquare(5, 6);

});
