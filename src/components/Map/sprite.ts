import { getFont } from './utils';

export default class Sprite {
    private items: SpriteItemEx[] = [];
    private canvas: HTMLCanvasElement;

    addCanvas(canvas: HTMLCanvasElement): SpriteItem {
        const item: SpriteItemEx = {
            canvas,
            width: canvas.width,
            height: canvas.height,
            rect: undefined as Rect
        };

        this.items.push(item);
        return item;
    }

    generateSpriteCanvas(): HTMLCanvasElement {
        // creates large canvas
        this.canvas = document.createElement("canvas")
        debugCanvases.push(this.canvas);
        const c = this.canvas.getContext("2d");
        const maxWidth = 2000;
        let occupiedHeight = 0;
        let nextHeight = 0;
        let occupiedWidth = 0;
        for(const item of this.items){
            // TODO!!
            occupiedWidth += item.canvas.width;
            if (occupiedWidth > maxWidth){
                occupiedHeight = nextHeight;
            }
            c.drawImage(item.canvas, occupiedWidth, occupiedHeight);
        }

        // put all small canvases into this one
        // adjust rect for each after it is done

        return this.canvas;
    }

    //     getSpriteItem():SpriteItem {
    // return null;
    //     }
}



export interface SpriteItem {
    //rectFunc: () => Rect;
    rect: Rect;
    width: number;
    height: number;
}

interface SpriteItemEx extends SpriteItem {
    canvas: HTMLCanvasElement;
}

export function createTextCanvas(text: string, fontSize: number) {
    const canvas = document.createElement("canvas")
    const c = canvas.getContext("2d");
    c.font = getFont(fontSize, 400);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";
    const { width } = c.measureText(text);

    canvas.width = width;
    canvas.height = fontSize;

    c.fillText(text, width / 2, canvas.height / 2);

    return canvas;
}