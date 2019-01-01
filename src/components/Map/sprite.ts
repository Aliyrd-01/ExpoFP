import { getFont } from './utils';

export default class Sprite {
    private items: SpriteItemEx[] = [];
    private canvas: HTMLCanvasElement;

    addCanvas(canvas: HTMLCanvasElement): SpriteItem {
        const item: SpriteItemEx = {
            canvas,
            width: canvas.width,
            height: canvas.height,
            rect: undefined as Rect,
            top: undefined,
            left: undefined
        };

        this.items.push(item);
        return item;
    }

    generateSpriteCanvas(): HTMLCanvasElement {
        // creates large canvas
        this.canvas = document.createElement("canvas")
        debugCanvases.push(this.canvas);
        const c = this.canvas.getContext("2d");
        const maxWidth = 1000;
        let drawHeight = 0;
        let nextHeight = 0;
        let drawWidth = 0;
        for(const item of this.items){
            
            if (drawWidth + item.canvas.width > maxWidth){
                drawWidth = 0;
                drawHeight = nextHeight;
            }
            item.top = drawHeight;
            item.left = drawWidth;

            drawWidth += item.canvas.width;
            if (drawHeight + item.canvas.height > nextHeight){
                nextHeight = drawHeight + item.canvas.height;
            }
        }

        this.canvas.width = maxWidth;
        this.canvas.height = nextHeight;

        for(const item of this.items){
            c.drawImage(item.canvas, item.left, item.top);

            item.rect  = Rect.fromXywh(item.left, item.top, item.width, item.height)
                .normalize(this.canvas.width, this.canvas.height);
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
    top: number,
    left: number
}

export function createTextCanvas(text: string, fontSize: number) {
    const canvas = document.createElement("canvas")
    const c = canvas.getContext("2d");
    const font = getFont(fontSize, 400);
    c.font = font;
  
    const { width } = c.measureText(text);

    canvas.width = width;
    canvas.height = fontSize * 3 + 2;
    // set font again
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "middle";
    
    c.fillStyle = "#000";
    c.fillRect(0,0,canvas.width, canvas.height);

    c.fillStyle = "#fff";

    c.fillText(text, width / 2, canvas.height / 2);

    return canvas;
}