//import { Area } from "./areas";
import c from './drawing-context'
// import { isShallowEqual } from '@/utils';
import { getFont } from './utils';
//import settings from '@/settings';
import { getSpriteIntersectingObjects } from './caching';
import { getBoothState } from '@/components/Map/draw-booths';
import settings from '@/settings';

const minFontSize = 4;
const maxFontSize = 14;


const booths = store.getters.boothsArray as Booth[]

export default function drawLabels() {
    if (c.detailLevel < 100) return;

    // console.log('drawing labels: ', visibleBooths.length)
    for (var b of getSpriteIntersectingObjects(booths)) {
        drawSingleLabel(b)
    }
}


export function drawSingleLabel(b: Booth) {
    const ctx = c.spriteContext
    const s = getBoothState(b);
    const color = c.dimColor('#fff', c.dimmed && s.dimmed && !s.selected);
    ctx.save();
    try {
        if (c.detailLevel < 5000) {
            const padding = c.getUnscaled(5);
            const w = b.rect.w - 2 * padding;
            const h = b.rect.h - 2 * padding;
            if (w > 0 && h > 0) {
                const rect = Rect.fromXywh(b.rect.x1 + padding, b.rect.y1 + padding, w, h);
                ctx.translate(b.rect.cx, b.rect.cy);
                const fontSize = getMaxFontSize(rect, b.name);
                if (fontSize) {
                    const font = getFont(fontSize);

                    ctx.font = font;
                    ctx.fillStyle = color;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.fillText(b.name, 0, 0);
                    return;
                }
            }
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, 2 * Math.PI);
            ctx.fill();
            return;

        }

        const paddingY = c.getUnscaled(8);
        const paddingX = c.getUnscaled(5);
        const w = b.rect.w - 2 * paddingX;
        const h = b.rect.h - 2 * paddingY;
        if (w <= 0 || h <= 0) return;
        const rect = Rect.fromXywh(b.rect.x1 + paddingX, b.rect.y1 + paddingY, w, h);
        const lines = b.exhibitors.map(e => store.state.exhibitors[e].name);
        lines.unshift(b.name);
        const detailsFontSize = c.detailLevel > 22000 ? 14 : 12;
        const fontSize = c.getUnscaled(detailsFontSize);
        let occupiedHeight = fontSize;
        ctx.font = getFont(fontSize);
        ctx.fillStyle = color;
        ctx.textBaseline = 'hanging';
        ctx.textAlign = 'left';

        ctx.translate(rect.x1, rect.y1);
        const occupiedOk = () => occupiedHeight <= rect.h;

        for (let i = 0; i < lines.length && occupiedOk(); i++) {
            const line = lines[i].trim();
            let trimmedText = trimToWidth(line, rect.w);
            occupiedHeight += fontSize;
            if (trimmedText !== line) {
                // insert rest as the next line
                const right = line.substr(trimmedText.length);
                trimmedText = trimmedText.trim();
                if (right.length > 2) {
                    lines.splice(i + 1, 0, right)
                } else {
                    trimmedText += '…';
                }
                if (!occupiedOk && !trimmedText.endsWith('…')) {
                    trimmedText += '…';
                }
            }
            ctx.fillText(trimmedText, 0, occupiedHeight - 2 * fontSize);

        }
    }
    finally {
        ctx.restore();
    }
}

function doesTextFitWithCurrentScale(rect: Rect, text: string, fontSize: number) {
    const font = getFont(fontSize);
    c.spriteContext.font = font;
    const size = c.spriteContext.measureText(text);
    return size.width <= rect.w && fontSize < rect.h;
}

function getMaxFontSize(rect: Rect, text: string) {
    let fontSize = maxFontSize;
    while (fontSize > minFontSize) {
        const scaledFontSize = c.getUnscaled(fontSize);
        const fits = doesTextFitWithCurrentScale(rect, text, scaledFontSize);
        if (fits) return scaledFontSize;
        fontSize -= 1;
    }

    return null;
    //const scaledFontSize = ctx.getUnscaled(fontSize);
    //const font = `${fontSize}px Arial`;
}

function trimToWidth(text: string, widthPx: number): string {
    const length = text.length;
    let left = 0;
    let right = length;
    // let i = 0;
    while (true) {
        let middle = Math.floor((left + right) / 2);
        // console.log(i, left, middle, right)
        if (middle === 0) return '';
        if (right - left <= 1) return text.substr(0, left);
        //let leftText = text.substr(0, left);
        let rightText = text.substr(0, right);
        let middleText = text.substr(0, middle);
        //let leftFits = ctx.ctx.measureText(leftText).width <= widthPx;
        let rightFits = c.spriteContext.measureText(rightText).width <= widthPx;
        if (rightFits) return rightText;
        let middleFits = c.spriteContext.measureText(middleText).width <= widthPx;
        if (middleFits) left = middle;
        else right = middle;
    }
}



