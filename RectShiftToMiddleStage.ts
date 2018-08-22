const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const color : string = '#43A047'
const drawRSTMNode = (context, i, scale) => {
    context.fillStyle = color
    const gap : number = h / nodes
    const size : number = gap / 3
    const index : number = i % 2
    context.save()
    context.translate(w / 2, gap/2 + gap * i)
    context.scale(1 - 2 * index, 1)
    context.fillRect(w/2 * (1 - scale) - size/2, -size/2, size, size)
    context.restore()
}
class RectShiftToMiddleStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    rstm : LinkedRSTM = new LinkedRSTM()
    animator : Animator = new Animator()
    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        if (this.rstm) {
            this.rstm.draw(this.context)
        }
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.rstm.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.rstm.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : RectShiftToMiddleStage = new RectShiftToMiddleStage()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RSTMNode {
    next : RSTMNode
    prev : RSTMNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RSTMNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawRSTMNode(context, this.i, this.state.scale)
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RSTMNode {
        var curr : RSTMNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedRSTM {
    curr : RSTMNode = new RSTMNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.strokeStyle = color
        context.beginPath()
        context.moveTo(w / 2, 0.05 * h)
        context.lineTo(w / 2, 0.95 * h)
        context.stroke()
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
