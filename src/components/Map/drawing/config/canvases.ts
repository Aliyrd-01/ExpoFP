import { RegularBooth } from "../../../../store/BoothStore";
import { t } from "../../../../utils/i18n";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export interface CanvasDescriptor {
    width: number;
    height: number;
    draw(c: CanvasRenderingContext2D): void;
}

let prevMeasureFont: string;
function measureText(font: string, text: string) {
    if (prevMeasureFont !== font) ctx.font = font;
    return ctx.measureText(text).width;
}

export function createLabelCanvas(text: string, fontSize: number, pixelRatio: number, color: string = "#fff"): CanvasDescriptor {
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
        draw(c) {
            // set font again
            c.font = font;
            c.textAlign = "center";
            c.textBaseline = "alphabetic";

            // c.fillStyle = "#000";
            // c.fillRect(0,0,canvas.width, canvas.height);

            c.fillStyle = color;
            c.fillText(text, width / 2, height - (vPad / 2) * pixelRatio);
        },
    };
}

export function createDetailsCanvas(b: RegularBooth, pixelRatio: number, color: string = "#fff"): CanvasDescriptor {
    //const fixBooth = EFP_EXPO === "fincon19" && b.special === true && b.title.startsWith("Quick Money");
    const lines = [];
    // const bs = b.special ? (b as SpecialBooth) : undefined;
    //const br = !b.special ? (b as RegularBooth) : undefined;
    // if (b.special === false) {

    if (b.onHold) {
        lines.push(t("On Hold"));
    } else if (b.reserved) {
        lines.push(t("Reserved"));
    } else if (b.exhibitors.length) {
        lines.push(...b.exhibitors.map((e) => e.name).sort((a, b) => (a > b ? 1 : -1)));
    } else {
        if (b.size) lines.push(b.size);
        if (b.price && b.price !== "0") lines.push(b.price);
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
    const companiesWidth = lines.map((x) => measureText(detailFont, x));
    const maxTextWidth = Math.max(mainLineWidth, ...companiesWidth);

    const width = maxTextWidth + 2;
    const height = boothFontSize + boothPadding + lines.length * detailFontSize + 3 * pixelRatio + 4;

    return {
        width,
        height,
        draw(c) {
            let nextLine = boothFontSize;

            c.fillStyle = color;
            c.textAlign = "start";
            c.textBaseline = "alphabetic";
            c.font = boothFont;

            c.fillText(mainLine, 0, nextLine);
            nextLine += boothFontSize + boothPadding;

            c.font = detailFont;
            c.fillStyle = color;

            for (const line of lines) {
                c.fillText(line, 0, nextLine);
                nextLine += detailFontSize + 1 * pixelRatio;
            }
        },
    };
}

const circleCanvasCache = new Map<string, CanvasDescriptor>();
export function createCircleCanvas(
    radius: number,
    pixelRatio: number,
    color: string = "#fff",
    stroke: string = null
): CanvasDescriptor {
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
            draw(c) {
                c.fillStyle = stroke || color;
                c.beginPath();
                c.arc(size / 2, size / 2, radius * pixelRatio, 0, 2 * Math.PI);
                c.fill();

                if (!stroke) return;
                c.fillStyle = color;
                c.beginPath();
                c.arc(size / 2, size / 2, (radius * pixelRatio) / 2, 0, 2 * Math.PI);
                c.fill();
            },
        };

        circleCanvasCache.set(key, res);
        // cleanup
        setTimeout(() => circleCanvasCache.delete(key), 5000);
    }
    return res;
}

const bookmarkCanvasCache = new Map<string, CanvasDescriptor & { lineWidth: number; padding: number }>();
export function createBookmarkCanvas(widthPx: number, pixelRatio: number, color: string = "#fff") {
    const key = widthPx + " " + pixelRatio;
    let res = bookmarkCanvasCache.get(key);
    if (!res) {
        // const canvas = document.createElement("canvas");
        const padding = 2 * pixelRatio;
        const w = widthPx * pixelRatio;
        const h = w * 1.4;

        const width = Math.ceil(w + padding * 2);
        const height = Math.ceil(h + padding * 2);
        const lineWidth = Math.ceil((1 * pixelRatio) / 1.5);

        // const c = canvas.getContext("2d");

        res = {
            width,
            height,
            lineWidth,
            padding,
            draw(c) {
                c.translate(padding, padding);
                c.fillStyle = "#e64839";
                c.strokeStyle = color;
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
            },
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

export function createMultilineTextCanvas(lines: string[], inputWidth: number, fontSize: number, color: string = "#fff") {
    // const canvas = document.createElement("canvas");
    const padding = fontSize * 0.5;
    const lineHeight = fontSize;

    const width = inputWidth + padding * 2;
    const height = lines.length * lineHeight + padding * 2;

    // const c = canvas.getContext("2d");

    return {
        width,
        height,
        draw(c) {
            c.textAlign = "center";
            c.textBaseline = "alphabetic";
            c.font = getFont(fontSize);

            const totalHeight = lines.length * lineHeight;
            const startFrom = height / 2 - totalHeight / 2 - fontSize * 0.1;

            for (let i = 0; i < lines.length; i++) {
                // c.fillStyle = "#aaa";
                // c.fillRect(0, startFrom + lineHeight * i, width, lineHeight);
                c.fillStyle = color;
                c.fillText(lines[i], width / 2, startFrom + lineHeight * (i + 1));
            }
        },
    };
}

// function getFont(px: number, weight: number) {
//     return weight + " " + px + 'px "Oswald", sans-serif';//-apple-system, Roboto,
// }
