import c from './drawing-context'
import { getSpriteIntersectingObjects } from './caching';
import settings from '@/settings';

const booths = store.getters.boothsArray as Booth[];
let cachedChecksums: Map<Booth[], string>;
let cachedBoothsStateKey: string;


export function getBoothsStateChecksum() {
    // return getSpriteIntersectingObjects(booths).reduce((s, c) => s + getBoothState(c), "");
    const key = `${store.getters.hoveredBooths.join()}|` +
        `${store.getters.selectedExhibitor ? store.getters.selectedExhibitor.id : ''}|` +
        `${store.getters.bookmarkedArray.join()}|` +
        `${store.getters.highlightedBoothIds ? store.getters.highlightedBoothIds.join() : 'x'}`;

    if (key !== cachedBoothsStateKey) {
        cachedChecksums = new Map<Booth[], string>();
        cachedBoothsStateKey = key;
    }
    const bb = getSpriteIntersectingObjects(booths);
    if (!cachedChecksums.has(bb)) {
        const c1 = getSpriteIntersectingObjects(bb).reduce((s, c) => s + getBoothStateBits(c).join(), "");
        cachedChecksums.set(bb, c1);
    }

    return cachedChecksums.get(bb);
    // console.log('getSpriteIntersectingObjects(booths)', getSpriteIntersectingObjects(booths).length);

}

export function drawBooths() {
    for (var b of getSpriteIntersectingObjects(booths)) {
        drawSingleBooth(b);
    }
}

export function drawSingleBooth(b: Booth) {
    const ctx = c.spriteContext;
    ctx.save();
    ctx.translate(b.rect.x1, b.rect.y1);

    const s = getBoothState(b)
    let color: string;
    if (s.error) color = '#f33'
    else if (s.selected) color = settings.colors.booths.selected;
    else if (s.hover) color = !s.empty ? settings.colors.booths.defaultHover : settings.colors.booths.emptyHover;
    else if (s.empty) color = settings.colors.booths.empty;
    else color = settings.colors.booths.default;

    if (s.dimmed) {
        color = s.hover ? settings.colors.booths.emptyHover : settings.colors.booths.empty;
    }

    color = c.dimColor(color, s.dimmed);
    ctx.fillStyle = color;

    ctx.fillRect(0, 0, b.rect.w, b.rect.h)
    if (s.bookmarked) drawBookmark(b, s.dimmed);
    ctx.restore();
}

export function getBoothState(b: Booth) {
    const hover = store.getters.hoveredBooths.indexOf(b.id) !== -1;
    const highlighted = !!store.getters.highlightedBoothIdsObj[b.id];
    const dimmed = store.getters.highlightedBoothIds && !highlighted;
    const selected = store.getters.selectedExhibitor && b.exhibitors.find(e => e === store.getters.selectedExhibitor.id);
    const empty = b.exhibitors.length === 0;
    const error = !!b.error;
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, dimmed, selected, error, empty, bookmarked }
}

function getBoothStateBits(b: Booth) {
    let { hover, dimmed, selected, error, empty, bookmarked } = getBoothState(b);
    return [hover, dimmed, selected, error, empty, bookmarked]
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