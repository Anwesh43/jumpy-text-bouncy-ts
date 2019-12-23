const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.005
const text : string = "hello"
const nodes : number = 5
const foreColor : string = "teal"
const backColor : string = "#bdbdbd"
const delay : number = 30
const fontSizeFactor : number = 5

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawJumpingCharacters(context : CanvasRenderingContext2D, scale : number, text : string, gap : number) {
        const tw : number = context.measureText(text).width
        const sf : number = ScaleUtil.sinify(scale)
        var x = 0
        context.save()
        context.translate(-tw / 2, 0)
        for (var i = 0; i < text.length; i++) {
            const sci : number = ScaleUtil.divideScale(sf, i, text.length)
            const ch : string =  `${text.charAt(i)}`
            const chw = context.measureText(ch).width
            context.save()
            context.translate(x, -gap * sci)
            context.rotate(Math.PI * sci)
            context.fillText(ch, 0, 0)
            context.restore()
            x += chw
        }
        context.restore()
    }

    static drawJTBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = h / (nodes + 1)
        const fontSize : number = gap / fontSizeFactor
        context.font = context.font.replace(/\d+/, `${fontSize}`)
        context.fillStyle = foreColor
        context.save()
        context.translate(w / 2, gap * (i + 1))
        DrawingUtil.drawJumpingCharacters(context, scale, text, gap)
        context.restore()
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
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
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class JTBNode {

    prev : JTBNode
    next : JTBNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new JTBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawJTBNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : JTBNode {
        var curr : JTBNode = this.prev
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

class JumpyBouncyText {

    root : JTBNode = new JTBNode(0)
    curr : JTBNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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

class Renderer {

    jbt : JumpyBouncyText = new JumpyBouncyText()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.jbt.draw(context)
    }

    handleTap(cb : Function) {
        this.jbt.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.jbt.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
