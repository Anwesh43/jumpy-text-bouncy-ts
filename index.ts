const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.005
const text : string = "hello"
const nodes : number = 1
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
            context.translate(0, -gap * sci)
            context.rotate(Math.PI * sci)
            context.fillText(ch, -chw / 2, 0)
            context.restore()
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

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

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
