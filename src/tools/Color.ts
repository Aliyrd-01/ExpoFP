import Color from "color";
import settings from "./settings";
import store from "../store";

Color.prototype.vec4 = function () {
    const r = this.rgb().object();
    const a = r.alpha || 1;
    return [r.r / 255, r.g / 255, r.b / 255, a];
};

export function getColorFromGradient(clickCount: number, min: number, max: number) {

    const colorPalette = settings.heatmapColors.map((color) => Color(color));

    // Normalize the value to the range [0, 1]
    let normalizedValue = (clickCount - min) / (max - min) || 0;

    normalizedValue = Math.max(0, Math.min(normalizedValue, 1));

    // Use a nonlinear function to improve distinguishability on the lower end of the spectrum
    let scaledValue = Math.sqrt(normalizedValue);

    // Find the color index in the palette
    let colorIndex = Math.floor(scaledValue * (colorPalette.length - 1));
    colorIndex = Math.max(0, Math.min(colorIndex, colorPalette.length - 1));

    // Determine the start and end colors for interpolation
    let colorStart = colorPalette[colorIndex];
    let colorEnd = colorPalette[Math.min(colorIndex + 1, colorPalette.length - 1)];
    let interpolationFactor = scaledValue * (colorPalette.length - 1) - colorIndex;

    // Return the interpolated color
    let interpolatedColor = colorStart.mix(colorEnd, interpolationFactor);

    return interpolatedColor.hex();
}