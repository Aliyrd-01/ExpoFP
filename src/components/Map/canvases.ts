import { getFont } from './utils';

export function createTextCanvas(text: string, fontSize: number) {
    const canvas = document.createElement("canvas")
    const c = canvas.getContext("2d");
    const font = getFont(fontSize, 400);
    c.font = font;
  
    const { width } = c.measureText(text);

    canvas.width = width;
    canvas.height = fontSize + 2;
    // set font again
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "middle";
    
    // c.fillStyle = "#000";
    // c.fillRect(0,0,canvas.width, canvas.height);

    c.fillStyle = "#fff";

    c.fillText(text, width / 2, canvas.height / 2);

    return canvas;
}