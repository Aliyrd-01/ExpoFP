import Rect from "../../../../core/Rect";
import debugCanvases from "../../../../tools/debugCanvases";
import settings from "../../../../tools/settings";
import { CanvasDescriptor } from "../config/canvases";

const maxHeight = 2000;
const maxWidth = 2000;

type ContainerCanvasInfo = {
    width: number;
    height: number;
    items: SpriteItemEx[];
};

export default class Sprite {
    private readonly canvasToSpriteItem = new Map<CanvasDescriptor, SpriteItemEx>();

    addCanvas(canvas: CanvasDescriptor): SpriteItem {
        let item = this.canvasToSpriteItem.get(canvas);

        if (!item) {
            item = {
                // containerCanvas: undefined,
                containerCanvasId: undefined,
                containerCanvasWidth: undefined,
                containerCanvasHeight: undefined,
                rect: undefined,
                width: Math.ceil(canvas.width),
                height: Math.ceil(canvas.height),
                canvas
            };
            // console.log('zzzz', item);
            this.canvasToSpriteItem.set(canvas, item);
        }
        return item;
    }

    generateSpriteCanvases(): (() => HTMLCanvasElement)[] {
        if (settings.debug) console.time("sprite.generateSpriteCanvases");

        // const containerCanvasItems = new Map<CanvasInfo, SpriteItemEx[]>();

        const containerCanvasInfos = [] as ContainerCanvasInfo[];
        let currentContainer: ContainerCanvasInfo;
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

            if (!currentContainer || drawHeight + canvas.height > maxHeight) {
                if (currentContainer) {
                    currentContainer.width = maxWidth;
                    currentContainer.height = nextHeight;
                }
                currentContainer = { width: 0, height: 0, items: [] };
                containerCanvasInfos.push(currentContainer);
                //
                drawHeight = nextHeight = drawWidth = 0;
            }

            currentContainer.items.push(item);
            // let ar = containerCanvasItems.get(currentContainer);
            // if (!ar){
            //     ar = [];
            //     containerCanvasItems.set(currentContainer, ar);
            // }
            // ar.push(item);
            // item.containerCanvas = currentContainer;

            item.rect = Rect.fromXywh(drawWidth, drawHeight, item.width, item.height);

            drawWidth += canvas.width + 2; // add padding
            if (drawHeight + canvas.height > nextHeight) {
                nextHeight = drawHeight + canvas.height;
            }
        }

        if (currentContainer) {
            currentContainer.width = maxWidth;
            currentContainer.height = nextHeight;
        }

        // for(const ci of containerCanvasInfos){

        // }

        // // cache adds 15% improvement
        // const cache = new Map<HTMLCanvasElement, CanvasRenderingContext2D>();
        // // draw and set rect
        // for (const canvas of canvasesKeys) {
        //     const item = this.canvasToSpriteItem.get(canvas);

        //     let c = cache.get(item.containerCanvas);
        //     if (!c) {
        //         c = item.containerCanvas.getContext("2d");
        //         cache.set(item.containerCanvas, c);
        //     }
        //     // if (canvas instanceof HTMLCanvasElement) {
        //     //     c.drawImage(canvas, item.rect.x1, item.rect.y1);
        //     // } else {
        //     // c.fillRect(item.rect.x1, item.rect.y1, item.rect.w, item.rect.h);
        //     c.setTransform(1, 0, 0, 1, item.rect.x1, item.rect.y1);
        //     canvas.draw(c);
        //     // }
        // }

        // clear to free memory
        this.canvasToSpriteItem.clear();

        if (settings.debug) console.timeEnd("sprite.generateSpriteCanvases");
        return containerCanvasInfos.map((ci, i) => () => {
            const canvas = document.createElement("canvas");
            canvas.id = "cnvs_" + i;
            canvas.width = ci.width;
            canvas.height = ci.height;
            const c = canvas.getContext("2d");

            for (const item of ci.items) {
                c.setTransform(1, 0, 0, 1, item.rect.x1, item.rect.y1);
                item.canvas.draw(c);
                item.containerCanvasId = canvas.id;
                item.containerCanvasWidth = canvas.width;
                item.containerCanvasHeight = canvas.height;
                // item.containerCanvas = canvas;
            }

            if (settings.debug) debugCanvases.push(currentContainer);
            return canvas;
        });
    }
}

export interface SpriteItem {
    rect: Rect;
    containerCanvasId: string;
    containerCanvasWidth: number;
    containerCanvasHeight: number;
    // containerCanvas: () => HTMLCanvasElement;
}

interface SpriteItemEx extends SpriteItem {
    width: number;
    height: number;
    canvas: CanvasDescriptor;
}
