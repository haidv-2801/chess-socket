var board,
  game = new Chess(),
  turn = 'w',
  socket = io();

function alert({ message, type }) {
  let me = $('.alert');

  me.text(message);
  me.addClass(`alert-${type}`);
  me.fadeTo(2000, 500).slideUp(500, function () {
    me.slideUp(500);
    me.removeClass(`alert-${type}`);
  });
}

function waitingScreen(status) {
  if (status) {
    $('.backdrop').remove('.backdrop');
    $('body').prepend(
      `<div class="backdrop"><h1>Đang chờ đối thủ...</h1></div>`
    );
  } else {
    $('.backdrop').remove('.backdrop');
  }
}

const { firstname, roomid, gamemode } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (gamemode == constant.GAME_MODE.PVF) {
  waitingScreen(true);
}

socket.emit('join', { firstname, roomid });

socket.on('turn', (_turn) => {
  turn = _turn;
});

socket.on('guestInfo', (data) => {
  const { turn: _turn, name, room } = data;
  if (room.length >= 2) waitingScreen();
  console.log(data);
  if (name == firstname) {
    turn = _turn;
  } else {
    turn = _turn == 'w' ? 'b' : 'w';
  }
  // $('.badge-white-player').text(room?.[0]?.name || 'Chử phòng');
  // $('.badge-black-player').text(room?.[1].name || 'Chờ người chơi...');
});

socket.on('message', (message, disconnect) => {
  alert({ message, type: 'primary' });
  waitingScreen();
  if (disconnect) {
    game = new Chess();
    board.position(game.fen());
  }
});

socket.on('movingData', (fen) => {
  game = new Chess(fen);
  board.position(fen);
});

if (gamemode == constant.GAME_MODE.PVE) {
  $('.badge-white-player').text('Bạn');
  $('.badge-black-player').text('Máy');
}

if (gamemode == constant.GAME_MODE.PVP) {
  $('.badge-white-player').text('Người chơi 1');
  $('.badge-black-player').text('Người chơi 2');
}

var PLAY_MODE = {
  PVSP: 0,
  PVSE: 1,
};

/*The "AI" part starts here */

var minimaxRoot = function (depth, game, isMaximisingPlayer) {
  var newGameMoves = game.ugly_moves();
  var bestMove = -9999;
  var bestMoveFound;

  for (var i = 0; i < newGameMoves.length; i++) {
    var newGameMove = newGameMoves[i];
    game.ugly_move(newGameMove);
    var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = newGameMove;
    }
  }
  return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
  positionCount++;
  if (depth === 0) {
    return -evaluateBoard(game.board());
  }

  var newGameMoves = game.ugly_moves();

  if (isMaximisingPlayer) {
    var bestMove = -9999;
    for (var i = 0; i < newGameMoves.length; i++) {
      game.ugly_move(newGameMoves[i]);
      bestMove = Math.max(
        bestMove,
        minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
      );
      game.undo();
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  } else {
    var bestMove = 9999;
    for (var i = 0; i < newGameMoves.length; i++) {
      game.ugly_move(newGameMoves[i]);
      bestMove = Math.min(
        bestMove,
        minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer)
      );
      game.undo();
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  }
};

var evaluateBoard = function (board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
    }
  }
  return totalEvaluation;
};

var reverseArray = function (array) {
  return array.slice().reverse();
};

var pawnEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
  [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
  [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
  [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
  [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
  [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval = [
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
  [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
  [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
  [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
  [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
  [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
  [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
];

var bishopEvalWhite = [
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
  [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
  [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
  [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
  [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
  [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
  [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
  [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
  [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
  [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
];

var kingEvalWhite = [
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
  [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
];

var kingEvalBlack = reverseArray(kingEvalWhite);

var getPieceValue = function (piece, x, y) {
  if (piece === null) {
    return 0;
  }
  var getAbsoluteValue = function (piece, isWhite, x, y) {
    if (piece.type === 'p') {
      return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
    } else if (piece.type === 'r') {
      return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
    } else if (piece.type === 'n') {
      return 30 + knightEval[y][x];
    } else if (piece.type === 'b') {
      return 30 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
    } else if (piece.type === 'q') {
      return 90 + evalQueen[y][x];
    } else if (piece.type === 'k') {
      return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
    }
    throw 'Unknown piece type: ' + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y);
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

/* board visualization and games state handling */

var onDragStart = function (source, piece, position, orientation) {
  if (gamemode == constant.GAME_MODE.PVF && turn !== game.turn()) return false;

  if (
    game.in_checkmate() === true ||
    game.in_draw() === true ||
    (gamemode == constant.GAME_MODE.PVE && piece.search(/^b/) !== -1)
  ) {
    return false;
  }
};

var makeBestMove = function () {
  if (gamemode == constant.GAME_MODE.PVE) {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
  }

  board.position(game.fen());

  if (gamemode == constant.GAME_MODE.PVF) {
    socket.emit('moving', game.fen());
  }

  renderMoveHistory(game.history());
  if (game.game_over()) {
    alert('Game over');
  }
};

var positionCount;
var getBestMove = function (game) {
  if (game.game_over()) {
    alert('Game over');
  }

  positionCount = 0;
  var depth = parseInt($('#search-depth').find(':selected').text());

  var d = new Date().getTime();
  var d2 = new Date().getTime();
  var bestMove = minimaxRoot(depth, game, true);
  var moveTime = d2 - d;
  var positionsPerS = (positionCount * 1000) / moveTime;

  $('#position-count').text(positionCount);
  $('#time').text(moveTime / 1000 + 's');
  $('#positions-per-s').text(positionsPerS);
  return bestMove;
};

/**
 * Render ra HTML lịch sử di chuyển
 * @param {*} moves
 */
var renderMoveHistory = function (moves) {
  var historyElement = $('.move-history').empty();
  historyElement.empty();
  for (var i = 0; i < moves.length; i = i + 2) {
    historyElement.append(
      '<span class="move-his-item"> Trắng: ' +
        moves[i] +
        ' ' +
        (moves[i + 1] ? ' - Đen: ' + moves[i + 1] : ' ') +
        '</span><hr>'
    );
  }
  var el = document.getElementById('.move-history');
  if (el) historyElement.scrollTop(historyElement[0].scrollHeight);
};

/**
 * Sự kiện xảy ra sau khi người chơi thả quân cờ xuống
 * @param {*} source from
 * @param {*} target to
 */
var onDrop = function (source, target) {
  //Thực hiện di chuyển from -> to nếu không đi được thì null
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q',
  });

  removeGreySquares();
  if (move === null) {
    return 'snapback';
  }

  renderMoveHistory(game.history());
  window.setTimeout(makeBestMove, 250);
};

/**
 * game.fen() string trạng thái của bàn cờ (xem lại chessboardjs)
 */
var onSnapEnd = function () {
  board.position(game.fen());
};

/**
 * Xử lý khi hover vào ô bàn cờ
 * Thì highlight những nước có thể đi  tiếp theo
 * @param {*} square
 * @param {*} piece
 */
var onMouseoverSquare = function (square, piece) {
  if (gamemode == constant.GAME_MODE.PVF && turn !== game.turn()) return;

  //Danh sách các nước có thể đi tiếp theo VD: ['e4', 'e5']
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

/**
 * Sự kiện khi chuột rời khỏi ô bàn cờ thí xóa các highlight color
 * @param {*} square
 * @param {*} piece
 */
var onMouseoutSquare = function (square, piece) {
  removeGreySquares();
};

/**
 * Xóa các highlight color
 */
var removeGreySquares = function () {
  $('#board .square-55d63').css('background', '');
};

/**
 * Highlight các đường đi gợi ý
 * @param {string} square địa chỉ ô cần highlight VD: e4
 */
var greySquare = function (square) {
  var squareEl = $('#board .square-' + square);

  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board = ChessBoard('board', cfg);
