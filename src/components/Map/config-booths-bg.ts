import Color from "color";
import settings from "@/settings";
import { BoothDrawerBase } from "./config-booths-base";
import { getBoothState } from "./config-booths";
import animate from "./animate";
import TriangleDrawer2 from "./TriangleDrawer2";
import { requireDrawer } from "./draw";

export default class BoothBgDrawer extends BoothDrawerBase<TriangleDrawer2> {

    protected readonly booth: Booth;
    protected readonly drawer: TriangleDrawer2;
    public readonly updateBound: () => void;

    constructor(booth: Booth) {
        super(booth, "booth-bg", TriangleDrawer2);
        // this.booth = booth;
        // this.drawer = requireDrawer("booth-bg", TriangleDrawer2);
        // this.updateBound = this.update.bind(this);

        const r = this.booth.rect;
        const p0 = [r.x1, r.y1] as Vec2;
        const p1 = [r.x2, r.y1] as Vec2;
        const p2 = [r.x1, r.y2] as Vec2;
        const p3 = [r.x2, r.y2] as Vec2;

        const c = getBoothColor(this.booth);

        this.drawer.addObject({
            p0, p1, p2,
            color: c.vec4()
        });
        this.update();
    }

    // protected getId(name: string) {
    //     return `b${this.booth.id}${name}`;
    // }

    update() {
        const s = getBoothState(this.booth);
        const c = getBoothColor(this.booth);
        // this.drawer.updateColor(this.getId("bg"), c.vec4());
        // this.drawer.updateSkipdim(this.getId("bg"), s.skipDim);
    }
}

function getBoothColor(b: Booth) {
    const s = getBoothState(b);
    let color: string;
    let defColor: any;
    if (b.special === true) {
        defColor = b.color;
    } else if (b.special === false) {
        defColor =
            s.empty && !s.onhold ? b.availColor || settings.colors.booths.empty : b.soldColor || settings.colors.booths.default;
    }

    if (s.error) color = "#f33";
    else if (s.selected) color = settings.colors.booths.selected;
    else color = defColor;

    let colorInfo = Color(color);
    if (s.hover && !s.selected) {
        colorInfo = colorInfo.darken(0.2);
    }

    return colorInfo;
}
