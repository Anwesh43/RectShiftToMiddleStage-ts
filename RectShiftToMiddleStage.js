var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var color = '#43A047';
var drawRSTMNode = function (context, i, scale) {
    var gap = h / nodes;
    var size = gap / 3;
    var index = i % 2;
    context.save();
    context.translate(w / 2, gap / 2 + gap * i);
    context.scale(1 - 2 * index, 1);
    context.fillRect((w / 2 + size / 2) * (1 - scale) - size / 2, -size / 2, size, size);
    context.beginPath();
    context.moveTo(0, -gap / 2);
    context.lineTo(0, -gap / 2 + gap * scale);
    context.stroke();
    context.restore();
};
var RectShiftToMiddleStage = (function () {
    function RectShiftToMiddleStage() {
        this.canvas = document.createElement('canvas');
        this.rstm = new LinkedRSTM();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    RectShiftToMiddleStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    RectShiftToMiddleStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        if (this.rstm) {
            this.rstm.draw(this.context);
        }
    };
    RectShiftToMiddleStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.rstm.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.rstm.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    RectShiftToMiddleStage.init = function () {
        var stage = new RectShiftToMiddleStage();
    };
    return RectShiftToMiddleStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += this.dir * 0.1;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var RSTMNode = (function () {
    function RSTMNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    RSTMNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new RSTMNode(this.i + 1);
            this.next.prev = this;
        }
    };
    RSTMNode.prototype.draw = function (context) {
        drawRSTMNode(context, this.i, this.state.scale);
        if (this.prev) {
            this.prev.draw(context);
        }
    };
    RSTMNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    RSTMNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    RSTMNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return RSTMNode;
})();
var LinkedRSTM = (function () {
    function LinkedRSTM() {
        this.curr = new RSTMNode(0);
        this.dir = 1;
    }
    LinkedRSTM.prototype.draw = function (context) {
        context.lineCap = 'round';
        context.lineWidth = Math.min(w, h) / 60;
        context.strokeStyle = color;
        context.fillStyle = color;
        this.curr.draw(context);
    };
    LinkedRSTM.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedRSTM.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedRSTM;
})();
