/**
 * Created by Gusarov on 04.07.2016.
 */
var minesG = function (size, density) {
    var options = {
        size: 10,
        density: .1
    };
    if (size > 0) {
        options.size = size;
    }
    if (density > 0 && density < .99) {
        options.density = density;
    }
    var matrix = [], canvas = (function () {
            var canvasEl = document.querySelector('#canvas'),
                fillCanvas = function () {
                    canvasEl.innerHTML = '';
                    matrix = [];
                    var totalSize = Math.pow(options.size, 2),
                        totalDensity = Math.floor(totalSize * options.density),
                        minesCache = [];
                    for (var y = 0; y <= options.size; y++) {
                        var tr = document.createElement('tr');
                        canvasEl.appendChild(tr);
                        for (var x = 0; x <= options.size; x++) {
                            var _field = cell.createCell(x, y);
                            tr.appendChild(_field.td);
                        }
                    }
                    function getRandomInt(min, max) {
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }

                    while (totalDensity > 0) {
                        var randX = getRandomInt(0, options.size),
                            randY = getRandomInt(0, options.size),
                            field = matrix[randY][randX];
                        if (field.mine === 0) {
                            field.mine = 1;
                            minesCache.push(field);
                            totalDensity--;
                        }
                    }
                    for (var i = 0; i < minesCache.length; i++) {
                        minesCache[i].setSiblingsValue();
                    }
                },
                openAll = function () {
                    var field = {};
                    for (var y = 0; y <= options.size; y++) {
                        for (var x = 0; x <= options.size; x++) {
                            if (field = getMatrixField(x, y)) {
                                field.play();
                            }
                        }
                    }
                },
                processEmptySiblings = function (field) {
                    var _processInner = function (siblingField, _field) {
                        if (siblingField !== null
                            && siblingField.played === false
                            && siblingField.value === 0
                            && (siblingField.x === _field.x || siblingField.y === _field.y)) {
                            siblingField.play();
                            siblingField.callSiblings(_processInner);
                        }
                    };
                    field.callSiblings(_processInner);
                };
            var getMatrixField = function (x, y) {
                if (matrix.hasOwnProperty(y) && matrix[y].hasOwnProperty(x)) {
                    return matrix[y][x];
                }
                return null;
            };
            var directions = {
                topLeft: function (x, y) {
                    return getMatrixField(x - 1, y - 1);
                },
                top: function (x, y) {
                    return getMatrixField(x, y - 1);
                },
                topRight: function (x, y) {
                    return getMatrixField(x + 1, y - 1);
                },
                right: function (x, y) {
                    return getMatrixField(x + 1, y);
                },
                bottomRight: function (x, y) {
                    return getMatrixField(x + 1, y + 1);
                },
                bottom: function (x, y) {
                    return getMatrixField(x, y + 1);
                },
                bottomLeft: function (x, y) {
                    return getMatrixField(x - 1, y + 1);
                },
                left: function (x, y) {
                    return getMatrixField(x - 1, y);
                }
            };
            return {
                start: fillCanvas,
                directions: directions,
                openAll: openAll,
                processEmptySiblings: processEmptySiblings
            };
        })(),
        cell = (function () {
            var clickCallback = function (field) {
                    return function (event) {
                        gamePlay(field);
                    };
                },
                rightClickCallback = function (field) {
                    return function (event) {
                        event.preventDefault();
                        field.flagged = true;
                        var flag = document.createElement('i');
                        flag.className = 'flag fa fa-flag';
                        flag.oncontextmenu = function (_event) {
                            _event.preventDefault();
                            field.flagged = false;
                            field.td.removeChild(_event.target);
                        };
                        field.td.appendChild(flag);
                    };
                };
            return {
                createCell: function (x, y) {
                    var td = document.createElement('td'),
                        input = document.createElement('input'),
                        cell = {
                            x: x,
                            y: y,
                            td: td,
                            input: input,
                            matrix: matrix
                        },
                        field = new Field(cell);
                    input.type = 'button';
                    input.value = ' ';
                    input.onclick = clickCallback(field);
                    input.oncontextmenu = rightClickCallback(field);
                    td.appendChild(input);
                    if (!matrix.hasOwnProperty(y)) {
                        matrix[y] = [];
                    }
                    return matrix[y][x] = field;
                }
            };
        })(),
        Field = function (cell) {
            this.x = cell.x;
            this.y = cell.y;
            this.td = cell.td;
            this.input = cell.input;
            this.value = 0;
            this.mine = 0;
            this.played = false;
            this.flagged = false;
            this.callSiblings = (function (field) {
                return function (callback) {
                    var directions = canvas.directions,
                        siblingField;
                    for (var i in directions) {
                        if (directions.hasOwnProperty(i)) {
                            siblingField = directions[i](field.x, field.y);
                            callback(siblingField, field);
                        }
                    }
                }
            })(this);
            this.setSiblingsValue = (function (field) {
                return function () {
                    field.callSiblings(function (siblingField) {
                        if (siblingField !== null && siblingField.mine === 0)
                            siblingField.value += 1;
                    });
                }
            })(this);
            this.play = (function (field) {
                return function () {
                    if (field.played === true || field.flagged === true) {
                        return;
                    }
                    field.input.className += ' hidden';
                    var span = document.createElement('span');
                    if (field.mine === 1) {
                        span.className = 'fa fa-bomb';
                        field.td.appendChild(span);
                    } else if (field.value > 0) {
                        span.innerText = field.value;
                        var classes = {1: 'blue', 2: 'green', 3: 'red'};
                        if (classes.hasOwnProperty(field.value + "")) {
                            span.className = classes[field.value];
                        }
                        field.td.appendChild(span);
                    }
                    field.played = true;
                }
            })(this);
            return this;
        },
        gamePlay = function (field) {

            field.play();
            if (field.mine === 1) {
                field.td.className += ' bg-red';
                //game over
                canvas.openAll();
                setTimeout(function () {
                    if (confirm('Game over! Want to try again?')) {
                        playMiner();
                    }
                }, 300);
            } else if (field.value === 0) {
                canvas.processEmptySiblings(field);
            }
        };
    canvas.start();
};
var playMiner = function () {
    minesG(document.querySelector('#size').value, document.querySelector('#density').value);
}
