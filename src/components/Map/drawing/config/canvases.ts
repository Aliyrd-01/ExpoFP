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

export function createDetailsCanvas(
    b: RegularBooth,
    pixelRatio: number,
    color: string = "#fff",
    frontSize: number,
    onlyMain: boolean
): CanvasDescriptor {
    const mainLines: string[] = [];
    const detailsLines: string[] = [];

    const mainFontSize = frontSize;
    const detailFontSize = frontSize;

    const mainFont = getFont(mainFontSize, 500);
    const detailFont = getFont(detailFontSize, 300);

    if (b.onHold) {
        detailsLines.push(t("On Hold"));
        mainLines.push(b.name);
    } else if (b.reserved) {
        detailsLines.push(t("Reserved"));
        mainLines.push(b.name);
    } else if (b.exhibitors.length) {
        mainLines.push(...b.exhibitors.map((e) => e.name).sort((a, b) => (a > b ? 1 : -1)));
        detailsLines.push(b.name);
    } else {
        mainLines.push(b.name);
        if (b.size) detailsLines.push(b.size);
        if (b.price && b.price !== "0") detailsLines.push(b.price);
    }

    const mainLineWidth = mainLines.concat(detailsLines).map((x) => measureText(mainFont, x));
    const detailsWidth = detailsLines.map((x) => measureText(detailFont, x));

    const maxTextWidth = Math.max(...mainLineWidth, ...detailsWidth);

    const width = maxTextWidth + 2;

    const height =
        mainFontSize + mainLines.length * (mainFontSize + pixelRatio) + detailsLines.length * (detailFontSize + pixelRatio);

    return {
        width,
        height,
        draw(c) {
            let nextLine = mainFontSize;

            c.fillStyle = color;
            c.textAlign = "start";
            c.textBaseline = "alphabetic";

            c.font = mainFont;
            c.fillStyle = color;

            for (const line of mainLines) {
                c.fillText(line, 0, nextLine);
                nextLine += mainFontSize + 1 * pixelRatio;
            }

            c.font = detailFont;

            nextLine += pixelRatio;

            if (onlyMain) return;

            for (const line of detailsLines) {
                c.fillText(line, 0, nextLine);
                nextLine += detailFontSize + 1 * pixelRatio;
            }
        },
    };
}

const circleCanvasCache = new Map<string, CanvasDescriptor>();
export function createCircleCanvas(radius: number, pixelRatio: number, color: string = "#fff"): CanvasDescriptor {
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
                c.fillStyle = color;
                c.beginPath();
                c.arc(size / 2, size / 2, radius * pixelRatio, 0, 2 * Math.PI);
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

export function createCurrentCanvas(
    pixelRatio: number,
    color: string = "#c8248b",
    scale: number = pixelRatio * 0.4
): CanvasDescriptor {
    return {
        width: 70 * scale,
        height: 70 * scale,

        draw(ctx) {
            ctx.scale(scale, scale);

            // #path833
            ctx.beginPath();
            ctx.fillStyle = "#FFFFFF";
            ctx.moveTo(0.0, 35.0);
            ctx.bezierCurveTo(0.0, 54.329966, 15.670034, 70.0, 35.0, 70.0);
            ctx.bezierCurveTo(54.329966, 70.0, 70.0, 54.329966, 70.0, 35.0);
            ctx.bezierCurveTo(70.0, 15.670034, 54.329966, 0.0, 35.0, 0.0);
            ctx.bezierCurveTo(15.670034, 0.0, 0.0, 15.670034, 0.0, 35.0);
            ctx.fill();

            // #path835
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(10.0, 35.0);
            ctx.bezierCurveTo(10.0, 48.807119, 21.192881, 60.0, 35.0, 60.0);
            ctx.bezierCurveTo(48.807119, 60.0, 60.0, 48.807119, 60.0, 35.0);
            ctx.bezierCurveTo(60.0, 21.192881, 48.807119, 10.0, 35.0, 10.0);
            ctx.bezierCurveTo(21.192881, 10.0, 10.0, 21.192881, 10.0, 35.0);
            ctx.fill();
        },
    };
}

export function createTargetCanvas(
    pixelRatio: number,
    color: string = "#c8248b",
    scale: number = pixelRatio * 0.5
): CanvasDescriptor {
    return {
        width: 70 * scale,
        height: 100 * scale,
        // padding,
        draw(ctx) {
            ctx.beginPath();
            ctx.scale(scale, scale);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.moveTo(32.6, 97.8);
            ctx.bezierCurveTo(24.4, 81.5, 0.0, 57.0, 0.0, 32.6);
            ctx.bezierCurveTo(0.0, 14.6, 14.6, 0.0, 32.6, 0.0);
            ctx.bezierCurveTo(50.5, 0.0, 65.2, 14.6, 65.2, 32.6);
            ctx.bezierCurveTo(65.2, 57.0, 40.7, 81.5, 32.6, 97.8);
            ctx.fill();

            // #path1440
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(32.6, 91.1);
            ctx.bezierCurveTo(25.2, 76.3, 3.1, 54.2, 3.1, 32.1);
            ctx.bezierCurveTo(3.1, 15.9, 16.3, 2.6, 32.6, 2.6);
            ctx.bezierCurveTo(48.8, 2.6, 62.0, 15.9, 62.0, 32.1);
            ctx.bezierCurveTo(62.0, 54.2, 39.9, 76.3, 32.6, 91.1);
            ctx.fill();

            // #path1442
            ctx.beginPath();
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.moveTo(16.2, 32.6);
            ctx.bezierCurveTo(16.2, 41.6, 23.5, 48.9, 32.5, 48.9);
            ctx.bezierCurveTo(41.5, 48.9, 48.8, 41.6, 48.8, 32.6);
            ctx.bezierCurveTo(48.8, 23.6, 41.5, 16.3, 32.5, 16.3);
            ctx.bezierCurveTo(23.5, 16.3, 16.2, 23.6, 16.2, 32.6);
            ctx.fill();
        },
    };
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
