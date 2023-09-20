export default function canvasFromText(text: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");    
    ctx.font = "30px Arial";
    ctx.fillText(text, 0, 0);
    return canvas;
}
