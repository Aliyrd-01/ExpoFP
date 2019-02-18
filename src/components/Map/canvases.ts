//import { getFont2 } from './utils';

export function createLabelCanvas(text: string, fontSize: number) {
    text = text.replace(/^_/,'');
    fontSize *= devicePixelRatio
    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    const font = getFont(fontSize, 500);
    c.font = font;
    let { width } = c.measureText(text.replace(/./g,'3'));
    //if (text.length < 3) width += fontSize / 8;
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

export function createDetailsCanvas(b: Booth) {
    const lines = b.exhibitors.map(e => store.state.exhibitors[e].name);

    if (!b.exhibitors.length) {
        if (b.onHold) {
            lines.push('On Hold');
        } else {
            if (b.size) lines.push(b.size);
            if (b.price) lines.push(b.price);
        }
    }

    const boothFontSize = 12 * devicePixelRatio;
    const detailFontSize = 12 * devicePixelRatio;
    const boothFont = getFont(boothFontSize, 500);
    const detailFont = getFont(detailFontSize, 200);
    const boothPadding = 1 * devicePixelRatio;

    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    c.font = boothFont;
    const boothWidth = c.measureText(b.name).width;
    c.font = detailFont;
    const companiesWidth = lines.map(x => c.measureText(x).width);
    const maxTextWidth = Math.max(boothWidth, ...companiesWidth);
    canvas.width = maxTextWidth + 2;
    const height = boothFontSize + boothPadding + lines.length * detailFontSize + 3 * devicePixelRatio;
    canvas.height = height + 4;

    let nextLine = 0;
    c.fillStyle = "#fff";
    c.textAlign = "start";
    c.textBaseline = "hanging";
    c.font = boothFont;
    if (!b.hideName){
        c.fillText(b.name, 0, nextLine);
        nextLine += boothFontSize + boothPadding;
    }
    c.font = detailFont;

    for (const line of lines) {
        c.fillText(line, 0, nextLine);
        nextLine += detailFontSize + 1 * devicePixelRatio;
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

export function createBookmarkCanvas(widthPx: number) {
    const canvas = document.createElement("canvas");
    const padding = 2 * devicePixelRatio;
    const w = widthPx * devicePixelRatio;
    const h = w * 1.4;
    canvas.width = w + padding * 2;
    canvas.height = h + padding * 2;

    const c = canvas.getContext("2d");
    c.translate(padding, padding);
    c.fillStyle = "#e64839";
    c.strokeStyle = "#fff"
    c.lineWidth = 1 * devicePixelRatio / 1.5;
    // ctx.fillRect(b.rect.w - 1.5 * w, 0, w, h);

    c.beginPath();

    c.moveTo(0, 0);
    c.lineTo(0, h);
    c.lineTo(w / 2, h - w / 2);
    c.lineTo(w, h);
    c.lineTo(w, 0);
    // c.lineTo(0, 0)
    c.fill();
    c.stroke();

    return canvas;
}

function getFont(px: number, weight: number) {
    return weight + " " + px + 'px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
}

// function getFont(px: number, weight: number) {
//     return weight + " " + px + 'px "Oswald", sans-serif';//-apple-system, Roboto, 
// }