// //import { getFont2 } from './utils';

// export function createLabelCanvas(text: string, fontSize: number, color: string = '#fff') {
//     text = text.replace(/^_/, "");
//     fontSize *= devicePixelRatio;
//     const canvas = document.createElement("canvas");
//     const c = canvas.getContext("2d");
//     const font = getFont(fontSize, 500);
//     c.font = font;
//     let { width } = c.measureText(text.replace(/[0-9]/g, "3").replace(/[A-Z]/g, "A"));
//     //if (text.length < 3) width += fontSize / 8;
//     canvas.width = width + 3 + 3; // 4 was added as extra padding
//     const vPad = 4;
//     canvas.height = fontSize + vPad;
//     // set font again
//     c.font = font;
//     c.textAlign = "center";
//     c.textBaseline = "alphabetic";

//     // c.fillStyle = "#000";
//     // c.fillRect(0,0,canvas.width, canvas.height);

//     c.fillStyle = color;
//     c.fillText(text, canvas.width / 2, canvas.height - vPad / 2 * devicePixelRatio);

//     return canvas;
// }

// export function createDetailsCanvas(b: RegularBooth, color: string = "#fff") {
//     //const fixBooth = EFP_EXPO === "fincon19" && b.special === true && b.title.startsWith("Quick Money");
//     const lines = [];
//     // const bs = b.special ? (b as SpecialBooth) : undefined;
//     //const br = !b.special ? (b as RegularBooth) : undefined;
//     // if (b.special === false) {
//     lines.push(...b.exhibitors.map(e => store.state.exhibitors[e].name));
//     if (!b.exhibitors.length) {
//         if (b.onHold) {
//             lines.push("On Hold");
//         } else {
//             if (b.size) lines.push(b.size);
//             if (b.price && b.price !== '0') lines.push(b.price);
//         }
//     }
//     // }

//     // if (fixBooth) lines.push(b.title);

//     const boothFontSize = 14 * devicePixelRatio;
//     const detailFontSize = 14 * devicePixelRatio;
//     const boothFont = getFont(boothFontSize, 500);
//     const detailFont = getFont(detailFontSize, 300);
//     const boothPadding = 1 * devicePixelRatio;

//     let mainLine = b.name;
//     // if (b.special === false || fixBooth) {
//     //     mainLine = b.name;
//     // } else if (b.special === true) {
//     //     mainLine = b.title || b.name;
//     // }

//     const canvas = document.createElement("canvas");
//     const c = canvas.getContext("2d");
//     c.font = boothFont;
//     const mainLineWidth = c.measureText(mainLine).width;
//     c.font = detailFont;
//     const companiesWidth = lines.map(x => c.measureText(x).width);
//     const maxTextWidth = Math.max(mainLineWidth, ...companiesWidth);
//     canvas.width = maxTextWidth + 2;
//     const height = boothFontSize + boothPadding + lines.length * detailFontSize + 3 * devicePixelRatio;
//     canvas.height = height + 4;

//     let nextLine = boothFontSize;
//     c.fillStyle = color;
//     c.textAlign = "start";
//     c.textBaseline = "alphabetic";
//     c.font = boothFont;

//     c.fillText(mainLine, 0, nextLine);
//     nextLine += boothFontSize + boothPadding;

//     c.font = detailFont;
//     c.fillStyle = '#fff';

//     for (const line of lines) {
//         c.fillText(line, 0, nextLine);
//         nextLine += detailFontSize + 1 * devicePixelRatio;
//     }

//     return canvas;
// }

// export function createCircleCanvas(radius: number, color: string = '#fff') {
//     const canvas = document.createElement("canvas");
//     const padding = 1;
//     const size = radius * 2 * devicePixelRatio + padding * 2;
//     canvas.width = canvas.height = size;

//     const c = canvas.getContext("2d");
//     c.fillStyle = color;
//     c.beginPath();
//     c.arc(size / 2, size / 2, radius * devicePixelRatio, 0, 2 * Math.PI);
//     c.fill();
//     return { canvas, padding };
// }

// export function createBookmarkCanvas(widthPx: number) {
//     const canvas = document.createElement("canvas");
//     const padding = 2 * devicePixelRatio;
//     const w = widthPx * devicePixelRatio;
//     const h = w * 1.4;
//     canvas.width = w + padding * 2;
//     canvas.height = h + padding * 2;

//     const c = canvas.getContext("2d");
//     c.translate(padding, padding);
//     c.fillStyle = "#e64839";
//     c.strokeStyle = "#fff";
//     c.lineWidth = (1 * devicePixelRatio) / 1.5;
//     // ctx.fillRect(b.rect.w - 1.5 * w, 0, w, h);

//     c.beginPath();

//     c.moveTo(0, 0);
//     c.lineTo(0, h);
//     c.lineTo(w / 2, h - w / 2);
//     c.lineTo(w, h);
//     c.lineTo(w, 0);
//     c.lineTo(0, 0)
//     c.fill();
//     c.stroke();

//     return { canvas, lineWidth: c.lineWidth, padding };
// }


// export function getFont(px: number, weight: number = 500) {
//     return (
//         weight +
//         " " +
//         px +
//         'px Oswald, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
//     );
// }

// export function createMultilineTextCanvas(lines: string[], width: number, fontSize: number) {
//     const canvas = document.createElement("canvas");
//     const padding = fontSize * 0.5;
//     const lineHeight = fontSize;

//     canvas.width = width + padding * 2;
//     canvas.height = lines.length * lineHeight + padding * 2;

//     const c = canvas.getContext("2d");

//     c.textAlign = "center";
//     c.textBaseline = "alphabetic";
//     c.font = getFont(fontSize);

//     const totalHeight = lines.length * lineHeight;
//     const startFrom = canvas.height / 2 - totalHeight / 2 - fontSize * 0.1;

//     for (let i = 0; i < lines.length; i++) {
//         // c.fillStyle = "#aaa";
//         // c.fillRect(0, startFrom + lineHeight * i, canvas.width, lineHeight);
//         c.fillStyle = "#fff";
//         c.fillText(lines[i], canvas.width / 2, startFrom + lineHeight * (i + 1));
//     }

//     return canvas;
// }

// // function getFont(px: number, weight: number) {
// //     return weight + " " + px + 'px "Oswald", sans-serif';//-apple-system, Roboto,
// // }
