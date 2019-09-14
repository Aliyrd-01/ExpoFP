import { RegularBooth } from "../../../../store/BoothStore";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export interface CanvasDescriptor {
    width: number;
    height: number;
    draw(x: number, y: number, c: CanvasRenderingContext2D): void;
}

let prevMeasureFont: string;
function measureText(font: string, text: string) {
    if (prevMeasureFont !== font) ctx.font = font;
    return ctx.measureText(text).width;
}

export function createLabelCanvas(text: string, fontSize: number, pixelRatio: number): CanvasDescriptor {
    text = text.replace(/^_/, "");
    fontSize *= pixelRatio;
    // const canvas = document.createElement("canvas");
    // const c = canvas.getContext("2d");
    const font = getFont(fontSize, 500);
    const width = measureText(font, text.replace(/[0-9]/g, "3").replace(/[A-Z]/g, "A")) + 3 + 3; //
    const vPad = 4;
    const height = fontSize + vPad;

    return {
        width,
        height,
        draw(x, y, c) {
            // set font again
            c.font = font;
            c.textAlign = "center";
            c.textBaseline = "alphabetic";

            // c.fillStyle = "#000";
            // c.fillRect(0,0,canvas.width, canvas.height);

            c.fillStyle = "#fff";
            c.fillText(text, x + width / 2, y + height - (vPad / 2) * pixelRatio);
        }
    };
}

export function createDetailsCanvas(b: RegularBooth, pixelRatio: number): CanvasDescriptor {
    //const fixBooth = EFP_EXPO === "fincon19" && b.special === true && b.title.startsWith("Quick Money");
    const lines = [];
    // const bs = b.special ? (b as SpecialBooth) : undefined;
    //const br = !b.special ? (b as RegularBooth) : undefined;
    // if (b.special === false) {
    lines.push(...b.exhibitors.map(e => e.name));
    if (!b.exhibitors.length) {
        if (b.onHold) {
            lines.push("On Hold");
        } else {
            if (b.size) lines.push(b.size);
            if (b.price && b.price !== "0") lines.push(b.price);
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

    // const canvas = document.createElement("canvas");
    // const c = canvas.getContext("2d");
    const mainLineWidth = measureText(boothFont, mainLine); // c.measureText(mainLine).width;
    const companiesWidth = lines.map(x => measureText(detailFont, x));
    const maxTextWidth = Math.max(mainLineWidth, ...companiesWidth);

    const width = maxTextWidth + 2;
    const height = boothFontSize + boothPadding + lines.length * detailFontSize + 3 * pixelRatio + 4;

    return {
        width,
        height,
        draw(x, y, c) {
            let nextLine = boothFontSize;

            c.fillStyle = "#fff";
            c.textAlign = "start";
            c.textBaseline = "alphabetic";
            c.font = boothFont;

            c.fillText(mainLine, x + 0, y + nextLine);
            nextLine += boothFontSize + boothPadding;

            c.font = detailFont;
            c.fillStyle = "#fff";

            for (const line of lines) {
                c.fillText(line, x + 0, y + nextLine);
                nextLine += detailFontSize + 1 * pixelRatio;
            }
        }
    };
}

const circleCanvasCache = new Map<string, CanvasDescriptor>();
export function createCircleCanvas(radius: number, pixelRatio: number): CanvasDescriptor {
    const key = radius + " " + pixelRatio;
    let res = circleCanvasCache.get(key);

    if (!res) {
        // const canvas = document.createElement("canvas");
        const padding = 1;
        const size = radius * 2 * pixelRatio + padding * 2;
        // canvas.width = canvas.height = size;

        res = {
            width: size,
            height: size,
            // padding,
            draw(x, y, c) {
                c.fillStyle = "#fff";
                c.beginPath();
                c.arc(x + size / 2, y + size / 2, radius * pixelRatio, 0, 2 * Math.PI);
                c.fill();
            }
        };

        circleCanvasCache.set(key, res);
        // cleanup
        setTimeout(() => circleCanvasCache.delete(key), 5000);
    }
    return res;
}

const bookmarkCanvasCache = new Map<string, CanvasDescriptor & { lineWidth: number; padding: number }>();
export function createBookmarkCanvas(widthPx: number, pixelRatio: number) {
    const key = widthPx + " " + pixelRatio;
    let res = bookmarkCanvasCache.get(key);
    if (!res) {
        // const canvas = document.createElement("canvas");
        const padding = 2 * pixelRatio;
        const w = widthPx * pixelRatio;
        const h = w * 1.4;

        const width = w + padding * 2;
        const height = h + padding * 2;
        const lineWidth = (1 * pixelRatio) / 1.5;

        // const c = canvas.getContext("2d");

        res = {
            width,
            height,
            lineWidth,
            padding,
            draw(x, y, c) {
                c.translate(x + padding, y + padding);
                c.fillStyle = "#e64839";
                c.strokeStyle = "#fff";
                c.lineWidth = lineWidth;

                c.beginPath();

                c.moveTo(0, 0);
                c.lineTo(0, h);
                c.lineTo(w / 2, h - w / 2);
                c.lineTo(w, h);
                c.lineTo(w, 0);
                c.lineTo(0, 0);
                c.fill();
                c.stroke();
            }
        };
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
