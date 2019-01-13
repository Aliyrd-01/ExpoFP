//import { getFont } from './utils';

export function createLabelCanvas(text: string, fontSize: number) {
    fontSize *= devicePixelRatio
    const canvas = document.createElement("canvas");
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

export function createDetailsCanvas(b:Booth) {
    const companies = b.exhibitors.map(e => store.state.exhibitors[e].name)

    const boothFontSize = 14 * devicePixelRatio;
    const detailFontSize = 13 * devicePixelRatio;
    const boothFont = getFont(boothFontSize, 600);
    const detailFont = getFont(detailFontSize, 400);
    const boothPadding =  0 * devicePixelRatio;

    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    c.font = boothFont;
    const boothWidth = c.measureText(b.name).width;
    c.font = detailFont;
    const companiesWidth = companies.map(x => c.measureText(x).width);
    const maxTextWidth = Math.max(boothWidth, ...companiesWidth);
    canvas.width = maxTextWidth + 2;
    const height = boothFontSize + boothPadding + companies.length * detailFontSize + 3 * devicePixelRatio;
    canvas.height = height;

    let nextLine = 0;
    c.fillStyle = "#fff";
    c.textAlign = "start";
    c.textBaseline = "hanging";
    c.font = boothFont;
    c.fillText(b.name, 0, nextLine);
    nextLine += boothFontSize + boothPadding;
    c.font = detailFont;

    for(const line of companies){
        c.fillText(line, 0, nextLine);
        nextLine += detailFontSize;
    }


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