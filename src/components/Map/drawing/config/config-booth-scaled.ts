import { Booth } from "../../../../store/BoothStore";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { BoothDrawerBaseWithoutPainter } from "./BoothDrawerBase";
import { canvarFromPath } from "./canvases";

export default function configScaledBoot(context: DrawerContext, booth: Booth) {
    if (booth) new ScaledBoothDrawer(context, booth);
}

class ScaledBoothDrawer extends BoothDrawerBaseWithoutPainter {
    private readonly painter: RectPainter = null;

    constructor(context: DrawerContext, booth: Booth) {
        super(context, booth);

        let { cx, cy } = booth.rect;
        this.painter = this.context.requirePainter(this.getId("yahCanvas"), RectPainter, 161);

        const yahCanvas = canvarFromPath(booth.paths);

        this.painter.addObject({
            id: "yahCanvas",
            center: [0, 0],
            deltaPts: [-yahCanvas.width / 2, -yahCanvas.height / 2, yahCanvas.width / 2, yahCanvas.height / 2],
            canvasTmp: yahCanvas,
            texPosition: "lefttop",
            visible: true,
        });

        this.painter.updateCenter("yahCanvas", [cx, cy]);
        this.painter.updateSkipdim("yahCanvas", true);

        this.startAutoupdate();
    }

    update() {
        const s = this.booth;
        this.painter.updateSkipdim("yahCanvas", s.skipDim);
    }
}
