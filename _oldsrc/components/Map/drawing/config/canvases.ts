//import { getFont2 } from './utils';

export function createLabelCanvas(text: string, fontSize: number, pixelRatio: number) {
    text = text.replace(/^_/, "");
    fontSize *= pixelRatio;
    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    const font = getFont(fontSize, 500);
    c.font = font;
    let { width } = c.measureText(text.replace(/[0-9]/g, "3").replace(/[A-Z]/g, "A"));
    //if (text.length < 3) width += fontSize / 8;
    canvas.width = width + 3 + 3; // 4 was added as extra padding
    const vPad = 4;
    canvas.height = fontSize + vPad;
    // set font again
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "alphabetic";

    // c.fillStyle = "#000";
    // c.fillRect(0,0,canvas.width, canvas.height);

    c.fillStyle = '#fff';
    c.fillText(text, canvas.width / 2, canvas.height - vPad / 2 * pixelRatio);

    return canvas;
}

export function createDetailsCanvas(b: RegularBooth, pixelRatio: number) {
    //const fixBooth = EFP_EXPO === "fincon19" && b.special === true && b.title.startsWith("Quick Money");
    const lines = [];
    // const bs = b.special ? (b as SpecialBooth) : undefined;
    //const br = !b.special ? (b as RegularBooth) : undefined;
    // if (b.special === false) {
    lines.push(...b.exhibitors.map(e => store.state.exhibitors[e].name));
    if (!b.exhibitors.length) {
        if (b.onHold) {
            lines.push("On Hold");
        } else {
            if (b.size) lines.push(b.size);
            if (b.price && b.price !== '0') lines.push(b.price);
        }
    }
    // }

    // if (fixBooth) lines.push(b.title);

    const boothFontSize = 14 * pixelRatio;
    const detailFontSize = 14 * pixelRatio;
    const boothFont = getFont(boothFontSize, 500);
    const detailFont = getFont(detailFontSize, 300);
    const boothPadding = 1 * pixelRatio;

    let mainLine = b.name;
    // if (b.special === false || fixBooth) {
    //     mainLine = b.name;
    // } else if (b.special === true) {
    //     mainLine = b.title || b.name;
    // }

    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    c.font = boothFont;
    const mainLineWidth = c.measureText(mainLine).width;
    c.font = detailFont;
    const companiesWidth = lines.map(x => c.measureText(x).width);
    const maxTextWidth = Math.max(mainLineWidth, ...companiesWidth);
    canvas.width = maxTextWidth + 2;
    const height = boothFontSize + boothPadding + lines.length * detailFontSize + 3 * pixelRatio;
    canvas.height = height + 4;

    let nextLine = boothFontSize;
    c.fillStyle = '#fff';
    c.textAlign = "start";
    c.textBaseline = "alphabetic";
    c.font = boothFont;

    c.fillText(mainLine, 0, nextLine);
    nextLine += boothFontSize + boothPadding;

    c.font = detailFont;
    c.fillStyle = '#fff';

    for (const line of lines) {
        c.fillText(line, 0, nextLine);
        nextLine += detailFontSize + 1 * pixelRatio;
    }

    return canvas;
}

const circleCanvasCache = new Map<string, { canvas: HTMLCanvasElement, padding: number }>();
export function createCircleCanvas(radius: number, pixelRatio: number) {
    const key = radius + " " + pixelRatio;
    let res = circleCanvasCache.get(key);

    if (!res) {
        const canvas = document.createElement("canvas");
        const padding = 1;
        const size = radius * 2 * pixelRatio + padding * 2;
        canvas.width = canvas.height = size;
    
        const c = canvas.getContext("2d");
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(size / 2, size / 2, radius * pixelRatio, 0, 2 * Math.PI);
        c.fill();
        res = { canvas, padding };

        circleCanvasCache.set(key, res);
        // cleanup
        setTimeout(() => circleCanvasCache.delete(key), 5000);
    }
    return res;
}

const bookmarkCanvasCache = new Map<string, { canvas: HTMLCanvasElement, lineWidth: number, padding: number }>();
export function createBookmarkCanvas(widthPx: number, pixelRatio: number) {
    const key = widthPx + " " + pixelRatio;
    let res = bookmarkCanvasCache.get(key);
    if (!res) {
        const canvas = document.createElement("canvas");
        const padding = 2 * pixelRatio;
        const w = widthPx * pixelRatio;
        const h = w * 1.4;
        canvas.width = w + padding * 2;
        canvas.height = h + padding * 2;

        const c = canvas.getContext("2d");
        c.translate(padding, padding);
        c.fillStyle = "#e64839";
        c.strokeStyle = "#fff";
        c.lineWidth = (1 * pixelRatio) / 1.5;
        // ctx.fillRect(b.rect.w - 1.5 * w, 0, w, h);

        c.beginPath();

        c.moveTo(0, 0);
        c.lineTo(0, h);
        c.lineTo(w / 2, h - w / 2);
        c.lineTo(w, h);
        c.lineTo(w, 0);
        c.lineTo(0, 0)
        c.fill();
        c.stroke();

        res = { canvas, lineWidth: c.lineWidth, padding };
        bookmarkCanvasCache.set(key, res);
        // cleanup
        setTimeout(() => bookmarkCanvasCache.delete(key), 5000);
    }
    return res;
}


export function getFont(px: number, weight: number = 500) {
    return (
        weight +
        " " +
        px +
        'px Oswald, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    );
}

export function createMultilineTextCanvas(lines: string[], width: number, fontSize: number) {
    const canvas = document.createElement("canvas");
    const padding = fontSize * 0.5;
    const lineHeight = fontSize;

    canvas.width = width + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    const c = canvas.getContext("2d");

    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.font = getFont(fontSize);

    const totalHeight = lines.length * lineHeight;
    const startFrom = canvas.height / 2 - totalHeight / 2 - fontSize * 0.1;

    for (let i = 0; i < lines.length; i++) {
        // c.fillStyle = "#aaa";
        // c.fillRect(0, startFrom + lineHeight * i, canvas.width, lineHeight);
        c.fillStyle = "#fff";
        c.fillText(lines[i], canvas.width / 2, startFrom + lineHeight * (i + 1));
    }

    return canvas;
}

// function getFont(px: number, weight: number) {
//     return weight + " " + px + 'px "Oswald", sans-serif';//-apple-system, Roboto,
// }
