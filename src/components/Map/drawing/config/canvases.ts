import { PathInfo } from "../../../../data/Data";
import { getTrianglesFromFpPaths } from "../../../../data/svg";
import { RegularBooth } from "../../../../store/BoothStore";
import { t } from "../../../../utils/i18n";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export interface CanvasDescriptor {
    w?: number;
    h?: number;
    width: number;
    height: number;
    draw(c: CanvasRenderingContext2D): void;
}

let prevMeasureFont: string;
function measureText(font: string, text: string) {
    if (prevMeasureFont !== font) ctx.font = font;
    return ctx.measureText(text).width;
}

export function createLabelCanvas(
    text: string,
    fontSize: number,
    pixelRatio: number,
    color: string = "#fff",
    fontWeight: number
): CanvasDescriptor {
    text = text.replace(/^_/, "");
    fontSize *= pixelRatio;
    // const canvas = document.createElement("canvas");
    // const c = canvas.getContext("2d");
    const font = getFont(fontSize, fontWeight);
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
    fontSize: number,
    onlyId: boolean,
    textAlign: CanvasTextAlign = "start"
): CanvasDescriptor {
    //const fixBooth = EFP_EXPO === "fincon19" && b.special === true && b.title.startsWith("Quick Money");
    const lines = [];
    // const bs = b.special ? (b as SpecialBooth) : undefined;
    //const br = !b.special ? (b as RegularBooth) : undefined;
    // if (b.special === false) {

    if (b.onHold) {
        lines.push(t("On Hold"));
    } else if (b.reserved) {
        lines.push(t("Reserved"));
    } /*else if (b.exhibitors.length) {
<<<<<<< HEAD
        lines.push(...b.exhibitors.map((e) => e.name).sort((a, b) => (a > b ? 1 : -1)));
    } */ else if (!onlyId) {
        lines.push(...b.exhibitors.map((e) => e.name).sort((a, b) => (a > b ? 1 : -1)));
    }
    if (b.size) lines.push(b.size.indexOf("/") > -1 ? b.size.substring(0, b.size.indexOf("/")).trim() : b.size);
    if (b.price && b.price !== "0") lines.push(b.price);

    // }

    // if (fixBooth) lines.push(b.title);

    const boothFontSize = fontSize * pixelRatio;
    const detailFontSize = 0.9 * fontSize * pixelRatio;
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
            let x = 0;

            if (textAlign === "right") {
                x = width;
            }

            c.fillStyle = color;
            c.textAlign = textAlign;
            c.textBaseline = "alphabetic";
            c.font = boothFont;

            c.fillText(mainLine, x, nextLine);
            nextLine += boothFontSize + boothPadding;

            c.font = detailFont;
            c.fillStyle = color;

            for (const line of lines) {
                c.fillText(line, x, nextLine);
                nextLine += detailFontSize + 1 * pixelRatio;
            }
        },
    };
}

