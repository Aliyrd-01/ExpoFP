import Color from "color";
import settings from "./settings";

Color.prototype.vec4 = function () {
    const r = this.rgb().object();
    const a = r.alpha || 1;
    return [r.r / 255, r.g / 255, r.b / 255, a];
};

export function getColorFromGradient(countClicks: number) {
    const colors = settings.heatmapColors.map((color) => Color(color));

    // Приводим текущее количество кликов к диапазону [0, 1]
    let t = (countClicks - settings.minClicks) / (settings.maxClicks - settings.minClicks);

    // Индекс нижнего цвета в градиенте
    let i = Math.floor(t * (colors.length - 1));
    i = Math.max(0, Math.min(i, colors.length - 2)); // Обрезаем до допустимого диапазона

    // t на этом этапе - это относительное значение между цветом i и цветом i+1
    t = t * (colors.length - 1) - i;

    // Получаем два ближайших цвета
    let color1 = colors[i];
    let color2 = colors[i + 1];

    // Используем метод mix библиотеки 'color', чтобы получить промежуточный цвет
    let resultColor = color1.mix(color2, t);

    return resultColor.hex(); // Получаем результирующий цвет в формате HEX
}
