import c from './drawing-context'
import { getCurrentSpriteIntersectingObjects } from './caching';
import settings from '@/settings';
import Color from 'color';

const booths = store.getters.boothsArray as Booth[];
let cachedChecksums: Map<Booth[], string>;
let cachedBoothsStateKey: string;


export function getBoothsStateChecksum() {
    const key = `${store.getters.hoveredBoothIds.join()}|` +
        `${store.getters.selectedBoothIds.join()}|` +
        `${store.getters.bookmarkedArray.join()}|` +
        `${store.getters.listBoothsIds.join()}`;

    if (key !== cachedBoothsStateKey) {
        cachedChecksums = new Map<Booth[], string>();
        cachedBoothsStateKey = key;
    }
    const bb = getCurrentSpriteIntersectingObjects(booths);
    if (!cachedChecksums.has(bb)) {
        const c1 = getCurrentSpriteIntersectingObjects(bb).reduce((s, c) => s + getBoothStateBits(c).join(), "");
        cachedChecksums.set(bb, c1);
    }

    return cachedChecksums.get(bb);
}

export function drawBooths() {
    for (var b of getCurrentSpriteIntersectingObjects(booths)) {
        drawSingleBooth(b);
    }
}

export function drawSingleBooth(b: Booth) {
    const ctx = c.spriteContext;
    ctx.save();
    ctx.translate(b.rect.x1, b.rect.y1);

    let defColor =  settings.colors.booths.default;
    if (b.name.startsWith('Y')){
        defColor = '#aaa';
    } else 
    if (b.name.startsWith('X')){
        defColor = '#82D13F';
    } else if (parseInt(b.name)> 949 && parseInt(b.name) < 1000){
        defColor = '#FF9E4D';
    }

    const s = getBoothState(b)
    
    let color: string;
    if (s.error) color = '#f33'
    else if (s.selected) color = settings.colors.booths.selected;
    // else if (s.selected) color = settings.colors.booths.selected;
    // else if (s.hover) color = !s.empty ? settings.colors.booths.defaultHover : settings.colors.booths.emptyHover;
    else if (s.empty) color = settings.colors.booths.empty;
    else color = defColor;

    if (s.dimmed && !s.selected) {
        color = settings.colors.booths.empty; // Color(color).desaturate(0.5).toString();
    }
    if (s.hover && !s.selected) {// || !s.dimmed && s.otherHaveDim
        color = Color(color).darken(0.2).toString();
    }

    color = c.dimColor(color, s.dimmed && !s.selected);

    ctx.fillStyle = color;

    ctx.fillRect(0, 0, b.rect.w, b.rect.h)
    if (s.bookmarked) drawBookmark(b, s.dimmed);
    ctx.restore();
}

export function getBoothState(b: Booth) {
    const g = store.getters;
    const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
    const selected = !!g.selectedBoothIdsSet.has(b.id);
    const inList = g.listBoothsIdsSet.has(b.id);
    const dimmedFp = g.dimmed;
    const dimmed = dimmedFp && !inList && !selected;

    const empty = b.exhibitors.length === 0;
    const error = !!b.error && !b.name.startsWith('Y');
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, selected, dimmed, dimmedFp, error, empty, bookmarked }
}

function getBoothStateBits(b: Booth) {
    let { hover, selected, dimmed, dimmedFp, error, empty, bookmarked } = getBoothState(b);
    return [hover, selected, dimmed, dimmedFp, error, empty, bookmarked]
}

function drawBookmark(b: Booth, dimmed: boolean) {
    const ctx = c.spriteContext;
    let w = c.getUnscaled(12);
    w = Math.min(w, b.rect.w / 3.5)
    const h = w * 1.4;
    ctx.save();
    ctx.translate(b.rect.w - 1.5 * w, 0);

    ctx.fillStyle = c.dimColor("#e64839", dimmed);
    ctx.strokeStyle = c.dimColor(settings.colors.fg, dimmed);
    ctx.lineWidth = c.getStrokeWidth() / 1.5;
    // ctx.fillRect(b.rect.w - 1.5 * w, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, h);
    ctx.lineTo(w / 2, h - w / 2);
    ctx.lineTo(w, h);
    ctx.lineTo(w, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}