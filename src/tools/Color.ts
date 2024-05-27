import Color from "color";
import settings from "./settings";

Color.prototype.vec4 = function () {
    const r = this.rgb().object();
    const a = r.alpha || 1;
    return [r.r / 255, r.g / 255, r.b / 255, a];
};

export function getColorFromGradient(countClicks: number) {
    const colors = settings.heatmapColors.map((color) => Color(color));

    let t = (countClicks - settings.minClicks) / (settings.maxClicks - settings.minClicks);

    t = Math.max(0, Math.min(t, 1));

    let i = Math.floor(t * (colors.length - 1));
    i = Math.max(0, Math.min(i, colors.length - 2));

    t = t * (colors.length - 1) - i;

    let color1 = colors[i];
    let color2 = colors[i + 1];

    let resultColor = color1.mix(color2, t);

    return resultColor.hex();
}