export function createExhibitorsDetailsCanvas(
    b: RegularBooth,
    pixelRatio: number,
    color: string = "#fff",
    frontSize: number,
    onlyMain: boolean,
    onlyFeaturedExhibitors: boolean,
    textAlign: CanvasTextAlign = "start"
): CanvasDescriptor {
    const mainLines: string[] = [];
    const detailsLines: string[] = [];

    const mainFontSize = frontSize * pixelRatio;
    const detailFontSize = 0.9 * frontSize * pixelRatio;

    const mainFont = getFont(mainFontSize, 500);
    const detailFont = getFont(detailFontSize, 300);

    if (onlyFeaturedExhibitors) mainLines.push(...b.exhibitors.filter((e) => e.featured).map((e) => e.name));
    else mainLines.push(...b.exhibitors.map((e) => e.name));

    if (!onlyMain) detailsLines.push(b.name);

    const maxTextWidth = Math.max(
        ...mainLines.map((x) => measureText(mainFont, x)),
        ...detailsLines.map((x) => measureText(detailFont, x))
    );

    const w = Math.max(
        ...mainLines.map((x) =>
            measureText(mainFont, x.replace(" ", "").substring(0, 4).replace(/[0-9]/g, "3").replace(/[A-Z]/gi, "A"))
        ),
        ...detailsLines.map((x) =>
            measureText(detailFont, x.replace(" ", "").substring(0, 4).replace(/[0-9]/g, "3").replace(/[A-Z]/gi, "A"))
        )
    );

    const height =
        mainFontSize * mainLines.length +
        detailFontSize * detailsLines.length +
        pixelRatio * (mainLines.length + detailsLines.length) +
        3;

    return {
        width: maxTextWidth,
        height,
        w,
        h: onlyMain ? height / mainLines.length : null,
        draw(c) {
            let nextLine = mainFontSize;
            let x = 0;

            if (textAlign === "right") {
                x = maxTextWidth;
            }

            c.fillStyle = color;
            c.textAlign = textAlign;
            c.textBaseline = "alphabetic";

            c.font = mainFont;
            c.fillStyle = color;

            for (const line of mainLines) {
                c.fillText(line, x, nextLine);
                nextLine += mainFontSize + pixelRatio;
            }

            c.font = detailFont;

            for (const line of detailsLines) {
                c.fillText(line, x, nextLine);
                nextLine += detailFontSize + pixelRatio;
            }
        },
    };
}

