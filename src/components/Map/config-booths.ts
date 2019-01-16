import Color from 'color';
import { requireDrawer, requireUpdate } from "./draw";
import Drawer from "./Drawer";


const boothBgDrawerById = new Map<number, BoothBgDrawer>();

export default function config() {
    const booths = store.getters.boothsArray as Booth[];
    for (const b of booths) {
        boothBgDrawerById.set(b.id, new BoothBgDrawer(b))
    }
};

abstract class BoothDrawerBase {
    protected readonly booth: Booth;
    protected readonly drawer: Drawer;

    constructor(booth: Booth, drawerType: string) {
        this.booth = booth;
        this.drawer = requireDrawer(drawerType);
    }

    protected getId(name: string) {
        return `b${this.booth.id}${name}`;
    }
}

class BoothBgDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, 'booth-bg');

        const r = this.booth.rect;
        this.drawer.addObject({
            id: this.getId('bg'),
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [.5, .5, -.5, -.5],
            color: getBoothColor(this.booth)
        });
    }

    private update(){
        
    }

}


store.watch(((s, g) => g.hoveredBoothIds) as any, (v: number[], oldV: number[]) => {
    handleBoothSetsDifference(new Set(v), new Set(oldV));
});


store.watch(((s, g) => g.selectedBoothIdsSet) as any, (v: Set<number>, oldV: Set<number>) => {
    handleBoothSetsDifference(v, oldV);
});


function handleBoothSetsDifference(v: Set<number>, oldV: Set<number>) {
    const newElements = Array.from(v).filter(x => !oldV.has(x));
    const missingElements = Array.from(oldV).filter(x => !v.has(x));

    newElements.forEach(x => boothColorsToHandle.add(x));
    missingElements.forEach(x => boothColorsToHandle.add(x));

    // may be later -> call require-redraw
}


function getBoothState(b: Booth) {
    const g = store.getters;

    const hover = g.hoveredBoothIds.indexOf(b.id) !== -1;
    const selected = !!g.selectedBoothIdsSet.has(b.id);
    const inList = g.listBoothsIdsSet.has(b.id);
    const dimmedFp = g.dimmed;
    const dimmed = dimmedFp && !inList && !selected;

    const empty = b.exhibitors.length === 0;
    const error = !!b.error;
    const bookmarked = b.exhibitors.find(e => store.state.bookmarked[e])
    return { hover, selected, dimmed, dimmedFp, error, empty, bookmarked };
}


function getBoothColor(b: Booth): Vec4 {
    const s = getBoothState(b);
    let color: Color;

    if (s.selected) color = Color(__settings.colors.booths.selected);
    else color = Color(__settings.colors.booths.default);

    if (s.hover) {
        color = color.darken(0.2);
    }

    return ColorInfo.fromHex(color.hex()).toVec4();
}



