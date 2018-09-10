import c from './drawing-context';
import { drawBooths, getBoothsStateChecksum } from './draw-booths';
import drawFg from './draw-fg';
import drawBg from './draw-bg';
import drawLabels from './draw-labels';
import drawColumns from './draw-columns';
import drawIcons from './draw-icons';

// TODO: dynamic parts
const parts = c.deviceScale >= 1.5 ? 3 : 2;
const dirtySprites:string[] = [];

export function drawSprites() {
    console.log('drawSprites', performance.now())
    const fpXCStep = Math.round(c.fpCWidth / parts);
    const fpYCStep = Math.round(c.fpCHeight / parts);
    const exactXRatio = c.svgWidth / c.fpCWidth;
    const exactYRatio = c.svgHeight / c.fpCHeight;

    const fpFRectVisible = c.fpFRectVisible;
    dirtySprites.length = 0;

    for (let xPart = 0; xPart < parts; xPart++) {
        for (let yPart = 0; yPart < parts; yPart++) {
            const fx1 = xPart * fpXCStep;
            const fy1 = yPart * fpYCStep;
            const fx2 = xPart === parts - 1 ? c.fpCWidth : (xPart + 1) * fpXCStep;
            const fy2 = yPart === parts - 1 ? c.fpCHeight : (yPart + 1) * fpYCStep;

            const fRect = Rect.fromX1y1x2y2(fx1, fy1, fx2, fy2);
            const sRect = Rect.fromX1y1x2y2(fx1 * exactXRatio, fy1 * exactYRatio, fx2 * exactXRatio, fy2 * exactYRatio);

            if (fpFRectVisible.intersects(fRect)) {
                const id = `${xPart}x${yPart}`;
                const dirty = drawSprite(id, fRect, sRect);
                if (dirty){
                    dirtySprites.push(id);
                }
            }
        }
    }
}

const wait = 100;

window.setInterval(()=>{
    if (dirtySprites.length){
        c.requireRedraw();
    }
}, 100);


function createSpriteCanvas(fRect: Rect, sRect: Rect) {
    c.spriteSRect = sRect;

    const canvas = document.createElement('canvas');
    if (fRect.w * fRect.h > 16777216){
        return canvas;
    }
    console.log('Creating canvas2:', fRect.w, fRect.h)
    canvas.width = fRect.w;
    canvas.height = fRect.h;
    c.spriteContext = canvas.getContext('2d');
    c.spriteContext.scale(fRect.w / sRect.w, fRect.h / sRect.h);
    c.spriteContext.translate(-sRect.x1, -sRect.y1);

    drawBg();
    drawBooths();
    drawColumns();
    drawLabels();
    drawFg();
    drawIcons();
    

    return canvas;
}


function drawSprite(id: string, fRect: Rect, sRect: Rect):boolean {
    const sprite = getSpriteToDraw(id, fRect, sRect);
    const ctx = c.context;

    ctx.save();
    ctx.translate(c.fpCx + fRect.x1, c.fpCy + fRect.y1);

    ctx.drawImage(sprite.canvas, 0, 0, fRect.w, fRect.h);
    // ctx.strokeStyle = '#000';
    // ctx.lineWidth = 0.3;
    // ctx.strokeRect(0, 0, fRect.w, fRect.h);

    ctx.restore();

    trimCache();

    return sprite.dirty;
}

const maxExactCachedCanvases = 2000;
const exactCanvasCache = new Map<string, HTMLCanvasElement>();
const exactCachedKeysQueue: string[] = [];

const lastPositionById = new Map<string, string>();
const lastCanvasById = new Map<string, HTMLCanvasElement>();
// const lastRequestedByExactKey = new Map<string, number>();
// const lastRequestedExactKeyById = new Map<string, string>();
const lastRequestedPositionKeyById = new Map<string, { positionKey: string, time: number }>();
// const isSpriteDirty = new Map<string, boolean>();

function getSpriteToDraw(id: string, fRect: Rect, sRect: Rect):{canvas:HTMLCanvasElement, dirty: boolean} {
    c.spriteSRect = sRect;
    const state = getBoothsStateChecksum();
    const positionKey = `${fRect.toString()}|${sRect.toString()}`
    const exactKey = `${positionKey}|${state}`;

    const lastPositionForThisSprite = lastRequestedPositionKeyById.get(id);
    if (!lastPositionForThisSprite || lastPositionForThisSprite.positionKey !== positionKey) {
        lastRequestedPositionKeyById.set(id, { positionKey, time: performance.now() });
    }

    let timeSinceInitialRequestForThisPosition = 0;
    if (lastPositionForThisSprite && lastPositionForThisSprite.positionKey === positionKey) {
        timeSinceInitialRequestForThisPosition = performance.now() - lastPositionForThisSprite.time;
    }

    let canvas = exactCanvasCache.get(exactKey);

    // console.log('State', exactCanvasCache.has(exactKey), positionKey === lastPositionById.get(id), timeSinceInitialRequestForThisPosition)
    if (!canvas) {
        const lastPositionKey = lastPositionById.get(id);
        if (lastPositionKey === positionKey || timeSinceInitialRequestForThisPosition >= wait) {
            // just state changed
            canvas = createCanvasNow();
        } else {
            canvas = lastCanvasById.get(id) || createCanvasNow();
        }
    }

    const dirty = !exactCanvasCache.has(exactKey);

    if (!dirty) {
        lastCanvasById.set(id, canvas);
    }

    return {canvas, dirty};

    function createCanvasNow() {
        const canvas = createSpriteCanvas(fRect, sRect);
        exactCanvasCache.set(exactKey, canvas);
        exactCachedKeysQueue.push(exactKey);
        return canvas;
    }
}

function trimCache() {
    while (exactCanvasCache.size > maxExactCachedCanvases) {
        const keyToRemove = exactCachedKeysQueue.shift();
        exactCanvasCache.delete(keyToRemove);
    }

}

(window as any)['canvasCache'] = exactCanvasCache