const circleCanvasCache = new Map<string, CanvasDescriptor>();
export function createCircleCanvas(radius: number, pixelRatio: number, color: string = "#fff"): CanvasDescriptor {
    const key = radius + " " + pixelRatio + " " + color;
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

export function createYahCanvas(
    pixelRatio: number,
    color: string = "#ff4343",
    scale: number = pixelRatio * 0.5
): CanvasDescriptor {
    return {
        width: 77 * scale,
        height: 116 * scale,
        // padding,
        draw(ctx) {
            ctx.scale(scale, scale);

            ctx.beginPath();
            ctx.fillStyle = "#FFFFFF";
            ctx.moveTo(68.303, 57.335);
            ctx.bezierCurveTo(77.894, 39.304, 70.649, 15.785, 50.95, 8.04);
            ctx.bezierCurveTo(30.727, 0, 8.375, 11.837, 3.207, 32.831);
            ctx.bezierCurveTo(0, 46.185, 6.644, 57.323, 13.131, 68.211);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(51.565, 35.459);
            ctx.bezierCurveTo(51.565, 43.256, 45.201, 49.575, 37.354, 49.575);
            ctx.bezierCurveTo(29.516, 49.575, 23.159, 43.256, 23.159, 35.459);
            ctx.bezierCurveTo(23.159, 27.668, 29.516, 21.345, 37.354, 21.345);
            ctx.bezierCurveTo(45.201, 21.345, 51.565, 27.668, 51.565, 35.459);
            ctx.closePath();
            ctx.fill();

            // #path4
            ctx.beginPath();
            ctx.moveTo(68.303, 57.335);
            ctx.bezierCurveTo(77.894, 39.304, 70.649, 15.785, 50.95, 8.04);
            ctx.bezierCurveTo(30.727, 0, 8.375, 11.837, 3.207, 32.831);
            ctx.bezierCurveTo(0, 46.185, 6.644, 57.323, 13.131, 68.211);
            ctx.lineTo(13.131, 68.211);
            ctx.lineTo(13.131, 68.211);
            ctx.bezierCurveTo(13.921, 69.533, 14.698, 70.829, 15.454, 72.137);
            ctx.bezierCurveTo(19.465, 79.158, 23.533, 86.12, 27.571, 93.086);
            ctx.lineTo(27.571, 93.086);
            ctx.bezierCurveTo(30.098, 97.421, 32.611, 101.756, 35.116, 106.077);
            ctx.bezierCurveTo(36.128, 107.868, 38.934, 107.868, 39.945, 106.077);
            ctx.bezierCurveTo(49.387, 90.003, 58.708, 74.029, 68.031, 57.951);
            ctx.bezierCurveTo(68.15, 57.743, 68.24, 57.543, 68.303, 57.335);
            ctx.closePath();
            ctx.moveTo(60.103, 60.395);
            ctx.lineTo(63.201, 55.041);
            ctx.lineTo(63.201, 55.041);
            ctx.bezierCurveTo(73.31, 36.735, 61.285, 11.614, 39.04, 11.17);
            ctx.bezierCurveTo(19.388, 10.714, 2.759, 29.479, 9.386, 49.013);
            ctx.bezierCurveTo(10.726, 52.998, 12.657, 56.9, 14.84, 60.721);
            ctx.bezierCurveTo(15.041, 58.454, 15.938, 56.258, 17.589, 54.586);
            ctx.bezierCurveTo(19.708, 52.425, 22.216, 50.638, 24.996, 49.283);
            ctx.bezierCurveTo(28.252, 52.249, 32.595, 54.051, 37.354, 54.051);
            ctx.bezierCurveTo(42.123, 54.051, 46.47, 52.249, 49.73, 49.283);
            ctx.bezierCurveTo(52.505, 50.638, 55.017, 52.425, 57.135, 54.586);
            ctx.bezierCurveTo(58.701, 56.188, 59.701, 58.245, 60.103, 60.395);
            ctx.closePath();
            ctx.fill("evenodd");

            // #path6
            ctx.beginPath();

            ctx.moveTo(29.024, 104.982);
            ctx.bezierCurveTo(29.024, 103.626, 27.923, 102.527, 26.57, 102.527);
            ctx.bezierCurveTo(25.214, 102.527, 24.114, 103.626, 24.114, 104.982);
            ctx.bezierCurveTo(24.114, 111.395, 30.347, 116.838, 37.444, 116.838);
            ctx.bezierCurveTo(44.54, 116.838, 50.771, 111.395, 50.771, 104.982);
            ctx.bezierCurveTo(50.771, 103.626, 49.666, 102.527, 48.317, 102.527);
            ctx.bezierCurveTo(46.961, 102.527, 45.855, 103.626, 45.855, 104.982);
            ctx.bezierCurveTo(45.855, 108.193, 42.352, 111.956, 37.444, 111.956);
            ctx.bezierCurveTo(32.528, 111.956, 29.024, 108.193, 29.024, 104.982);
            ctx.closePath();
            ctx.fill();
        },
    };
}

export function canvarFromPath(paths: PathInfo[], scale: number = 0.5, suffix: string): CanvasDescriptor {
    var bounds: number[] = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE];

    paths.forEach((path) => {
        path["triangles"] = getTrianglesFromFpPaths(path.index, suffix);

        path["triangles"].forEach((tri: Triangle) => {
            tri.forEach((point) => {
                if (point[0] < bounds[0]) bounds[0] = point[0];
                else if (point[0] > bounds[2]) bounds[2] = point[0];

                if (point[1] < bounds[1]) bounds[1] = point[1];
                else if (point[1] > bounds[3]) bounds[3] = point[1];
            });
        });
    });

    const w = bounds[2] - bounds[0];
    const h = bounds[3] - bounds[1];
    const dx = bounds[0];
    const dy = bounds[1];

    return {
        width: w * scale,
        height: h * scale,

        draw(ctx) {
            ctx.scale(scale, scale);

            paths.forEach((path) => {
                ctx.beginPath();
                ctx.fillStyle = path.color;

                path["triangles"].forEach((tri) => {
                    ctx.moveTo(tri[0][0] - dx, tri[0][1] - dy);
                    ctx.lineTo(tri[1][0] - dx, tri[1][1] - dy);
                    ctx.lineTo(tri[2][0] - dx, tri[2][1] - dy);
                    ctx.lineTo(tri[0][0] - dx, tri[0][1] - dy);
                });

                ctx.fill();
            });
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
