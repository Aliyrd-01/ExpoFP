import Color from "color";

Color.prototype.vec4 = function() {
    const r = this.rgb().object();
    const a = r.alpha || 1;
    return [r.r / 255, r.g / 255, r.b / 255, a];
};
