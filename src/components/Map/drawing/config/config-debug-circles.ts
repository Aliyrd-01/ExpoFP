import { DrawerContext } from "../Drawer1";
import { createCircleCanvas } from "./canvases";
import RectPainter from "../painters/RectPainter";
import { reaction } from "mobx";
import { uiState } from "../../../../store";

export function configDebugCircles(context: DrawerContext, painterOrderPriority: number) {
    const circlesDrawer = context.requirePainter("CIRCLES", RectPainter, painterOrderPriority, true);
    circlesDrawer.disableScale();

    let index = 0;

    function drawCircles(circles: { x: number, y: number, radius: number, color?: string }[]) {
        circles.forEach(circle => {
            const circleCanvas = createCircleCanvas(circle.radius, context.pixelRatio, circle.color || "#000000");

            circlesDrawer.addObject({
                id: `Circle_${index}`,
                center: [circle.x, circle.y],
                deltas: [0, 0, 0, 0],
                deltaPts: [
                    -circleCanvas.width / 2,
                    -circleCanvas.height / 2,
                    circleCanvas.width,
                    circleCanvas.height,
                ],
                canvasTmp: circleCanvas,
                texPosition: "lefttop",
                visible: false,
            });

            circlesDrawer.updateVisible(`Circle_${index}`, true);

            index += 1;
        })

        circlesDrawer.reinitializeBuffers();
    }

    function removeCircles() {
        for (let i = index; i >= 0; i--) {
            circlesDrawer.removeObject(`Circle_${i}`);
        }
    }

    reaction(
        () => uiState.debugCircles,
        (value) => {
            context.requireUpdate(removeCircles);
            context.requireUpdate(() => drawCircles(value));
        }
    )
}