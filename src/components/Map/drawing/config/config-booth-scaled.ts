import store from "../../../../store";
import { Booth } from "../../../../store/BoothStore";
import { LayersMode } from "../../../../store/LayerStore";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import { BoothDrawerBaseWithoutPainter } from "./BoothDrawerBase";
import { canvarFromPath } from "./canvases";

export default function configScaledBoot(
    context: DrawerContext,
    layerID: string,
    booth: Booth,
    painterOrderPriority: number,
    visible: boolean
) {
    new ScaledBoothDrawer(context, layerID, booth, painterOrderPriority, visible);
}

class ScaledBoothDrawer extends BoothDrawerBaseWithoutPainter {
    private readonly painter: RectPainter = null;

    constructor(context: DrawerContext, layerID: string, booth: Booth, painterOrderPriority: number, visible: boolean) {
        super(context, booth);

        let { cx, cy } = booth.rect;
        this.painter = this.context.requirePainter(
            layerID + ":" + this.getId("yahCanvas"),
            RectPainter,
            painterOrderPriority,
            visible
        );

        const yahCanvas = canvarFromPath(booth.paths, 0.5, store.layerStore.mode !== LayersMode.Default ? booth.layer.name : "");

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
