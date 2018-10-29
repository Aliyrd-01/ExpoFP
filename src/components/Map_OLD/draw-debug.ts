import c from './drawing-context'
import { svgWidth, svgHeight } from '@/tools/svg'

export function drawFpGrid() {
    const ctx = c.context;
    const extendX = 1000;
    const extendY = 1000;
    ctx.strokeStyle = 'blue'
    for (var x = -extendX; x < svgWidth + extendX; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, -extendY);
        ctx.lineTo(x, svgHeight + extendY * 2);
        ctx.stroke();
    }

    for (var y = -extendY; y < svgHeight + extendY; y += 100) {
        ctx.beginPath();
        ctx.moveTo(-extendX, y);
        ctx.lineTo(svgWidth + extendX * 2, y);
        ctx.stroke();
    }
}

export function drawDebug() {
    c.context.save();
    // let lines = 0;
    c.context.translate(c.canvas.width - 160 * c.deviceScale, 0)
    const fontSize = 9 * c.deviceScale;
    c.context.font = `${fontSize}px Arial`;
    c.context.textBaseline = 'top';

    writeLine('svgScale: ' + c.svgScale)
    writeLine('zoomScale: ' + c.zoomScale)
    // writeLine('zoomTranslateX: ' + c.zoomTranslateX)
    // writeLine('zoomTranslateY: ' + c.zoomTranslateY)
    // writeLine('styleHeight: ' + c.styleHeight)
    // writeLine('canvas.height: ' + c.canvas.height)
    // writeLine('svgHeight: ' + svgHeight)
    // writeLine('svgViewBox.y1: ' + c.svgViewBox.y1)
    // writeLine('svgViewBox.h: ' + c.svgViewBox.h)
    // writeLine('svgViewBox.x1: ' + c.svgViewBox.x1)
    // writeLine('svgViewBox.w: ' + c.svgViewBox.w)
    writeLine('fpAvgBoothArea: ' + c.fpAvgBoothArea)
    writeLine('detailLevel: ' + c.detailLevel)
    //writeLine('y: ' + c.)
    //c.context.textAlign = 'center';

    c.context.restore();

    function writeLine(text: string) {
        c.context.fillText(text, 10, 10)
        c.context.translate(0, fontSize)
    }
}