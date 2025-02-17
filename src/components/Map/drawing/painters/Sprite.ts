import Rect from "../../../../core/Rect";
import debugCanvases from "../../../../tools/debugCanvases";
import isDebug from "../../../../utils/is-debug";
import isMobile from "../../../../utils/is-mobile";
import isWebview from "../../../../utils/is-webview";
import { CanvasDescriptor } from "../config/canvases";

const maxHeight = (isMobile || isWebview) ? 1024 : 2000;
const maxWidth = (isMobile || isWebview) ? 1024 : 2000;

type ContainerCanvasInfo = {
    width: number;
    height: number;
    items: SpriteItemEx[];
};

const canvas = document.createElement("canvas");
canvas.width = maxWidth;
canvas.height = maxHeight;
const c = canvas.getContext("2d");


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
                canvas,
            };
            // console.log('zzzz', item);
            this.canvasToSpriteItem.set(canvas, item);
        }
        return item;
    }

    generateSpriteCanvases(): (() => HTMLCanvasElement)[] {
        if (isDebug) console.time("sprite.generateSpriteCanvases");

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
                    // round nextHeight up
                    if (nextHeight < maxHeight && nextHeight > maxHeight - 100) nextHeight = maxHeight;
                    currentContainer.height = nextHeight;
                }
                currentContainer = { width: 0, height: 0, items: [] };
                containerCanvasInfos.push(currentContainer);
                //
                drawHeight = nextHeight = drawWidth = 0;
            }

            currentContainer.items.push(item);

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

        // clear to free memory
        this.canvasToSpriteItem.clear();

        if (isDebug) console.timeEnd("sprite.generateSpriteCanvases");

        // we're reusing same canvas
        return containerCanvasInfos.map((ci, i) => () => {
            canvas.id = "cnvs_" + i;

            c.setTransform(1, 0, 0, 1, 0, 0);
            c.clearRect(0, 0, canvas.width, canvas.height);

            for (const item of ci.items) {
                c.setTransform(1, 0, 0, 1, item.rect.x1, item.rect.y1);
                item.canvas.draw(c);
                item.containerCanvasId = canvas.id;
                item.containerCanvasWidth = canvas.width;
                item.containerCanvasHeight = canvas.height;
                // item.containerCanvas = canvas;
            }

            if (isDebug) debugCanvases.push(canvas);
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
