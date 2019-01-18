import { requireUpdate } from "./draw";

export default function animate<T>(timeout: number, duration: number,
    easingFunc: (k: number) => number,
    interpolateFunc: (k: number) => T,
    setFunc: (t: T) => void): void {

    function doAnimation() {
        const start = performance.now();

        function animationStep() {
            const part = Math.min(1, (performance.now() - start) / duration);
            const easedPart = easingFunc(part);
            const val = interpolateFunc(easedPart);
            setFunc(val);
            if (part !== 1) {
                requireUpdate(animationStep);
            }
        }
        requireUpdate(animationStep);
    }

    if (timeout) window.setTimeout(doAnimation, timeout);
    else doAnimation();
}