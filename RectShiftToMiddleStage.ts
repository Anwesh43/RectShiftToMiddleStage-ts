const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const drawRSTMNode = (context, i, scale) => {
    context.fillStyle = '#43A047'
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
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
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
