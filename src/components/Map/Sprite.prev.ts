// const maxHeight = 1000;
// const maxWidth = 1000;

// export default class Sprite {
//     // private items: SpriteItemEx[] = [];
//     private readonly canvasToSpriteItem = new Map<HTMLCanvasElement, SpriteItemEx>();
//     // private canvas: HTMLCanvasElement;

//     addCanvas(canvas: HTMLCanvasElement): SpriteItem {
//         let item = this.canvasToSpriteItem.get(canvas);

//         if (!item) {
//             item = {
//                 containerCanvas: undefined,
//                 // canvasTmp: canvas,
//                 width: canvas.width,
//                 height: canvas.height,
//                 rect: undefined as Rect,
//                 top: undefined,
//                 left: undefined
//             };

//             // this.items.push(item);
//             this.canvasToSpriteItem.set(canvas, item);
//         }
//         return item;
//     }

//     generateSpriteCanvases(): HTMLCanvasElement[] {
//         const canvases = [];
//         let currentCanvas;
//         let drawHeight = 0;
//         let nextHeight = 0;
//         let drawWidth = 0;

//         const canvasesKeys = Array.from(this.canvasToSpriteItem.keys());
//         canvasesKeys.sort((a,b) => a.height - b.height);

//         for (const canvas of canvasesKeys) {
//             const item = this.canvasToSpriteItem.get(canvas);

//             if (drawWidth + canvas.width > maxWidth) {
//                 drawWidth = 0;
//                 drawHeight = nextHeight;
//             }

//             if (!currentCanvas || drawHeight + canvas.height > maxHeight) {
//                 if (currentCanvas) {
//                     currentCanvas.width = maxWidth;
//                     currentCanvas.height = nextHeight;
//                 }
//                 currentCanvas = document.createElement("canvas");
//                 canvases.push(currentCanvas);
//                 debugCanvases.push(currentCanvas);
//                 drawHeight = nextHeight = drawWidth = 0;
//             }

//             item.containerCanvas = currentCanvas;
//             item.top = drawHeight;
//             item.left = drawWidth;

//             drawWidth += canvas.width;
//             if (drawHeight + canvas.height > nextHeight) {
//                 nextHeight = drawHeight + canvas.height;
//             }
//         }

//         currentCanvas.width = maxWidth;
//         currentCanvas.height = nextHeight;

//         // draw and set rect
//         for (const canvas of canvasesKeys) {
//             const item = this.canvasToSpriteItem.get(canvas);

//             const c = item.containerCanvas.getContext("2d");
//             c.drawImage(canvas, item.left, item.top);

//             item.rect = Rect.fromXywh(item.left, item.top, item.width, item.height)
//                 .normalize(item.containerCanvas.width, item.containerCanvas.height);
//         }

//         // clear to free memory
//         this.canvasToSpriteItem.clear();

//         return canvases;
//     }

//     //     getSpriteItem():SpriteItem {
//     // return null;
//     //     }
// }



// export interface SpriteItem {
//     //rectFunc: () => Rect;
//     rect: Rect;
//     width: number;
//     height: number;
//     containerCanvas: HTMLCanvasElement;
// }

// interface SpriteItemEx extends SpriteItem {
//     // canvasTmp: HTMLCanvasElement;
//     top: number,
//     left: number
// }

// // export function createTextCanvas(text: string, fontSize: number) {
// //     const canvas = document.createElement("canvas")
// //     const c = canvas.getContext("2d");
// //     const font = getFont(fontSize, 400);
// //     c.font = font;

// //     const { width } = c.measureText(text);

// //     canvas.width = width;
// //     canvas.height = fontSize + 2;
// //     // set font again
// //     c.font = font;
// //     c.textAlign = "center";
// //     c.textBaseline = "middle";

// //     // c.fillStyle = "#000";
// //     // c.fillRect(0,0,canvas.width, canvas.height);

// //     c.fillStyle = "#fff";

// //     c.fillText(text, width / 2, canvas.height / 2);

// //     return canvas;
// // }