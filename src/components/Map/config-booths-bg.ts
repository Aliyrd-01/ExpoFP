import Color from "color";
import settings from "@/settings";
import { BoothDrawerBase } from "./config-booths-base";
import { getBoothState } from "./config-booths";
import animate from "./animate";

export default class BoothBgDrawer extends BoothDrawerBase {
    constructor(booth: Booth) {
        super(booth, "booth-bg");

        const r = this.booth.rect;
        this.drawer.addObject({
            id: this.getId("bg"),
            rotateRadians: booth.rotate,
            center: [r.cx, r.cy],
            deltas: [-r.w / 2, -r.h / 2, r.w / 2, r.h / 2],
            deltaPts: [0.5, 0.5, -0.5, -0.5]
        });
        this.update();
    }

    // private prevColor: string;
    // private cancelColorAnimate: () => void;

    update() {
        const s = getBoothState(this.booth);
        const c = getBoothColor(this.booth);
        // if (this.prevColor !== c) {
        //     if (this.cancelColorAnimate) this.cancelColorAnimate();
        //     // animate color
        //     if (this.prevColor) {
        //         this.cancelColorAnimate = animate(0, 100, null,
        //             d3.interpolate(this.prevColor, c), v => {
        //             this.drawer.updateColor(this.getId('bg'), Color(v).vec4());
        //         })
        //     } else {
        //         this.drawer.updateColor(this.getId('bg'), Color(c).vec4());
        //     }
        //     this.prevColor = c;
        // }

        this.drawer.updateColor(this.getId("bg"), c.vec4());
        this.drawer.updateSkipdim(this.getId("bg"), s.skipDim);
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

    // if (b.name == "A51"){
    //     debugger
    // }
    // if (s.dimmed && !s.selected) {
    //     color = settings.colors.booths.empty; ;
    // }

    let colorInfo = Color(color);
    if (s.hover && !s.selected) {
        colorInfo = colorInfo.darken(0.2);
    }

    return colorInfo;
}
