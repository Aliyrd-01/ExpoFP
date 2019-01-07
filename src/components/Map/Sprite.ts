const maxHeight = 1000;
const maxWidth = 1000;

export default class Sprite {
    private readonly canvasToSpriteItem = new Map<HTMLCanvasElement, SpriteItemEx>();

    addCanvas(canvas: HTMLCanvasElement): SpriteItem {
        let item = this.canvasToSpriteItem.get(canvas);

        if (!item) {
            item = {
                containerCanvas: undefined,
                rect: undefined,
                width: canvas.width,
                height: canvas.height,
            };

            this.canvasToSpriteItem.set(canvas, item);
        }
        return item;
    }

    generateSpriteCanvases(): HTMLCanvasElement[] {
        const canvases = [];
        let currentCanvas;
        let drawHeight = 0;
        let nextHeight = 0;
        let drawWidth = 0;

        const canvasesKeys = Array.from(this.canvasToSpriteItem.keys());
        canvasesKeys.sort((a,b) => a.height - b.height);

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
                debugCanvases.push(currentCanvas);
                drawHeight = nextHeight = drawWidth = 0;
            }

            item.containerCanvas = currentCanvas;

            item.rect = Rect.fromXywh(drawWidth, drawHeight, item.width, item.height);

            drawWidth += canvas.width;
            if (drawHeight + canvas.height > nextHeight) {
                nextHeight = drawHeight + canvas.height;
            }
        }

        currentCanvas.width = maxWidth;
        currentCanvas.height = nextHeight;

        // draw and set rect
        for (const canvas of canvasesKeys) {
            const item = this.canvasToSpriteItem.get(canvas);

            const c = item.containerCanvas.getContext("2d");
            c.drawImage(canvas, item.rect.x1, item.rect.y1);
        }

        // clear to free memory
        this.canvasToSpriteItem.clear();

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
