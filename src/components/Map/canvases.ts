//import { getFont } from './utils';

export function createTextCanvas(text: string, fontSize: number) {
    const canvas = document.createElement("canvas")
    const c = canvas.getContext("2d");
    const font = getFont(fontSize, 600);
    c.font = font;

    const { width } = c.measureText(text);

    canvas.width = width + 3 + 4; // 4 was added as extra padding
    canvas.height = fontSize + 4;
    // set font again
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "bottom";

    // c.fillStyle = "#000";
    // c.fillRect(0,0,canvas.width, canvas.height);

    c.fillStyle = "#fff";

    c.fillText(text, canvas.width / 2, canvas.height);

    return canvas;
}


export function createCircleCanvas(radius) {
    const canvas = document.createElement("canvas");
    const size = radius * 2 + 2;
    canvas.width = canvas.height = size;

    const c = canvas.getContext("2d");
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
    c.fill();
    return canvas;
}

function getFont(px: number, weight: number) {
    return weight + " " + px + 'px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
}