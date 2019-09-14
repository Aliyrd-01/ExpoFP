import settings from "../../../../tools/settings";
import debugCanvases from "../../../../tools/debugCanvases";
import Rect from "../../../../core/Rect";

const maxHeight = 2000;
const maxWidth = 2000;

export default class Sprite {
    private readonly canvasToSpriteItem = new Map<HTMLCanvasElement, SpriteItemEx>();

    addCanvas(canvas: HTMLCanvasElement): SpriteItem {
        let item = this.canvasToSpriteItem.get(canvas);

        if (!item) {
            item = {
                containerCanvas: undefined,
                rect: undefined,
                width: canvas.width,
                height: canvas.height
            };

            this.canvasToSpriteItem.set(canvas, item);
        }
        return item;
    }

    generateSpriteCanvases(): HTMLCanvasElement[] {
        if (settings.debug) console.time("sprite.generateSpriteCanvases");
        const canvases = [];
        let currentCanvas;
        let drawHeight = 0;
        let nextHeight = 0;
        let drawWidth = 0;

        const canvasesKeys = Array.from(this.canvasToSpriteItem.keys());
        canvasesKeys.sort((a, b) => a.height - b.height);

        for (const canvas of canvasesKeys) {
            const item = this.canvasToSpriteItem.get(canvas);

            if (drawWidth + canvas.width > maxWidth) {
                drawWidth = 0;
                drawHeight = nextHeight;
            }

            if (!currentCanvas || drawHeight + canvas.height > maxHeight) {
                if (currentCanvas) {
                    currentCanvas.width = maxWidth;
                    currentCanvas.height = nextHeight;
                }
                currentCanvas = document.createElement("canvas");
                canvases.push(currentCanvas);
                if (settings.debug) debugCanvases.push(currentCanvas);
                drawHeight = nextHeight = drawWidth = 0;
            }

            item.containerCanvas = currentCanvas;

            item.rect = Rect.fromXywh(drawWidth, drawHeight, item.width, item.height);

            drawWidth += canvas.width + 2; // add padding
            if (drawHeight + canvas.height > nextHeight) {
                nextHeight = drawHeight + canvas.height;
            }
        }

        if (currentCanvas) {
            currentCanvas.width = maxWidth;
            currentCanvas.height = nextHeight;
        }

        // cache adds 15% improvement
        const cache = new Map<HTMLCanvasElement, CanvasRenderingContext2D>();
        // draw and set rect
        for (const canvas of canvasesKeys) {
            const item = this.canvasToSpriteItem.get(canvas);

            let c = cache.get(item.containerCanvas);
            if (!c) {
                c = item.containerCanvas.getContext("2d");
                cache.set(item.containerCanvas, c);
            }

            c.drawImage(canvas, item.rect.x1, item.rect.y1);
        }

        // clear to free memory
        this.canvasToSpriteItem.clear();

        if (settings.debug) console.timeEnd("sprite.generateSpriteCanvases");
        return canvases;
    }
}

export interface SpriteItem {
    rect: Rect;
    containerCanvas: HTMLCanvasElement;
}

interface SpriteItemEx extends SpriteItem {
    width: number;
    height: number;
}
