import { ZoomBehavior } from "d3-zoom";
import { event as currentEvent, Selection, select } from "d3-selection";
import { easeExpIn } from "d3-ease";

export default function configInertia(zoom: ZoomBehavior<Element, {}>) {

    let $canvas: Selection<any, {}, null, undefined>;
    let transforms = [];
    let initialK;
    let currentInertialAf;
    const transitionDuration = 1000;
    let initialTransitionSpeedX = 0.4; // per ms
    let initialTransitionSpeedY = 0.4; // per ms

    zoom.on("start.inertial", function () {
        const e = currentEvent;
        if (!e.sourceEvent) return;

        $canvas = select(this);
        $canvas.interrupt();

        window.cancelAnimationFrame(currentInertialAf);
        transforms = [];
        initialK = e.transform.k;
        transforms.push({
            at: performance.now(),
            transform: e.transform
        });
    });

    zoom.on("zoom.inertial", function () {
        const e = currentEvent;
        if (!e.sourceEvent) return;
        transforms.push({
            at: performance.now(),
            transform: e.transform
        });
    });

    zoom.on("end.inertial", function () {
        const e = currentEvent;
        if (!e.sourceEvent) return;
        const lastK = transforms[transforms.length - 1].transform.k;
        if (lastK !== initialK) return;
        const min = 50;
        const now = performance.now();
        const maxAt = now - min;
        for (let i = transforms.length - 1; i >= 0; i--) {
            let t = transforms[i];
            if (t.at < maxAt || i === 0) {
                // take it
                let time = now - t.at;
                let diffX =
                    (e.transform.x - t.transform.x) / e.transform.k;
                let diffY =
                    (e.transform.y - t.transform.y) / e.transform.k;
                initialTransitionSpeedX = diffX / time;
                initialTransitionSpeedY = diffY / time;
                break;
            }
        }

        const speed = Math.sqrt(initialTransitionSpeedX * initialTransitionSpeedX + initialTransitionSpeedY * initialTransitionSpeedY);
        // __logger.log("zoom speed", speed, initialTransitionSpeedX, initialTransitionSpeedY);
        if (speed > 0.08) doTransition();
    });


    function doTransition() {
        const start = performance.now();
        const till = start + transitionDuration;
        let prevSpeedX = initialTransitionSpeedX;
        let prevSpeedY = initialTransitionSpeedY;
        let prevTime = start;

        function doStep() {
            const now = performance.now();
            let part = (till - now) / transitionDuration;
            if (part < 0) part = 0;
            const partEased = easeExpIn(part);
            const currentSpeedX = initialTransitionSpeedX * partEased;
            const currentSpeedY = initialTransitionSpeedY * partEased;
            const avgSpeedX = (currentSpeedX + prevSpeedX) / 2;
            const avgSpeedY = (currentSpeedY + prevSpeedY) / 2;
            const durationSincePrev = now - prevTime;
            prevSpeedX = currentSpeedX;
            prevSpeedY = currentSpeedY;
            prevTime = now;
            const distanceSincePrevX = durationSincePrev * avgSpeedX;
            const distanceSincePrevY = durationSincePrev * avgSpeedY;

            $canvas.call(
                zoom.translateBy,
                distanceSincePrevX,
                distanceSincePrevY
            );

            if (partEased > 0.02) {
                currentInertialAf = requestAnimationFrame(doStep);
            }
        }
        currentInertialAf = requestAnimationFrame(doStep);
    }
}
