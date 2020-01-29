export default function animate<T>(
    timeout: number,
    duration: number,
    easingFunc: (k: number) => number,
    interpolateFunc: (k: number) => T,
    stepFunc: (func: () => void) => void,
    setFunc: (t: T) => void,
    callback?: () => void
) {
    let stopAnimation = false;

    function doAnimation() {
        const start = performance.now();

        function animationStep() {
            if (stopAnimation) return;
            const part = Math.min(1, (performance.now() - start) / duration);
            const easedPart = easingFunc ? easingFunc(part) : part;
            const val = interpolateFunc(easedPart);
            setFunc(val);
            if (part !== 1) {
                stepFunc(animationStep);
            } else if (callback) {
                callback();
            }
        }
        stepFunc(animationStep);
    }

    if (timeout) window.setTimeout(doAnimation, timeout);
    else doAnimation();

    return () => {
        stopAnimation = true;
    };
}
